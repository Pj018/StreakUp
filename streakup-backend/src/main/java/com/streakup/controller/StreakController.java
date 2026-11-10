package com.streakup.controller;

import com.streakup.model.dto.StreakReviveRequest;
import com.streakup.model.entity.Streak;
import com.streakup.model.entity.User;
import com.streakup.repository.UserRepository;
import com.streakup.scheduler.MidnightStreakScheduler;
import com.streakup.service.StreakService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/streaks")
@Tag(name = "Streaks & Revives", description = "Streak Management, Shield usage, and Rewarded Ad Revivals")
public class StreakController {

    private final StreakService streakService;
    private final UserRepository userRepository;
    private final MidnightStreakScheduler midnightStreakScheduler;

    public StreakController(StreakService streakService,
                            UserRepository userRepository,
                            MidnightStreakScheduler midnightStreakScheduler) {
        this.streakService = streakService;
        this.userRepository = userRepository;
        this.midnightStreakScheduler = midnightStreakScheduler;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @PostMapping("/revive-with-ad")
    @Operation(summary = "Revive a broken streak after the user watches a Rewarded Video Ad")
    public ResponseEntity<Map<String, Object>> reviveWithAd(
            Authentication authentication,
            @Valid @RequestBody StreakReviveRequest request) {
        User user = getAuthenticatedUser(authentication);
        Streak revivedStreak = streakService.reviveStreakWithAd(user, request);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Streak successfully revived via rewarded video ad!",
                "currentStreak", revivedStreak.getCurrentStreak(),
                "status", revivedStreak.getStatus()
        ));
    }

    @PostMapping("/{habitId}/shield")
    @Operation(summary = "Manually protect a streak using 1 streak shield")
    public ResponseEntity<Map<String, Object>> applyShield(Authentication authentication, @PathVariable UUID habitId) {
        User user = getAuthenticatedUser(authentication);
        Streak streak = streakService.applyShieldToStreak(user, habitId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Streak shield successfully applied!",
                "remainingShields", user.getStreakShields(),
                "streakStatus", streak.getStatus()
        ));
    }

    @PostMapping("/trigger-midnight-eval")
    @Operation(summary = "Manual trigger for testing midnight streak processing engine")
    public ResponseEntity<Map<String, String>> triggerMidnightEval() {
        midnightStreakScheduler.triggerManually();
        return ResponseEntity.ok(Map.of("message", "Midnight streak evaluation executed successfully"));
    }
}
