package com.monish.springbootapp.Controller;

import com.monish.springbootapp.dto.AddParticipantRequest;
import com.monish.springbootapp.dto.CreateTripRequest;
import com.monish.springbootapp.dto.TripSummaryResponse;
import com.monish.springbootapp.model.Expense;
import com.monish.springbootapp.model.Participant;
import com.monish.springbootapp.model.Trip;
import com.monish.springbootapp.service.AuditService;
import com.monish.springbootapp.service.ExpenseService;
import com.monish.springbootapp.service.SettlementService;
import com.monish.springbootapp.service.TripService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "*")
public class TripController {

    private final TripService tripService;
    private final ExpenseService expenseService;
    private final SettlementService settlementService;
    private final AuditService auditService;

    public TripController(TripService tripService,
                          ExpenseService expenseService,
                          SettlementService settlementService,
                          AuditService auditService) {
        this.tripService = tripService;
        this.expenseService = expenseService;
        this.settlementService = settlementService;
        this.auditService = auditService;
    }

    @PostMapping
    public ResponseEntity<Trip> createTrip(@Valid @RequestBody CreateTripRequest request) {
        Trip created = tripService.createTrip(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<Trip>> getAllTrips() {
        return ResponseEntity.ok(tripService.getAllTrips());
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<Trip> getTripById(@PathVariable Long tripId) {
        return ResponseEntity.ok(tripService.getTripById(tripId));
    }

    @GetMapping("/{tripId}/summary")
    public ResponseEntity<TripSummaryResponse> getTripSummary(@PathVariable Long tripId) {
        Trip trip = tripService.getTripById(tripId);
        List<Participant> participants = tripService.getParticipants(tripId);
        List<Expense> expenses = expenseService.getTripExpenses(tripId);

        BigDecimal totalSpend = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        TripSummaryResponse response = new TripSummaryResponse(
                trip,
                participants,
                expenses,
                totalSpend,
                expenses.size(),
                settlementService.computeNetBalances(tripId),
                settlementService.getSettlements(tripId),
                auditService.getLogsForTrip(tripId)
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<Trip> updateTrip(@PathVariable Long tripId,
                                          @RequestBody CreateTripRequest request) {
        Trip updated = tripService.updateTrip(tripId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long tripId) {
        tripService.deleteTrip(tripId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{tripId}/participants")
    public ResponseEntity<Participant> addParticipant(@PathVariable Long tripId,
                                                      @Valid @RequestBody AddParticipantRequest request) {
        Participant participant = tripService.addParticipant(tripId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(participant);
    }

    @GetMapping("/{tripId}/participants")
    public ResponseEntity<List<Participant>> getParticipants(@PathVariable Long tripId) {
        return ResponseEntity.ok(tripService.getParticipants(tripId));
    }
}
