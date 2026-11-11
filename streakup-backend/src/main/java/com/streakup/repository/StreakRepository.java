package com.streakup.repository;

import com.streakup.model.entity.Streak;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StreakRepository extends JpaRepository<Streak, UUID> {
    Optional<Streak> findByHabitId(UUID habitId);
    List<Streak> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
