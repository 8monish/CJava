package com.monish.springbootapp.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class CreateExpenseRequest {

    @NotBlank(message = "Expense description is required")
    private String description;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be strictly positive")
    private BigDecimal amount;

    private String category = "OTHER";

    @NotNull(message = "Payer ID is required")
    private Long payerId;

    @NotEmpty(message = "At least one participant must share this expense")
    private List<Long> sharedParticipantIds;

    // Optional: custom shares per participantId. If null or empty, split equally.
    private Map<Long, BigDecimal> customShares;

    private LocalDateTime expenseDate;

    public CreateExpenseRequest() {}

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Long getPayerId() {
        return payerId;
    }

    public void setPayerId(Long payerId) {
        this.payerId = payerId;
    }

    public List<Long> getSharedParticipantIds() {
        return sharedParticipantIds;
    }

    public void setSharedParticipantIds(List<Long> sharedParticipantIds) {
        this.sharedParticipantIds = sharedParticipantIds;
    }

    public Map<Long, BigDecimal> getCustomShares() {
        return customShares;
    }

    public void setCustomShares(Map<Long, BigDecimal> customShares) {
        this.customShares = customShares;
    }

    public LocalDateTime getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(LocalDateTime expenseDate) {
        this.expenseDate = expenseDate;
    }
}
