package com.streakup.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    @Async
    public void sendWelcomeEmail(String toEmail, String fullName) {
        log.info("📧 Preparing welcome email for {} <{}>...", fullName, toEmail);

        String subject = "Welcome to StreakUp! 🔥 Your Discipline Journey Begins";
        String htmlContent = buildWelcomeHtml(fullName);

        if (mailSender != null && mailFrom != null && !mailFrom.isBlank()) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(mailFrom, "StreakUp Team");
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);

                mailSender.send(message);
                log.info("✅ Welcome email successfully sent via SMTP to {}", toEmail);
                return;
            } catch (Exception e) {
                log.warn("⚠️ SMTP delivery encountered an issue ({}). Email logged to console.", e.getMessage());
            }
        } else {
            log.info("ℹ️ SMTP credentials not set. Email generated and logged for: {}", toEmail);
        }

        // Always log email details for auditing / development verification
        log.info("==================== WELCOME EMAIL ====================");
        log.info("To: {}", toEmail);
        log.info("Subject: {}", subject);
        log.info("Recipient: {}", fullName);
        log.info("Benefits: 1 Free Streak Shield + Level 1 Explorer Status");
        log.info("========================================================");
    }

    private String buildWelcomeHtml(String fullName) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<meta charset='UTF-8'>"
                + "<meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                + "<style>"
                + "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 20px; color: #0F172A; }"
                + ".container { max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }"
                + ".header { background: linear-gradient(135deg, #EA580C 0%, #C2410C 100%); padding: 32px 24px; text-align: center; color: #FFFFFF; }"
                + ".header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }"
                + ".header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }"
                + ".content { padding: 28px 24px; }"
                + ".greeting { font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 12px; }"
                + ".text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }"
                + ".perks-box { background-color: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 24px; }"
                + ".perk-item { display: flex; align-items: center; margin-bottom: 10px; font-size: 14px; color: #1E293B; font-weight: 600; }"
                + ".perk-item:last-child { margin-bottom: 0; }"
                + ".perk-icon { margin-right: 10px; font-size: 18px; }"
                + ".btn-container { text-align: center; margin: 28px 0 16px; }"
                + ".btn { display: inline-block; background-color: #EA580C; color: #FFFFFF !important; font-weight: 800; font-size: 15px; padding: 14px 32px; border-radius: 10px; text-decoration: none; }"
                + ".footer { padding: 20px 24px; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #F1F5F9; }"
                + "</style>"
                + "</head>"
                + "<body>"
                + "<div class='container'>"
                + "<div class='header'>"
                + "<h1>🔥 StreakUp</h1>"
                + "<p>Gamified Habit Tracker & Routine Planner</p>"
                + "</div>"
                + "<div class='content'>"
                + "<div class='greeting'>Welcome aboard, " + escapeHtml(fullName) + "! 🚀</div>"
                + "<div class='text'>Congratulations on taking the first step towards building unstoppable daily discipline. We are thrilled to have you in the StreakUp community!</div>"
                + "<div class='perks-box'>"
                + "<div class='perk-item'><span class='perk-icon'>🛡️</span> 1 Free Streak Shield credited to your vault</div>"
                + "<div class='perk-item'><span class='perk-icon'>⚡</span> Level 1 Routine Explorer unlocked</div>"
                + "<div class='perk-item'><span class='perk-icon'>🔥</span> Complete your 3 starter daily habits to earn +30 XP</div>"
                + "</div>"
                + "<div class='text'>Your starter routine has been initialized. Open the app, mark your habits completed, and keep your flame glowing today!</div>"
                + "</div>"
                + "<div class='footer'>Sent with ❤️ by StreakUp Team • Keep Your Flame Glowing Daily</div>"
                + "</div>"
                + "</body>"
                + "</html>";
    }

    private String escapeHtml(String input) {
        if (input == null) return "Member";
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
