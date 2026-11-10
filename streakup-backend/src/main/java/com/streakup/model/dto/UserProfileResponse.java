package com.streakup.model.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserProfileResponse {
    private UUID id;
    private String email;
    private String fullName;
    private int xpPoints;
    private int currentLevel;
    private int xpToNextLevel;
    private int streakShields;
    private boolean isPro;
    private long totalHabits;
    private long totalCompletions;
    private String avatarUrl;
    private String bio;
    private LocalDateTime createdAt;

    public UserProfileResponse() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public int getXpPoints() { return xpPoints; }
    public void setXpPoints(int xpPoints) { this.xpPoints = xpPoints; }

    public int getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(int currentLevel) { this.currentLevel = currentLevel; }

    public int getXpToNextLevel() { return xpToNextLevel; }
    public void setXpToNextLevel(int xpToNextLevel) { this.xpToNextLevel = xpToNextLevel; }

    public int getStreakShields() { return streakShields; }
    public void setStreakShields(int streakShields) { this.streakShields = streakShields; }

    public boolean isPro() { return isPro; }
    public void setPro(boolean pro) { isPro = pro; }

    public long getTotalHabits() { return totalHabits; }
    public void setTotalHabits(long totalHabits) { this.totalHabits = totalHabits; }

    public long getTotalCompletions() { return totalCompletions; }
    public void setTotalCompletions(long totalCompletions) { this.totalCompletions = totalCompletions; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
