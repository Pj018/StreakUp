package com.streakup.model.entity;

import com.streakup.model.enums.StreakStatus;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "streaks")
public class Streak {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habit_id", nullable = false, unique = true)
    private Habit habit;

    @Column(name = "current_streak", nullable = false)
    private int currentStreak = 0;

    @Column(name = "longest_streak", nullable = false)
    private int longestStreak = 0;

    @Column(name = "last_completed_date")
    private LocalDate lastCompletedDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StreakStatus status = StreakStatus.ACTIVE;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Streak() {}

    public Streak(User user, Habit habit) {
        this.user = user;
        this.habit = habit;
        this.currentStreak = 0;
        this.longestStreak = 0;
        this.status = StreakStatus.ACTIVE;
        this.updatedAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Habit getHabit() { return habit; }
    public void setHabit(Habit habit) { this.habit = habit; }

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public int getLongestStreak() { return longestStreak; }
    public void setLongestStreak(int longestStreak) { this.longestStreak = longestStreak; }

    public LocalDate getLastCompletedDate() { return lastCompletedDate; }
    public void setLastCompletedDate(LocalDate lastCompletedDate) { this.lastCompletedDate = lastCompletedDate; }

    public StreakStatus getStatus() { return status; }
    public void setStatus(StreakStatus status) { this.status = status; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
