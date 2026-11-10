package com.streakup.repository;

import com.streakup.model.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    Optional<Subscription> findTopByUserIdAndStatusOrderByStartDateDesc(UUID userId, String status);
}
