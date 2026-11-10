package com.streakup.model.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "habit_logs", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"habit_id", "completed_date"})
})
public class HabitLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habit_id", nullable = false)
    private Habit habit;

    @Column(name = "completed_date", nullable = false)
    private LocalDate completedDate;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt = LocalDateTime.now();

    @Column(name = "xp_earned", nullable = false)
    private int xpEarned = 10;

    public HabitLog() {}

    public HabitLog(User user, Habit habit, LocalDate completedDate, int xpEarned) {
        this.user = user;
        this.habit = habit;
        this.completedDate = completedDate;
        this.xpEarned = xpEarned;
        this.completedAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Habit getHabit() { return habit; }
    public void setHabit(Habit habit) { this.habit = habit; }

    public LocalDate getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDate completedDate) { this.completedDate = completedDate; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public int getXpEarned() { return xpEarned; }
    public void setXpEarned(int xpEarned) { this.xpEarned = xpEarned; }
}
