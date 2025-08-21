package com.example.be.service;

import com.example.be.repository.DisputeRepository;
import com.example.be.repository.ParcelRequestRepository;
import com.example.be.repository.ProfileRepository;
import com.example.be.types.DisputeStatusEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final ProfileRepository profileRepository;
    private final ParcelRequestRepository parcelRequestRepository;
    private final EntityManager entityManager;

    @Transactional
    public Map<String, Object> createDispute(UUID userId, UUID parcelRequestId, String description) {
        log.info("Creating dispute: userId={}, parcelRequestId={}", userId, parcelRequestId);

        // Check if user has already disputed this parcel request using native SQL
        String checkQuery = "SELECT COUNT(*) FROM disputes WHERE user_id = ? AND parcel_request_id = ?";
        Long existingCount = (Long) entityManager.createNativeQuery(checkQuery)
                .setParameter(1, userId)
                .setParameter(2, parcelRequestId)
                .getSingleResult();

        if (existingCount > 0) {
            throw new RuntimeException("You have already disputed this parcel request");
        }

        // Validate user exists using native SQL
        String userCheckQuery = "SELECT COUNT(*) FROM profiles WHERE id = ?";
        Long userCount = (Long) entityManager.createNativeQuery(userCheckQuery)
                .setParameter(1, userId)
                .getSingleResult();

        if (userCount == 0) {
            throw new RuntimeException("User not found");
        }

        // Validate parcel request exists using native SQL
        String requestCheckQuery = "SELECT COUNT(*) FROM parcel_requests WHERE id = ?";
        Long requestCount = (Long) entityManager.createNativeQuery(requestCheckQuery)
                .setParameter(1, parcelRequestId)
                .getSingleResult();

        if (requestCount == 0) {
            throw new RuntimeException("Parcel request not found");
        }

        // Create dispute using native SQL
        String insertQuery = "INSERT INTO disputes (id, user_id, parcel_request_id, description, status, created_at) " +
                           "VALUES (gen_random_uuid(), ?, ?, ?, CAST('OPEN' AS dispute_status_enum), CURRENT_TIMESTAMP) " +
                           "RETURNING id, created_at";

        Object[] result = (Object[]) entityManager.createNativeQuery(insertQuery)
                .setParameter(1, userId)
                .setParameter(2, parcelRequestId)
                .setParameter(3, description)
                .getSingleResult();

        UUID disputeId = (UUID) result[0];
        Instant createdAt = (Instant) result[1];

        log.info("Dispute created successfully with ID: {}", disputeId);

        Map<String, Object> disputeData = new HashMap<>();
        disputeData.put("id", disputeId);
        disputeData.put("userId", userId);
        disputeData.put("parcelRequestId", parcelRequestId);
        disputeData.put("description", description);
        disputeData.put("status", "OPEN");
        disputeData.put("createdAt", createdAt.toString());

        return disputeData;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUserDisputes(UUID userId) {
        String query = "SELECT d.id, d.user_id, d.parcel_request_id, d.description, d.status, d.created_at, d.resolved_at, " +
                      "pr.description as request_description, pr.weight_kg, pr.volume_m3, pr.status as request_status " +
                      "FROM disputes d " +
                      "LEFT JOIN parcel_requests pr ON d.parcel_request_id = pr.id " +
                      "WHERE d.user_id = ? " +
                      "ORDER BY d.created_at DESC";

        List<Object[]> results = entityManager.createNativeQuery(query)
                .setParameter(1, userId)
                .getResultList();

        return results.stream().map(row -> {
            Map<String, Object> dispute = new HashMap<>();
            dispute.put("id", row[0]);
            dispute.put("userId", row[1]);
            dispute.put("parcelRequestId", row[2]);
            dispute.put("description", row[3]);
            dispute.put("status", row[4]);
            dispute.put("createdAt", row[5] != null ? row[5].toString() : null);
            dispute.put("resolvedAt", row[6] != null ? row[6].toString() : null);
            dispute.put("requestDescription", row[7]);
            dispute.put("requestWeightKg", row[8]);
            dispute.put("requestVolumeM3", row[9]);
            dispute.put("requestStatus", row[10]);
            return dispute;
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getParcelRequestDisputes(UUID parcelRequestId) {
        String query = "SELECT d.id, d.user_id, d.parcel_request_id, d.description, d.status, d.created_at, d.resolved_at, " +
                      "p.first_name, p.last_name, p.email " +
                      "FROM disputes d " +
                      "LEFT JOIN profiles p ON d.user_id = p.id " +
                      "WHERE d.parcel_request_id = ? " +
                      "ORDER BY d.created_at DESC";

        List<Object[]> results = entityManager.createNativeQuery(query)
                .setParameter(1, parcelRequestId)
                .getResultList();

        return results.stream().map(row -> {
            Map<String, Object> dispute = new HashMap<>();
            dispute.put("id", row[0]);
            dispute.put("userId", row[1]);
            dispute.put("parcelRequestId", row[2]);
            dispute.put("description", row[3]);
            dispute.put("status", row[4]);
            dispute.put("createdAt", row[5] != null ? row[5].toString() : null);
            dispute.put("resolvedAt", row[6] != null ? row[6].toString() : null);
            dispute.put("userFirstName", row[7]);
            dispute.put("userLastName", row[8]);
            dispute.put("userEmail", row[9]);
            return dispute;
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDisputesByStatus(DisputeStatusEnum status) {
        String query = "SELECT d.id, d.user_id, d.parcel_request_id, d.description, d.status, d.created_at, d.resolved_at, " +
                      "p.first_name, p.last_name, pr.description as request_description " +
                      "FROM disputes d " +
                      "LEFT JOIN profiles p ON d.user_id = p.id " +
                      "LEFT JOIN parcel_requests pr ON d.parcel_request_id = pr.id " +
                      "WHERE d.status = CAST(? AS dispute_status_enum) " +
                      "ORDER BY d.created_at DESC";

        List<Object[]> results = entityManager.createNativeQuery(query)
                .setParameter(1, status.name())
                .getResultList();

        return results.stream().map(row -> {
            Map<String, Object> dispute = new HashMap<>();
            dispute.put("id", row[0]);
            dispute.put("userId", row[1]);
            dispute.put("parcelRequestId", row[2]);
            dispute.put("description", row[3]);
            dispute.put("status", row[4]);
            dispute.put("createdAt", row[5] != null ? row[5].toString() : null);
            dispute.put("resolvedAt", row[6] != null ? row[6].toString() : null);
            dispute.put("userFirstName", row[7]);
            dispute.put("userLastName", row[8]);
            dispute.put("requestDescription", row[9]);
            return dispute;
        }).toList();
    }

    @Transactional
    public Map<String, Object> updateDisputeStatus(UUID disputeId, DisputeStatusEnum status) {
        log.info("Updating dispute status: disputeId={}, status={}", disputeId, status);

        // Check if dispute exists
        String checkQuery = "SELECT COUNT(*) FROM disputes WHERE id = ?";
        Long disputeCount = (Long) entityManager.createNativeQuery(checkQuery)
                .setParameter(1, disputeId)
                .getSingleResult();

        if (disputeCount == 0) {
            throw new RuntimeException("Dispute not found");
        }

        // Update dispute status using native SQL
        String updateQuery;
        if (status == DisputeStatusEnum.RESOLVED || status == DisputeStatusEnum.CLOSED) {
            updateQuery = "UPDATE disputes SET status = CAST(? AS dispute_status_enum), resolved_at = CURRENT_TIMESTAMP " +
                         "WHERE id = ? RETURNING id, status, resolved_at";
        } else {
            updateQuery = "UPDATE disputes SET status = CAST(? AS dispute_status_enum) " +
                         "WHERE id = ? RETURNING id, status, resolved_at";
        }

        Object[] result = (Object[]) entityManager.createNativeQuery(updateQuery)
                .setParameter(1, status.name())
                .setParameter(2, disputeId)
                .getSingleResult();

        Map<String, Object> response = new HashMap<>();
        response.put("id", result[0]);
        response.put("status", result[1]);
        response.put("resolvedAt", result[2] != null ? result[2].toString() : null);

        return response;
    }
} 