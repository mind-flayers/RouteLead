package com.example.be.controller;

import com.example.be.dto.ProfileDto;
import com.example.be.service.ProfileService;
import com.example.be.types.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")

//test user: 797c6f16-a06a-46b4-ae9f-9ded8aa4ab27
//test user: 05214edd-a8fa-4db5-89b9-57b3a3d99389
public class AdminUserController {

    private final ProfileService profileService;

    @GetMapping("/{id}")
    public ResponseEntity<ProfileDto> getUserById(@PathVariable("id") UUID id) {
        log.info("GET /admin/users/{} - Fetching user profile by ID", id);
        ProfileDto profile = profileService.getProfileById(id);
        return ResponseEntity.ok(profile);
    }

    @GetMapping(value = {"", "/"})
    public ResponseEntity<List<ProfileDto>> getAllUsers() {
        log.info("GET /admin/users - Fetching all user profiles");
        List<ProfileDto> profiles = profileService.getAllProfiles();
        return ResponseEntity.ok(profiles);
    }

    // New endpoints for additional database fetching

    @GetMapping("/role/{role}")
    public ResponseEntity<List<ProfileDto>> getUsersByRole(@PathVariable("role") UserRole role) {
        log.info("GET /admin/users/role/{} - Fetching users by role", role);
        List<ProfileDto> profiles = profileService.getProfilesByRole(role);
        return ResponseEntity.ok(profiles);
    }

    @GetMapping("/verified")
    public ResponseEntity<List<ProfileDto>> getVerifiedUsers() {
        log.info("GET /admin/users/verified - Fetching verified users");
        List<ProfileDto> profiles = profileService.getVerifiedProfiles();
        return ResponseEntity.ok(profiles);
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<ProfileDto>> getUsersByCity(@PathVariable("city") String city) {
        log.info("GET /admin/users/city/{} - Fetching users by city", city);
        List<ProfileDto> profiles = profileService.getProfilesByCity(city);
        return ResponseEntity.ok(profiles);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProfileDto>> searchUsersByName(@RequestParam("name") String name) {
        log.info("GET /admin/users/search?name={} - Searching users by name", name);
        List<ProfileDto> profiles = profileService.searchProfilesByName(name);
        return ResponseEntity.ok(profiles);
    }

    @GetMapping("/role/{role}/verified/{verified}")
    public ResponseEntity<List<ProfileDto>> getUsersByRoleAndVerification(
            @PathVariable("role") UserRole role,
            @PathVariable("verified") Boolean verified) {
        log.info("GET /admin/users/role/{}/verified/{} - Fetching users by role and verification", role, verified);
        List<ProfileDto> profiles = profileService.getProfilesByRoleAndVerification(role, verified);
        return ResponseEntity.ok(profiles);
    }

    @GetMapping("/count/role/{role}")
    public ResponseEntity<Long> getProfileCountByRole(@PathVariable("role") UserRole role) {
        log.info("GET /admin/users/count/role/{} - Getting profile count by role", role);
        long count = profileService.getProfileCountByRole(role);
        return ResponseEntity.ok(count);
    }
}
