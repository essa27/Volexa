package com.example.sportmanagement.service;

import com.example.sportmanagement.model.MatchScore;
import com.example.sportmanagement.repository.MatchScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MatchScoreService {

    @Autowired
    private MatchScoreRepository repository;

    public List<MatchScore> getAllScores() {
        return repository.findAll();
    }

    public MatchScore saveScore(MatchScore score) {
        return repository.save(score);
    }

    public void deleteScore(Long id) {
        repository.deleteById(id);
    }
}
