package com.streakup.controller;

import com.streakup.model.dto.HabitCompleteResponse;
import com.streakup.model.dto.HabitRequest;
import com.streakup.model.dto.HabitResponse;
import com.streakup.model.entity.User;
import com.streakup.repository.UserRepository;
import com.streakup.service.HabitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/habits")
@Tag(name = "Habits", description = "Habit Management and Daily Check-ins")
public class HabitController {

    private final HabitService habitService;
    private final UserRepository userRepository;

    public HabitController(HabitService habitService, UserRepository userRepository) {
        this.habitService = habitService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @GetMapping
    @Operation(summary = "Get all active habits for the current user with streak data")
    public ResponseEntity<List<HabitResponse>> getHabits(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(habitService.getUserHabits(user));
    }

    @PostMapping
    @Operation(summary = "Create a new habit (enforces Free tier max 4 limit)")
    public ResponseEntity<HabitResponse> createHabit(Authentication authentication,
                                                    @Valid @RequestBody HabitRequest request) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(habitService.createHabit(user, request));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Mark a habit completed for today or a specific date (+10 XP & Streak)")
    public ResponseEntity<HabitCompleteResponse> completeHabit(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(habitService.completeHabit(user, id, date));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Archive an existing habit")
    public ResponseEntity<Map<String, String>> archiveHabit(Authentication authentication, @PathVariable UUID id) {
        User user = getAuthenticatedUser(authentication);
        habitService.archiveHabit(user, id);
        return ResponseEntity.ok(Map.of("message", "Habit successfully archived"));
    }
}
