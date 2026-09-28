package com.monish.springbootapp.Controller;

import com.monish.springbootapp.dto.CreateExpenseRequest;
import com.monish.springbootapp.model.Expense;
import com.monish.springbootapp.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    public ResponseEntity<Expense> logExpense(@PathVariable Long tripId,
                                              @Valid @RequestBody CreateExpenseRequest request) {
        Expense expense = expenseService.logExpense(tripId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(expense);
    }

    @GetMapping
    public ResponseEntity<?> getExpenses(@PathVariable Long tripId,
                                         @RequestParam(required = false) Integer page,
                                         @RequestParam(required = false) Integer size) {
        if (page != null && size != null) {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "expenseDate"));
            Page<Expense> pagedResult = expenseService.getTripExpensesPaged(tripId, pageable);
            return ResponseEntity.ok(pagedResult);
        }
        List<Expense> list = expenseService.getTripExpenses(tripId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{expenseId}")
    public ResponseEntity<Expense> getExpenseById(@PathVariable Long tripId,
                                                  @PathVariable Long expenseId) {
        return ResponseEntity.ok(expenseService.getExpenseById(expenseId));
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long tripId,
                                              @PathVariable Long expenseId) {
        expenseService.deleteExpense(tripId, expenseId);
        return ResponseEntity.noContent().build();
    }
}
