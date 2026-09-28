package com.monish.springbootapp.repository;

import com.monish.springbootapp.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByTripIdOrderByTimestampDesc(Long tripId);
}
