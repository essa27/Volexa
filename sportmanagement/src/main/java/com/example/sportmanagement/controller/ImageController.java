package com.example.sportmanagement.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "http://localhost:4200")
public class ImageController {


    @GetMapping("/{filename:.+}")
    public ResponseEntity<byte[]> getImage(@PathVariable String filename) {
        try {
            // Set the path to the images folder
            Path imagePath = Paths.get("uploads").resolve(filename);


            if (!Files.exists(imagePath)) {
                // Fallback in case the image is not found, you could return a default image
                Path fallbackImagePath = Paths.get("uploads").resolve("default.jpg");
                byte[] fallbackImageBytes = Files.readAllBytes(fallbackImagePath);
                return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(fallbackImageBytes);
            }

            MediaType mediaType = Optional.ofNullable(Files.probeContentType(imagePath))
                    .map(MediaType::parseMediaType)
                    .orElse(MediaType.APPLICATION_OCTET_STREAM);

            byte[] imageBytes = Files.readAllBytes(imagePath);
            return ResponseEntity.ok().contentType(mediaType).body(imageBytes);
        } catch (IOException e) {
            // Log error (optional)
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);  // Return 500 Internal Server Error
        }
    }
}
