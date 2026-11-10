package com.streakup.controller;

import com.streakup.model.dto.SubscriptionRequest;
import com.streakup.model.entity.Subscription;
import com.streakup.model.entity.User;
import com.streakup.repository.UserRepository;
import com.streakup.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/subscriptions")
@Tag(name = "Subscriptions & Paywall", description = "Pro Membership, RevenueCat/Google Play integration")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;

    public SubscriptionController(SubscriptionService subscriptionService, UserRepository userRepository) {
        this.subscriptionService = subscriptionService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @PostMapping("/upgrade")
    @Operation(summary = "Upgrade user to Pro membership & grant bonus shields")
    public ResponseEntity<Map<String, Object>> upgradeSubscription(
            Authentication authentication,
            @Valid @RequestBody SubscriptionRequest request) {
        User user = getAuthenticatedUser(authentication);
        User updatedUser = subscriptionService.upgradeSubscription(user, request);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Congratulations! You are now a StreakUp PRO member.",
                "isPro", updatedUser.isPro(),
                "streakShields", updatedUser.getStreakShields()
        ));
    }

    @GetMapping("/current")
    @Operation(summary = "Get active subscription details")
    public ResponseEntity<?> getCurrentSubscription(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Optional<Subscription> sub = subscriptionService.getActiveSubscription(user);

        if (sub.isPresent()) {
            return ResponseEntity.ok(sub.get());
        }
        return ResponseEntity.ok(Map.of(
                "planType", "FREE",
                "status", "ACTIVE",
                "isPro", user.isPro()
        ));
    }
}
