package com.streakup.repository;

import com.streakup.model.entity.Habit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HabitRepository extends JpaRepository<Habit, UUID> {
    List<Habit> findByUserIdAndIsArchivedFalseOrderByCreatedAtDesc(UUID userId);
    long countByUserIdAndIsArchivedFalse(UUID userId);
    Optional<Habit> findByIdAndUserId(UUID id, UUID userId);
    List<Habit> findByIsArchivedFalse();
}
