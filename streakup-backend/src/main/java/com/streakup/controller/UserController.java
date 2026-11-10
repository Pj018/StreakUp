package com.streakup.controller;

import com.streakup.model.dto.ChangePasswordRequest;
import com.streakup.model.dto.UpdateProfileRequest;
import com.streakup.model.dto.UserProfileResponse;
import com.streakup.model.entity.User;
import com.streakup.repository.HabitLogRepository;
import com.streakup.repository.HabitRepository;
import com.streakup.repository.UserRepository;
import com.streakup.service.GamificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/user")
@Tag(name = "User Profile", description = "User stats, profile, avatar & security APIs")
public class UserController {

    private final UserRepository userRepository;
    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final GamificationService gamificationService;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository,
                          HabitRepository habitRepository,
                          HabitLogRepository habitLogRepository,
                          GamificationService gamificationService,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.habitRepository = habitRepository;
        this.habitLogRepository = habitLogRepository;
        this.gamificationService = gamificationService;
        this.passwordEncoder = passwordEncoder;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private UserProfileResponse mapToResponse(User user) {
        UserProfileResponse res = new UserProfileResponse();
        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setFullName(user.getFullName());
        res.setAvatarUrl(user.getAvatarUrl());
        res.setBio(user.getBio());
        res.setXpPoints(user.getXpPoints());
        res.setCurrentLevel(user.getCurrentLevel());
        res.setXpToNextLevel(gamificationService.getXpToNextLevel(user.getXpPoints()));
        res.setStreakShields(user.getStreakShields());
        res.setPro(user.isPro());
        res.setTotalHabits(habitRepository.countByUserIdAndIsArchivedFalse(user.getId()));
        res.setTotalCompletions(habitLogRepository.countByUserId(user.getId()));
        res.setCreatedAt(user.getCreatedAt());
        return res;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current authenticated user profile & gamification progress")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(mapToResponse(user));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile details (full name, bio, avatar)")
    public ResponseEntity<UserProfileResponse> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        User user = getAuthenticatedUser(authentication);

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        user = userRepository.save(user);
        return ResponseEntity.ok(mapToResponse(user));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password securely with current password verification")
    public ResponseEntity<?> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        User user = getAuthenticatedUser(authentication);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Incorrect current password. Please try again."));
        }

        if (request.getNewPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password must be at least 6 characters long."));
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully!"));
    }
}
