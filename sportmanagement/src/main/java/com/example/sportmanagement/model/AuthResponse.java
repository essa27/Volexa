package com.example.sportmanagement.model;

public class AuthResponse {

    private final String token;
    private final String username;
    private final String role;
    private final Long userId;

    public AuthResponse(String token, String username, String role, Long userId) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.userId = userId;
    }

    public String getToken() {
        return token;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public Long getUserId() {
        return userId;
    }

    @Override
    public String toString() {
        return "AuthResponse{" +
                "token='[PROTECTED]'" +
                ", username='" + username + '\'' +
                ", role='" + role + '\'' +
                ", userId=" + userId +
                '}';
    }
}
