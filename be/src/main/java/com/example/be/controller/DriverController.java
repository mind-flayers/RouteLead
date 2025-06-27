package com.example.be.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/driver")
public class DriverController {

    @PreAuthorize("hasRole('DRIVER')")
    @GetMapping("/my-routes")
    public String getMyRoutes() {
        return "Driver's routes (protected)";
    }
} 