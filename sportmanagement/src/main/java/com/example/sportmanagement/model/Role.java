package com.example.sportmanagement.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Role {
    COACH, ADMIN, ATHLETE;

    @JsonCreator
    public static Role fromString(String key) {
        if (key == null) return null;
        try {
            return Role.valueOf(key.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    @JsonValue
    public String getValue() {
        return this.name();
    }
}
