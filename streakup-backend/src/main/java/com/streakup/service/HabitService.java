package com.streakup.service;

import com.streakup.model.dto.*;
import com.streakup.model.entity.*;
import com.streakup.model.enums.StreakStatus;
import com.streakup.repository.HabitLogRepository;
import com.streakup.repository.HabitRepository;
import com.streakup.repository.StreakRepository;
import com.streakup.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class HabitService {

    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final StreakRepository streakRepository;
    private final UserRepository userRepository;
    private final StreakService streakService;
    private final GamificationService gamificationService;

    @Value("${gamification.free-tier-max-habits:4}")
    private int freeTierMaxHabits;

    @Value("${gamification.xp-per-completion:10}")
    private int xpPerCompletion;

    public HabitService(HabitRepository habitRepository,
                        HabitLogRepository habitLogRepository,
                        StreakRepository streakRepository,
                        UserRepository userRepository,
                        StreakService streakService,
                        GamificationService gamificationService) {
        this.habitRepository = habitRepository;
        this.habitLogRepository = habitLogRepository;
        this.streakRepository = streakRepository;
        this.userRepository = userRepository;
        this.streakService = streakService;
        this.gamificationService = gamificationService;
    }

    @Transactional
    public HabitResponse createHabit(User user, HabitRequest request) {
        // Enforce Free Tier Limit
        if (!user.isPro()) {
            long currentCount = habitRepository.countByUserIdAndIsArchivedFalse(user.getId());
            if (currentCount >= freeTierMaxHabits) {
                throw new IllegalStateException("Free plan limit reached (max " + freeTierMaxHabits + " habits). Upgrade to Pro for unlimited habits!");
            }
        }

        Habit habit = new Habit();
        habit.setUser(user);
        habit.setTitle(request.getTitle().trim());
        habit.setDescription(request.getDescription());
        habit.setCategory(request.getCategory());
        habit.setFrequencyType(request.getFrequencyType());
        habit.setTargetPerDay(request.getTargetPerDay() > 0 ? request.getTargetPerDay() : 1);
        habit.setReminderTime(request.getReminderTime());
        habit.setColor(request.getColor() != null ? request.getColor() : "#6366F1");
        habit.setIcon(request.getIcon() != null ? request.getIcon() : "flame");
        habit.setArchived(false);

        habit = habitRepository.save(habit);

        // Initialize streak
        Streak streak = streakService.getOrCreateStreak(user, habit);

        return mapToResponse(habit, streak, false);
    }

    public List<HabitResponse> getUserHabits(User user) {
        List<Habit> habits = habitRepository.findByUserIdAndIsArchivedFalseOrderByCreatedAtDesc(user.getId());
        LocalDate today = LocalDate.now();

        return habits.stream().map(habit -> {
            Streak streak = streakService.getOrCreateStreak(user, habit);
            boolean completedToday = habitLogRepository.existsByHabitIdAndCompletedDate(habit.getId(), today);
            return mapToResponse(habit, streak, completedToday);
        }).collect(Collectors.toList());
    }

    @Transactional
    public HabitCompleteResponse completeHabit(User user, UUID habitId, LocalDate completionDate) {
        Habit habit = habitRepository.findByIdAndUserId(habitId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Habit not found"));

        if (completionDate == null) {
            completionDate = LocalDate.now();
        }

        boolean alreadyCompleted = habitLogRepository.existsByHabitIdAndCompletedDate(habitId, completionDate);
        if (alreadyCompleted) {
            Streak streak = streakService.getOrCreateStreak(user, habit);
            HabitCompleteResponse response = new HabitCompleteResponse();
            response.setHabitId(habitId);
            response.setSuccess(true);
            response.setMessage("Habit was already completed for " + completionDate);
            response.setCurrentStreak(streak.getCurrentStreak());
            response.setLongestStreak(streak.getLongestStreak());
            response.setStreakStatus(streak.getStatus());
            response.setXpEarned(0);
            response.setTotalXp(user.getXpPoints());
            response.setCurrentLevel(user.getCurrentLevel());
            response.setLevelUp(false);
            response.setNewlyUnlockedBadges(List.of());
            return response;
        }

        // 1. Log completion
        HabitLog log = new HabitLog(user, habit, completionDate, xpPerCompletion);
        habitLogRepository.save(log);

        // 2. Update Streak
        Streak streak = streakService.processHabitCompletion(user, habit, completionDate);

        // 3. Award XP & Level Calculation
        int oldLevel = user.getCurrentLevel();
        user.setXpPoints(user.getXpPoints() + xpPerCompletion);
        int newLevel = gamificationService.calculateLevel(user.getXpPoints());
        boolean levelUp = newLevel > oldLevel;
        user.setCurrentLevel(newLevel);
        user = userRepository.save(user);

        // 4. Check & Award Badges
        List<String> newlyUnlocked = gamificationService.checkAndAwardBadges(user, streak);

        HabitCompleteResponse response = new HabitCompleteResponse();
        response.setHabitId(habitId);
        response.setSuccess(true);
        response.setMessage(levelUp ? "🎉 Level Up! You reached Level " + newLevel : "Habit completed! +10 XP");
        response.setCurrentStreak(streak.getCurrentStreak());
        response.setLongestStreak(streak.getLongestStreak());
        response.setStreakStatus(streak.getStatus());
        response.setXpEarned(xpPerCompletion);
        response.setTotalXp(user.getXpPoints());
        response.setCurrentLevel(newLevel);
        response.setLevelUp(levelUp);
        response.setNewlyUnlockedBadges(newlyUnlocked);
        return response;
    }

    @Transactional
    public void archiveHabit(User user, UUID habitId) {
        Habit habit = habitRepository.findByIdAndUserId(habitId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Habit not found"));
        habit.setArchived(true);
        habitRepository.save(habit);
    }

    private HabitResponse mapToResponse(Habit habit, Streak streak, boolean completedToday) {
        HabitResponse res = new HabitResponse();
        res.setId(habit.getId());
        res.setTitle(habit.getTitle());
        res.setDescription(habit.getDescription());
        res.setCategory(habit.getCategory());
        res.setFrequencyType(habit.getFrequencyType());
        res.setTargetPerDay(habit.getTargetPerDay());
        res.setReminderTime(habit.getReminderTime());
        res.setColor(habit.getColor());
        res.setIcon(habit.getIcon());
        res.setArchived(habit.isArchived());
        res.setCreatedAt(habit.getCreatedAt());

        if (streak != null) {
            res.setCurrentStreak(streak.getCurrentStreak());
            res.setLongestStreak(streak.getLongestStreak());
            res.setStreakStatus(streak.getStatus());
            res.setLastCompletedDate(streak.getLastCompletedDate());
        } else {
            res.setCurrentStreak(0);
            res.setLongestStreak(0);
            res.setStreakStatus(StreakStatus.ACTIVE);
        }

        res.setCompletedToday(completedToday);
        return res;
    }
}
