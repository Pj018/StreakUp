package com.streakup.model.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class BadgeDto {
    private UUID id;
    private String code;
    private String name;
    private String description;
    private String iconUrl;
    private int requiredStreak;
    private int requiredXp;
    private boolean isUnlocked;
    private LocalDateTime unlockedAt;

    public BadgeDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIconUrl() { return iconUrl; }
    public void setIconUrl(String iconUrl) { this.iconUrl = iconUrl; }

    public int getRequiredStreak() { return requiredStreak; }
    public void setRequiredStreak(int requiredStreak) { this.requiredStreak = requiredStreak; }

    public int getRequiredXp() { return requiredXp; }
    public void setRequiredXp(int requiredXp) { this.requiredXp = requiredXp; }

    public boolean isUnlocked() { return isUnlocked; }
    public void setUnlocked(boolean unlocked) { isUnlocked = unlocked; }

    public LocalDateTime getUnlockedAt() { return unlockedAt; }
    public void setUnlockedAt(LocalDateTime unlockedAt) { this.unlockedAt = unlockedAt; }
}
