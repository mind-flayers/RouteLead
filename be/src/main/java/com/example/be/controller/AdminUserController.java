package com.example.be.controller;

import com.example.be.dto.ProfileDto;
import com.example.be.service.ProfileService;
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
}
