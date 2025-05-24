package com.example.be.repository;

import com.example.be.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    Profile findByEmail(String email);
    boolean existsByEmail(String email);
} 