package com.monish.springbootapp.service;

import com.monish.springbootapp.dto.AddParticipantRequest;
import com.monish.springbootapp.dto.CreateTripRequest;
import com.monish.springbootapp.exception.ResourceNotFoundException;
import com.monish.springbootapp.model.Participant;
import com.monish.springbootapp.model.Trip;
import com.monish.springbootapp.repository.ParticipantRepository;
import com.monish.springbootapp.repository.TripRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final ParticipantRepository participantRepository;
    private final AuditService auditService;

    public TripService(TripRepository tripRepository,
                       ParticipantRepository participantRepository,
                       AuditService auditService) {
        this.tripRepository = tripRepository;
        this.participantRepository = participantRepository;
        this.auditService = auditService;
    }

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    public Trip getTripById(Long id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip with ID " + id + " not found"));
    }

    @Transactional
    public Trip createTrip(CreateTripRequest request) {
        Trip trip = new Trip(request.getName(), request.getDescription(), request.getCurrency());
        Trip savedTrip = tripRepository.save(trip);

        if (request.getParticipantNames() != null) {
            for (String name : request.getParticipantNames()) {
                if (name != null && !name.trim().isEmpty()) {
                    Participant p = new Participant(name.trim(), null, savedTrip);
                    savedTrip.addParticipant(p);
                }
            }
            savedTrip = tripRepository.save(savedTrip);
        }

        auditService.record(savedTrip, "TRIP_CREATED",
                "Created trip '" + savedTrip.getName() + "' with " + savedTrip.getParticipants().size() + " participants.");

        return savedTrip;
    }

    @Transactional
    public Trip updateTrip(Long id, CreateTripRequest request) {
        Trip trip = getTripById(id);
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            trip.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            trip.setDescription(request.getDescription().trim());
        }
        if (request.getCurrency() != null && !request.getCurrency().trim().isEmpty()) {
            trip.setCurrency(request.getCurrency().trim());
        }
        Trip updated = tripRepository.save(trip);
        auditService.record(updated, "TRIP_UPDATED", "Updated trip details for '" + updated.getName() + "'.");
        return updated;
    }

    @Transactional
    public Participant addParticipant(Long tripId, AddParticipantRequest request) {
        Trip trip = getTripById(tripId);
        Participant participant = new Participant(request.getName().trim(), request.getEmail(), trip);
        Participant savedParticipant = participantRepository.save(participant);

        auditService.record(trip, "PARTICIPANT_ADDED",
                "Added participant '" + savedParticipant.getName() + "' to trip.");

        return savedParticipant;
    }

    public List<Participant> getParticipants(Long tripId) {
        getTripById(tripId); // ensure trip exists
        return participantRepository.findByTripId(tripId);
    }

    @Transactional
    public void deleteTrip(Long id) {
        Trip trip = getTripById(id);
        tripRepository.delete(trip);
    }
}
