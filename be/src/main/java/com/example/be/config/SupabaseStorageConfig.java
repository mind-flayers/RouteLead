package com.example.be.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.net.URI;

/**
 * Configuration for Supabase Storage using S3-compatible API
 */
@Configuration
public class SupabaseStorageConfig {

    @Value("${supabase.url:https://fnsaibersyxpedauhwfw.supabase.co}")
    private String supabaseUrl;

    @Value("${supabase.service.role.key:your-service-role-key}")
    private String serviceRoleKey;

    @Value("${supabase.anon.key:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuc2FpYmVyc3l4cGVkYXVod2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNjExMDgsImV4cCI6MjA2MzYzNzEwOH0.sUYQrB5mZfeWhoMkbvvquzM9CdrOLEVFpF0yEnE2yZQ}")
    private String anonKey;

    @Bean
    public S3Client supabaseS3Client() {
        // For now, we'll use a mock S3 client since we need proper Supabase service role credentials
        // In production, you would configure this with actual Supabase credentials
        
        // This is a placeholder configuration
        return S3Client.builder()
                .region(Region.US_EAST_1)
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create("mock-access-key", "mock-secret-key")))
                .endpointOverride(URI.create(supabaseUrl + "/storage/v1/s3"))
                .build();
    }
}
