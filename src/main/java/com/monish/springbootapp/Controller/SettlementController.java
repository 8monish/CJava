package com.monish.springbootapp.Controller;

import com.monish.springbootapp.dto.ParticipantBalanceDto;
import com.monish.springbootapp.dto.SettlementTransactionDto;
import com.monish.springbootapp.service.SettlementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}")
@CrossOrigin(origins = "*")
public class SettlementController {

    private final SettlementService settlementService;

    public SettlementController(SettlementService settlementService) {
        this.settlementService = settlementService;
    }

    @GetMapping("/balances")
    public ResponseEntity<List<ParticipantBalanceDto>> getNetBalances(@PathVariable Long tripId) {
        List<ParticipantBalanceDto> balances = settlementService.computeNetBalances(tripId);
        return ResponseEntity.ok(balances);
    }

    @PostMapping("/settlements/generate")
    public ResponseEntity<List<SettlementTransactionDto>> generateSettlements(@PathVariable Long tripId) {
        List<SettlementTransactionDto> settlements = settlementService.generateSettlements(tripId);
        return ResponseEntity.ok(settlements);
    }

    @GetMapping("/settlements")
    public ResponseEntity<List<SettlementTransactionDto>> getSettlements(@PathVariable Long tripId) {
        return ResponseEntity.ok(settlementService.getSettlements(tripId));
    }

    @PutMapping("/settlements/{settlementId}/settle")
    public ResponseEntity<SettlementTransactionDto> markSettled(@PathVariable Long tripId,
                                                                @PathVariable Long settlementId) {
        SettlementTransactionDto updated = settlementService.markSettled(tripId, settlementId);
        return ResponseEntity.ok(updated);
    }
}
