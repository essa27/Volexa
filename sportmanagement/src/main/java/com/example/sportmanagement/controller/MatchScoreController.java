package com.example.sportmanagement.controller;

import com.example.sportmanagement.model.MatchScore;
import com.example.sportmanagement.service.MatchScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scores")
@CrossOrigin(origins = "*")
public class MatchScoreController {

    @Autowired
    private MatchScoreService service;

    @GetMapping
    public List<MatchScore> getAllScores() {
        return service.getAllScores();
    }

    @PostMapping
    public MatchScore addScore(@RequestBody MatchScore score) {
        return service.saveScore(score);
    }

    @PutMapping("/{id}")
    public MatchScore updateScore(@PathVariable Long id, @RequestBody MatchScore updatedScore) {
        updatedScore.setId(id);
        return service.saveScore(updatedScore);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteScore(@PathVariable Long id) {
        service.deleteScore(id);
        return ResponseEntity.ok().build();
    }
}
