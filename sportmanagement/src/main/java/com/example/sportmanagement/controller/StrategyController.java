package com.example.sportmanagement.controller;

import com.example.sportmanagement.model.Strategy;
import com.example.sportmanagement.model.User;
import com.example.sportmanagement.repository.StrategyRepository;
import com.example.sportmanagement.repository.UserRepository;
import com.example.sportmanagement.config.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping("/api/strategy")
@CrossOrigin(origins = "http://localhost:4200")
public class StrategyController {

    private final Path uploadDir = Paths.get("uploads/strategy");
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final StrategyRepository strategyRepository;

    public StrategyController(JwtUtil jwtUtil, UserRepository userRepository, StrategyRepository strategyRepository) throws IOException {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.strategyRepository = strategyRepository;
        Files.createDirectories(uploadDir);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadStrategy(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            HttpServletRequest request
    )
    {
        try {
            String token = request.getHeader("Authorization").substring(7);
            String username = jwtUtil.extractUsername(token);
            User user = userRepository.findByUsername(username).orElseThrow();

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            Strategy strategy = new Strategy();
            strategy.setName(name);
            strategy.setFilename(filename);
            strategy.setUser(user);
            strategyRepository.save(strategy);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Strategy saved successfully");
            response.put("filename", filename);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "❌ Upload failed"));
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserStrategies(HttpServletRequest request) {
        try {
            String token = request.getHeader("Authorization").substring(7);
            String username = jwtUtil.extractUsername(token);

            List<Strategy> strategies = strategyRepository.findByUserUsername(username);
            return ResponseEntity.ok(strategies);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "❌ Unauthorized"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStrategy(@PathVariable Long id, HttpServletRequest request) {
        try {
            String token = request.getHeader("Authorization").substring(7);
            String username = jwtUtil.extractUsername(token);

            Strategy strategy = strategyRepository.findById(id).orElseThrow();

            if (!strategy.getUser().getUsername().equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "❌ You can only delete your own strategy"));
            }

            Files.deleteIfExists(uploadDir.resolve(strategy.getFilename()));
            strategyRepository.delete(strategy);

            return ResponseEntity.ok(Map.of("message", "✅ Strategy deleted"));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "❌ File deletion failed"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "❌ Strategy not found"));
        }
    }

    @GetMapping("/image/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) throws IOException {
        Path file = uploadDir.resolve(filename);
        Resource resource = new UrlResource(file.toUri());

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }
}
