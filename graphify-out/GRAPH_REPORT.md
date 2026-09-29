# Graph Report - CJava  (2026-09-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 462 nodes · 1107 edges · 24 communities (20 shown, 4 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 102 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e9d2fb3c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.js
- ExpenseService
- Settlement
- User
- CreateTripRequest
- SettlementService.java
- .logExpense
- SettlementTransactionDto
- ParticipantBalanceDto
- AuditLog
- org.springframework.http.ResponseEntity
- ExpenseShare
- Trip
- Expense
- TripSummaryResponse
- Participant
- GlobalExceptionHandler.java
- ExpenseController
- mvnw
- AuditController
- ExpenseController.java
- SpringbootappApplicationTests.java
- SpringbootappApplication.java
- com.monish:springbootapp

## God Nodes (most connected - your core abstractions)
1. `Trip` - 60 edges
2. `Expense` - 49 edges
3. `Participant` - 48 edges
4. `SettlementTransactionDto` - 30 edges
5. `Settlement` - 29 edges
6. `AuditLog` - 28 edges
7. `TripSummaryResponse` - 26 edges
8. `ExpenseShare` - 24 edges
9. `ParticipantBalanceDto` - 24 edges
10. `ExpenseService` - 22 edges

## Surprising Connections (you probably didn't know these)
- `AuditLogRepository` --references--> `AuditLog`  [EXTRACTED]
  src/main/java/com/monish/springbootapp/repository/AuditLogRepository.java → src/main/java/com/monish/springbootapp/model/AuditLog.java
- `ExpenseRepository` --references--> `Expense`  [EXTRACTED]
  src/main/java/com/monish/springbootapp/repository/ExpenseRepository.java → src/main/java/com/monish/springbootapp/model/Expense.java
- `ParticipantRepository` --references--> `Participant`  [EXTRACTED]
  src/main/java/com/monish/springbootapp/repository/ParticipantRepository.java → src/main/java/com/monish/springbootapp/model/Participant.java
- `SettlementRepository` --references--> `Settlement`  [EXTRACTED]
  src/main/java/com/monish/springbootapp/repository/SettlementRepository.java → src/main/java/com/monish/springbootapp/model/Settlement.java
- `TripRepository` --references--> `Trip`  [EXTRACTED]
  src/main/java/com/monish/springbootapp/repository/TripRepository.java → src/main/java/com/monish/springbootapp/model/Trip.java

## Import Cycles
- None detected.

## Communities (24 total, 4 thin omitted)

### Community 0 - "index.js"
Cohesion: 0.14
Nodes (46): apiCall(), closeMobileNav(), closeModal(), downloadBlob(), escapeCsv(), escapeHtml(), exportAllTripsJSON(), exportTripCSV() (+38 more)

### Community 1 - "ExpenseService"
Cohesion: 0.13
Nodes (23): arrays, list, org.springframework.boot.CommandLineRunner, org.springframework.data.domain.Page, org.springframework.data.domain.Pageable, org.springframework.data.jpa.repository.JpaRepository, org.springframework.stereotype.Component, org.springframework.stereotype.Repository (+15 more)

### Community 2 - "Settlement"
Cohesion: 0.07
Nodes (7): DeleteMapping, GetMapping, BusinessRuleViolationException, ResourceNotFoundException, Entity, Table, Settlement

### Community 3 - "User"
Cohesion: 0.08
Nodes (19): column, generatedvalue, generationtype, id, jakarta.persistence.Entity, jakarta.persistence.Table, org.springframework.stereotype.Controller, org.springframework.web.bind.annotation.DeleteMapping (+11 more)

### Community 4 - "CreateTripRequest"
Cohesion: 0.08
Nodes (5): org.springframework.transaction.annotation.Transactional, PostMapping, PutMapping, AddParticipantRequest, CreateTripRequest

### Community 5 - "SettlementService.java"
Cohesion: 0.18
Nodes (13): arraylist, bigdecimal, com.fasterxml.jackson.annotation.JsonIgnoreProperties, decimalmin, jsonignore, localdatetime, map, notblank (+5 more)

### Community 6 - ".logExpense"
Cohesion: 0.14
Nodes (3): Override, PostMapping, CreateExpenseRequest

### Community 9 - "AuditLog"
Cohesion: 0.12
Nodes (3): AuditLog, Entity, Table

### Community 10 - "org.springframework.http.ResponseEntity"
Cohesion: 0.17
Nodes (9): annotation, org.springframework.http.ResponseEntity, CrossOrigin, GetMapping, PostMapping, PutMapping, RequestMapping, RestController (+1 more)

### Community 11 - "ExpenseShare"
Cohesion: 0.14
Nodes (4): ExpenseShare, Entity, Table, ExpenseShareRepository

### Community 12 - "Trip"
Cohesion: 0.15
Nodes (3): Entity, Table, Trip

### Community 13 - "Expense"
Cohesion: 0.15
Nodes (3): Expense, Entity, Table

### Community 15 - "Participant"
Cohesion: 0.17
Nodes (3): Entity, Table, Participant

### Community 16 - "GlobalExceptionHandler.java"
Cohesion: 0.26
Nodes (7): fielderror, hashmap, httpstatus, org.springframework.web.bind.annotation.ExceptionHandler, org.springframework.web.bind.annotation.RestControllerAdvice, org.springframework.web.bind.MethodArgumentNotValidException, GlobalExceptionHandler

### Community 17 - "ExpenseController"
Cohesion: 0.20
Nodes (6): ExpenseController, CrossOrigin, DeleteMapping, GetMapping, RequestMapping, RestController

### Community 18 - "mvnw"
Cohesion: 0.38
Nodes (8): mvnw script, clean(), die(), exec_maven(), hash_string(), set_java_home(), trim(), verbose()

### Community 19 - "AuditController"
Cohesion: 0.29
Nodes (5): AuditController, CrossOrigin, GetMapping, RequestMapping, RestController

### Community 20 - "ExpenseController.java"
Cohesion: 0.33
Nodes (5): page, pageable, pagerequest, sort, valid

### Community 21 - "SpringbootappApplicationTests.java"
Cohesion: 0.60
Nodes (3): org.junit.jupiter.api.Test, org.springframework.boot.test.context.SpringBootTest, SpringbootappApplicationTests

### Community 22 - "SpringbootappApplication.java"
Cohesion: 0.50
Nodes (3): org.springframework.boot.autoconfigure.SpringBootApplication, springapplication, SpringbootappApplication

## Knowledge Gaps
- **2 isolated node(s):** `state`, `com.monish:springbootapp`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 147 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Trip` connect `Trip` to `ExpenseService`, `Settlement`, `CreateTripRequest`, `SettlementService.java`, `.logExpense`, `AuditLog`, `Expense`, `TripSummaryResponse`, `Participant`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **Why does `Expense` connect `Expense` to `ExpenseService`, `CreateTripRequest`, `SettlementService.java`, `.logExpense`, `AuditLog`, `ExpenseShare`, `Trip`, `TripSummaryResponse`, `Participant`, `ExpenseController`, `ExpenseController.java`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Why does `Participant` connect `Participant` to `ExpenseService`, `Settlement`, `CreateTripRequest`, `SettlementService.java`, `.logExpense`, `AuditLog`, `ExpenseShare`, `Trip`, `Expense`, `TripSummaryResponse`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **What connects `state`, `com.monish:springbootapp` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14450354609929078 - nodes in this community are weakly interconnected._
- **Should `ExpenseService` be split into smaller, more focused modules?**
  _Cohesion score 0.1303030303030303 - nodes in this community are weakly interconnected._
- **Should `Settlement` be split into smaller, more focused modules?**
  _Cohesion score 0.07293868921775898 - nodes in this community are weakly interconnected._