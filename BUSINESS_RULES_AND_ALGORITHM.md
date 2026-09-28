# TripSplit — Business Rules & Settlement Algorithm

This document provides a concise mathematical and algorithmic explanation of the core business logic implemented in TripSplit.

---

## 1. Core Mathematical Definitions

For a given trip $T$ with participants $P = \{p_1, p_2, \dots, p_n\}$ and expenses $E = \{e_1, e_2, \dots, e_m\}$:

1. **Total Out-of-Pocket Paid ($Paid_i$)**:
   $$\text{Paid}_i = \sum_{e \in E, \, \text{payer}(e) = p_i} \text{amount}(e)$$

2. **Total Owed Expense Share ($Owed_i$)**:
   $$\text{Owed}_i = \sum_{e \in E} \text{shareAmount}(e, p_i)$$

3. **Participant Net Balance ($B_i$)**:
   $$B_i = \text{Paid}_i - \text{Owed}_i$$

- **$B_i > 0$ (Creditor)**: Participant paid more than their share and is **owed money**.
- **$B_i < 0$ (Debtor)**: Participant owes more than they paid and **must pay money**.
- **$B_i = 0$ (Cleared)**: Participant is fully settled up.

---

## 2. Business Rules Enforced in the Service Layer

### Rule 1: Zero-Sum Net Balance Invariant
$$\sum_{i=1}^n B_i = 0.00$$

**Why it matters**: Every dollar spent by a payer is distributed among the beneficiaries. If penny division is unhandled (e.g. $\$100 / 3 = 33.33 \times 3 = 99.99$), $\$0.01$ is lost, violating conservation of money.

**Enforcement Mechanism in [ExpenseService.java](file:///home/monish/Projects/Java/CJava/src/main/java/com/monish/springbootapp/service/ExpenseService.java)**:
When splitting amount $A$ across $k$ participants:
1. $\text{baseShare} = \lfloor \frac{A}{k} \times 100 \rfloor / 100$
2. $\text{remainderCents} = (A - \text{baseShare} \times k) \times 100$
3. Add $\$0.01$ to the first $\text{remainderCents}$ participants.
4. Result: $\sum \text{shares} = A$ exactly.
5. In [SettlementService.java](file:///home/monish/Projects/Java/CJava/src/main/java/com/monish/springbootapp/service/SettlementService.java), `computeNetBalances()` asserts $\sum B_i == 0.00$. If not, `BusinessRuleViolationException` is thrown before any settlement can be generated.

---

### Rule 2: Complete Settlement Clearance
Every participant's balance must reach exactly $0.00$ after executing the generated settlement transactions.

**Enforcement Mechanism in [SettlementService.java](file:///home/monish/Projects/Java/CJava/src/main/java/com/monish/springbootapp/service/SettlementService.java)**:
After generating transactions, the service simulates each payment:
- Debtor's simulated balance increases by $T_{\text{amount}}$.
- Creditor's simulated balance decreases by $T_{\text{amount}}$.
- The service verifies that $\forall p_i, \, B_i^{\text{simulated}} == 0.00$. If any residual balance remains, execution halts.

---

## 3. Greedy Debt Simplification Algorithm

### The Problem
If $N$ friends transact pairwise, up to $\frac{N(N-1)}{2}$ transactions ($O(N^2)$) may be required. For 4 people, that is up to 6 transactions; for 10 people, up to 45 transactions.

### The Algorithm
The greedy algorithm reduces the number of payments to at most **$N - 1$ transactions**:

1. Partition all non-zero net balances into two max-heaps (priority queues):
   - **Creditors ($C$)**: Members with $B_i > 0$, ordered descending by balance.
   - **Debtors ($D$)**: Members with $B_i < 0$, ordered descending by absolute debt ($|B_i|$).
2. While both $C$ and $D$ are non-empty:
   - Poll maximal creditor $c = \text{max}(C)$ and maximal debtor $d = \text{max}(D)$.
   - Transaction Amount: $S = \min(c.\text{amount}, d.\text{amount})$.
   - Create transaction: **$d \rightarrow c$ of amount $S$**.
   - $c.\text{amount} \leftarrow c.\text{amount} - S$.
   - $d.\text{amount} \leftarrow d.\text{amount} - S$.
   - If $c.\text{amount} > 0$, push back into $C$.
   - If $d.\text{amount} > 0$, push back into $D$.
3. Time Complexity: $O(N \log N)$ where $N$ is the number of participants.

---

## 4. Worked Step-by-Step Example (Alpine Retreat 2026)

### Initial Group Expenses
- Alice paid $\$480$ (Chalet Lodge) — shared by Alice, Bob, Charlie, Diana ($\$120$ each).
- Bob paid $\$260$ (SUV Rental) — shared by Alice, Bob, Charlie, Diana ($\$65$ each).
- Charlie paid $\$180$ (Fondue Dinner) — shared by Alice, Bob, Charlie, Diana ($\$45$ each).
- Alice paid $\$140$ (Gondola Passes) — shared by Alice, Charlie, Diana ($\$46.67, \$46.67, \$46.66$).
- Diana paid $\$95.50$ (Groceries) — shared by Alice, Bob, Charlie, Diana ($\$23.88, \$23.88, \$23.87, \$23.87$).

### Net Balances Table
| Participant | Paid | Owed Share | Net Balance ($Paid - Owed$) | Role |
|---|---|---|---|---|
| **Alice** | $\$620.00$ | $\$300.55$ | **$+\$319.45$** | Creditor (owed money) |
| **Bob** | $\$260.00$ | $\$253.88$ | **$+\$6.12$** | Creditor (owed money) |
| **Charlie** | $\$180.00$ | $\$300.54$ | **$-\$120.54$** | Debtor (owes money) |
| **Diana** | $\$95.50$ | $\$300.53$ | **$-\$205.03$** | Debtor (owes money) |
| **Total** | $\$1,155.50$ | $\$1,155.50$ | **$\$0.00$** | **Zero-Sum Verified** |

### Execution of Greedy Algorithm
1. **Step 1**:
   - Max Creditor: Alice ($\$319.45$)
   - Max Debtor: Diana ($\$205.03$)
   - $S = \min(319.45, 205.03) = \$205.03$
   - **Transaction 1: Diana pays Alice $\$205.03$**
   - Diana cleared to $\$0.00$. Alice remaining: $\$319.45 - \$205.03 = \$114.42$.

2. **Step 2**:
   - Max Creditor: Alice ($\$114.42$)
   - Max Debtor: Charlie ($\$120.54$)
   - $S = \min(114.42, 120.54) = \$114.42$
   - **Transaction 2: Charlie pays Alice $\$114.42$**
   - Alice cleared to $\$0.00$. Charlie remaining: $\$120.54 - \$114.42 = \$6.12$.

3. **Step 3**:
   - Max Creditor: Bob ($\$6.12$)
   - Max Debtor: Charlie ($\$6.12$)
   - $S = \min(6.12, 6.12) = \$6.12$
   - **Transaction 3: Charlie pays Bob $\$6.12$**
   - Bob cleared to $\$0.00$. Charlie cleared to $\$0.00$.

### Result
Total transactions required: **3** (clearing 4 members across 5 uneven group expenses).
All balances clear to **$\$0.00$** with zero residual error.
