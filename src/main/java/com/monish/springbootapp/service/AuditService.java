package com.monish.springbootapp.service;

import com.monish.springbootapp.model.AuditLog;
import com.monish.springbootapp.model.Trip;
import com.monish.springbootapp.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void record(Trip trip, String action, String details) {
        AuditLog log = new AuditLog(trip, action, details);
        auditLogRepository.save(log);
    }

    public List<AuditLog> getLogsForTrip(Long tripId) {
        return auditLogRepository.findByTripIdOrderByTimestampDesc(tripId);
    }
}
