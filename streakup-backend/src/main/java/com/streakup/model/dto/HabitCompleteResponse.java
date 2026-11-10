package com.streakup.model.dto;

import com.streakup.model.enums.StreakStatus;
import java.util.List;
import java.util.UUID;

public class HabitCompleteResponse {
    private UUID habitId;
    private boolean success;
    private String message;
    private int currentStreak;
    private int longestStreak;
    private StreakStatus streakStatus;
    private int xpEarned;
    private int totalXp;
    private int currentLevel;
    private boolean levelUp;
    private List<String> newlyUnlockedBadges;

    public HabitCompleteResponse() {}

    public UUID getHabitId() { return habitId; }
    public void setHabitId(UUID habitId) { this.habitId = habitId; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public int getLongestStreak() { return longestStreak; }
    public void setLongestStreak(int longestStreak) { this.longestStreak = longestStreak; }

    public StreakStatus getStreakStatus() { return streakStatus; }
    public void setStreakStatus(StreakStatus streakStatus) { this.streakStatus = streakStatus; }

    public int getXpEarned() { return xpEarned; }
    public void setXpEarned(int xpEarned) { this.xpEarned = xpEarned; }

    public int getTotalXp() { return totalXp; }
    public void setTotalXp(int totalXp) { this.totalXp = totalXp; }

    public int getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(int currentLevel) { this.currentLevel = currentLevel; }

    public boolean isLevelUp() { return levelUp; }
    public void setLevelUp(boolean levelUp) { this.levelUp = levelUp; }

    public List<String> getNewlyUnlockedBadges() { return newlyUnlockedBadges; }
    public void setNewlyUnlockedBadges(List<String> newlyUnlockedBadges) { this.newlyUnlockedBadges = newlyUnlockedBadges; }
}
