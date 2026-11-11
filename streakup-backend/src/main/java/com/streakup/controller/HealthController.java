package com.streakup.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@Tag(name = "Health Check", description = "Server status check")
public class HealthController {

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public String rootPage() {
        return "<!DOCTYPE html><html><head><title>StreakUp API</title><style>" +
                "body{font-family:system-ui,-apple-system,sans-serif;background:#F8FAFC;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}" +
                ".card{background:white;padding:40px;border-radius:24px;box-shadow:0 10px 25px rgba(0,0,0,0.05);text-align:center;max-width:420px;border:1px solid #E2E8F0;}" +
                ".flame{font-size:56px;margin-bottom:12px;}" +
                "h1{color:#0F172A;font-size:24px;margin:0 0 8px;}" +
                ".status{display:inline-block;background:#ECFDF5;color:#059669;padding:6px 14px;border-radius:20px;font-weight:700;font-size:12px;margin-bottom:16px;border:1px solid #A7F3D0;}" +
                "p{color:#64748B;font-size:14px;line-height:1.5;margin:0 0 20px;}" +
                "a{display:inline-block;background:#4F46E5;color:white;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;}" +
                "</style></head><body><div class='card'>" +
                "<div class='flame'>🔥</div>" +
                "<h1>StreakUp Backend</h1>" +
                "<div class='status'>🟢 24/7 Cloud API Online</div>" +
                "<p>Spring Boot 3 + PostgreSQL Cloud Database connected and operational.</p>" +
                "<a href='/swagger-ui.html'>View Swagger API Docs →</a>" +
                "</div></body></html>";
    }

    @GetMapping("/api/v1/health")
    @Operation(summary = "Check server and API health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "app", "StreakUp Backend API",
                "timestamp", LocalDateTime.now(),
                "version", "1.0.0"
        ));
    }
}
