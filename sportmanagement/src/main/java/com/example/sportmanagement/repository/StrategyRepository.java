package com.example.sportmanagement.repository;

import com.example.sportmanagement.model.Strategy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StrategyRepository extends JpaRepository<Strategy, Long> {
    List<Strategy> findByUserUsername(String username);
}
