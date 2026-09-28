package com.monish.springbootapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "settlements")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Settlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    @JsonIgnore
    private Trip trip;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "from_participant_id", nullable = false)
    private Participant fromParticipant;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "to_participant_id", nullable = false)
    private Participant toParticipant;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private boolean settled = false;

    private LocalDateTime settledAt;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Settlement() {}

    public Settlement(Trip trip, Participant fromParticipant, Participant toParticipant, BigDecimal amount) {
        this.trip = trip;
        this.fromParticipant = fromParticipant;
        this.toParticipant = toParticipant;
        this.amount = amount;
        this.settled = false;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
    }

    public Participant getFromParticipant() {
        return fromParticipant;
    }

    public void setFromParticipant(Participant fromParticipant) {
        this.fromParticipant = fromParticipant;
    }

    public Participant getToParticipant() {
        return toParticipant;
    }

    public void setToParticipant(Participant toParticipant) {
        this.toParticipant = toParticipant;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
