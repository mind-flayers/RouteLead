package com.example.be.repository;

import com.example.be.model.Profile;
import com.example.be.types.UserRole;
import com.example.be.types.VerificationStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    Profile findByEmail(String email);
    boolean existsByEmail(String email);
    
    // Find profiles by role
    List<Profile> findByRole(UserRole role);
    
    // Find verified profiles
    List<Profile> findByIsVerifiedTrue();
    
    // Find profiles by city
    List<Profile> findByCity(String city);
    
    // Find profiles by role and verification status
    List<Profile> findByRoleAndIsVerified(UserRole role, Boolean isVerified);
    
    // Custom query to find profiles with partial name match
    @Query("SELECT p FROM Profile p WHERE LOWER(p.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Profile> findByNameContainingIgnoreCase(@Param("name") String name);
    
    // Count profiles by role
    long countByRole(UserRole role);
    
    /**
     * Update verification status using native SQL to handle enum casting properly
     */
    @Modifying
    @Query(value = "UPDATE profiles SET verification_status = CAST(:status AS verification_status_enum), is_verified = :isVerified WHERE id = :profileId", nativeQuery = true)
    int updateVerificationStatus(@Param("profileId") UUID profileId, @Param("status") String status, @Param("isVerified") boolean isVerified);
} 