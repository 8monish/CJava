package com.monish.springbootapp.service;

import com.monish.springbootapp.dto.CreateExpenseRequest;
import com.monish.springbootapp.exception.BusinessRuleViolationException;
import com.monish.springbootapp.exception.ResourceNotFoundException;
import com.monish.springbootapp.model.Expense;
import com.monish.springbootapp.model.ExpenseShare;
import com.monish.springbootapp.model.Participant;
import com.monish.springbootapp.model.Trip;
import com.monish.springbootapp.repository.ExpenseRepository;
import com.monish.springbootapp.repository.ParticipantRepository;
import com.monish.springbootapp.repository.TripRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;
    private final ParticipantRepository participantRepository;
    private final AuditService auditService;

    public ExpenseService(ExpenseRepository expenseRepository,
                          TripRepository tripRepository,
                          ParticipantRepository participantRepository,
                          AuditService auditService) {
        this.expenseRepository = expenseRepository;
        this.tripRepository = tripRepository;
        this.participantRepository = participantRepository;
        this.auditService = auditService;
    }

    public List<Expense> getTripExpenses(Long tripId) {
        ensureTripExists(tripId);
        return expenseRepository.findByTripIdOrderByExpenseDateDesc(tripId);
    }

    public Page<Expense> getTripExpensesPaged(Long tripId, Pageable pageable) {
        ensureTripExists(tripId);
        return expenseRepository.findByTripId(tripId, pageable);
    }

    public Expense getExpenseById(Long expenseId) {
        return expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense with ID " + expenseId + " not found"));
    }

    @Transactional
    public Expense logExpense(Long tripId, CreateExpenseRequest request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip with ID " + tripId + " not found"));

        Participant payer = participantRepository.findById(request.getPayerId())
                .orElseThrow(() -> new ResourceNotFoundException("Payer with ID " + request.getPayerId() + " not found"));

        if (!payer.getTrip().getId().equals(tripId)) {
            throw new BusinessRuleViolationException("Payer '" + payer.getName() + "' does not belong to Trip ID " + tripId);
        }

        List<Long> sharedIds = request.getSharedParticipantIds();
        if (sharedIds == null || sharedIds.isEmpty()) {
            throw new BusinessRuleViolationException("At least one participant must share the expense.");
        }

        List<Participant> sharedParticipants = new ArrayList<>();
        for (Long id : sharedIds) {
            Participant p = participantRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Shared participant with ID " + id + " not found"));
            if (!p.getTrip().getId().equals(tripId)) {
                throw new BusinessRuleViolationException("Participant '" + p.getName() + "' does not belong to Trip ID " + tripId);
            }
            sharedParticipants.add(p);
        }

        BigDecimal totalAmount = request.getAmount().setScale(2, RoundingMode.HALF_UP);
        if (totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleViolationException("Expense amount must be strictly positive.");
        }

        LocalDateTime date = (request.getExpenseDate() != null) ? request.getExpenseDate() : LocalDateTime.now();
        Expense expense = new Expense(request.getDescription(), totalAmount, request.getCategory(), trip, payer, date);

        // Calculate shares
        Map<Long, BigDecimal> customShares = request.getCustomShares();
        if (customShares != null && !customShares.isEmpty()) {
            BigDecimal sumCustom = BigDecimal.ZERO;
            for (Participant p : sharedParticipants) {
                BigDecimal share = customShares.getOrDefault(p.getId(), BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
                if (share.compareTo(BigDecimal.ZERO) < 0) {
                    throw new BusinessRuleViolationException("Share amount for participant '" + p.getName() + "' cannot be negative.");
                }
                sumCustom = sumCustom.add(share);
                expense.addShare(new ExpenseShare(expense, p, share));
            }
            if (sumCustom.compareTo(totalAmount) != 0) {
                throw new BusinessRuleViolationException(
                        "Sum of custom shares (" + sumCustom + ") does not equal expense amount (" + totalAmount + ").");
            }
        } else {
            // Equal split with exact penny allocation
            int count = sharedParticipants.size();
            BigDecimal baseShare = totalAmount.divide(BigDecimal.valueOf(count), 2, RoundingMode.DOWN);
            BigDecimal remainder = totalAmount.subtract(baseShare.multiply(BigDecimal.valueOf(count)));
            int extraCents = remainder.movePointRight(2).intValueExact();

            for (int i = 0; i < count; i++) {
                BigDecimal allocatedShare = baseShare;
                if (i < extraCents) {
                    allocatedShare = allocatedShare.add(new BigDecimal("0.01"));
                }
                expense.addShare(new ExpenseShare(expense, sharedParticipants.get(i), allocatedShare));
            }
        }

        Expense savedExpense = expenseRepository.save(expense);

        auditService.record(trip, "EXPENSE_LOGGED",
                "Logged expense '" + savedExpense.getDescription() + "' of " + trip.getCurrency() + " " + totalAmount
                        + " paid by " + payer.getName() + ", split among " + sharedParticipants.size() + " participants.");

        return savedExpense;
    }

    @Transactional
    public void deleteExpense(Long tripId, Long expenseId) {
        Expense expense = getExpenseById(expenseId);
        if (!expense.getTrip().getId().equals(tripId)) {
            throw new BusinessRuleViolationException("Expense does not belong to this trip.");
        }
        Trip trip = expense.getTrip();
        String desc = expense.getDescription();
        BigDecimal amt = expense.getAmount();

        expenseRepository.delete(expense);

        auditService.record(trip, "EXPENSE_DELETED",
                "Deleted expense '" + desc + "' of " + trip.getCurrency() + " " + amt + ".");
    }

    private void ensureTripExists(Long tripId) {
        if (!tripRepository.existsById(tripId)) {
            throw new ResourceNotFoundException("Trip with ID " + tripId + " not found");
        }
    }
}
