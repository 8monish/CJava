package com.monish.springbootapp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SettlementTransactionDto {

    private Long id;
    private Long fromParticipantId;
    private String fromParticipantName;
    private Long toParticipantId;
    private String toParticipantName;
    private BigDecimal amount;
    private boolean settled;
    private LocalDateTime settledAt;

    public SettlementTransactionDto() {}

    public SettlementTransactionDto(Long id, Long fromParticipantId, String fromParticipantName,
                                    Long toParticipantId, String toParticipantName,
                                    BigDecimal amount, boolean settled, LocalDateTime settledAt) {
        this.id = id;
        this.fromParticipantId = fromParticipantId;
        this.fromParticipantName = fromParticipantName;
        this.toParticipantId = toParticipantId;
        this.toParticipantName = toParticipantName;
        this.amount = amount;
        this.settled = settled;
        this.settledAt = settledAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFromParticipantId() {
        return fromParticipantId;
    }

    public void setFromParticipantId(Long fromParticipantId) {
        this.fromParticipantId = fromParticipantId;
    }

    public String getFromParticipantName() {
        return fromParticipantName;
    }

    public void setFromParticipantName(String fromParticipantName) {
        this.fromParticipantName = fromParticipantName;
    }

    public Long getToParticipantId() {
        return toParticipantId;
    }

    public void setToParticipantId(Long toParticipantId) {
        this.toParticipantId = toParticipantId;
    }

    public String getToParticipantName() {
        return toParticipantName;
    }

    public void setToParticipantName(String toParticipantName) {
        this.toParticipantName = toParticipantName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public boolean isSettled() {
        return settled;
    }

    public void setSettled(boolean settled) {
        this.settled = settled;
    }

    public LocalDateTime getSettledAt() {
        return settledAt;
    }

    public void setSettledAt(LocalDateTime settledAt) {
        this.settledAt = settledAt;
    }
}
