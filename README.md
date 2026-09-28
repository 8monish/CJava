# TripSplit — Group Travel Expense Settlement Tracker

TripSplit is a full-stack group travel expense settlement application. It logs uneven group travel expenses across participants and runs a greedy cashflow reduction algorithm to compute the minimal set of transactions needed to clear all balances to zero.

---

## 1. Key Features

- **Trip Management**: Create and configure trips with custom currencies and participant rosters.
- **Shared Expense Logging**: Log expenses with payer, positive amount, category, and participating beneficiaries.
- **Deterministic Penny-Split Allocation**: Distributes remainder cents systematically so that $\sum \text{shares} = \text{total}$ down to $0.00$.
- **Zero-Sum Ledger Invariant**: Enforces $\sum \text{Net Balances} = 0.00$ in the service layer before saving or returning data.
- **Greedy Debt Simplification**: Pairs maximal debtors with maximal creditors to reduce transactions to at most $N-1$.
- **Settlement Clearance Tracking**: Interactive payment clearance with timestamps, payment methods, and receipt notes.
- **Immutable Audit Trail**: Chronological event log tracking creations, expense modifications, and settlement payments.
- **Multi-Level Nested Navigation**: Hierarchical drill-downs (`Trips` → `Trip Workspace` → `Member Ledger` / `Expense Receipt`).
- **Data Export**: Real-time CSV and JSON export for offsite accounting.

---

## 2. Tech Stack

- **Backend**: Spring Boot 4.1.1, Spring Web, Spring Data JPA, Hibernate, Jakarta Validation
- **Database**: MariaDB (Production Dialect) / H2 (In-memory testing)
- **Frontend**: Pure Vanilla HTML5, Vanilla CSS, Vanilla JavaScript (Zero external front-end frameworks)
- **Typography**: Google Fonts (`Outfit`, `Plus Jakarta Sans`, `JetBrains Mono`)

---

## 3. Project Structure

```
.
├── pom.xml
├── README.md
├── API_DOCUMENTATION.md
├── DATABASE_DESIGN.md
├── BUSINESS_RULES_AND_ALGORITHM.md
├── src/main/java/com/monish/springbootapp/
│   ├── SpringbootappApplication.java
│   ├── DataSeeder.java                     # Pre-seeds demo expedition with 4 members
│   ├── Controller/
│   │   ├── HomeController.java             # Serves static index.html
│   │   ├── TripController.java             # Trip CRUD, participants, summary
│   │   ├── ExpenseController.java          # Expense logging, pagination, deletion
│   │   ├── SettlementController.java       # Balances & minimal settlements
│   │   └── AuditController.java            # Immutable audit logs
│   ├── service/
│   │   ├── TripService.java
│   │   ├── ExpenseService.java
│   │   ├── SettlementService.java
│   │   └── AuditService.java
│   ├── repository/
│   │   ├── TripRepository.java
│   │   ├── ParticipantRepository.java
│   │   ├── ExpenseRepository.java
│   │   ├── ExpenseShareRepository.java
│   │   ├── SettlementRepository.java
│   │   └── AuditLogRepository.java
│   ├── model/
│   │   ├── Trip.java
│   │   ├── Participant.java
│   │   ├── Expense.java
│   │   ├── ExpenseShare.java
│   │   ├── Settlement.java
│   │   └── AuditLog.java
│   ├── dto/                                # Request & response transfer objects
│   └── exception/                          # Custom exceptions & @RestControllerAdvice
└── src/main/resources/
    ├── application.properties
    └── static/
        ├── index.html                      # Semantic single-page layout
        ├── index.css                       # Minimalist design system
        ├── index.js                        # Nested router, calculations & exports
        └── images/tripsplit_hero.jpg       # Travel expenses hero visual
```

---

## 4. Quickstart Guide

### Prerequisites
- Java 21+ (configured for Java 26/27)
- MariaDB running on `localhost:3306` with database `Cjava` (user: `user`, password: `pass`)

### Build and Run
```bash
# Build the project
./mvnw clean package -DskipTests

# Run the Spring Boot application
./mvnw spring-boot:run
```

Once running, access the application in your browser:
- **Web Interface**: `http://localhost:8080/#/explore`
- **Trips Catalog**: `http://localhost:8080/#/trips`
- **Analytics Hub**: `http://localhost:8080/#/analytics`
- **Settlement Hub**: `http://localhost:8080/#/settlements`

---

## 5. Pre-seeded Demo Data

On first launch, `DataSeeder` automatically populates the **"Alpine Retreat & Trek 2026"** expedition:
- **Members**: Alice Chen, Bob Miller, Charlie Davis, Diana Ross
- **Expenses**: 5 uneven shared expenses (Lodge $480, SUV $260, Dinner $180, Gondola $140, Groceries $95.50)
- **Settlement**: Greedy cashflow reduction generates 3 minimal payments clearing all balances to $0.00.
