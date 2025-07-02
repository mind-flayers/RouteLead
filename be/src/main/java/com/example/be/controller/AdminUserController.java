package com.example.be.controller;

import com.example.be.dto.ProfileDto;
import com.example.be.service.ProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminUserController {

    private final ProfileService profileService;

    @GetMapping("/{id}")
    public ResponseEntity<ProfileDto> getUserById(@PathVariable("id") UUID id) {
        log.info("GET /admin/users/{} - Fetching user profile by ID", id);
        ProfileDto profile = profileService.getProfileById(id);
        return ResponseEntity.ok(profile);
    }
}
