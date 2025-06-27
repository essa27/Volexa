package com.example.sportmanagement.service;

import com.example.sportmanagement.model.User;
import com.example.sportmanagement.model.RegisterRequest;
import com.example.sportmanagement.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private static final String ROLE_PREFIX = "ROLE_";

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void registerNewUser(RegisterRequest registerRequest) {
        if (registerRequest.getUsername() == null || registerRequest.getUsername().isBlank()) {
            throw new RuntimeException("❌ Username is required.");
        }
        if (registerRequest.getEmail() == null || registerRequest.getEmail().isBlank()) {
            throw new RuntimeException("❌ Email is required.");
        }
        if (registerRequest.getPassword() == null || registerRequest.getPassword().isBlank()) {
            throw new RuntimeException("❌ Password is required.");
        }
        if (registerRequest.getRole() == null) {
            throw new RuntimeException("❌ Role is required.");
        }

        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("❌ Username already exists.");
        }
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("❌ Email already exists.");
        }

        String encodedPassword = passwordEncoder.encode(registerRequest.getPassword());

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(encodedPassword);
        user.setRole(registerRequest.getRole());

        // ✅ Set required default values
        user.setName(registerRequest.getUsername()); // or any placeholder name
        user.setTeam("Unassigned");
        user.setLevel("Beginner");
        user.setPhotoUrl("");
        user.setAge(0); // or any safe default

        userRepository.save(user);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = getUserByUsername(username);

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities(ROLE_PREFIX + user.getRole().name())
                .build();
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("❌ User not found with username: " + username));
    }
}
