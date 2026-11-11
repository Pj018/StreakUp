package com.streakup.service;

import com.streakup.model.dto.StreakReviveRequest;
import com.streakup.model.entity.Habit;
import com.streakup.model.entity.Streak;
import com.streakup.model.entity.User;
import com.streakup.model.enums.StreakStatus;
import com.streakup.repository.HabitRepository;
import com.streakup.repository.StreakRepository;
import com.streakup.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class StreakService {

    private final StreakRepository streakRepository;
    private final HabitRepository habitRepository;
    private final UserRepository userRepository;

    public StreakService(StreakRepository streakRepository,
                         HabitRepository habitRepository,
                         UserRepository userRepository) {
        this.streakRepository = streakRepository;
        this.habitRepository = habitRepository;
        this.userRepository = userRepository;
    }

    public Streak getOrCreateStreak(User user, Habit habit) {
        return streakRepository.findByHabitId(habit.getId())
                .orElseGet(() -> streakRepository.save(new Streak(user, habit)));
    }

    @Transactional
    public Streak processHabitCompletion(User user, Habit habit, LocalDate completionDate) {
        Streak streak = getOrCreateStreak(user, habit);
        LocalDate lastDate = streak.getLastCompletedDate();

        if (lastDate == null) {
            // First time completing
            streak.setCurrentStreak(1);
            streak.setLongestStreak(Math.max(1, streak.getLongestStreak()));
            streak.setStatus(StreakStatus.ACTIVE);
        } else if (lastDate.equals(completionDate)) {
            // Already logged today, do nothing to streak
        } else if (lastDate.plusDays(1).equals(completionDate)) {
            // Consecutive day: increment streak
            int newStreak = streak.getCurrentStreak() + 1;
            streak.setCurrentStreak(newStreak);
            streak.setLongestStreak(Math.max(newStreak, streak.getLongestStreak()));
            streak.setStatus(StreakStatus.ACTIVE);
        } else {
            // Missed a day or more: restarted streak
            streak.setCurrentStreak(1);
            streak.setStatus(StreakStatus.ACTIVE);
        }

        streak.setLastCompletedDate(completionDate);
        streak.setUpdatedAt(LocalDateTime.now());
        return streakRepository.save(streak);
    }

    @Transactional
    public Streak undoHabitCompletion(User user, Habit habit, LocalDate completionDate) {
        Streak streak = getOrCreateStreak(user, habit);
        if (completionDate != null && completionDate.equals(streak.getLastCompletedDate())) {
            int newStreak = Math.max(0, streak.getCurrentStreak() - 1);
            streak.setCurrentStreak(newStreak);
            if (newStreak == 0) {
                streak.setLastCompletedDate(null);
            } else {
                streak.setLastCompletedDate(completionDate.minusDays(1));
            }
            streak.setUpdatedAt(LocalDateTime.now());
            return streakRepository.save(streak);
        }
        return streak;
    }

    /**
     * Revive a broken streak when user watches a rewarded video ad or uses a shield.
     */
    @Transactional
    public Streak reviveStreakWithAd(User user, StreakReviveRequest request) {
        Streak streak = streakRepository.findByHabitId(request.getHabitId())
                .orElseThrow(() -> new IllegalArgumentException("Streak record not found for habit"));

        if (!streak.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized streak modification");
        }

        // Validate ad verification token (in production, verify with AdMob SSV / server callback)
        if (request.getAdVerificationToken() == null || request.getAdVerificationToken().isBlank()) {
            throw new IllegalArgumentException("Invalid rewarded ad verification token");
        }

        // Revive streak
        if (streak.getStatus() == StreakStatus.BROKEN || streak.getCurrentStreak() == 0) {
            streak.setCurrentStreak(Math.max(1, streak.getLongestStreak()));
        }
        streak.setStatus(StreakStatus.ACTIVE);
        streak.setLastCompletedDate(LocalDate.now().minusDays(1)); // set to yesterday so today can be completed
        streak.setUpdatedAt(LocalDateTime.now());

        return streakRepository.save(streak);
    }

    /**
     * Use a streak shield manually to protect a streak
     */
    @Transactional
    public Streak applyShieldToStreak(User user, UUID habitId) {
        if (user.getStreakShields() <= 0) {
            throw new IllegalStateException("No streak shields available. Purchase or earn more shields.");
        }

        Streak streak = streakRepository.findByHabitId(habitId)
                .orElseThrow(() -> new IllegalArgumentException("Streak record not found"));

        if (!streak.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access");
        }

        user.setStreakShields(user.getStreakShields() - 1);
        userRepository.save(user);

        streak.setStatus(StreakStatus.SHIELDED);
        streak.setUpdatedAt(LocalDateTime.now());
        return streakRepository.save(streak);
    }

    /**
     * Daily streak evaluation logic (runs at midnight or triggered via test endpoint)
     */
    @Transactional
    public void evaluateAllStreaksForMissedDays(LocalDate targetDate) {
        List<Streak> allStreaks = streakRepository.findAll();

        for (Streak streak : allStreaks) {
            LocalDate lastDate = streak.getLastCompletedDate();
            if (lastDate == null) continue;

            // If last completed date was before yesterday, streak is at risk
            if (lastDate.isBefore(targetDate.minusDays(1))) {
                User user = streak.getUser();
                if (streak.getStatus() == StreakStatus.SHIELDED) {
                    // Shield was active, consume shield state and reset to ACTIVE
                    streak.setStatus(StreakStatus.ACTIVE);
                } else if (user.getStreakShields() > 0) {
                    // Automatically consume user's streak shield to save them
                    user.setStreakShields(user.getStreakShields() - 1);
                    userRepository.save(user);
                    streak.setStatus(StreakStatus.SHIELDED);
                } else {
                    // Break streak
                    streak.setStatus(StreakStatus.BROKEN);
                }
                streakRepository.save(streak);
            }
        }
    }
}
