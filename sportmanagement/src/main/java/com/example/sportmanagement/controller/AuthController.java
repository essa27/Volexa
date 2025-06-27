package com.example.sportmanagement.controller;

import com.example.sportmanagement.config.JwtUtil;
import com.example.sportmanagement.model.AuthRequest;
import com.example.sportmanagement.model.AuthResponse;
import com.example.sportmanagement.model.RegisterRequest;
import com.example.sportmanagement.model.User;
import com.example.sportmanagement.service.UserService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            logger.info("🔐 Login attempt for user: {}", request.getUsername());

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            return generateAuthResponse(request.getUsername());

        } catch (Exception e) {
            logger.warn("❌ Login failed for user: {} - {}", request.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        logger.info("👤 Registration attempt:");
        logger.info("   Username: {}", registerRequest.getUsername());
        logger.info("   Email: {}", registerRequest.getEmail());
        logger.info("   Password: {}", registerRequest.getPassword());
        logger.info("   Role: {}", registerRequest.getRole());

        try {
            userService.registerNewUser(registerRequest);
            return ResponseEntity.ok(Map.of("message", "User registered successfully"));


        } catch (Exception e) {
            logger.error("❌ Registration failed for user: {}", registerRequest.getUsername(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }



    private ResponseEntity<AuthResponse> generateAuthResponse(String username) {
        UserDetails userDetails = userService.loadUserByUsername(username);
        User user = userService.getUserByUsername(username);

        if (userDetails.getAuthorities().isEmpty()) {
            logger.error("🚫 No roles found for user: {}", username);
            throw new IllegalStateException("User has no roles assigned");
        }

        String token = jwtUtil.generateToken(userDetails);
        String role = userDetails.getAuthorities().iterator().next().getAuthority();
        String cleanRole = role.replace("ROLE_", "").toLowerCase();

        AuthResponse response = new AuthResponse(
                token,
                user.getUsername(),
                cleanRole,
                user.getId()
        );

        logger.info("✅ Auth successful for {} with role {}", username, cleanRole);
        return ResponseEntity.ok(response);
    }
}


