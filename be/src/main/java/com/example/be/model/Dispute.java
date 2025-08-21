package com.example.be.model;

import com.example.be.types.DisputeStatusEnum;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "disputes")
@Getter
@Setter
public class Dispute {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Profile user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parcel_request_id")
    private ParcelRequest parcelRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_route_id")
    private ReturnRoute relatedRoute;

    @Column(name = "description", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DisputeStatusEnum status = DisputeStatusEnum.OPEN;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;
} 