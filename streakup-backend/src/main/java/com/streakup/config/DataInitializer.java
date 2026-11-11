package com.streakup.config;

import com.streakup.model.entity.Badge;
import com.streakup.model.entity.User;
import com.streakup.repository.BadgeRepository;
import com.streakup.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final BadgeRepository badgeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(BadgeRepository badgeRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.badgeRepository = badgeRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (badgeRepository.count() == 0) {
            log.info("🌱 Seeding default gamification badges...");

            List<Badge> defaultBadges = List.of(
                    new Badge("FIRST_STEP", "First Step", "Complete your first habit", "footprints", 0, 10),
                    new Badge("STREAK_3", "Spark of Discipline", "Achieve a 3-day streak", "flame", 3, 0),
                    new Badge("STREAK_7", "7-Day Warrior", "Maintain a 7-day streak", "shield-check", 7, 0),
                    new Badge("STREAK_21", "Habit Builder", "Hit the 21-day psychological habit milestone", "brain", 21, 0),
                    new Badge("STREAK_30", "30-Day Master", "Dominate your routine for 30 consecutive days", "trophy", 30, 0),
                    new Badge("LEVEL_5", "Rising Star", "Earn 500 XP and reach Level 5", "star", 0, 500),
                    new Badge("LEVEL_10", "Discipline Icon", "Earn 1000 XP and reach Level 10", "crown", 0, 1000)
            );

            badgeRepository.saveAll(defaultBadges);
            log.info("✅ 7 Default badges seeded successfully!");
        }

        if (userRepository.findByEmail("alex@streakup.app").isEmpty()) {
            User demoUser = new User(
                    "alex@streakup.app",
                    passwordEncoder.encode("password123"),
                    "Alex Hunter"
            );
            demoUser.setXpPoints(140);
            demoUser.setCurrentLevel(2);
            demoUser.setStreakShields(2);
            userRepository.save(demoUser);
            log.info("✅ Default demo user alex@streakup.app seeded (password: password123)");
        }
    }
}
