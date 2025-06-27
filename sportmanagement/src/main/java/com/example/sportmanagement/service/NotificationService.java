package com.example.sportmanagement.service;

import com.example.sportmanagement.model.Notification;
import com.example.sportmanagement.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository repository;

    public List<Notification> getAll() {
        return repository.findAll();
    }

    public Notification create(Notification notification) {
        return repository.save(notification);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public void markAllAsRead() {
        List<Notification> notifications = repository.findAll();
        for (Notification n : notifications) {
            n.setUnread(false);
        }
        repository.saveAll(notifications);
    }
}
