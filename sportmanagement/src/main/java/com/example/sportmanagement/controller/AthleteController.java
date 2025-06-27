package com.example.sportmanagement.controller;

import com.example.sportmanagement.model.Athlete;
import com.example.sportmanagement.repository.AthleteRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping(value = "/api/athletes", produces = MediaType.APPLICATION_JSON_VALUE)
@CrossOrigin(origins = "http://localhost:4200")
public class AthleteController {

    private final AthleteRepository athleteRepository;
    private final ObjectMapper objectMapper;

    public AthleteController(AthleteRepository athleteRepository, ObjectMapper objectMapper) {
        this.athleteRepository = athleteRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('COACH', 'ADMIN', 'ATHLETE')")
    public ResponseEntity<List<Athlete>> getAllAthletes() {
        return ResponseEntity.ok(athleteRepository.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('COACH', 'ADMIN', 'ATHLETE')")
    public ResponseEntity<?> getAthleteById(@PathVariable Long id) {
        return athleteRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).body(Map.of("message", "Athlete not found")));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('COACH', 'ADMIN')")
    public ResponseEntity<?> createAthlete(
            @RequestPart("athlete") MultipartFile athletePart,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "medicalFile", required = false) MultipartFile medicalFile,
            @RequestPart(value = "contractFile", required = false) MultipartFile contractFile) {

        try {
            Athlete athlete = objectMapper.readValue(athletePart.getInputStream(), Athlete.class);
            handleFileUploads(athlete, file, medicalFile, contractFile);
            Athlete saved = athleteRepository.save(athlete);
            return ResponseEntity.ok(saved);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid JSON: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to save athlete: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('COACH', 'ADMIN')")
    public ResponseEntity<?> updateAthlete(
            @PathVariable Long id,
            @RequestPart("athlete") MultipartFile athletePart,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "medicalFile", required = false) MultipartFile medicalFile,
            @RequestPart(value = "contractFile", required = false) MultipartFile contractFile) {

        try {
            Athlete updatedAthlete = objectMapper.readValue(athletePart.getInputStream(), Athlete.class);
            Optional<Athlete> optionalAthlete = athleteRepository.findById(id);
            if (optionalAthlete.isPresent()) {
                Athlete existing = optionalAthlete.get();
                updateAthleteFields(existing, updatedAthlete);
                handleFileUploads(existing, file, medicalFile, contractFile);
                athleteRepository.save(existing);
                return ResponseEntity.ok(existing);
            } else {
                return ResponseEntity.status(404).body(Map.of("message", "Athlete not found"));
            }
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid JSON: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to update athlete: " + e.getMessage()));
        }
    }

    private void updateAthleteFields(Athlete existing, Athlete updatedAthlete) {
        existing.setName(updatedAthlete.getName());
        existing.setAge(updatedAthlete.getAge());
        existing.setHeight(updatedAthlete.getHeight());
        existing.setWeight(updatedAthlete.getWeight());
        existing.setEmail(updatedAthlete.getEmail());
        existing.setPosition(updatedAthlete.getPosition());
        existing.setTeam(updatedAthlete.getTeam());
        existing.setLevel(updatedAthlete.getLevel());
        existing.setAttendance(updatedAthlete.getAttendance());
        existing.setMatchesPlayed(updatedAthlete.getMatchesPlayed());
        existing.setPoints(updatedAthlete.getPoints());
        existing.setBlocks(updatedAthlete.getBlocks());
        existing.setServes(updatedAthlete.getServes());
        existing.getWeeklyAttendance().clear();
        existing.getWeeklyAttendance().addAll(updatedAthlete.getWeeklyAttendance());



        if (updatedAthlete.getPhotoUrl() != null && !updatedAthlete.getPhotoUrl().isBlank()) {
            existing.setPhotoUrl(updatedAthlete.getPhotoUrl());
        }
    }


    private void handleFileUploads(Athlete athlete, MultipartFile file, MultipartFile medicalFile, MultipartFile contractFile) throws IOException {
        if (file != null && !file.isEmpty()) {
            String uploadDir = "uploads/";
            createDirectoriesIfNotExists(uploadDir);
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            athlete.setPhotoUrl(filename);
        }

        if (medicalFile != null && !medicalFile.isEmpty()) {
            String dir = "uploads/medical/";
            createDirectoriesIfNotExists(dir);
            String filename = UUID.randomUUID() + "_" + medicalFile.getOriginalFilename();
            Path filePath = Paths.get(dir, filename);
            Files.copy(medicalFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            athlete.setMedicalDocumentUrl(filename);
        }

        if (contractFile != null && !contractFile.isEmpty()) {
            String dir = "uploads/contracts/";
            createDirectoriesIfNotExists(dir);
            String filename = UUID.randomUUID() + "_" + contractFile.getOriginalFilename();
            Path filePath = Paths.get(dir, filename);
            Files.copy(contractFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            athlete.setContractDocumentUrl(filename);
        }
    }

    private void createDirectoriesIfNotExists(String dirPath) throws IOException {
        Path path = Paths.get(dirPath);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('COACH', 'ADMIN')")
    public ResponseEntity<?> deleteAthlete(@PathVariable Long id) {
        if (!athleteRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("message", "Athlete not found"));
        }
        athleteRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Athlete deleted successfully"));
    }

    @GetMapping("/files/{type}/{filename:.+}")
    public ResponseEntity<Resource> getAthleteFile(
            @PathVariable String type,
            @PathVariable String filename) {

        try {
            String decodedFilename = URLDecoder.decode(filename, StandardCharsets.UTF_8);

            Path basePath = switch (type) {
                case "contracts" -> Paths.get("uploads/contracts/");
                case "medical" -> Paths.get("uploads/medical/");
                default -> Paths.get("uploads/");
            };

            Path filePath = basePath.resolve(decodedFilename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            String contentType = Files.probeContentType(filePath);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + decodedFilename + "\"")
                    .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                    .body(resource);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}