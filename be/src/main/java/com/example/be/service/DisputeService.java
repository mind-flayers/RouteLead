package com.example.be.service;

import com.example.be.model.Dispute;
import com.example.be.repository.DisputeRepository;
import com.example.be.types.DisputeStatusEnum;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DisputeService {
    
    private final DisputeRepository disputeRepository;
    
    @Autowired
    public DisputeService(DisputeRepository disputeRepository) {
        this.disputeRepository = disputeRepository;
    }
    
    @Transactional
    public Dispute createDispute(UUID userId, String description, UUID relatedBidId, UUID relatedRouteId) {
        Dispute dispute = new Dispute();
        dispute.setUser(new com.example.be.model.Profile());
        dispute.getUser().setId(userId);
        dispute.setDescription(description);
        dispute.setStatus(DisputeStatusEnum.OPEN);
        
        if (relatedBidId != null) {
            dispute.setRelatedBid(new com.example.be.model.Bid());
            dispute.getRelatedBid().setId(relatedBidId);
        }
        
        if (relatedRouteId != null) {
            dispute.setRelatedRoute(new com.example.be.model.ReturnRoute());
            dispute.getRelatedRoute().setId(relatedRouteId);
        }
        
        return disputeRepository.save(dispute);
    }
    
    @Transactional
    public Dispute updateDisputeStatus(UUID disputeId, DisputeStatusEnum status) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new RuntimeException("Dispute not found with id: " + disputeId));
        
        dispute.setStatus(status);
        if (status == DisputeStatusEnum.RESOLVED || status == DisputeStatusEnum.CLOSED) {
            dispute.setResolvedAt(ZonedDateTime.now());
        }
        
        return disputeRepository.save(dispute);
    }
    
    @Transactional(readOnly = true)
    public List<Dispute> getDisputesByUser(UUID userId) {
        return disputeRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    @Transactional(readOnly = true)
    public List<Dispute> getDisputesByStatus(DisputeStatusEnum status) {
        return disputeRepository.findByStatusOrderByCreatedAtDesc(status);
    }
    
    @Transactional(readOnly = true)
    public List<Dispute> getDisputesByUserAndStatus(UUID userId, DisputeStatusEnum status) {
        return disputeRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
    }
    
    @Transactional(readOnly = true)
    public List<Dispute> getDisputesByBid(UUID bidId) {
        return disputeRepository.findByRelatedBidIdOrderByCreatedAtDesc(bidId);
    }
    
    @Transactional(readOnly = true)
    public List<Dispute> getDisputesByRoute(UUID routeId) {
        return disputeRepository.findByRelatedRouteIdOrderByCreatedAtDesc(routeId);
    }
    
    @Transactional(readOnly = true)
    public List<Dispute> getOpenDisputes() {
        return disputeRepository.findByStatusAndResolvedAtIsNullOrderByCreatedAtDesc(DisputeStatusEnum.OPEN);
    }
    
    @Transactional(readOnly = true)
    public Dispute getDisputeById(UUID id) {
        return disputeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dispute not found with id: " + id));
    }
    
    @Transactional(readOnly = true)
    public long getDisputeCountByStatus(DisputeStatusEnum status) {
        return disputeRepository.countByStatus(status);
    }
    
    @Transactional(readOnly = true)
    public long getDisputeCountByUserAndStatus(UUID userId, DisputeStatusEnum status) {
        return disputeRepository.countByUserIdAndStatus(userId, status);
    }
} 