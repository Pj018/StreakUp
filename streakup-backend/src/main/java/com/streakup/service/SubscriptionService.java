package com.streakup.service;

import com.streakup.model.dto.SubscriptionRequest;
import com.streakup.model.entity.Subscription;
import com.streakup.model.entity.User;
import com.streakup.model.enums.PlanType;
import com.streakup.repository.SubscriptionRepository;
import com.streakup.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository, UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public User upgradeSubscription(User user, SubscriptionRequest request) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endDate = (request.getPlanType() == PlanType.PRO_ANNUAL)
                ? now.plusYears(1)
                : now.plusMonths(1);

        Subscription subscription = new Subscription();
        subscription.setUser(user);
        subscription.setPlanType(request.getPlanType());
        subscription.setStatus("ACTIVE");
        subscription.setStartDate(now);
        subscription.setEndDate(endDate);
        subscription.setTransactionId(request.getTransactionId() != null ? request.getTransactionId() : "TXN_" + System.currentTimeMillis());

        subscriptionRepository.save(subscription);

        // Update User Pro status and give 5 bonus streak shields
        user.setPro(true);
        user.setStreakShields(user.getStreakShields() + 5);
        return userRepository.save(user);
    }

    public Optional<Subscription> getActiveSubscription(User user) {
        return subscriptionRepository.findTopByUserIdAndStatusOrderByStartDateDesc(user.getId(), "ACTIVE");
    }
}
