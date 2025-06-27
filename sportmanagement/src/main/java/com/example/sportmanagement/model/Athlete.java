package com.example.sportmanagement.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "athletes")
public class Athlete {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int age;
    private double height;
    private double weight;
    private String position;
    private String email;
    private String team;
    private String level;
    private int attendance;
    private String photoUrl;

    private int matchesPlayed;
    private int points;
    private int blocks;
    private int serves;
    private String medicalDocumentUrl;
    private String contractDocumentUrl;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "weekly_attendance", joinColumns = @JoinColumn(name = "athlete_id"))
    public List<WeeklyAttendance> weeklyAttendance;

    // Default constructor
    public Athlete() {}

    // Getters and Setters

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }
    public void setAge(int age) {
        this.age = age;
    }

    public double getHeight() {
        return height;
    }
    public void setHeight(double height) {
        this.height = height;
    }

    public double getWeight() {
        return weight;
    }
    public void setWeight(double weight) {
        this.weight = weight;
    }

    public String getPosition() {
        return position;
    }
    public void setPosition(String position) {
        this.position = position;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getTeam() {
        return team;
    }
    public void setTeam(String team) {
        this.team = team;
    }

    public String getLevel() {
        return level;
    }
    public void setLevel(String level) {
        this.level = level;
    }

    public int getAttendance() {
        return attendance;
    }
    public void setAttendance(int attendance) {
        this.attendance = attendance;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }
    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public int getMatchesPlayed() {
        return matchesPlayed;
    }
    public void setMatchesPlayed(int matchesPlayed) {
        this.matchesPlayed = matchesPlayed;
    }

    public int getPoints() {
        return points;
    }
    public void setPoints(int points) {
        this.points = points;
    }

    public int getBlocks() {
        return blocks;
    }
    public void setBlocks(int blocks) {
        this.blocks = blocks;
    }

    public int getServes() {
        return serves;
    }
    public void setServes(int serves) {
        this.serves = serves;
    }

    public String getMedicalDocumentUrl() {
        return medicalDocumentUrl;
    }
    public void setMedicalDocumentUrl(String medicalDocumentUrl) {
        this.medicalDocumentUrl = medicalDocumentUrl;
    }

    public String getContractDocumentUrl() {
        return contractDocumentUrl;
    }
    public void setContractDocumentUrl(String contractDocumentUrl) {
        this.contractDocumentUrl = contractDocumentUrl;
    }

    public List<WeeklyAttendance> getWeeklyAttendance() {
        return weeklyAttendance;
    }
    public void setWeeklyAttendance(List<WeeklyAttendance> weeklyAttendance) {
        this.weeklyAttendance = weeklyAttendance;
    }

    // Inner class
    @Embeddable
    public static class WeeklyAttendance {
        private String label;
        private int attended;
        private int total;

        public WeeklyAttendance() {}

        public WeeklyAttendance(String label, int attended, int total) {
            this.label = label;
            this.attended = attended;
            this.total = total;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public int getAttended() {
            return attended;
        }

        public void setAttended(int attended) {
            this.attended = attended;
        }

        public int getTotal() {
            return total;
        }

        public void setTotal(int total) {
            this.total = total;
        }
    }
}
