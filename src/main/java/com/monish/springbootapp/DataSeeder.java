package com.monish.springbootapp;

import com.monish.springbootapp.dto.CreateExpenseRequest;
import com.monish.springbootapp.dto.CreateTripRequest;
import com.monish.springbootapp.model.Participant;
import com.monish.springbootapp.model.Trip;
import com.monish.springbootapp.repository.TripRepository;
import com.monish.springbootapp.service.ExpenseService;
import com.monish.springbootapp.service.SettlementService;
import com.monish.springbootapp.service.TripService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final TripRepository tripRepository;
    private final TripService tripService;
    private final ExpenseService expenseService;
    private final SettlementService settlementService;

    public DataSeeder(TripRepository tripRepository,
                      TripService tripService,
                      ExpenseService expenseService,
                      SettlementService settlementService) {
        this.tripRepository = tripRepository;
        this.tripService = tripService;
        this.expenseService = expenseService;
        this.settlementService = settlementService;
    }

    @Override
    public void run(String... args) {
        if (tripRepository.count() > 0) {
            return;
        }

        CreateTripRequest tripReq = new CreateTripRequest(
                "Alpine Retreat & Trek 2026",
                "A scenic week-long hiking expedition through the Swiss Alps with mountain lodges, scenic trains, and group dinners.",
                "USD",
                Arrays.asList("Alice Chen", "Bob Miller", "Charlie Davis", "Diana Ross")
        );

        Trip trip = tripService.createTrip(tripReq);
        List<Participant> participants = tripService.getParticipants(trip.getId());

        Participant alice = participants.get(0);
        Participant bob = participants.get(1);
        Participant charlie = participants.get(2);
        Participant diana = participants.get(3);

        List<Long> allFour = Arrays.asList(alice.getId(), bob.getId(), charlie.getId(), diana.getId());
        List<Long> threeWithoutBob = Arrays.asList(alice.getId(), charlie.getId(), diana.getId());

        // Expense 1: Chalet Booking
        CreateExpenseRequest exp1 = new CreateExpenseRequest();
        exp1.setDescription("Chalet Mountain Lodge (4 Nights)");
        exp1.setAmount(new BigDecimal("480.00"));
        exp1.setCategory("LODGING");
        exp1.setPayerId(alice.getId());
        exp1.setSharedParticipantIds(allFour);
        exp1.setExpenseDate(LocalDateTime.now().minusDays(5));
        expenseService.logExpense(trip.getId(), exp1);

        // Expense 2: Rental SUV & Petrol
        CreateExpenseRequest exp2 = new CreateExpeexpense_shares  |
| expenses        |
| participants    |
| settlements     |
| trips           |
| users           |
+------nseRequest();
        exp2.setDescription("Rental SUV & Highway Tolls");
        exp2.setAmount(new BigDecimal("260.00"));
        exp2.setCategory("TRANSPORT");
        exp2.setPayerId(bob.getId());
        exp2.setSharedParticipantIds(allFour);
        exp2.setExpenseDate(LocalDateTime.now().minusDays(4));
        expenseService.logExpense(trip.getId(), exp2);

        // Expense 3: Fondue Dinner
        CreateExpenseRequest exp3 = new CreateExpenseRequest();
        exp3.setDescription("Traditional Swiss Fondue Dinner");
        exp3.setAmount(new BigDecimal("180.00"));
        exp3.setCategory("FOOD");
        exp3.setPayerId(charlie.getId());
        exp3.setSharedParticipantIds(allFour);
        exp3.setExpenseDate(LocalDateTime.now().minusDays(3));
        expenseService.logExpense(trip.getId(), exp3);

        // Expense 4: Gondola Mountain Passes (Bob didn't take the gondola hike)
        CreateExpenseRequest exp4 = new CreateExpenseRequest();
        exp4.setDescription("Glacier 3000 Gondola Passes");
        exp4.setAmount(new BigDecimal("140.00"));
        exp4.setCategory("ACTIVITIES");
        exp4.setPayerId(alice.getId());
        exp4.setSharedParticipantIds(threeWithoutBob);
        exp4.setExpenseDate(LocalDateTime.now().minusDays(2));
        expenseService.logExpense(trip.getId(), exp4);

        // Expense 5: Local Market Groceries
        CreateExpenseRequest exp5 = new CreateExpenseRequest();
        exp5.setDescription("Organic Groceexpense_shares  |\n" + //
                        "| expenses        |\n" + //
                        "| participants    |\n" + //
                        "| settlements     |\n" + //
                        "| trips           |\n" + //
                        "| users           |\n" + //
                        "+------ries, Fruit & Trail Mix");
        exp5.setAmount(new BigDecimal("95.50"));
        exp5.setCategory("FOOD");
        exp5.setPayerId(diana.getId());
        exp5.setSharedParticipantIds(allFour);
        exp5.setExpenseDate(LocalDateTime.now().minusDays(1));
        expenseService.logExpense(trip.getId(), exp5);

        // Pre-generate minimal settlements
        settlementService.generateSettlements(trip.getId());
    }
}
