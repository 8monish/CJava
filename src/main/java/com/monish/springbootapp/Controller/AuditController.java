package com.monish.springbootapp.Controller;

import com.monish.springbootapp.model.AuditLog;
import com.monish.springbootapp.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/audit-logs")
@CrossOrigin(origins = "*")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAuditLogs(@PathVariable Long tripId) {
        List<AuditLog> logs = auditService.getLogsForTrip(tripId);
        return ResponseEntity.ok(logs);
    }
}
