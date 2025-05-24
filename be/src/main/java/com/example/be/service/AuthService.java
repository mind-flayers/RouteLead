package com.example.be.service;

import com.example.be.config.SupabaseConfig;
import com.example.be.dto.AuthRequest;
import com.example.be.dto.AuthResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class AuthService {

    private final SupabaseConfig supabaseConfig;
    private final RestTemplate restTemplate;
    private static final String SUPABASE_URL = "https://fnsaibersyxpedauhwfw.supabase.co";

    @Autowired
    public AuthService(SupabaseConfig supabaseConfig) {
        this.supabaseConfig = supabaseConfig;
        this.restTemplate = new RestTemplate();
    }

    public AuthResponse signup(AuthRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", supabaseConfig.getAnonKey());

            var body = Map.of(
                "email", request.getEmail(),
                "password", request.getPassword(),
                "data", Map.of("name", request.getName())
            );

            var response = restTemplate.postForObject(
                SUPABASE_URL + "/auth/v1/signup",
                new HttpEntity<>(body, headers),
                Map.class
            );

            return new AuthResponse(
                (String) response.get("access_token"),
                (String) response.get("refresh_token"),
                ((Map) response.get("user")).get("id").toString(),
                ((Map) response.get("user")).get("email").toString(),
                request.getName()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to sign up: " + e.getMessage());
        }
    }

    public AuthResponse login(AuthRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", supabaseConfig.getAnonKey());

            var body = Map.of(
                "email", request.getEmail(),
                "password", request.getPassword()
            );

            var response = restTemplate.postForObject(
                SUPABASE_URL + "/auth/v1/token?grant_type=password",
                new HttpEntity<>(body, headers),
                Map.class
            );

            return new AuthResponse(
                (String) response.get("access_token"),
                (String) response.get("refresh_token"),
                ((Map) response.get("user")).get("id").toString(),
                ((Map) response.get("user")).get("email").toString(),
                ((Map) ((Map) response.get("user")).get("user_metadata")).get("name").toString()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to login: " + e.getMessage());
        }
    }
} 