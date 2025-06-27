package com.example.sportmanagement.repository;

import com.example.sportmanagement.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("SELECT COUNT(r) > 0 FROM Reservation r " +
            "WHERE r.courtId = :courtId " +
            "AND :startTime < r.endTime AND :endTime > r.startTime")
    boolean existsByCourtIdAndTimeConflict(
            @Param("courtId") Long courtId,
            @Param("startTime") OffsetDateTime startTime,
            @Param("endTime") OffsetDateTime endTime
    );
}
