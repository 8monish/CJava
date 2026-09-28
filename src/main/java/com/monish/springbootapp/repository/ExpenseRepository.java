package com.monish.springbootapp.repository;

import com.monish.springbootapp.model.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByTripIdOrderByExpenseDateDesc(Long tripId);
    Page<Expense> findByTripId(Long tripId, Pageable pageable);
    List<Expense> findByTripId(Long tripId);
}
