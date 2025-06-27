package com.example.sportmanagement.model;

import jakarta.persistence.*;

@Entity
public class MatchScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String date;
    private String teamA;
    private String teamB;
    private int pointsA;
    private int pointsB;
    private int setsA;
    private int setsB;

    public MatchScore() {
    }

    public MatchScore(Long id, String date, String teamA, String teamB, int pointsA, int pointsB, int setsA, int setsB) {
        this.id = id;
        this.date = date;
        this.teamA = teamA;
        this.teamB = teamB;
        this.pointsA = pointsA;
        this.pointsB = pointsB;
        this.setsA = setsA;
        this.setsB = setsB;
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTeamA() {
        return teamA;
    }

    public void setTeamA(String teamA) {
        this.teamA = teamA;
    }

    public String getTeamB() {
        return teamB;
    }

    public void setTeamB(String teamB) {
        this.teamB = teamB;
    }

    public int getPointsA() {
        return pointsA;
    }

    public void setPointsA(int pointsA) {
        this.pointsA = pointsA;
    }

    public int getPointsB() {
        return pointsB;
    }

    public void setPointsB(int pointsB) {
        this.pointsB = pointsB;
    }

    public int getSetsA() {
        return setsA;
    }

    public void setSetsA(int setsA) {
        this.setsA = setsA;
    }

    public int getSetsB() {
        return setsB;
    }

    public void setSetsB(int setsB) {
        this.setsB = setsB;
    }
}
