package com.streakup.repository;

import com.streakup.model.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, UUID> {
    List<UserBadge> findByUserIdOrderByUnlockedAtDesc(UUID userId);
    boolean existsByUserIdAndBadgeId(UUID userId, UUID badgeId);
}
