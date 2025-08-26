package com.example.be.dto;

import com.example.be.types.DeliveryStatusEnum;

import java.math.BigDecimal;

public class DeliveryStatusUpdateDto {
    private DeliveryStatusEnum status;
    private BigDecimal currentLat;
    private BigDecimal currentLng;
    private String notes;

    public DeliveryStatusEnum getStatus() {
        return status;
    }

    public void setStatus(DeliveryStatusEnum status) {
        this.status = status;
    }

    public BigDecimal getCurrentLat() {
        return currentLat;
    }

    public void setCurrentLat(BigDecimal currentLat) {
        this.currentLat = currentLat;
    }

    public BigDecimal getCurrentLng() {
        return currentLng;
    }

    public void setCurrentLng(BigDecimal currentLng) {
        this.currentLng = currentLng;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
