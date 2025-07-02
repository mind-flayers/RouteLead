package com.example.be.dto;

import com.example.be.types.BidStatus;

public class BidStatusUpdateDto {
    private BidStatus status;

    public BidStatus getStatus() {
        return status;
    }

    public void setStatus(BidStatus status) {
        this.status = status;
    }
}
