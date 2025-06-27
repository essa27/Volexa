package com.example.sportmanagement.controller;

import com.example.sportmanagement.model.Reservation;
import com.example.sportmanagement.model.User;
import com.example.sportmanagement.service.ReservationService;
import com.example.sportmanagement.repository.UserRepository;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;
    private final UserRepository userRepository;

    public ReservationController(ReservationService reservationService, UserRepository userRepository) {
        this.reservationService = reservationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Map<String, Object>> getAll() {
        List<Reservation> reservations = reservationService.getAllReservations();

        List<Long> userIds = reservations.stream()
                .map(Reservation::getUserId)
                .distinct()
                .collect(Collectors.toList());

        List<User> users = userRepository.findAllById(userIds);

        Map<Long, String> userIdToName = users.stream()
                .collect(Collectors.toMap(User::getId, User::getName));

        return reservations.stream().map(reservation -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", reservation.getId());
            map.put("courtId", reservation.getCourtId());
            map.put("userId", reservation.getUserId());
            map.put("startTime", reservation.getStartTime());
            map.put("endTime", reservation.getEndTime());
            map.put("title", reservation.getTitle());
            map.put("team", reservation.getTeam());
            map.put("coachName", userIdToName.getOrDefault(reservation.getUserId(), "Unknown"));
            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    public Reservation add(@RequestBody Reservation reservation, Principal principal) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        reservation.setUserId(user.getId());

        return reservationService.addReservation(reservation);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    public void delete(@PathVariable Long id, Principal principal) {
        String username = principal.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        reservationService.deleteReservation(id, currentUser);
    }
}
