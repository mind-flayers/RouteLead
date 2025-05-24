package com.example.be.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.support.ResourcePropertySource;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;
import java.io.IOException;

@Configuration
public class EnvConfig {
    
    @Bean
    public PropertySource<?> envPropertySource(Environment env) throws IOException {
        try {
            return new ResourcePropertySource(new ClassPathResource(".env"));
        } catch (IOException e) {
            // Return empty property source if .env file doesn't exist
            return new ResourcePropertySource("empty", new ClassPathResource("application.properties"));
        }
    }
} 