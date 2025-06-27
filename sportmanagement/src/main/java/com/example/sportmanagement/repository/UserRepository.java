package com.example.sportmanagement.repository;

import com.example.sportmanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);  // Change this to return Optional<User>
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
