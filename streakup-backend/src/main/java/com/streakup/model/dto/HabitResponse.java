package com.streakup.model.dto;

import com.streakup.model.enums.Category;
import com.streakup.model.enums.FrequencyType;
import com.streakup.model.enums.StreakStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public class HabitResponse {
    private UUID id;
    private String title;
    private String description;
    private Category category;
    private FrequencyType frequencyType;
    private int targetPerDay;
    private LocalTime reminderTime;
    private String color;
    private String icon;
    private boolean isArchived;
    private LocalDateTime createdAt;

    // Streak info
    private int currentStreak;
    private int longestStreak;
    private StreakStatus streakStatus;
    private boolean completedToday;
    private LocalDate lastCompletedDate;

    public HabitResponse() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public FrequencyType getFrequencyType() { return frequencyType; }
    public void setFrequencyType(FrequencyType frequencyType) { this.frequencyType = frequencyType; }

    public int getTargetPerDay() { return targetPerDay; }
    public void setTargetPerDay(int targetPerDay) { this.targetPerDay = targetPerDay; }

    public LocalTime getReminderTime() { return reminderTime; }
    public void setReminderTime(LocalTime reminderTime) { this.reminderTime = reminderTime; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public boolean isArchived() { return isArchived; }
    public void setArchived(boolean archived) { isArchived = archived; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public int getLongestStreak() { return longestStreak; }
    public void setLongestStreak(int longestStreak) { this.longestStreak = longestStreak; }

    public StreakStatus getStreakStatus() { return streakStatus; }
    public void setStreakStatus(StreakStatus streakStatus) { this.streakStatus = streakStatus; }

    public boolean isCompletedToday() { return completedToday; }
    public void setCompletedToday(boolean completedToday) { this.completedToday = completedToday; }

    public LocalDate getLastCompletedDate() { return lastCompletedDate; }
    public void setLastCompletedDate(LocalDate lastCompletedDate) { this.lastCompletedDate = lastCompletedDate; }
}
