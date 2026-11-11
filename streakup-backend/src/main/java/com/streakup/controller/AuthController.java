package com.streakup.controller;

import com.streakup.model.dto.AuthRequest;
import com.streakup.model.dto.AuthResponse;
import com.streakup.model.dto.ForgotPasswordRequest;
import com.streakup.model.dto.RegisterRequest;
import com.streakup.model.dto.ResetPasswordRequest;
import com.streakup.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Registration and Login APIs")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Login existing user")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Send 6-digit password reset verification OTP to user email")
    public ResponseEntity<Map<String, Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "If an account exists with this email, a 6-digit verification code has been sent."
        ));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using 6-digit verification OTP code")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password has been successfully reset! You can now log in with your new password."
        ));
    }
}
