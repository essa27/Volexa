package com.example.sportmanagement.controller;

import com.example.sportmanagement.model.Role;
import com.example.sportmanagement.model.User;
import com.example.sportmanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.io.IOException;
import java.nio.file.*;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private static final Path UPLOAD_DIR = Paths.get("uploads");

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PutMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateAccount(
            @RequestPart("user") User updatedUser,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication auth
    )
    {
        String username = auth.getName();
        logger.info("🔄 Update request from user: {}", username);

        Optional<User> optionalUser = userRepository.findByUsername(username);
        if (optionalUser.isEmpty()) {
            logger.warn("⚠️ User not found: {}", username);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

        User user = optionalUser.get();

        if (updatedUser.getName() == null || updatedUser.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Name is required.");
        }

        user.setName(updatedUser.getName().trim());

        if (updatedUser.getAge() != null) {
            user.setAge(updatedUser.getAge());
        }

        if (updatedUser.getEmail() != null && !updatedUser.getEmail().trim().isEmpty()) {
            user.setEmail(updatedUser.getEmail().trim());
        }

        // ✅ Handle image upload
        if (file != null && !file.isEmpty()) {
            try {
                Files.createDirectories(UPLOAD_DIR);
                String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path filePath = UPLOAD_DIR.resolve(filename);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                user.setPhotoUrl("http://localhost:8080/api/images/" + filename);
                logger.info("📸 Uploaded new profile photo: {}", filename);
            } catch (IOException e) {
                logger.error("❌ Photo upload failed", e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save photo.");
            }
        }

        if (user.getRole() == Role.ATHLETE) {
            if (updatedUser.getTeam() != null) {
                user.setTeam(updatedUser.getTeam().trim());
            }
            if (updatedUser.getLevel() != null) {
                user.setLevel(updatedUser.getLevel());
            }
        }

        try {
            User savedUser = userRepository.save(user);
            logger.info("✅ User updated successfully: {}", savedUser);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            logger.error("❌ Error updating user: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating user.");
        }
    }

    // ✅ Serve uploaded images
    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path file = UPLOAD_DIR.resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                HttpHeaders headers = new HttpHeaders();
                headers.add("Access-Control-Allow-Origin", "http://localhost:4200"); // ✅ Match Angular origin
                headers.add("Access-Control-Allow-Methods", "GET");

                return ResponseEntity.ok()
                        .headers(headers)
                        .contentType(MediaType.IMAGE_JPEG) // or use Files.probeContentType(file) if needed
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        logger.info("📥 Fetching full user data for: {}", username);

        Optional<User> user = userRepository.findByUsername(username);

        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            logger.warn("❌ User not found: {}", username);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        logger.info("📤 Fetching all users");
        return ResponseEntity.ok(userRepository.findAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        try {
            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Cannot delete user: related data exists."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred."));
        }
    }




}


