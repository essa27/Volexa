package com.example.sportmanagement.repository;

import com.example.sportmanagement.model.MatchScore;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchScoreRepository extends JpaRepository<MatchScore, Long> {
}
