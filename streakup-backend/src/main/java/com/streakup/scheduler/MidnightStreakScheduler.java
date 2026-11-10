package com.streakup.scheduler;

import com.streakup.service.StreakService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class MidnightStreakScheduler {

    private static final Logger log = LoggerFactory.getLogger(MidnightStreakScheduler.class);
    private final StreakService streakService;

    public MidnightStreakScheduler(StreakService streakService) {
        this.streakService = streakService;
    }

    /**
     * Executes every midnight: 00:00:00 AM server time
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void runMidnightStreakEngine() {
        LocalDate today = LocalDate.now();
        log.info("⏰ Midnight Streak Engine triggered for date: {}", today);
        streakService.evaluateAllStreaksForMissedDays(today);
        log.info("✅ Midnight Streak Engine completed successfully.");
    }

    /**
     * Manual trigger for testing/admin purposes
     */
    public void triggerManually() {
        log.info("⚡ Manual Streak Engine evaluation triggered.");
        streakService.evaluateAllStreaksForMissedDays(LocalDate.now());
    }
}
