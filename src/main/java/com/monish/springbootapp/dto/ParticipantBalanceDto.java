package com.monish.springbootapp.dto;

import java.math.BigDecimal;

public class ParticipantBalanceDto {

    private Long participantId;
    private String participantName;
    private String participantEmail;
    private BigDecimal totalPaid;
    private BigDecimal totalOwed;
    private BigDecimal netBalance;
    private String status; // OWED_MONEY, OWES_MONEY, SETTLED

    public ParticipantBalanceDto() {}

    public ParticipantBalanceDto(Long participantId, String participantName, String participantEmail,
                                 BigDecimal totalPaid, BigDecimal totalOwed, BigDecimal netBalance) {
        this.participantId = participantId;
        this.participantName = participantName;
        this.participantEmail = participantEmail;
        this.totalPaid = totalPaid;
        this.totalOwed = totalOwed;
        this.netBalance = netBalance;

        if (netBalance.compareTo(BigDecimal.ZERO) > 0) {
            this.status = "OWED_MONEY";
        } else if (netBalance.compareTo(BigDecimal.ZERO) < 0) {
            this.status = "OWES_MONEY";
        } else {
            this.status = "SETTLED";
        }
    }

    public Long getParticipantId() {
        return participantId;
    }

    public void setParticipantId(Long participantId) {
        this.participantId = participantId;
    }

    public String getParticipantName() {
        return participantName;
    }

    public void setParticipantName(String participantName) {
        this.participantName = participantName;
    }

    public String getParticipantEmail() {
        return participantEmail;
    }

    public void setParticipantEmail(String participantEmail) {
        this.participantEmail = participantEmail;
    }

    public BigDecimal getTotalPaid() {
        return totalPaid;
    }

    public void setTotalPaid(BigDecimal totalPaid) {
        this.totalPaid = totalPaid;
    }

    public BigDecimal getTotalOwed() {
        return totalOwed;
    }

    public void setTotalOwed(BigDecimal totalOwed) {
        this.totalOwed = totalOwed;
    }

    public BigDecimal getNetBalance() {
        return netBalance;
    }

    public void setNetBalance(BigDecimal netBalance) {
        this.netBalance = netBalance;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
