package com.streakup.controller;

import com.streakup.model.dto.UserProfileResponse;
import com.streakup.model.entity.User;
import com.streakup.repository.HabitLogRepository;
import com.streakup.repository.HabitRepository;
import com.streakup.repository.UserRepository;
import com.streakup.service.GamificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user")
@Tag(name = "User Profile", description = "User stats and profile APIs")
public class UserController {

    private final UserRepository userRepository;
    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final GamificationService gamificationService;

    public UserController(UserRepository userRepository,
                          HabitRepository habitRepository,
                          HabitLogRepository habitLogRepository,
                          GamificationService gamificationService) {
        this.userRepository = userRepository;
        this.habitRepository = habitRepository;
        this.habitLogRepository = habitLogRepository;
        this.gamificationService = gamificationService;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current authenticated user profile & gamification progress")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserProfileResponse res = new UserProfileResponse();
        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setFullName(user.getFullName());
        res.setXpPoints(user.getXpPoints());
        res.setCurrentLevel(user.getCurrentLevel());
        res.setXpToNextLevel(gamificationService.getXpToNextLevel(user.getXpPoints()));
        res.setStreakShields(user.getStreakShields());
        res.setPro(user.isPro());
        res.setTotalHabits(habitRepository.countByUserIdAndIsArchivedFalse(user.getId()));
        res.setTotalCompletions(habitLogRepository.countByUserId(user.getId()));
        res.setCreatedAt(user.getCreatedAt());

        return ResponseEntity.ok(res);
    }
}
