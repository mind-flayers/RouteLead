package com.example.be.controller;

import com.example.be.dto.AuthRequest;
import com.example.be.dto.AuthResponse;
import com.example.be.service.AuthService;
import com.example.be.config.JwtUtil;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @Value("${jwt.secret:MyJwtSecretKeyForRouteLead1234567890}")
    private String jwtSecret;
    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationInMs;

    @Autowired
    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@RequestBody AuthRequest request) {
        AuthResponse authResponse = authService.signup(request);
        String token = generateToken(authResponse.getUserId(), authResponse.getEmail(), "CUSTOMER");
        Map<String, Object> result = new HashMap<>();
        result.put("user", authResponse);
        result.put("token", token);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AuthRequest request) {
        AuthResponse authResponse = authService.login(request);
        // You may want to fetch the user's role from DB here
        String token = generateToken(authResponse.getUserId(), authResponse.getEmail(), "CUSTOMER");
        Map<String, Object> result = new HashMap<>();
        result.put("user", authResponse);
        result.put("token", token);
        return ResponseEntity.ok(result);
    }

    private String generateToken(String userId, String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setId(userId)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationInMs))
                .signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }
} 