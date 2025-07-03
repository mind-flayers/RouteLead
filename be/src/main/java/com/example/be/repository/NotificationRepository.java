package com.example.be.repository;

import com.example.be.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserId(UUID userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = :isRead WHERE n.id = :id")
    void updateIsRead(@Param("id") UUID id, @Param("isRead") Boolean isRead);
}
