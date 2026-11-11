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
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email address is required.");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long.");
        }

        String normalizedEmail = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("An account with this email already exists (" + normalizedEmail + "). Please sign in or reset your password.");
        }

        User user = new User(
                normalizedEmail,
                passwordEncoder.encode(request.getPassword()),
                request.getFullName() != null && !request.getFullName().isBlank() ? request.getFullName().trim() : "Member"
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
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Please enter your email address.");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Please enter your password.");
        }

        String email = request.getEmail().toLowerCase().trim();

        // Check if user exists first to give clear feedback
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            throw new IllegalArgumentException("No account found with " + email + ". Please tap 'Create Account Free' to sign up.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            throw new IllegalArgumentException("Incorrect password for " + email + ". Please try again or tap 'Forgot Password?' to reset it.");
        }

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

        String normalizedEmail = email.toLowerCase().trim();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("No account found with " + normalizedEmail + ". Please check the spelling or create an account first."));

        // Generate 6 digit numeric OTP
        String otp = String.format("%06d", new java.security.SecureRandom().nextInt(1000000));
        user.setResetPasswordOtp(otp);
        user.setResetPasswordOtpExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendPasswordResetOtpEmail(user.getEmail(), user.getFullName(), otp);
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
