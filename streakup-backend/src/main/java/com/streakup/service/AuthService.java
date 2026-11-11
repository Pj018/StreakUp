package com.streakup.service;

import com.streakup.config.JwtUtils;
import com.streakup.model.dto.AuthRequest;
import com.streakup.model.dto.AuthResponse;
import com.streakup.model.dto.RegisterRequest;
import com.streakup.model.entity.User;
import com.streakup.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final GamificationService gamificationService;
    private final HabitService habitService;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils,
                       AuthenticationManager authenticationManager,
                       GamificationService gamificationService,
                       HabitService habitService,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
        this.gamificationService = gamificationService;
        this.habitService = habitService;
        this.emailService = emailService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        User user = new User(
                request.getEmail().toLowerCase().trim(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName().trim()
        );
        user = userRepository.save(user);

        // Seed initial starter habits with currentStreak = 0
        habitService.createStarterHabitsForUser(user);

        // Check initial starter badges
        gamificationService.checkAndAwardBadges(user, null);

        // Send welcome email to new user
        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

        String token = jwtUtils.generateToken(user.getEmail(), user.getId());

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getXpPoints(),
                user.getCurrentLevel(),
                user.getStreakShields(),
                user.isPro()
        );
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String token = jwtUtils.generateToken(user.getEmail(), user.getId());

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getXpPoints(),
                user.getCurrentLevel(),
                user.getStreakShields(),
                user.isPro()
        );
    }

    @Transactional
    public void forgotPassword(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        userRepository.findByEmail(email.toLowerCase().trim()).ifPresent(user -> {
            // Generate 6 digit numeric OTP
            String otp = String.format("%06d", new java.security.SecureRandom().nextInt(1000000));
            user.setResetPasswordOtp(otp);
            user.setResetPasswordOtpExpiry(java.time.LocalDateTime.now().plusMinutes(15));
            userRepository.save(user);

            emailService.sendPasswordResetOtpEmail(user.getEmail(), user.getFullName(), otp);
        });
    }

    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (otp == null || otp.isBlank()) {
            throw new IllegalArgumentException("Verification code (OTP) is required");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }

        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("No account found with email: " + email));

        if (user.getResetPasswordOtp() == null || !user.getResetPasswordOtp().equals(otp.trim())) {
            throw new IllegalArgumentException("Invalid verification code (OTP). Please check and try again.");
        }

        if (user.getResetPasswordOtpExpiry() == null || user.getResetPasswordOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired. Please request a new code.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordOtp(null);
        user.setResetPasswordOtpExpiry(null);
        userRepository.save(user);
    }
}
