# TripSplit — REST API Documentation

Base URL: `http://localhost:8080/api`

Standard HTTP Status Codes used:
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `204 No Content`: Resource deleted successfully.
- `400 Bad Request`: Input validation failed (`@Valid`).
- `404 Not Found`: Resource ID not found.
- `422 Unprocessable Entity`: Business rule violated (e.g. non-zero balance sum, invalid payer).

---

## 1. Trips

### List All Trips
- **Endpoint**: `GET /api/trips`
- **Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "Alpine Retreat & Trek 2026",
    "description": "Week-long hiking expedition through the Swiss Alps",
    "currency": "USD",
    "createdAt": "2026-09-28T10:39:00",
    "participants": [ ... ],
    "expenses": [ ... ],
    "settlements": [ ... ]
  }
]
```

### Create Trip
- **Endpoint**: `POST /api/trips`
- **Request Body**:
```json
{
  "name": "Iceland Aurora Tour",
  "description": "Glacier hiking & hot springs",
  "currency": "EUR",
  "participantNames": ["Lukas", "Sophia", "Mateo"]
}
```
- **Response**: `201 Created`

### Get Trip Details
- **Endpoint**: `GET /api/trips/{tripId}`
- **Response**: `200 OK`

### Get Trip Full Summary
- **Endpoint**: `GET /api/trips/{tripId}/summary`
- **Response**: `200 OK` (returns trip metadata, participant roster, itemized expenses, computed net balances, generated settlements, and audit logs).

### Update Trip
- **Endpoint**: `PUT /api/trips/{tripId}`
- **Request Body**:
```json
{
  "name": "Iceland Aurora Tour 2026",
  "description": "Updated itinerary notes",
  "currency": "EUR"
}
```
- **Response**: `200 OK`

### Delete Trip
- **Endpoint**: `DELETE /api/trips/{tripId}`
- **Response**: `204 No Content` (Cascade-deletes all associated expenses, shares, settlements, and audit logs).

---

## 2. Participants

### Add Member to Trip
- **Endpoint**: `POST /api/trips/{tripId}/participants`
- **Request Body**:
```json
{
  "name": "Elena Rostova",
  "email": "elena@example.com"
}
```
- **Response**: `201 Created`

### List Members
- **Endpoint**: `GET /api/trips/{tripId}/participants`
- **Response**: `200 OK`

---

## 3. Expenses

### Log an Expense
- **Endpoint**: `POST /api/trips/{tripId}/expenses`
- **Request Body**:
```json
{
  "description": "Rental SUV & Petrol",
  "amount": 260.00,
  "category": "TRANSPORT",
  "payerId": 2,
  "sharedParticipantIds": [1, 2, 3, 4]
}
```
- **Optional Custom Splits**: Send `"customShares": { "1": 65.00, "2": 65.00, "3": 65.00, "4": 65.00 }`.
- **Response**: `201 Created` (Includes itemized `ExpenseShare` records with exact penny allocations).

### List Trip Expenses (Supports Pagination)
- **Endpoint**: `GET /api/trips/{tripId}/expenses`
- **Optional Query Params**: `?page=0&size=10`
- **Response**: `200 OK`

### Get Single Expense
- **Endpoint**: `GET /api/trips/{tripId}/expenses/{expenseId}`
- **Response**: `200 OK`

### Delete Expense
- **Endpoint**: `DELETE /api/trips/{tripId}/expenses/{expenseId}`
- **Response**: `204 No Content`

---

## 4. Balances & Settlements

### Compute Participant Net Balances
- **Endpoint**: `GET /api/trips/{tripId}/balances`
- **Response**: `200 OK`
```json
[
  {
    "participantId": 1,
    "participantName": "Alice Chen",
    "totalPaid": 620.00,
    "totalOwed": 300.55,
    "netBalance": 319.45,
    "status": "OWED_MONEY"
  },
  {
    "participantId": 4,
    "participantName": "Diana Ross",
    "totalPaid": 95.50,
    "totalOwed": 300.53,
    "netBalance": -205.03,
    "status": "OWES_MONEY"
  }
]
```

### Generate Minimal Settlements
- **Endpoint**: `POST /api/trips/{tripId}/settlements/generate`
- **Response**: `200 OK`
```json
[
  {
    "id": 1,
    "fromParticipantId": 4,
    "fromParticipantName": "Diana Ross",
    "toParticipantId": 1,
    "toParticipantName": "Alice Chen",
    "amount": 205.03,
    "settled": false,
    "settledAt": null
  }
]
```

### Mark Settlement as Paid
- **Endpoint**: `PUT /api/trips/{tripId}/settlements/{settlementId}/settle`
- **Response**: `200 OK` (Sets `settled = true` and records clearance timestamp).

---

## 5. Audit Log

### View Audit Trail
- **Endpoint**: `GET /api/trips/{tripId}/audit-logs`
- **Response**: `200 OK` (Chronological descending log of actions: `TRIP_CREATED`, `EXPENSE_LOGGED`, `EXPENSE_DELETED`, `SETTLEMENTS_GENERATED`, `SETTLEMENT_PAID`).

---

## 6. Error Response Schema

When an input validation or business rule fails, the `@RestControllerAdvice` returns structured JSON:
```json
{
  "timestamp": "2026-09-28T10:39:55.458",
  "status": 400,
  "error": "Validation Failed",
  "message": "Input validation failed. Please check provided fields.",
  "fieldErrors": {
    "amount": "Amount must be strictly positive"
  }
}
```
