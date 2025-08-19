package com.example.be.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class RequestBidCreateDto {
    private UUID routeId;
    private BigDecimal offeredPrice;
    private Integer startIndex; // optional, defaults to 0
    private Integer endIndex;   // optional, defaults to 0
}


