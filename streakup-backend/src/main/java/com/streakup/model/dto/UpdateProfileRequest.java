package com.streakup.model.dto;

public class UpdateProfileRequest {
    private String fullName;
    private String bio;
    private String avatarUrl;

    public UpdateProfileRequest() {}

    public UpdateProfileRequest(String fullName, String bio, String avatarUrl) {
        this.fullName = fullName;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
