package com.streakup.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Column(name = "xp_points", nullable = false)
    private int xpPoints = 0;

    @Column(name = "current_level", nullable = false)
    private int currentLevel = 1;

    @Column(name = "streak_shields", nullable = false)
    private int streakShields = 1; // 1 free shield to start

    @Column(name = "is_pro", nullable = false)
    private boolean isPro = false;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "bio", length = 300)
    private String bio;

    @Column(name = "reset_password_otp", length = 10)
    private String resetPasswordOtp;

    @Column(name = "reset_password_otp_expiry")
    private LocalDateTime resetPasswordOtpExpiry;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public User() {}

    public User(String email, String password, String fullName) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.xpPoints = 0;
        this.currentLevel = 1;
        this.streakShields = 1;
        this.isPro = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

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

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getResetPasswordOtp() { return resetPasswordOtp; }
    public void setResetPasswordOtp(String resetPasswordOtp) { this.resetPasswordOtp = resetPasswordOtp; }

    public LocalDateTime getResetPasswordOtpExpiry() { return resetPasswordOtpExpiry; }
    public void setResetPasswordOtpExpiry(LocalDateTime resetPasswordOtpExpiry) { this.resetPasswordOtpExpiry = resetPasswordOtpExpiry; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
