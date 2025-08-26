package com.example.be.service;

import com.example.be.dto.BankDetailsDto;
import com.example.be.dto.WithdrawalDto;
import com.example.be.types.WithdrawalStatusEnum;
import com.example.be.types.EarningsStatusEnum;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class WithdrawalService {
    
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public WithdrawalService(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Create a new withdrawal request
     */
    @Transactional
    public WithdrawalDto createWithdrawal(UUID driverId, BigDecimal amount, BankDetailsDto bankDetails) {
        // Validate sufficient balance
        if (!validateSufficientBalance(driverId, amount)) {
            throw new RuntimeException("Insufficient balance for withdrawal");
        }

        // Convert bank details to JSON
        String bankDetailsJson;
        try {
            bankDetailsJson = objectMapper.writeValueAsString(bankDetails);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize bank details", e);
        }

        // Generate withdrawal ID
        UUID withdrawalId = UUID.randomUUID();

        // Insert withdrawal record
        String sql = "INSERT INTO withdrawals (id, driver_id, amount, bank_details, status, created_at) " +
                    "VALUES (?, ?, ?, ?::jsonb, 'PROCESSING'::withdrawal_status_enum, CURRENT_TIMESTAMP)";
        
        jdbcTemplate.update(sql, withdrawalId, driverId, amount, bankDetailsJson);

        // Return the created withdrawal (no need to modify earnings status anymore)
        return getWithdrawalById(withdrawalId);
    }

    /**
     * Update withdrawal status
     */
    @Transactional
    public WithdrawalDto updateWithdrawalStatus(UUID withdrawalId, WithdrawalStatusEnum status, String transactionId) {
        String sql = "UPDATE withdrawals " +
                    "SET status = ?::withdrawal_status_enum, " +
                    "    processed_at = CASE WHEN ? IN ('COMPLETED', 'FAILED') THEN CURRENT_TIMESTAMP ELSE processed_at END, " +
                    "    transaction_id = COALESCE(?, transaction_id) " +
                    "WHERE id = ?";

        int rowsUpdated = jdbcTemplate.update(sql, status.name(), status.name(), transactionId, withdrawalId);
        
        if (rowsUpdated == 0) {
            throw new RuntimeException("Withdrawal not found: " + withdrawalId);
        }

        // No need to restore balance - it will be calculated dynamically
        return getWithdrawalById(withdrawalId);
    }

    /**
     * Get withdrawal history for a driver
     */
    @Transactional(readOnly = true)
    public List<WithdrawalDto> getWithdrawalHistory(UUID driverId) {
        String sql = "SELECT w.id, w.driver_id, w.amount, w.bank_details, w.status, " +
                    "       w.transaction_id, w.processed_at, w.created_at, " +
                    "       CONCAT(p.first_name, ' ', p.last_name) as driver_name " +
                    "FROM withdrawals w " +
                    "JOIN profiles p ON w.driver_id = p.id " +
                    "WHERE w.driver_id = ? " +
                    "ORDER BY w.created_at DESC";

        return jdbcTemplate.query(sql, new WithdrawalRowMapper(), driverId);
    }

    /**
     * Get all withdrawal requests (for admin)
     */
    @Transactional(readOnly = true)
    public List<WithdrawalDto> getAllWithdrawals() {
        String sql = "SELECT w.id, w.driver_id, w.amount, w.bank_details, w.status, " +
                    "       w.transaction_id, w.processed_at, w.created_at, " +
                    "       CONCAT(p.first_name, ' ', p.last_name) as driver_name " +
                    "FROM withdrawals w " +
                    "JOIN profiles p ON w.driver_id = p.id " +
                    "ORDER BY w.created_at DESC";

        return jdbcTemplate.query(sql, new WithdrawalRowMapper());
    }

    /**
     * Get withdrawal by ID
     */
    @Transactional(readOnly = true)
    public WithdrawalDto getWithdrawalById(UUID withdrawalId) {
        String sql = "SELECT w.id, w.driver_id, w.amount, w.bank_details, w.status, " +
                    "       w.transaction_id, w.processed_at, w.created_at, " +
                    "       CONCAT(p.first_name, ' ', p.last_name) as driver_name " +
                    "FROM withdrawals w " +
                    "JOIN profiles p ON w.driver_id = p.id " +
                    "WHERE w.id = ?";

        List<WithdrawalDto> results = jdbcTemplate.query(sql, new WithdrawalRowMapper(), withdrawalId);
        
        if (results.isEmpty()) {
            throw new RuntimeException("Withdrawal not found: " + withdrawalId);
        }
        
        return results.get(0);
    }

    /**
     * Validate if driver has sufficient balance for withdrawal using the new calculation method
     */
    @Transactional(readOnly = true)
    public boolean validateSufficientBalance(UUID driverId, BigDecimal amount) {
        BigDecimal availableBalance = getAvailableBalance(driverId);
        return availableBalance != null && availableBalance.compareTo(amount) >= 0;
    }

    /**
     * Get available balance for a driver using the new calculation method:
     * Available Balance = Total AVAILABLE earnings - Total PROCESSING/COMPLETED withdrawals + Total FAILED withdrawals
     */
    @Transactional(readOnly = true)
    public BigDecimal getAvailableBalance(UUID driverId) {
        String sql = "SELECT " +
                    "  COALESCE(" +
                    "    (SELECT SUM(net_amount) FROM earnings WHERE driver_id = ? AND status = 'AVAILABLE'::earnings_status_enum), 0" +
                    "  ) " +
                    "  - " +
                    "  COALESCE(" +
                    "    (SELECT SUM(amount) FROM withdrawals WHERE driver_id = ? AND status IN ('PROCESSING'::withdrawal_status_enum, 'COMPLETED'::withdrawal_status_enum)), 0" +
                    "  ) " +
                    "  + " +
                    "  COALESCE(" +
                    "    (SELECT SUM(amount) FROM withdrawals WHERE driver_id = ? AND status = 'FAILED'::withdrawal_status_enum), 0" +
                    "  ) " +
                    "  as available_balance";

        return jdbcTemplate.queryForObject(sql, BigDecimal.class, driverId, driverId, driverId);
    }

    /**
     * Row mapper for withdrawal results
     */
    private class WithdrawalRowMapper implements RowMapper<WithdrawalDto> {
        @Override
        public WithdrawalDto mapRow(ResultSet rs, int rowNum) throws SQLException {
            // Parse bank details JSON
            Map<String, Object> bankDetails = null;
            String bankDetailsJson = rs.getString("bank_details");
            if (bankDetailsJson != null) {
                try {
                    bankDetails = objectMapper.readValue(bankDetailsJson, Map.class);
                } catch (JsonProcessingException e) {
                    // Log error but don't fail the query
                    System.err.println("Failed to parse bank details JSON: " + e.getMessage());
                }
            }

            return WithdrawalDto.builder()
                    .id(UUID.fromString(rs.getString("id")))
                    .driverId(UUID.fromString(rs.getString("driver_id")))
                    .amount(rs.getBigDecimal("amount"))
                    .bankDetails(bankDetails)
                    .status(WithdrawalStatusEnum.valueOf(rs.getString("status")))
                    .transactionId(rs.getString("transaction_id"))
                    .processedAt(rs.getTimestamp("processed_at") != null ? 
                               rs.getTimestamp("processed_at").toInstant().atZone(java.time.ZoneId.systemDefault()) : null)
                    .createdAt(rs.getTimestamp("created_at").toInstant().atZone(java.time.ZoneId.systemDefault()))
                    .driverName(rs.getString("driver_name"))
                    .build();
        }
    }
}
