package com.streakup.repository;

import com.streakup.model.entity.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HabitLogRepository extends JpaRepository<HabitLog, UUID> {
    Optional<HabitLog> findByHabitIdAndCompletedDate(UUID habitId, LocalDate completedDate);
    boolean existsByHabitIdAndCompletedDate(UUID habitId, LocalDate completedDate);
    List<HabitLog> findByUserIdAndCompletedDate(UUID userId, LocalDate completedDate);
    List<HabitLog> findByUserIdAndCompletedDateBetweenOrderByCompletedDateAsc(UUID userId, LocalDate start, LocalDate end);
    long countByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
