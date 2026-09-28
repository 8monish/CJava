package com.monish.springbootapp.dto;

import jakarta.validation.constraints.NotBlank;

public class AddParticipantRequest {

    @NotBlank(message = "Participant name is required")
    private String name;

    private String email;

    public AddParticipantRequest() {}

    public AddParticipantRequest(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
