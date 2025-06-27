package com.example.sportmanagement.repository;

import com.example.sportmanagement.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {}
