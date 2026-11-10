package com.streakup.model.dto;

import com.streakup.model.enums.Category;
import com.streakup.model.enums.FrequencyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

public class HabitRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Category is required")
    private Category category = Category.OTHER;

    @NotNull(message = "Frequency is required")
    private FrequencyType frequencyType = FrequencyType.DAILY;

    private int targetPerDay = 1;
    private LocalTime reminderTime;
    private String color = "#6366F1";
    private String icon = "flame";

    public HabitRequest() {}

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
}
