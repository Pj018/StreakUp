package com.streakup.service;

import com.streakup.model.entity.*;
import com.streakup.repository.BadgeRepository;
import com.streakup.repository.HabitLogRepository;
import com.streakup.repository.UserBadgeRepository;
import com.streakup.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class GamificationService {

    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final HabitLogRepository habitLogRepository;

    @Value("${gamification.xp-per-completion:10}")
    private int xpPerCompletion;

    @Value("${gamification.xp-per-level:100}")
    private int xpPerLevel;

    public GamificationService(UserRepository userRepository,
                               BadgeRepository badgeRepository,
                               UserBadgeRepository userBadgeRepository,
                               HabitLogRepository habitLogRepository) {
        this.userRepository = userRepository;
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.habitLogRepository = habitLogRepository;
    }

    public int calculateLevel(int totalXp) {
        return (totalXp / xpPerLevel) + 1;
    }

    public int getXpToNextLevel(int totalXp) {
        int currentLevel = calculateLevel(totalXp);
        int nextLevelThreshold = currentLevel * xpPerLevel;
        return nextLevelThreshold - totalXp;
    }

    @Transactional
    public List<String> checkAndAwardBadges(User user, Streak currentStreak) {
        List<String> newlyUnlocked = new ArrayList<>();
        List<Badge> allBadges = badgeRepository.findAll();
        long totalCompletions = habitLogRepository.countByUserId(user.getId());

        for (Badge badge : allBadges) {
            boolean alreadyUnlocked = userBadgeRepository.existsByUserIdAndBadgeId(user.getId(), badge.getId());
            if (alreadyUnlocked) {
                continue;
            }

            boolean eligible = false;

            // FIRST_STEP badge: Completed at least 1 habit
            if ("FIRST_STEP".equals(badge.getCode()) && totalCompletions >= 1) {
                eligible = true;
            }

            // Streak badges
            if (currentStreak != null && badge.getRequiredStreak() > 0) {
                if (currentStreak.getCurrentStreak() >= badge.getRequiredStreak() ||
                    currentStreak.getLongestStreak() >= badge.getRequiredStreak()) {
                    eligible = true;
                }
            }

            // XP / Level badges
            if (badge.getRequiredXp() > 0 && user.getXpPoints() >= badge.getRequiredXp()) {
                eligible = true;
            }

            if (eligible) {
                UserBadge userBadge = new UserBadge(user, badge);
                userBadgeRepository.save(userBadge);
                newlyUnlocked.add(badge.getName());
            }
        }

        return newlyUnlocked;
    }
}
