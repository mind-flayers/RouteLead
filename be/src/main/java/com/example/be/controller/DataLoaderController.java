package com.example.be.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

@RestController
@RequestMapping("/api/test")
public class DataLoaderController {

    @Autowired
    private DataSource dataSource;

    @PostMapping("/load-sample-data")
    public ResponseEntity<String> loadSampleData() {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            // Sample data SQL statements
            String[] sqlStatements = {
                // Insert sample users in auth schema first
                "INSERT INTO auth.users (id, email, created_at, updated_at) VALUES " +
                "('550e8400-e29b-41d4-a716-446655440001', 'driver1@test.com', NOW(), NOW()), " +
                "('550e8400-e29b-41d4-a716-446655440002', 'customer1@test.com', NOW(), NOW()) " +
                "ON CONFLICT (id) DO NOTHING",

                // Insert sample profiles
                "INSERT INTO public.profiles (id, email, role, first_name, last_name, phone_number, is_verified) VALUES " +
                "('550e8400-e29b-41d4-a716-446655440001', 'driver1@test.com', 'DRIVER', 'John', 'Driver', '+1234567890', true), " +
                "('550e8400-e29b-41d4-a716-446655440002', 'customer1@test.com', 'CUSTOMER', 'Jane', 'Customer', '+1234567891', true) " +
                "ON CONFLICT (id) DO NOTHING",

                // Insert sample route (using actual schema columns)
                "INSERT INTO public.return_routes (id, driver_id, origin_lat, origin_lng, destination_lat, destination_lng, departure_time, detour_tolerance_km, suggested_price_min, suggested_price_max, status) VALUES " +
                "('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', " +
                "40.7128, -74.0060, 42.3601, -71.0589, '2025-07-10 09:00:00+00', 5.0, 20.0, 40.0, 'OPEN') " +
                "ON CONFLICT (id) DO NOTHING",

                // Insert sample parcel request (using actual schema columns)
                "INSERT INTO public.parcel_requests (id, customer_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, weight_kg, volume_m3, description, max_budget, deadline, status) VALUES " +
                "('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', " +
                "40.7589, -73.9851, 42.3601, -71.0589, 5.2, 0.1, 'Electronics package', 35.0, '2025-07-10 10:00:00+00', 'OPEN') " +
                "ON CONFLICT (id) DO NOTHING",

                // Insert sample bids
                "INSERT INTO public.bids (id, request_id, route_id, start_index, end_index, offered_price, status, created_at, updated_at) VALUES " +
                "('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 0, 1, 25.50, 'PENDING', '2025-07-04 10:00:00+00', '2025-07-04 10:00:00+00'), " +
                "('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 0, 1, 30.00, 'ACCEPTED', '2025-07-04 11:00:00+00', '2025-07-04 11:30:00+00'), " +
                "('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 0, 1, 20.00, 'REJECTED', '2025-07-04 12:00:00+00', '2025-07-04 12:15:00+00') " +
                "ON CONFLICT (id) DO NOTHING"
            };

            int totalInserted = 0;
            for (String sql : sqlStatements) {
                int result = stmt.executeUpdate(sql);
                totalInserted += result;
            }

            return ResponseEntity.ok("Sample data loaded successfully. Total rows inserted: " + totalInserted);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error loading sample data: " + e.getMessage());
        }
    }
}
