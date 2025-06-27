package com.example.sportmanagement.service;

import com.example.sportmanagement.model.Reservation;
import com.example.sportmanagement.model.User;
import com.example.sportmanagement.model.Role;
import com.example.sportmanagement.repository.ReservationRepository;
import com.example.sportmanagement.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    public ReservationService(ReservationRepository reservationRepository, UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
    }

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    public Reservation addReservation(Reservation reservation) {
        boolean conflict = reservationRepository.existsByCourtIdAndTimeConflict(
                reservation.getCourtId(), reservation.getStartTime(), reservation.getEndTime()
        );
        if (conflict) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Conflict: Court " + reservation.getCourtId() +
                            " is already booked for the selected time."
            );
        }

        return reservationRepository.save(reservation);
    }

    public void deleteReservation(Long id, User currentUser) {
        Reservation reservation = getReservationById(id);

        Role userRole = currentUser.getRole();
        boolean isAdmin = userRole == Role.ADMIN;
        boolean isOwner = reservation.getUserId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this reservation.");
        }

        reservationRepository.deleteById(id);
    }

    public Reservation getReservationById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));
    }

    public String getCoachNameForReservation(Reservation reservation) {
        return userRepository.findById(reservation.getUserId())
                .map(User::getName)
                .orElse("Unknown");
    }
}
