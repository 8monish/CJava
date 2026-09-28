package com.monish.springbootapp.dto;

import com.monish.springbootapp.model.AuditLog;
import com.monish.springbootapp.model.Expense;
import com.monish.springbootapp.model.Participant;
import com.monish.springbootapp.model.Trip;

import java.math.BigDecimal;
import java.util.List;

public class TripSummaryResponse {

    private Trip trip;
    private List<Participant> participants;
    private List<Expense> expenses;
    private BigDecimal totalSpend;
    private int expenseCount;
    private List<ParticipantBalanceDto> balances;
    private List<SettlementTransactionDto> settlements;
    private List<AuditLog> auditLogs;

    public TripSummaryResponse() {}

    public TripSummaryResponse(Trip trip, List<Participant> participants, List<Expense> expenses,
                               BigDecimal totalSpend, int expenseCount,
                               List<ParticipantBalanceDto> balances,
                               List<SettlementTransactionDto> settlements,
                               List<AuditLog> auditLogs) {
        this.trip = trip;
        this.participants = participants;
        this.expenses = expenses;
        this.totalSpend = totalSpend;
        this.expenseCount = expenseCount;
        this.balances = balances;
        this.settlements = settlements;
        this.auditLogs = auditLogs;
    }

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
    }

    public List<Participant> getParticipants() {
        return participants;
    }

    public void setParticipants(List<Participant> participants) {
        this.participants = participants;
    }

    public List<Expense> getExpenses() {
        return expenses;
    }

    public void setExpenses(List<Expense> expenses) {
        this.expenses = expenses;
    }

    public BigDecimal getTotalSpend() {
        return totalSpend;
    }

    public void setTotalSpend(BigDecimal totalSpend) {
        this.totalSpend = totalSpend;
    }

    public int getExpenseCount() {
        return expenseCount;
    }

    public void setExpenseCount(int expenseCount) {
        this.expenseCount = expenseCount;
    }

    public List<ParticipantBalanceDto> getBalances() {
        return balances;
    }

    public void setBalances(List<ParticipantBalanceDto> balances) {
        this.balances = balances;
    }

    public List<SettlementTransactionDto> getSettlements() {
        return settlements;
    }

    public void setSettlements(List<SettlementTransactionDto> settlements) {
        this.settlements = settlements;
    }

    public List<AuditLog> getAuditLogs() {
        return auditLogs;
    }

    public void setAuditLogs(List<AuditLog> auditLogs) {
        this.auditLogs = auditLogs;
    }
}
