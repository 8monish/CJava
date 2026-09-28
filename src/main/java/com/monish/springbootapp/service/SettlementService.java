package com.monish.springbootapp.service;

import com.monish.springbootapp.dto.ParticipantBalanceDto;
import com.monish.springbootapp.dto.SettlementTransactionDto;
import com.monish.springbootapp.exception.BusinessRuleViolationException;
import com.monish.springbootapp.exception.ResourceNotFoundException;
import com.monish.springbootapp.model.Expense;
import com.monish.springbootapp.model.ExpenseShare;
import com.monish.springbootapp.model.Participant;
import com.monish.springbootapp.model.Settlement;
import com.monish.springbootapp.model.Trip;
import com.monish.springbootapp.repository.ExpenseRepository;
import com.monish.springbootapp.repository.ParticipantRepository;
import com.monish.springbootapp.repository.SettlementRepository;
import com.monish.springbootapp.repository.TripRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class SettlementService {

    private final TripRepository tripRepository;
    private final ParticipantRepository participantRepository;
    private final ExpenseRepository expenseRepository;
    private final SettlementRepository settlementRepository;
    private final AuditService auditService;

    public SettlementService(TripRepository tripRepository,
                             ParticipantRepository participantRepository,
                             ExpenseRepository expenseRepository,
                             SettlementRepository settlementRepository,
                             AuditService auditService) {
        this.tripRepository = tripRepository;
        this.participantRepository = participantRepository;
        this.expenseRepository = expenseRepository;
        this.settlementRepository = settlementRepository;
        this.auditService = auditService;
    }

    /**
     * Compute each participant's net balance (paid minus owed share).
     * Enforces Business Rule: Sum of all participants' net balances for a trip must always equal zero.
     */
    public List<ParticipantBalanceDto> computeNetBalances(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip with ID " + tripId + " not found"));

        List<Participant> participants = participantRepository.findByTripId(tripId);
        List<Expense> expenses = expenseRepository.findByTripId(tripId);

        Map<Long, BigDecimal> paidMap = new HashMap<>();
        Map<Long, BigDecimal> owedMap = new HashMap<>();

        for (Participant p : participants) {
            paidMap.put(p.getId(), BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
            owedMap.put(p.getId(), BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        }

        for (Expense expense : expenses) {
            Long payerId = expense.getPayer().getId();
            BigDecimal prevPaid = paidMap.getOrDefault(payerId, BigDecimal.ZERO);
            paidMap.put(payerId, prevPaid.add(expense.getAmount()));

            for (ExpenseShare share : expense.getShares()) {
                Long shareParticipantId = share.getParticipant().getId();
                BigDecimal prevOwed = owedMap.getOrDefault(shareParticipantId, BigDecimal.ZERO);
                owedMap.put(shareParticipantId, prevOwed.add(share.getShareAmount()));
            }
        }

        List<ParticipantBalanceDto> result = new ArrayList<>();
        BigDecimal sumNetBalances = BigDecimal.ZERO;

        for (Participant p : participants) {
            BigDecimal totalPaid = paidMap.getOrDefault(p.getId(), BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
            BigDecimal totalOwed = owedMap.getOrDefault(p.getId(), BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
            BigDecimal netBalance = totalPaid.subtract(totalOwed).setScale(2, RoundingMode.HALF_UP);

            sumNetBalances = sumNetBalances.add(netBalance);
            result.add(new ParticipantBalanceDto(
                    p.getId(),
                    p.getName(),
                    p.getEmail(),
                    totalPaid,
                    totalOwed,
                    netBalance
            ));
        }

        // Enforce Business Rule: Sum of all participants' net balances must equal zero
        if (sumNetBalances.compareTo(BigDecimal.ZERO) != 0) {
            throw new BusinessRuleViolationException(
                    "Integrity check failed: Sum of all participants' net balances (" + sumNetBalances + ") does not equal zero.");
        }

        return result;
    }

    /**
     * Generate a minimal set of settlement transactions to clear all balances.
     * Enforces Business Rule: Settlement transactions generated must fully clear every participant's balance to zero.
     */
    @Transactional
    public List<SettlementTransactionDto> generateSettlements(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip with ID " + tripId + " not found"));

        List<ParticipantBalanceDto> balances = computeNetBalances(tripId);

        // Helper classes for max-heap greedy debt simplification
        class MemberDebt {
            final Long participantId;
            final String name;
            BigDecimal amount;

            MemberDebt(Long participantId, String name, BigDecimal amount) {
                this.participantId = participantId;
                this.name = name;
                this.amount = amount;
            }
        }

        PriorityQueue<MemberDebt> creditors = new PriorityQueue<>((a, b) -> b.amount.compareTo(a.amount));
        PriorityQueue<MemberDebt> debtors = new PriorityQueue<>((a, b) -> b.amount.compareTo(a.amount));

        // For verification later
        Map<Long, BigDecimal> verificationBalances = new HashMap<>();

        for (ParticipantBalanceDto b : balances) {
            verificationBalances.put(b.getParticipantId(), b.getNetBalance());
            if (b.getNetBalance().compareTo(BigDecimal.ZERO) > 0) {
                creditors.add(new MemberDebt(b.getParticipantId(), b.getParticipantName(), b.getNetBalance()));
            } else if (b.getNetBalance().compareTo(BigDecimal.ZERO) < 0) {
                debtors.add(new MemberDebt(b.getParticipantId(), b.getParticipantName(), b.getNetBalance().negate()));
            }
        }

        List<SettlementTransactionDto> transactions = new ArrayList<>();

        while (!creditors.isEmpty() && !debtors.isEmpty()) {
            MemberDebt creditor = creditors.poll();
            MemberDebt debtor = debtors.poll();

            BigDecimal settleAmount = creditor.amount.min(debtor.amount).setScale(2, RoundingMode.HALF_UP);

            transactions.add(new SettlementTransactionDto(
                    null,
                    debtor.participantId,
                    debtor.name,
                    creditor.participantId,
                    creditor.name,
                    settleAmount,
                    false,
                    null
            ));

            // Update verification balance: debtor pays amount (moves towards 0), creditor receives amount (moves towards 0)
            verificationBalances.put(debtor.participantId, verificationBalances.get(debtor.participantId).add(settleAmount));
            verificationBalances.put(creditor.participantId, verificationBalances.get(creditor.participantId).subtract(settleAmount));

            BigDecimal creditorRemaining = creditor.amount.subtract(settleAmount);
            BigDecimal debtorRemaining = debtor.amount.subtract(settleAmount);

            if (creditorRemaining.compareTo(BigDecimal.ZERO) > 0) {
                creditor.amount = creditorRemaining;
                creditors.add(creditor);
            }

            if (debtorRemaining.compareTo(BigDecimal.ZERO) > 0) {
                debtor.amount = debtorRemaining;
                debtors.add(debtor);
            }
        }

        // Enforce Business Rule: Settlement transactions generated must fully clear every participant's balance to zero.
        for (Map.Entry<Long, BigDecimal> entry : verificationBalances.entrySet()) {
            if (entry.getValue().compareTo(BigDecimal.ZERO) != 0) {
                throw new BusinessRuleViolationException(
                        "Settlement calculation error: Participant ID " + entry.getKey() + " has remaining uncleared balance of " + entry.getValue());
            }
        }

        // Persist newly generated settlements: remove un-settled old ones first
        List<Settlement> existing = settlementRepository.findByTripId(tripId);
        List<Settlement> toKeep = new ArrayList<>();
        for (Settlement s : existing) {
            if (s.isSettled()) {
                toKeep.add(s);
            } else {
                settlementRepository.delete(s);
            }
        }

        Map<Long, Participant> participantMap = new HashMap<>();
        for (Participant p : participantRepository.findByTripId(tripId)) {
            participantMap.put(p.getId(), p);
        }

        List<SettlementTransactionDto> savedDtos = new ArrayList<>();
        // Include previously settled transactions
        for (Settlement s : toKeep) {
            savedDtos.add(new SettlementTransactionDto(
                    s.getId(),
                    s.getFromParticipant().getId(),
                    s.getFromParticipant().getName(),
                    s.getToParticipant().getId(),
                    s.getToParticipant().getName(),
                    s.getAmount(),
                    s.isSettled(),
                    s.getSettledAt()
            ));
        }

        // Save newly generated transactions
        for (SettlementTransactionDto dto : transactions) {
            Participant fromP = participantMap.get(dto.getFromParticipantId());
            Participant toP = participantMap.get(dto.getToParticipantId());
            Settlement entity = new Settlement(trip, fromP, toP, dto.getAmount());
            Settlement saved = settlementRepository.save(entity);

            savedDtos.add(new SettlementTransactionDto(
                    saved.getId(),
                    saved.getFromParticipant().getId(),
                    saved.getFromParticipant().getName(),
                    saved.getToParticipant().getId(),
                    saved.getToParticipant().getName(),
                    saved.getAmount(),
                    saved.isSettled(),
                    saved.getSettledAt()
            ));
        }

        auditService.record(trip, "SETTLEMENTS_GENERATED",
                "Generated " + transactions.size() + " minimal settlement transactions to clear all participant balances.");

        return savedDtos;
    }

    public List<SettlementTransactionDto> getSettlements(Long tripId) {
        List<Settlement> list = settlementRepository.findByTripId(tripId);
        if (list.isEmpty()) {
            return generateSettlements(tripId);
        }

        List<SettlementTransactionDto> dtos = new ArrayList<>();
        for (Settlement s : list) {
            dtos.add(new SettlementTransactionDto(
                    s.getId(),
                    s.getFromParticipant().getId(),
                    s.getFromParticipant().getName(),
                    s.getToParticipant().getId(),
                    s.getToParticipant().getName(),
                    s.getAmount(),
                    s.isSettled(),
                    s.getSettledAt()
            ));
        }
        return dtos;
    }

    @Transactional
    public SettlementTransactionDto markSettled(Long tripId, Long settlementId) {
        Settlement s = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement with ID " + settlementId + " not found"));

        if (!s.getTrip().getId().equals(tripId)) {
            throw new BusinessRuleViolationException("Settlement does not belong to this trip.");
        }

        s.setSettled(true);
        s.setSettledAt(LocalDateTime.now());
        Settlement saved = settlementRepository.save(s);

        auditService.record(s.getTrip(), "SETTLEMENT_PAID",
                "Settlement transaction #" + s.getId() + " marked as settled: "
                        + s.getFromParticipant().getName() + " paid "
                        + s.getTrip().getCurrency() + " " + s.getAmount() + " to "
                        + s.getToParticipant().getName() + ".");

        return new SettlementTransactionDto(
                saved.getId(),
                saved.getFromParticipant().getId(),
                saved.getFromParticipant().getName(),
                saved.getToParticipant().getId(),
                saved.getToParticipant().getName(),
                saved.getAmount(),
                saved.isSettled(),
                saved.getSettledAt()
        );
    }
}
