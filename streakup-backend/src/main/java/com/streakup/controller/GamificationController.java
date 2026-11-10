package com.streakup.controller;

import com.streakup.model.dto.BadgeDto;
import com.streakup.model.dto.HeatmapDayDto;
import com.streakup.model.entity.Badge;
import com.streakup.model.entity.HabitLog;
import com.streakup.model.entity.User;
import com.streakup.model.entity.UserBadge;
import com.streakup.repository.BadgeRepository;
import com.streakup.repository.HabitLogRepository;
import com.streakup.repository.UserBadgeRepository;
import com.streakup.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/gamification")
@Tag(name = "Gamification", description = "Badges, Heatmap & Achievement APIs")
public class GamificationController {

    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final HabitLogRepository habitLogRepository;

    public GamificationController(UserRepository userRepository,
                                  BadgeRepository badgeRepository,
                                  UserBadgeRepository userBadgeRepository,
                                  HabitLogRepository habitLogRepository) {
        this.userRepository = userRepository;
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.habitLogRepository = habitLogRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @GetMapping("/badges")
    @Operation(summary = "Get list of all badges and the current user's unlock status")
    public ResponseEntity<List<BadgeDto>> getBadges(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        List<Badge> allBadges = badgeRepository.findAll();
        List<UserBadge> userBadges = userBadgeRepository.findByUserIdOrderByUnlockedAtDesc(user.getId());

        Map<UUID, UserBadge> userBadgeMap = userBadges.stream()
                .collect(Collectors.toMap(ub -> ub.getBadge().getId(), ub -> ub, (a, b) -> a));

        List<BadgeDto> dtos = allBadges.stream().map(badge -> {
            BadgeDto dto = new BadgeDto();
            dto.setId(badge.getId());
            dto.setCode(badge.getCode());
            dto.setName(badge.getName());
            dto.setDescription(badge.getDescription());
            dto.setIconUrl(badge.getIconUrl());
            dto.setRequiredStreak(badge.getRequiredStreak());
            dto.setRequiredXp(badge.getRequiredXp());

            if (userBadgeMap.containsKey(badge.getId())) {
                dto.setUnlocked(true);
                dto.setUnlockedAt(userBadgeMap.get(badge.getId()).getUnlockedAt());
            } else {
                dto.setUnlocked(false);
                dto.setUnlockedAt(null);
            }
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/heatmap")
    @Operation(summary = "Get habit completion counts for the last 60 days for calendar heatmap")
    public ResponseEntity<List<HeatmapDayDto>> getHeatmap(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(59);

        List<HabitLog> logs = habitLogRepository.findByUserIdAndCompletedDateBetweenOrderByCompletedDateAsc(
                user.getId(), startDate, today);

        Map<LocalDate, Long> countMap = logs.stream()
                .collect(Collectors.groupingBy(HabitLog::getCompletedDate, Collectors.counting()));

        List<HeatmapDayDto> heatmap = new ArrayList<>();
        LocalDate curr = startDate;
        while (!curr.isAfter(today)) {
            int count = countMap.getOrDefault(curr, 0L).intValue();
            heatmap.add(new HeatmapDayDto(curr, count));
            curr = curr.plusDays(1);
        }

        return ResponseEntity.ok(heatmap);
    }
}
