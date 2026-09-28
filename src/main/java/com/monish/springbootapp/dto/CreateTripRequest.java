package com.monish.springbootapp.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

public class CreateTripRequest {

    @NotBlank(message = "Trip name is required")
    private String name;

    private String description;

    private String currency = "USD";

    private List<String> participantNames = new ArrayList<>();

    public CreateTripRequest() {}

    public CreateTripRequest(String name, String description, String currency, List<String> participantNames) {
        this.name = name;
        this.description = description;
        this.currency = currency;
        this.participantNames = participantNames;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public List<String> getParticipantNames() {
        return participantNames;
    }

    public void setParticipantNames(List<String> participantNames) {
        this.participantNames = participantNames;
    }
}
