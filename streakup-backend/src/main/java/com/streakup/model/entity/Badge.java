package com.streakup.model.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "badges")
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String code; // e.g. FIRST_STEP, STREAK_7, STREAK_30

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(name = "required_streak", nullable = false)
    private int requiredStreak = 0;

    @Column(name = "required_xp", nullable = false)
    private int requiredXp = 0;

    public Badge() {}

    public Badge(String code, String name, String description, String iconUrl, int requiredStreak, int requiredXp) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.iconUrl = iconUrl;
        this.requiredStreak = requiredStreak;
        this.requiredXp = requiredXp;
    }

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
}
