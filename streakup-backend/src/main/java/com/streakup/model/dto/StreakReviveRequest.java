package com.streakup.model.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class StreakReviveRequest {
    private UUID habitId;

    @NotBlank(message = "Ad token or proof is required")
    private String adVerificationToken;

    public StreakReviveRequest() {}

    public UUID getHabitId() { return habitId; }
    public void setHabitId(UUID habitId) { this.habitId = habitId; }

    public String getAdVerificationToken() { return adVerificationToken; }
    public void setAdVerificationToken(String adVerificationToken) { this.adVerificationToken = adVerificationToken; }
}
