package com.streakup.model.dto;

import java.util.UUID;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private UUID userId;
    private String email;
    private String fullName;
    private int xpPoints;
    private int currentLevel;
    private int streakShields;
    private boolean isPro;

    public AuthResponse() {}

    public AuthResponse(String token, UUID userId, String email, String fullName, int xpPoints, int currentLevel, int streakShields, boolean isPro) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.xpPoints = xpPoints;
        this.currentLevel = currentLevel;
        this.streakShields = streakShields;
        this.isPro = isPro;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public int getXpPoints() { return xpPoints; }
    public void setXpPoints(int xpPoints) { this.xpPoints = xpPoints; }

    public int getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(int currentLevel) { this.currentLevel = currentLevel; }

    public int getStreakShields() { return streakShields; }
    public void setStreakShields(int streakShields) { this.streakShields = streakShields; }

    public boolean isPro() { return isPro; }
    public void setPro(boolean pro) { isPro = pro; }
}
