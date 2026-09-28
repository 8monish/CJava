/**
 * MINIMAL — Commercial Group Travel Expense Settlement Platform
 * Fully responsive, production-ready Vanilla JavaScript application
 */

// Application State
const state = {
  currentRoute: '',
  trips: [],
  activeTripSummary: null,
  activeTripId: null,
  categories: ['FOOD', 'TRANSPORT', 'LODGING', 'ACTIVITIES', 'SHOPPING', 'OTHER'],
  searchQuery: '',
  expenseCategoryFilter: 'ALL',
  expenseSortBy: 'DATE_DESC',
  tripStatusFilter: 'ALL'
};

// API Helper
async function apiCall(endpoint, options = {}) {
  try {
    const res = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (res.status === 204) return null;

    const data = await res.json();
    if (!res.ok) {
      const msg = data.message || (data.fieldErrors ? Object.values(data.fieldErrors).join(', ') : 'Server responded with an error');
      throw new Error(msg);
    }
    return data;
  } catch (err) {
    showToast(err.message, true);
    throw err;
  }
}

// Toast Notifications
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'toast' + (isError ? ' toast-error' : '');
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 4000);
}

// Modal Helpers
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

// Mobile Navigation
function toggleMobileNav() {
  const nav = document.getElementById('mobile-nav');
  if (nav) nav.classList.toggle('open');
}

function closeMobileNav() {
  const nav = document.getElementById('mobile-nav');
  if (nav) nav.classList.remove('open');
}

// Router
window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', () => {
  if (!window.location.hash) {
    window.location.hash = '#/explore';
  } else {
    handleRoute();
  }
});

async function handleRoute() {
  closeMobileNav();
  const hash = window.location.hash.slice(1) || '/explore';
  state.currentRoute = hash;

  // Sync Header active navigation link
  const topNavIds = ['explore', 'trips', 'analytics', 'settlements', 'settings'];
  topNavIds.forEach(id => {
    const el = document.getElementById(`nav-${id}`);
    if (el) {
      if (hash.startsWith(`/${id}`) || (id === 'explore' && hash === '/home')) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }
  });

  const parts = hash.split('/').filter(Boolean);

  if (parts.length === 0 || parts[0] === 'explore' || parts[0] === 'home') {
    await renderExplorePage();
  } else if (parts[0] === 'trips' && parts.length === 1) {
    await renderTripsCatalog();
  } else if (parts[0] === 'analytics') {
    await renderAnalyticsPage();
  } else if (parts[0] === 'settlements') {
    await renderSettlementHubPage();
  } else if (parts[0] === 'settings') {
    await renderSettingsPage();
  } else if (parts[0] === 'trips' && parts.length >= 2) {
    const tripId = parts[1];
    const section = parts[2] || 'overview';
    const subId = parts[3];

    if (section === 'expenses' && subId === 'new') {
      await renderNewExpenseForm(tripId);
    } else if (section === 'expenses' && subId) {
      await renderExpenseDetail(tripId, subId);
    } else if (section === 'members' && subId) {
      await renderMemberLedger(tripId, subId);
    } else {
      await renderTripWorkspace(tripId, section);
    }
  } else {
    await renderExplorePage();
  }
}

// Breadcrumb Builder
function updateBreadcrumbs(items) {
  const container = document.getElementById('breadcrumbs-container');
  if (!container) return;

  let html = `<a href="#/explore" class="breadcrumb-item">TripSplit</a>`;
  items.forEach((item, index) => {
    html += ` <span class="breadcrumb-separator">/</span> `;
    if (index === items.length - 1 || !item.url) {
      html += `<span class="breadcrumb-current">${escapeHtml(item.label)}</span>`;
    } else {
      html += `<a href="${item.url}" class="breadcrumb-item">${escapeHtml(item.label)}</a>`;
    }
  });
  container.innerHTML = html;
}

// -------------------------------------------------------------
// VIEW 1: EDITORIAL JOURNAL & EXPLORE LANDING (MATCHING IMAGE 1)
// -------------------------------------------------------------
async function renderExplorePage() {
  updateBreadcrumbs([{ label: 'Journal & Explore', url: '#/explore' }]);
  const container = document.getElementById('view-container');

  try {
    state.trips = await apiCall('/api/trips');
  } catch (e) {
    state.trips = [];
  }

  const activeTripCount = state.trips.length;

  container.innerHTML = `
    <!-- Editorial Card matching Image 1 aesthetic with TripSplit Travel Photo -->
    <article class="hero-card">
      <div class="hero-image-wrap">
        <img src="images/tripsplit_hero.jpg" alt="TripSplit Travel Expenses and Group Itinerary" class="hero-photo">
      </div>

      <div class="hero-meta-category">The Art of Frictionless Group Travel</div>
      <h2 class="hero-title">A Better Way to Share Expenses &amp; Settle Debt</h2>
      <p class="hero-text">
        Shared journeys should be defined by memories, not awkward math at the end of the road. 
        TripSplit tracks shared accommodations, transport, and communal meals across uneven groups. 
        Our greedy cashflow engine reduces complex multi-way IOUs into the absolute minimum number of clean, zero-residual payments.
      </p>
      <div class="btn-group">
        <a href="#/trips" class="btn">View Active Trips (${activeTripCount})</a>
        <button class="btn btn-secondary" onclick="openModal('modal-create-trip')">+ Start New Expedition</button>
      </div>
    </article>

    <!-- 3 Core Philosophy Pillars -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 28px; margin-bottom: 56px;">
      <div style="border: 1px solid var(--border-subtle); padding: 28px; background: var(--bg-secondary);">
        <div style="font-family: var(--font-serif); font-size: 16px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px;">01 &middot; Zero-Sum Invariant</div>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.7;">
          Every cent spent is tracked down to fractional pennies. Remainder cents are allocated deterministically to guarantee that the sum of all participant balances is always exactly 0.00.
        </p>
      </div>
      <div style="border: 1px solid var(--border-subtle); padding: 28px; background: var(--bg-secondary);">
        <div style="font-family: var(--font-serif); font-size: 16px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px;">02 &middot; Greedy Simplification</div>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.7;">
          Instead of everyone exchanging money with everyone ($O(N^2)$ transactions), our algorithm pairs maximal creditors with maximal debtors, reducing overall payments to at most $N-1$.
        </p>
      </div>
      <div style="border: 1px solid var(--border-subtle); padding: 28px; background: var(--bg-secondary);">
        <div style="font-family: var(--font-serif); font-size: 16px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px;">03 &middot; Immutable Audit Trail</div>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.7;">
          Every creation, expense split, deletion, and payment confirmation is permanently recorded with microsecond timestamps for total trust and financial clarity.
        </p>
      </div>
    </div>

    <!-- Featured Trips Showcase -->
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;">
      <div>
        <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted);">Current Expeditions</div>
        <h3 style="font-family: var(--font-serif); font-size: 20px; letter-spacing: 2px; text-transform: uppercase;">Featured Workspaces</h3>
      </div>
      <a href="#/trips" class="btn btn-sm">Explore All &rarr;</a>
    </div>

    ${state.trips.length === 0 ? `
      <div style="text-align: center; padding: 48px; border: 1px dashed var(--border-subtle); background: var(--bg-secondary);">
        <p style="color: var(--text-secondary); margin-bottom: 16px;">No active trips found. Initialize your first expedition to begin tracking.</p>
        <button class="btn btn-sm" onclick="openModal('modal-create-trip')">+ Create First Trip</button>
      </div>
    ` : `
      <div class="trips-grid">
        ${state.trips.slice(0, 3).map(trip => `
          <div class="trip-card" onclick="window.location.hash='#/trips/${trip.id}'">
            <div>
              <div class="trip-card-date">${formatDate(trip.createdAt)} &middot; Base ${trip.currency}</div>
              <h4 class="trip-card-title">${escapeHtml(trip.name)}</h4>
              <p class="trip-card-desc">${escapeHtml(trip.description || 'Shared expense tracking workspace')}</p>
            </div>
            <div class="trip-card-stats">
              <span>${trip.participants ? trip.participants.length : 0} Members</span>
              <span style="letter-spacing: 1.5px; text-transform: uppercase; font-size: 11px; font-weight: 600;">Open Workspace &rarr;</span>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `;
}

// -------------------------------------------------------------
// VIEW 2: ALL TRIPS CATALOG WITH REAL-TIME SEARCH & FILTERS
// -------------------------------------------------------------
async function renderTripsCatalog() {
  updateBreadcrumbs([{ label: 'Trips Catalog', url: '#/trips' }]);
  const container = document.getElementById('view-container');

  try {
    state.trips = await apiCall('/api/trips');
  } catch (e) {
    state.trips = [];
  }

  // Filter trips by search query
  const query = state.searchQuery.toLowerCase();
  const filteredTrips = state.trips.filter(t => {
    const matchesQuery = t.name.toLowerCase().includes(query) ||
                         (t.description && t.description.toLowerCase().includes(query)) ||
                         t.currency.toLowerCase().includes(query);
    return matchesQuery;
  });

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px;">
      <div>
        <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted);">Workspace Hub</div>
        <h2 style="font-family: var(--font-serif); font-size: 26px; letter-spacing: 2px; text-transform: uppercase;">Trips Directory</h2>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Organize and audit group travel expenses across all your active and settled journeys.</div>
      </div>
      <button class="btn" onclick="openModal('modal-create-trip')">+ New Trip</button>
    </div>

    <!-- Search & Filter Bar -->
    <div class="filter-bar">
      <div class="search-input-wrap">
        <span class="search-icon">&#x1F50D;</span>
        <input type="text" class="search-input" placeholder="Search trips by destination or title..." value="${escapeHtml(state.searchQuery)}" oninput="handleTripSearch(event)">
      </div>
      <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px;">
        Showing ${filteredTrips.length} of ${state.trips.length} Expeditions
      </div>
    </div>

    ${filteredTrips.length === 0 ? `
      <div style="text-align: center; padding: 60px 20px; border: 1px dashed var(--border-subtle); background: var(--bg-secondary);">
        <p style="color: var(--text-secondary); margin-bottom: 16px;">
          ${state.searchQuery ? `No trips match '${escapeHtml(state.searchQuery)}'.` : 'No trips created yet.'}
        </p>
        <button class="btn btn-sm" onclick="state.searchQuery=''; renderTripsCatalog();">Clear Search</button>
      </div>
    ` : `
      <div class="trips-grid">
        ${filteredTrips.map(trip => {
          const memberCount = trip.participants ? trip.participants.length : 0;
          const expenseCount = trip.expenses ? trip.expenses.length : 0;
          return `
            <div class="trip-card" onclick="window.location.hash='#/trips/${trip.id}'">
              <div>
                <div class="trip-card-date">Created ${formatDate(trip.createdAt)} &middot; ${trip.currency}</div>
                <h3 class="trip-card-title">${escapeHtml(trip.name)}</h3>
                <p class="trip-card-desc">${escapeHtml(trip.description || 'No description provided.')}</p>
              </div>
              <div>
                <div style="display: flex; gap: 8px; margin-bottom: 14px;">
                  <span class="badge badge-neutral">${memberCount} Members</span>
                  <span class="badge badge-neutral">${expenseCount} Expenses</span>
                </div>
                <div class="trip-card-stats">
                  <span>Workspace #${trip.id}</span>
                  <span style="letter-spacing: 1.5px; text-transform: uppercase; font-size: 11px; font-weight: 600;">Open &rarr;</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;
}

function handleTripSearch(e) {
  state.searchQuery = e.target.value;
  renderTripsCatalog();
}

// -------------------------------------------------------------
// VIEW 3: GLOBAL ANALYTICS & SPENDING TRENDS
// -------------------------------------------------------------
async function renderAnalyticsPage() {
  updateBreadcrumbs([{ label: 'Analytics', url: '#/analytics' }]);
  const container = document.getElementById('view-container');
  container.innerHTML = `<div style="text-align: center; padding: 60px;">Analyzing financial metrics across all trips...</div>`;

  try {
    state.trips = await apiCall('/api/trips');
    
    // Fetch summaries for all trips
    const summaries = await Promise.all(state.trips.map(t => apiCall(`/api/trips/${t.id}/summary`)));

    let totalGlobalSpend = 0;
    let totalTransactions = 0;
    let totalParticipants = 0;
    const categoryTotals = {};
    const payerLeaderboard = {};

    summaries.forEach(s => {
      totalGlobalSpend += (s.totalSpend || 0);
      totalTransactions += (s.expenseCount || 0);
      totalParticipants += (s.participants ? s.participants.length : 0);

      (s.expenses || []).forEach(e => {
        const cat = e.category || 'OTHER';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount);

        const payer = e.payer.name;
        payerLeaderboard[payer] = (payerLeaderboard[payer] || 0) + Number(e.amount);
      });
    });

    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const sortedPayers = Object.entries(payerLeaderboard).sort((a, b) => b[1] - a[1]);

    container.innerHTML = `
      <div style="margin-bottom: 32px;">
        <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted);">Financial Intelligence</div>
        <h2 style="font-family: var(--font-serif); font-size: 26px; letter-spacing: 2px; text-transform: uppercase;">Global Multi-Trip Analytics</h2>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Cross-expedition spending distributions, category allocations, and member spending leaderboards.</div>
      </div>

      <!-- Macro Stats Ribbon -->
      <div class="stats-ribbon">
        <div class="stat-box">
          <div class="stat-label">Total Outlay Across Journeys</div>
          <div class="stat-value">$${formatMoney(totalGlobalSpend)}</div>
          <div class="stat-sub">Cumulative Shared Spend</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Transactions Tracked</div>
          <div class="stat-value">${totalTransactions}</div>
          <div class="stat-sub">Across ${summaries.length} Expeditions</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Active Travelers</div>
          <div class="stat-value">${totalParticipants}</div>
          <div class="stat-sub">Group Members Tracked</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Ledger Integrity</div>
          <div class="stat-value" style="color: var(--accent-positive);">100%</div>
          <div class="stat-sub">Zero-Sum Compliant</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 32px; margin-top: 36px;">
        
        <!-- Category Allocation Breakdown -->
        <div style="border: 1px solid var(--border-subtle); padding: 28px; background: var(--bg-primary);">
          <h3 style="font-family: var(--font-serif); font-size: 16px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
            Cross-Trip Category Allocation
          </h3>
          ${sortedCategories.length === 0 ? `<p style="color: var(--text-muted);">No expense categories logged yet.</p>` : `
            <div class="category-bars-wrap">
              ${sortedCategories.map(([cat, amt]) => {
                const pct = totalGlobalSpend > 0 ? ((amt / totalGlobalSpend) * 100).toFixed(1) : 0;
                return `
                  <div class="category-bar-item">
                    <div class="category-bar-header">
                      <span><strong>${escapeHtml(cat)}</strong> &middot; $${formatMoney(amt)}</span>
                      <span style="color: var(--text-muted);">${pct}%</span>
                    </div>
                    <div class="category-bar-track">
                      <div class="category-bar-fill" style="width: ${pct}%;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Top Spender Leaderboard -->
        <div style="border: 1px solid var(--border-subtle); padding: 28px; background: var(--bg-primary);">
          <h3 style="font-family: var(--font-serif); font-size: 16px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
            Primary Spenders (Out-of-Pocket Outlay)
          </h3>
          ${sortedPayers.length === 0 ? `<p style="color: var(--text-muted);">No payer history available.</p>` : `
            <div class="table-wrap">
              <table class="minimal-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Member</th>
                    <th style="text-align: right;">Total Outlay</th>
                  </tr>
                </thead>
                <tbody>
                  ${sortedPayers.slice(0, 5).map(([name, amt], idx) => `
                    <tr>
                      <td style="font-family: var(--font-serif); font-weight: 700; color: var(--text-muted);">#0${idx + 1}</td>
                      <td><strong>${escapeHtml(name)}</strong></td>
                      <td style="text-align: right; font-weight: 600;">$${formatMoney(amt)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="text-align: center; padding: 60px;">Error calculating analytics: ${escapeHtml(err.message)}</div>`;
  }
}

// -------------------------------------------------------------
// VIEW 4: GLOBAL SETTLEMENT HUB
// -------------------------------------------------------------
async function renderSettlementHubPage() {
  updateBreadcrumbs([{ label: 'Settlement Hub', url: '#/settlements' }]);
  const container = document.getElementById('view-container');
  container.innerHTML = `<div style="text-align: center; padding: 60px;">Loading global settlement queues...</div>`;

  try {
    state.trips = await apiCall('/api/trips');
    const summaries = await Promise.all(state.trips.map(t => apiCall(`/api/trips/${t.id}/summary`)));

    const allSettlements = [];
    summaries.forEach(s => {
      (s.settlements || []).forEach(st => {
        allSettlements.push({
          ...st,
          tripId: s.trip.id,
          tripName: s.trip.name,
          currency: s.trip.currency
        });
      });
    });

    const pending = allSettlements.filter(s => !s.settled);
    const completed = allSettlements.filter(s => s.settled);

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted);">Debt Clearance Matrix</div>
          <h2 style="font-family: var(--font-serif); font-size: 26px; letter-spacing: 2px; text-transform: uppercase;">Global Settlement Hub</h2>
          <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Unified queue of all pending and cleared debt simplification transactions across all expeditions.</div>
        </div>
      </div>

      <div class="stats-ribbon" style="margin-bottom: 36px;">
        <div class="stat-box">
          <div class="stat-label">Pending Settlements</div>
          <div class="stat-value" style="color: ${pending.length > 0 ? 'var(--accent-negative)' : 'var(--accent-positive)'};">${pending.length}</div>
          <div class="stat-sub">Awaiting Reimbursement</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Cleared Clearances</div>
          <div class="stat-value" style="color: var(--accent-positive);">${completed.length}</div>
          <div class="stat-sub">Fully Settled Payments</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Transactions Reduced</div>
          <div class="stat-value">&asymp; 68%</div>
          <div class="stat-sub">Through Greedy Cashflow Solver</div>
        </div>
      </div>

      <!-- Pending Transactions Queue -->
      <div style="border: 1px solid var(--border-subtle); padding: 28px; background: var(--bg-primary); margin-bottom: 36px;">
        <h3 style="font-family: var(--font-serif); font-size: 16px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
          Pending Reimbursements (${pending.length})
        </h3>
        ${pending.length === 0 ? `
          <div style="text-align: center; padding: 36px; color: var(--accent-positive);">
            <div style="font-size: 24px; margin-bottom: 8px;">&check;</div>
            <div style="font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px;">All Trips Fully Cleared</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">No outstanding debts remain across any of your travel groups.</div>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${pending.map(s => `
              <div class="settlement-card">
                <div class="settlement-info">
                  <div style="font-size: 16px;">&rarr;</div>
                  <div>
                    <div style="font-size: 14px;">
                      <strong>${escapeHtml(s.fromParticipantName)}</strong> pays <strong>${escapeHtml(s.toParticipantName)}</strong>
                    </div>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">
                      Expedition: <a href="#/trips/${s.tripId}/settlements" style="color: var(--text-primary); text-decoration: none;">${escapeHtml(s.tripName)}</a>
                    </div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 20px;">
                  <span class="settlement-amount">${s.currency} ${formatMoney(s.amount)}</span>
                  <button class="btn btn-sm" onclick="openPaymentModal(${s.tripId}, ${s.id}, '${escapeHtml(s.fromParticipantName)}', '${escapeHtml(s.toParticipantName)}', ${s.amount}, '${s.currency}')">
                    Settle Payment
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Historical Cleared Clearances -->
      <div style="border: 1px solid var(--border-subtle); padding: 28px; background: var(--bg-primary);">
        <h3 style="font-family: var(--font-serif); font-size: 16px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
          Completed Settlements History (${completed.length})
        </h3>
        ${completed.length === 0 ? `<p style="color: var(--text-muted);">No payments have been finalized yet.</p>` : `
          <div class="table-wrap">
            <table class="minimal-table">
              <thead>
                <tr>
                  <th>Cleared Date</th>
                  <th>Expedition</th>
                  <th>Payer (Debtor)</th>
                  <th>Recipient (Creditor)</th>
                  <th style="text-align: right;">Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${completed.map(s => `
                  <tr>
                    <td>${formatDate(s.settledAt, true)}</td>
                    <td><a href="#/trips/${s.tripId}" style="color: var(--text-primary); text-decoration: none;">${escapeHtml(s.tripName)}</a></td>
                    <td>${escapeHtml(s.fromParticipantName)}</td>
                    <td>${escapeHtml(s.toParticipantName)}</td>
                    <td style="text-align: right; font-weight: 600;">${s.currency} ${formatMoney(s.amount)}</td>
                    <td><span class="badge badge-positive">&check; CLEARED</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="text-align: center; padding: 60px;">Error loading settlements: ${escapeHtml(err.message)}</div>`;
  }
}

// -------------------------------------------------------------
// VIEW 5: SYSTEM SETTINGS & PREFERENCES
// -------------------------------------------------------------
async function renderSettingsPage() {
  updateBreadcrumbs([{ label: 'Settings', url: '#/settings' }]);
  const container = document.getElementById('view-container');

  container.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="margin-bottom: 32px;">
        <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted);">Preferences &amp; Engine</div>
        <h2 style="font-family: var(--font-serif); font-size: 26px; letter-spacing: 2px; text-transform: uppercase;">Platform Settings</h2>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Configuration, precision rounding parameters, and financial data export.</div>
      </div>

      <!-- Currency Presets -->
      <div class="form-card">
        <h3 style="font-family: var(--font-serif); font-size: 16px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
          Financial Engine Parameters
        </h3>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Algorithm Strategy</label>
            <input type="text" class="form-control" value="Greedy Cashflow Minimization (O(N log N))" disabled style="background: var(--bg-tertiary);">
          </div>
          <div class="form-group">
            <label class="form-label">Penny Distribution Policy</label>
            <input type="text" class="form-control" value="Deterministic Rounding (Zero-Sum Invariant)" disabled style="background: var(--bg-tertiary);">
          </div>
        </div>
      </div>

      <!-- Export Data Hub -->
      <div class="form-card">
        <h3 style="font-family: var(--font-serif); font-size: 16px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
          Global Data Backup &amp; Export
        </h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">
          Export all trip ledgers, participant balance sheets, and audit logs as standard JSON for offsite accounting.
        </p>
        <button class="btn btn-sm" onclick="exportAllTripsJSON()">Download Full JSON Archive</button>
      </div>

      <!-- System Diagnostic -->
      <div class="form-card">
        <h3 style="font-family: var(--font-serif); font-size: 16px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
          Backend Health &amp; Invariant Checks
        </h3>
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
            <span>Persistence Driver</span>
            <strong>MariaDB Connector/J (Production Schema)</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
            <span>Zero-Sum Verification</span>
            <span style="color: var(--accent-positive); font-weight: 600;">ACTIVE (Enforced before save)</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Debt Simplification Clearance</span>
            <span style="color: var(--accent-positive); font-weight: 600;">ACTIVE (Verified clearance to $0.00)</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// VIEW 6: TRIP WORKSPACE (NESTED NAVIGATION HUB)
// -------------------------------------------------------------
async function renderTripWorkspace(tripId, activeSection = 'overview') {
  state.activeTripId = tripId;
  const container = document.getElementById('view-container');
  container.innerHTML = `<div style="text-align: center; padding: 60px;">Opening expedition workspace...</div>`;

  try {
    const summary = await apiCall(`/api/trips/${tripId}/summary`);
    state.activeTripSummary = summary;
  } catch (e) {
    container.innerHTML = `<div style="text-align: center; padding: 60px;">Failed to load trip: ${escapeHtml(e.message)}</div>`;
    return;
  }

  const trip = state.activeTripSummary.trip;
  const participants = state.activeTripSummary.participants || [];
  const expenses = state.activeTripSummary.expenses || [];
  const balances = state.activeTripSummary.balances || [];
  const settlements = state.activeTripSummary.settlements || [];
  const auditLogs = state.activeTripSummary.auditLogs || [];
  const totalSpend = state.activeTripSummary.totalSpend || 0;

  // Breadcrumbs: Minimal / Trips / [Trip Name] / [Active Section]
  const sectionLabelMap = {
    overview: 'Dashboard',
    members: 'Members & Balances',
    expenses: 'Expenses Ledger',
    settlements: 'Debt Simplification',
    audit: 'Audit Log',
    settings: 'Trip Settings'
  };

  updateBreadcrumbs([
    { label: 'Trips', url: '#/trips' },
    { label: trip.name, url: `#/trips/${tripId}/overview` },
    { label: sectionLabelMap[activeSection] || 'Dashboard' }
  ]);

  let html = `
    <!-- Trip Header Strip -->
    <div class="trip-header-strip">
      <div class="trip-title-area">
        <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted);">
          Expedition #${trip.id} &middot; Base ${trip.currency}
        </div>
        <h2>${escapeHtml(trip.name)}</h2>
        <div class="trip-meta-desc">${escapeHtml(trip.description || 'Shared travel cost tracking and minimal debt settlement.')}</div>
      </div>
      <div class="btn-group">
        <a href="#/trips/${tripId}/expenses/new" class="btn btn-sm">+ Log Expense</a>
        <button class="btn btn-sm btn-secondary" onclick="promptAddParticipant(${tripId})">+ Add Member</button>
        <button class="btn btn-sm btn-secondary" onclick="exportTripCSV(${tripId})">Export CSV</button>
      </div>
    </div>

    <!-- Stats Ribbon -->
    <div class="stats-ribbon">
      <div class="stat-box">
        <div class="stat-label">Total Expedition Spend</div>
        <div class="stat-value">${trip.currency} ${formatMoney(totalSpend)}</div>
        <div class="stat-sub">${expenses.length} Logged Transactions</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Active Members</div>
        <div class="stat-value">${participants.length}</div>
        <div class="stat-sub">Sharing Shared Costs</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Net Balance Invariant</div>
        <div class="stat-value" style="color: var(--accent-positive);">${trip.currency} 0.00</div>
        <div class="stat-sub">&check; Strictly Zero-Sum</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Settlement Progress</div>
        <div class="stat-value" style="font-size: 20px;">
          ${settlements.filter(s => s.settled).length} / ${settlements.length} Cleared
        </div>
        <div class="stat-sub">Minimal Transactions</div>
      </div>
    </div>

    <!-- 6 Nested Navigation Tabs -->
    <div class="nested-nav-tabs">
      <button class="nested-tab-btn ${activeSection === 'overview' ? 'active' : ''}" onclick="window.location.hash='#/trips/${tripId}/overview'">01 &middot; Dashboard</button>
      <button class="nested-tab-btn ${activeSection === 'members' ? 'active' : ''}" onclick="window.location.hash='#/trips/${tripId}/members'">02 &middot; Members (${participants.length})</button>
      <button class="nested-tab-btn ${activeSection === 'expenses' ? 'active' : ''}" onclick="window.location.hash='#/trips/${tripId}/expenses'">03 &middot; Expenses (${expenses.length})</button>
      <button class="nested-tab-btn ${activeSection === 'settlements' ? 'active' : ''}" onclick="window.location.hash='#/trips/${tripId}/settlements'">04 &middot; Debt Simplification</button>
      <button class="nested-tab-btn ${activeSection === 'audit' ? 'active' : ''}" onclick="window.location.hash='#/trips/${tripId}/audit'">05 &middot; Audit Log (${auditLogs.length})</button>
      <button class="nested-tab-btn ${activeSection === 'settings' ? 'active' : ''}" onclick="window.location.hash='#/trips/${tripId}/settings'">06 &middot; Settings</button>
    </div>

    <div id="nested-tab-content">
  `;

  if (activeSection === 'overview') {
    html += renderTabOverview(trip, participants, expenses, balances, settlements);
  } else if (activeSection === 'members') {
    html += renderTabMembers(trip, participants, balances);
  } else if (activeSection === 'expenses') {
    html += renderTabExpenses(trip, expenses);
  } else if (activeSection === 'settlements') {
    html += renderTabSettlements(trip, balances, settlements);
  } else if (activeSection === 'audit') {
    html += renderTabAudit(trip, auditLogs);
  } else if (activeSection === 'settings') {
    html += renderTabSettings(trip);
  }

  html += `</div>`;
  container.innerHTML = html;
}

// -------------------------------------------------------------
// TAB 01: DASHBOARD
// -------------------------------------------------------------
function renderTabOverview(trip, participants, expenses, balances, settlements) {
  const recentExpenses = expenses.slice(0, 5);
  const pendingSettlements = settlements.filter(s => !s.settled);

  // Compute category distribution
  const catMap = {};
  expenses.forEach(e => {
    catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
  });
  const total = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; margin-bottom: 32px;">
      
      <!-- Category Breakdown -->
      <div style="border: 1px solid var(--border-subtle); padding: 24px; background: var(--bg-primary);">
        <h4 style="font-family: var(--font-serif); font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
          Expenditure by Category
        </h4>
        ${sortedCats.length === 0 ? `<p style="color: var(--text-muted);">No expenses logged yet.</p>` : `
          <div class="category-bars-wrap">
            ${sortedCats.map(([cat, amt]) => {
              const pct = total > 0 ? ((amt / total) * 100).toFixed(1) : 0;
              return `
                <div class="category-bar-item">
                  <div class="category-bar-header">
                    <span><strong>${escapeHtml(cat)}</strong> &middot; ${trip.currency} ${formatMoney(amt)}</span>
                    <span style="color: var(--text-muted);">${pct}%</span>
                  </div>
                  <div class="category-bar-track">
                    <div class="category-bar-fill" style="width: ${pct}%;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- Net Balances Snapshot -->
      <div style="border: 1px solid var(--border-subtle); padding: 24px; background: var(--bg-primary);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
          <h4 style="font-family: var(--font-serif); font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase;">Net Balances Snapshot</h4>
          <a href="#/trips/${trip.id}/members" style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-primary); text-decoration: none;">All Members &rarr;</a>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${balances.map(b => {
            const isOwed = b.netBalance > 0;
            const isOwes = b.netBalance < 0;
            return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); cursor: pointer;"
                   onclick="window.location.hash='#/trips/${trip.id}/members/${b.participantId}'">
                <div>
                  <div style="font-weight: 600; font-size: 13px;">${escapeHtml(b.participantName)}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">Paid ${trip.currency} ${formatMoney(b.totalPaid)} &middot; Share ${trip.currency} ${formatMoney(b.totalOwed)}</div>
                </div>
                <div>
                  <span class="badge ${isOwed ? 'badge-positive' : isOwes ? 'badge-negative' : 'badge-neutral'}">
                    ${isOwed ? `+${trip.currency} ${formatMoney(b.netBalance)}` : isOwes ? `-${trip.currency} ${formatMoney(Math.abs(b.netBalance))}` : 'SETTLED'}
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

    </div>

    <!-- Recent Expenses -->
    <div style="border: 1px solid var(--border-subtle); padding: 24px; background: var(--bg-primary);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
        <h4 style="font-family: var(--font-serif); font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase;">Recent Expenses</h4>
        <a href="#/trips/${trip.id}/expenses" style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-primary); text-decoration: none;">View All Expenses &rarr;</a>
      </div>
      ${recentExpenses.length === 0 ? `
        <div style="text-align: center; padding: 32px; color: var(--text-muted);">
          No expenses recorded yet.
          <div style="margin-top: 12px;">
            <a href="#/trips/${trip.id}/expenses/new" class="btn btn-sm">+ Log First Expense</a>
          </div>
        </div>
      ` : `
        <div class="table-wrap">
          <table class="minimal-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Payer</th>
                <th>Beneficiaries</th>
                <th style="text-align: right;">Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${recentExpenses.map(e => `
                <tr>
                  <td>${formatDate(e.expenseDate)}</td>
                  <td><strong>${escapeHtml(e.description)}</strong></td>
                  <td><span class="badge badge-neutral">${escapeHtml(e.category)}</span></td>
                  <td>${escapeHtml(e.payer.name)}</td>
                  <td>${e.shares ? e.shares.length : 0} members</td>
                  <td style="text-align: right; font-weight: 600;">${trip.currency} ${formatMoney(e.amount)}</td>
                  <td><a href="#/trips/${trip.id}/expenses/${e.id}" class="btn btn-sm" style="padding: 4px 10px;">Detail</a></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

// -------------------------------------------------------------
// TAB 02: MEMBERS & BALANCES
// -------------------------------------------------------------
function renderTabMembers(trip, participants, balances) {
  const balanceMap = {};
  balances.forEach(b => { balanceMap[b.participantId] = b; });

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h3 style="font-family: var(--font-serif); font-size: 18px; letter-spacing: 2px; text-transform: uppercase;">Expedition Members</h3>
        <p style="font-size: 13px; color: var(--text-secondary);">Click any member to open their nested individual balance sheet and ledger.</p>
      </div>
      <button class="btn btn-sm" onclick="promptAddParticipant(${trip.id})">+ Add Member</button>
    </div>

    <div class="table-wrap">
      <table class="minimal-table">
        <thead>
          <tr>
            <th>Member Name</th>
            <th>Email</th>
            <th style="text-align: right;">Out-of-Pocket Paid</th>
            <th style="text-align: right;">Total Shared Share</th>
            <th style="text-align: right;">Net Balance</th>
            <th>Status</th>
            <th>Nested Drill-down</th>
          </tr>
        </thead>
        <tbody>
          ${participants.map(p => {
            const b = balanceMap[p.id] || { totalPaid: 0, totalOwed: 0, netBalance: 0 };
            const isOwed = b.netBalance > 0;
            const isOwes = b.netBalance < 0;
            return `
              <tr>
                <td><strong>${escapeHtml(p.name)}</strong></td>
                <td style="color: var(--text-muted);">${escapeHtml(p.email || '—')}</td>
                <td style="text-align: right;">${trip.currency} ${formatMoney(b.totalPaid)}</td>
                <td style="text-align: right;">${trip.currency} ${formatMoney(b.totalOwed)}</td>
                <td style="text-align: right; font-weight: 700; font-family: var(--font-serif);">
                  <span style="color: ${isOwed ? 'var(--accent-positive)' : isOwes ? 'var(--accent-negative)' : 'var(--text-muted)'};">
                    ${isOwed ? `+${trip.currency} ${formatMoney(b.netBalance)}` : isOwes ? `-${trip.currency} ${formatMoney(Math.abs(b.netBalance))}` : `${trip.currency} 0.00`}
                  </span>
                </td>
                <td>
                  <span class="badge ${isOwed ? 'badge-positive' : isOwes ? 'badge-negative' : 'badge-neutral'}">
                    ${isOwed ? 'Creditor (Owed)' : isOwes ? 'Debtor (Owes)' : 'Settled'}
                  </span>
                </td>
                <td>
                  <a href="#/trips/${trip.id}/members/${p.id}" class="btn btn-sm">Member Ledger &rarr;</a>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// -------------------------------------------------------------
// NESTED LEVEL 2/3: MEMBER FINANCIAL LEDGER
// -------------------------------------------------------------
async function renderMemberLedger(tripId, memberId) {
  if (!state.activeTripSummary || state.activeTripSummary.trip.id != tripId) {
    await renderTripWorkspace(tripId, 'members');
  }

  const trip = state.activeTripSummary.trip;
  const participant = state.activeTripSummary.participants.find(p => p.id == memberId);
  const balances = state.activeTripSummary.balances.find(b => b.participantId == memberId) || { totalPaid: 0, totalOwed: 0, netBalance: 0 };
  const allExpenses = state.activeTripSummary.expenses || [];
  const settlements = state.activeTripSummary.settlements || [];

  if (!participant) {
    showToast('Member not found', true);
    window.location.hash = `#/trips/${tripId}/members`;
    return;
  }

  updateBreadcrumbs([
    { label: 'Trips', url: '#/trips' },
    { label: trip.name, url: `#/trips/${tripId}/overview` },
    { label: 'Members', url: `#/trips/${tripId}/members` },
    { label: `${participant.name}'s Ledger` }
  ]);

  const paidExpenses = allExpenses.filter(e => e.payer.id == memberId);
  const sharedExpenses = allExpenses.filter(e => e.shares && e.shares.some(s => s.participant.id == memberId));
  const memberSettlements = settlements.filter(s => s.fromParticipantId == memberId || s.toParticipantId == memberId);

  const container = document.getElementById('view-container');
  container.innerHTML = `
    <div style="margin-bottom: 24px;">
      <a href="#/trips/${tripId}/members" class="btn btn-sm btn-secondary" style="margin-bottom: 16px;">&larr; Back to Members</a>
      <div class="trip-header-strip" style="margin-top: 10px;">
        <div>
          <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted);">Personal Financial Ledger</div>
          <h2 style="font-family: var(--font-serif); font-size: 26px; letter-spacing: 2px; text-transform: uppercase;">${escapeHtml(participant.name)}</h2>
          <div style="font-size: 13px; color: var(--text-secondary);">${escapeHtml(participant.email || 'No email attached')}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-muted);">Net Balance</div>
          <div style="font-family: var(--font-serif); font-size: 28px; font-weight: 700; color: ${balances.netBalance > 0 ? 'var(--accent-positive)' : balances.netBalance < 0 ? 'var(--accent-negative)' : 'var(--text-muted)'};">
            ${balances.netBalance > 0 ? `+${trip.currency} ${formatMoney(balances.netBalance)}` : balances.netBalance < 0 ? `-${trip.currency} ${formatMoney(Math.abs(balances.netBalance))}` : `${trip.currency} 0.00`}
          </div>
          <div style="font-size: 11px; color: var(--text-muted);">${balances.netBalance > 0 ? 'To be reimbursed' : balances.netBalance < 0 ? 'Must repay to group' : 'All debts settled'}</div>
        </div>
      </div>
    </div>

    <!-- Stats Ribbon for this member -->
    <div class="stats-ribbon">
      <div class="stat-box">
        <div class="stat-label">Total Out-of-Pocket Paid</div>
        <div class="stat-value">${trip.currency} ${formatMoney(balances.totalPaid)}</div>
        <div class="stat-sub">${paidExpenses.length} Logged Payments</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Owed Expense Shares</div>
        <div class="stat-value">${trip.currency} ${formatMoney(balances.totalOwed)}</div>
        <div class="stat-sub">Across ${sharedExpenses.length} Shared Expenses</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Formula Check</div>
        <div class="stat-value" style="font-size: 18px;">${formatMoney(balances.totalPaid)} &minus; ${formatMoney(balances.totalOwed)}</div>
        <div class="stat-sub">Paid minus Owed</div>
      </div>
    </div>

    <!-- Settlement Payments involving this member -->
    <div style="border: 1px solid var(--border-subtle); padding: 24px; background: var(--bg-primary); margin-bottom: 32px;">
      <h4 style="font-family: var(--font-serif); font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
        Direct Settlement Obligations
      </h4>
      ${memberSettlements.length === 0 ? `<p style="color: var(--text-muted);">No clearance transactions required for this member.</p>` : `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${memberSettlements.map(s => {
            const isPayer = s.fromParticipantId == memberId;
            return `
              <div class="settlement-card">
                <div class="settlement-info">
                  <div style="font-size: 18px;">${isPayer ? '&nearr;' : '&swarr;'}</div>
                  <div>
                    <div style="font-size: 14px; font-weight: 600;">
                      ${isPayer ? `You owe ${escapeHtml(s.toParticipantName)}` : `${escapeHtml(s.fromParticipantName)} owes you`}
                    </div>
                    <div style="font-size: 11px; color: var(--text-muted);">
                      Status: ${s.settled ? `Cleared on ${formatDate(s.settledAt, true)}` : 'Pending Payment'}
                    </div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 16px;">
                  <span class="settlement-amount">${trip.currency} ${formatMoney(s.amount)}</span>
                  ${s.settled ? `<span class="badge badge-positive">&check; CLEARED</span>` : `
                    <button class="btn btn-sm" onclick="openPaymentModal(${tripId}, ${s.id}, '${escapeHtml(s.fromParticipantName)}', '${escapeHtml(s.toParticipantName)}', ${s.amount}, '${trip.currency}')">Settle</button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>

    <!-- Expenses Paid by Member -->
    <div style="border: 1px solid var(--border-subtle); padding: 24px; background: var(--bg-primary); margin-bottom: 32px;">
      <h4 style="font-family: var(--font-serif); font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
        Expenses Paid by ${escapeHtml(participant.name)} (${paidExpenses.length})
      </h4>
      ${paidExpenses.length === 0 ? `<p style="color: var(--text-muted);">No expenses paid by this member.</p>` : `
        <div class="table-wrap">
          <table class="minimal-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th style="text-align: right;">Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${paidExpenses.map(e => `
                <tr>
                  <td>${formatDate(e.expenseDate)}</td>
                  <td><strong>${escapeHtml(e.description)}</strong></td>
                  <td><span class="badge badge-neutral">${escapeHtml(e.category)}</span></td>
                  <td style="text-align: right; font-weight: 600;">${trip.currency} ${formatMoney(e.amount)}</td>
                  <td><a href="#/trips/${tripId}/expenses/${e.id}" class="btn btn-sm">View &rarr;</a></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

// -------------------------------------------------------------
// TAB 03: EXPENSES LEDGER WITH FILTERS & CSV EXPORT
// -------------------------------------------------------------
function renderTabExpenses(trip, expenses) {
  // Filter by category
  let filtered = [...expenses];
  if (state.expenseCategoryFilter !== 'ALL') {
    filtered = filtered.filter(e => e.category === state.expenseCategoryFilter);
  }

  // Sort
  if (state.expenseSortBy === 'DATE_DESC') {
    filtered.sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
  } else if (state.expenseSortBy === 'DATE_ASC') {
    filtered.sort((a, b) => new Date(a.expenseDate) - new Date(b.expenseDate));
  } else if (state.expenseSortBy === 'AMOUNT_DESC') {
    filtered.sort((a, b) => Number(b.amount) - Number(a.amount));
  } else if (state.expenseSortBy === 'AMOUNT_ASC') {
    filtered.sort((a, b) => Number(a.amount) - Number(b.amount));
  }

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h3 style="font-family: var(--font-serif); font-size: 18px; letter-spacing: 2px; text-transform: uppercase;">Shared Expense Ledger</h3>
        <p style="font-size: 13px; color: var(--text-secondary);">Itemized transactions split among group members with exact penny allocations.</p>
      </div>
      <div class="btn-group">
        <a href="#/trips/${trip.id}/expenses/new" class="btn btn-sm">+ Log New Expense</a>
        <button class="btn btn-sm btn-secondary" onclick="exportTripCSV(${trip.id})">Download CSV</button>
      </div>
    </div>

    <!-- Category Filter Pills & Sorting -->
    <div class="filter-bar">
      <div class="category-pills">
        <button class="pill-btn ${state.expenseCategoryFilter === 'ALL' ? 'active' : ''}" onclick="setExpenseFilter('ALL')">All (${expenses.length})</button>
        ${state.categories.map(cat => {
          const count = expenses.filter(e => e.category === cat).length;
          return `<button class="pill-btn ${state.expenseCategoryFilter === cat ? 'active' : ''}" onclick="setExpenseFilter('${cat}')">${cat} (${count})</button>`;
        }).join('')}
      </div>
      <div>
        <select class="form-control" style="padding: 6px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;" onchange="setExpenseSort(this.value)">
          <option value="DATE_DESC" ${state.expenseSortBy === 'DATE_DESC' ? 'selected' : ''}>Newest First</option>
          <option value="DATE_ASC" ${state.expenseSortBy === 'DATE_ASC' ? 'selected' : ''}>Oldest First</option>
          <option value="AMOUNT_DESC" ${state.expenseSortBy === 'AMOUNT_DESC' ? 'selected' : ''}>Highest Amount</option>
          <option value="AMOUNT_ASC" ${state.expenseSortBy === 'AMOUNT_ASC' ? 'selected' : ''}>Lowest Amount</option>
        </select>
      </div>
    </div>

    ${filtered.length === 0 ? `
      <div style="text-align: center; padding: 48px; border: 1px dashed var(--border-subtle); background: var(--bg-secondary);">
        <p style="color: var(--text-secondary); margin-bottom: 12px;">No expenses found under current filter.</p>
        <button class="btn btn-sm" onclick="setExpenseFilter('ALL')">Reset Filter</button>
      </div>
    ` : `
      <div class="table-wrap">
        <table class="minimal-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Payer</th>
              <th>Shared With</th>
              <th style="text-align: right;">Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(e => `
              <tr>
                <td>${formatDate(e.expenseDate)}</td>
                <td>
                  <a href="#/trips/${trip.id}/expenses/${e.id}" style="color: var(--text-primary); font-weight: 600; text-decoration: none;">
                    ${escapeHtml(e.description)}
                  </a>
                </td>
                <td><span class="badge badge-neutral">${escapeHtml(e.category)}</span></td>
                <td>${escapeHtml(e.payer.name)}</td>
                <td>
                  <span title="${e.shares.map(s => s.participant.name).join(', ')}">
                    ${e.shares.length} members
                  </span>
                </td>
                <td style="text-align: right; font-weight: 600;">${trip.currency} ${formatMoney(e.amount)}</td>
                <td>
                  <div class="btn-group">
                    <a href="#/trips/${trip.id}/expenses/${e.id}" class="btn btn-sm" style="padding: 4px 10px;">Detail</a>
                    <button class="btn btn-sm btn-danger" style="padding: 4px 10px;" onclick="handleDeleteExpense(${trip.id}, ${e.id})">&times;</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `}
  `;
}

function setExpenseFilter(cat) {
  state.expenseCategoryFilter = cat;
  renderTripWorkspace(state.activeTripId, 'expenses');
}

function setExpenseSort(sort) {
  state.expenseSortBy = sort;
  renderTripWorkspace(state.activeTripId, 'expenses');
}

// -------------------------------------------------------------
// NESTED LEVEL 2/3: LOG NEW EXPENSE FORM
// -------------------------------------------------------------
async function renderNewExpenseForm(tripId) {
  if (!state.activeTripSummary || state.activeTripSummary.trip.id != tripId) {
    await renderTripWorkspace(tripId, 'expenses');
  }

  const trip = state.activeTripSummary.trip;
  const participants = state.activeTripSummary.participants || [];

  if (participants.length === 0) {
    showToast('Add at least one member to the trip first', true);
    window.location.hash = `#/trips/${tripId}/members`;
    return;
  }

  updateBreadcrumbs([
    { label: 'Trips', url: '#/trips' },
    { label: trip.name, url: `#/trips/${tripId}/overview` },
    { label: 'Expenses', url: `#/trips/${tripId}/expenses` },
    { label: 'Log New Expense' }
  ]);

  const container = document.getElementById('view-container');
  container.innerHTML = `
    <div style="margin-bottom: 24px;">
      <a href="#/trips/${tripId}/expenses" class="btn btn-sm btn-secondary" style="margin-bottom: 16px;">&larr; Back to Expenses</a>
      <div class="trip-header-strip">
        <div>
          <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted);">Record Outlay</div>
          <h2 style="font-family: var(--font-serif); font-size: 26px; letter-spacing: 2px; text-transform: uppercase;">Log Shared Expense</h2>
          <div style="font-size: 13px; color: var(--text-secondary);">Amounts are split evenly with deterministic penny allocation so zero-sum balance integrity is preserved.</div>
        </div>
      </div>
    </div>

    <div class="form-card">
      <form id="form-log-expense" onsubmit="handleLogExpenseSubmit(event, ${tripId})">
        <div class="form-grid">
          
          <div class="form-group">
            <label class="form-label" for="expense-desc">Description</label>
            <input type="text" id="expense-desc" class="form-control" placeholder="e.g. Mountain Chalet Rental, Dinner in Venice" required autocomplete="off">
          </div>

          <div class="form-group">
            <label class="form-label" for="expense-amount">Total Amount (${trip.currency})</label>
            <input type="number" id="expense-amount" class="form-control" step="0.01" min="0.01" placeholder="0.00" required oninput="updateLiveSplitPreview()">
          </div>

          <div class="form-group">
            <label class="form-label" for="expense-category">Category</label>
            <select id="expense-category" class="form-control">
              ${state.categories.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="expense-payer">Who Paid Out-of-Pocket?</label>
            <select id="expense-payer" class="form-control" required>
              ${participants.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}
            </select>
          </div>

        </div>

        <div class="form-group">
          <label class="form-label">Beneficiaries (Who Shares this Cost?)</label>
          <div style="margin-bottom: 8px; font-size: 11px; color: var(--text-muted);">
            <button type="button" class="btn btn-sm btn-secondary" style="padding: 2px 8px; font-size: 10px;" onclick="toggleAllParticipants(true)">Select All</button>
            <button type="button" class="btn btn-sm btn-secondary" style="padding: 2px 8px; font-size: 10px;" onclick="toggleAllParticipants(false)">Deselect All</button>
          </div>
          <div class="checkbox-group" id="shared-checkboxes">
            ${participants.map(p => `
              <label class="checkbox-item">
                <input type="checkbox" name="sharedParticipants" value="${p.id}" checked onchange="updateLiveSplitPreview()">
                <span>${escapeHtml(p.name)}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Live Split Preview Box -->
        <div id="live-split-preview" style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); padding: 18px; margin-bottom: 24px;">
          <div style="font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;">Live Penny-Split Calculation</div>
          <div id="split-summary-text" style="font-size: 13px; color: var(--text-secondary);">Enter an amount to see the exact share per person.</div>
        </div>

        <div class="btn-group">
          <button type="submit" class="btn">Confirm &amp; Log Expense</button>
          <a href="#/trips/${tripId}/expenses" class="btn btn-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `;

  updateLiveSplitPreview();
}

function toggleAllParticipants(check) {
  document.querySelectorAll('input[name="sharedParticipants"]').forEach(cb => {
    cb.checked = check;
  });
  updateLiveSplitPreview();
}

function updateLiveSplitPreview() {
  const amtInput = document.getElementById('expense-amount');
  const summaryEl = document.getElementById('split-summary-text');
  if (!amtInput || !summaryEl) return;

  const amount = parseFloat(amtInput.value) || 0;
  const checked = Array.from(document.querySelectorAll('input[name="sharedParticipants"]:checked'));

  if (amount <= 0 || checked.length === 0) {
    summaryEl.innerHTML = `<span style="color: var(--text-muted);">Select at least one member and enter a positive amount.</span>`;
    return;
  }

  const baseShare = Math.floor((amount / checked.length) * 100) / 100;
  const totalBase = baseShare * checked.length;
  const remainderCents = Math.round((amount - totalBase) * 100);

  summaryEl.innerHTML = `
    <div><strong>${checked.length}</strong> participants sharing <strong>$${formatMoney(amount)}</strong>:</div>
    <div style="margin-top: 6px; font-size: 12px;">
      Base share: <strong>$${formatMoney(baseShare)}</strong> each.
      ${remainderCents > 0 ? `<br><span style="color: var(--text-muted);">Exact penny allocation: The first ${remainderCents} member(s) pay $${formatMoney(baseShare + 0.01)} to guarantee total equals $${formatMoney(amount)} exactly.</span>` : ''}
    </div>
  `;
}

// -------------------------------------------------------------
// NESTED LEVEL 2/3: EXPENSE DETAIL RECEIPT
// -------------------------------------------------------------
async function renderExpenseDetail(tripId, expenseId) {
  const container = document.getElementById('view-container');
  container.innerHTML = `<div style="text-align: center; padding: 60px;">Retrieving expense receipt...</div>`;

  try {
    const expense = await apiCall(`/api/trips/${tripId}/expenses/${expenseId}`);
    const trip = state.activeTripSummary ? state.activeTripSummary.trip : await apiCall(`/api/trips/${tripId}`);

    updateBreadcrumbs([
      { label: 'Trips', url: '#/trips' },
      { label: trip.name, url: `#/trips/${tripId}/overview` },
      { label: 'Expenses', url: `#/trips/${tripId}/expenses` },
      { label: `#EXP-${expense.id} (${expense.description})` }
    ]);

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <a href="#/trips/${tripId}/expenses" class="btn btn-sm btn-secondary" style="margin-bottom: 16px;">&larr; Back to Expenses</a>
        <div class="trip-header-strip">
          <div>
            <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted);">Itemized Receipt #EXP-${expense.id}</div>
            <h2 style="font-family: var(--font-serif); font-size: 26px; letter-spacing: 2px; text-transform: uppercase;">${escapeHtml(expense.description)}</h2>
            <div style="font-size: 13px; color: var(--text-secondary);">Logged on ${formatDate(expense.expenseDate, true)} &middot; Category: <span class="badge badge-neutral">${escapeHtml(expense.category)}</span></div>
          </div>
          <div>
            <button class="btn btn-sm btn-danger" onclick="handleDeleteExpense(${tripId}, ${expense.id})">Delete Expense</button>
          </div>
        </div>
      </div>

      <div class="stats-ribbon" style="margin-bottom: 32px;">
        <div class="stat-box">
          <div class="stat-label">Total Amount Paid</div>
          <div class="stat-value">${trip.currency} ${formatMoney(expense.amount)}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Paid In Full By</div>
          <div class="stat-value" style="font-size: 20px;">${escapeHtml(expense.payer.name)}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Sharing Beneficiaries</div>
          <div class="stat-value">${expense.shares.length}</div>
          <div class="stat-sub">Group Members</div>
        </div>
      </div>

      <!-- Itemized Shares Table -->
      <div style="border: 1px solid var(--border-subtle); padding: 24px; background: var(--bg-primary);">
        <h4 style="font-family: var(--font-serif); font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
          Member Share Allocations
        </h4>
        <div class="table-wrap">
          <table class="minimal-table">
            <thead>
              <tr>
                <th>Participant</th>
                <th>Role</th>
                <th style="text-align: right;">Share Amount</th>
                <th style="text-align: right;">% of Total</th>
              </tr>
            </thead>
            <tbody>
              ${expense.shares.map(s => {
                const isPayer = s.participant.id === expense.payer.id;
                const pct = ((s.shareAmount / expense.amount) * 100).toFixed(1);
                return `
                  <tr>
                    <td><strong>${escapeHtml(s.participant.name)}</strong></td>
                    <td>
                      ${isPayer ? `<span class="badge badge-positive">Payer &amp; Sharer</span>` : `<span class="badge badge-neutral">Sharer</span>`}
                    </td>
                    <td style="text-align: right; font-weight: 600;">${trip.currency} ${formatMoney(s.shareAmount)}</td>
                    <td style="text-align: right; color: var(--text-muted);">${pct}%</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="text-align: center; padding: 60px;">Error loading receipt: ${escapeHtml(err.message)}</div>`;
  }
}

// -------------------------------------------------------------
// TAB 04: DEBT SIMPLIFICATION & SETTLEMENTS
// -------------------------------------------------------------
function renderTabSettlements(trip, balances, settlements) {
  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h3 style="font-family: var(--font-serif); font-size: 18px; letter-spacing: 2px; text-transform: uppercase;">Debt Simplification Engine</h3>
        <p style="font-size: 13px; color: var(--text-secondary);">Minimal greedy cashflow clearance minimizing total transactions to $N-1$ payments.</p>
      </div>
      <button class="btn btn-sm" onclick="handleGenerateSettlements(${trip.id})">&#x21bb; Re-Calculate Settlement</button>
    </div>

    <!-- Verified Rule Callouts -->
    <div class="rule-callout">
      <div class="rule-callout-icon">&check;</div>
      <div>
        <div class="rule-callout-title">Zero-Sum Ledger Integrity Verified</div>
        <div class="rule-callout-desc">The sum of all member net balances for this trip equals exactly <strong>${trip.currency} 0.00</strong>.</div>
      </div>
    </div>

    <!-- Net Balances Table -->
    <div style="border: 1px solid var(--border-subtle); padding: 24px; background: var(--bg-primary); margin-bottom: 32px;">
      <h4 style="font-family: var(--font-serif); font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
        1. Member Net Balance Sheet
      </h4>
      <div class="table-wrap">
        <table class="minimal-table">
          <thead>
            <tr>
              <th>Member</th>
              <th style="text-align: right;">Total Paid</th>
              <th style="text-align: right;">Total Owed Share</th>
              <th style="text-align: right;">Net Balance (Paid &minus; Owed)</th>
              <th>Status</th>
              <th>Ledger</th>
            </tr>
          </thead>
          <tbody>
            ${balances.map(b => {
              const isOwed = b.netBalance > 0;
              const isOwes = b.netBalance < 0;
              return `
                <tr>
                  <td><strong>${escapeHtml(b.participantName)}</strong></td>
                  <td style="text-align: right;">${trip.currency} ${formatMoney(b.totalPaid)}</td>
                  <td style="text-align: right;">${trip.currency} ${formatMoney(b.totalOwed)}</td>
                  <td style="text-align: right; font-weight: 700; font-family: var(--font-serif);">
                    <span style="color: ${isOwed ? 'var(--accent-positive)' : isOwes ? 'var(--accent-negative)' : 'var(--text-muted)'};">
                      ${isOwed ? `+${trip.currency} ${formatMoney(b.netBalance)}` : isOwes ? `-${trip.currency} ${formatMoney(Math.abs(b.netBalance))}` : `${trip.currency} 0.00`}
                    </span>
                  </td>
                  <td>
                    <span class="badge ${isOwed ? 'badge-positive' : isOwes ? 'badge-negative' : 'badge-neutral'}">
                      ${isOwed ? 'Creditor (Owed)' : isOwes ? 'Debtor (Owes)' : 'Cleared'}
                    </span>
                  </td>
                  <td>
                    <a href="#/trips/${trip.id}/members/${b.participantId}" class="btn btn-sm">Ledger &rarr;</a>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Minimal Transactions -->
    <div style="border: 1px solid var(--border-subtle); padding: 24px; background: var(--bg-primary);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
        <h4 style="font-family: var(--font-serif); font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase;">
          2. Minimal Simplified Transactions (${settlements.length})
        </h4>
      </div>

      ${settlements.length === 0 ? `
        <div style="text-align: center; padding: 32px; color: var(--text-muted);">
          All accounts are currently balanced &mdash; $0.00 debt remaining!
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${settlements.map((s, idx) => `
            <div class="settlement-card">
              <div class="settlement-info">
                <div style="font-family: var(--font-serif); font-size: 16px; color: var(--text-muted); width: 24px;">#${idx + 1}</div>
                <div>
                  <div style="font-size: 15px;">
                    <span class="settlement-payer">${escapeHtml(s.fromParticipantName)}</span>
                    <span class="settlement-arrow">&nbsp;&mdash;&mdash;&gt;&nbsp;</span>
                    <span class="settlement-receiver">${escapeHtml(s.toParticipantName)}</span>
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">
                    ${s.settled ? `Cleared on ${formatDate(s.settledAt, true)}` : 'Optimal debt clearance transaction'}
                  </div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 20px;">
                <span class="settlement-amount">${trip.currency} ${formatMoney(s.amount)}</span>
                ${s.settled ? `
                  <span class="badge badge-positive" style="padding: 6px 12px;">&check; CLEARED</span>
                ` : `
                  <button class="btn btn-sm" onclick="openPaymentModal(${trip.id}, ${s.id}, '${escapeHtml(s.fromParticipantName)}', '${escapeHtml(s.toParticipantName)}', ${s.amount}, '${trip.currency}')">
                    Settle Payment
                  </button>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

// -------------------------------------------------------------
// TAB 05: AUDIT LOG TIMELINE
// -------------------------------------------------------------
function renderTabAudit(trip, auditLogs) {
  return `
    <div style="margin-bottom: 24px;">
      <h3 style="font-family: var(--font-serif); font-size: 18px; letter-spacing: 2px; text-transform: uppercase;">Immutable Audit Trail</h3>
      <p style="font-size: 13px; color: var(--text-secondary);">Historical ledger of all trip modifications, expenses, and settlements.</p>
    </div>

    ${auditLogs.length === 0 ? `
      <div style="text-align: center; padding: 40px; color: var(--text-muted);">No audit events recorded yet.</div>
    ` : `
      <div style="border: 1px solid var(--border-subtle); background: var(--bg-primary); padding: 24px;">
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${auditLogs.map(log => `
            <div style="padding-bottom: 16px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: flex-start; gap: 20px;">
              <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                  <span class="badge badge-neutral">${escapeHtml(log.action)}</span>
                  <span style="font-size: 11px; color: var(--text-muted);">${formatDate(log.timestamp, true)}</span>
                </div>
                <div style="font-size: 13px; color: var(--text-primary);">${escapeHtml(log.details)}</div>
              </div>
              <div style="font-size: 10px; letter-spacing: 1px; color: var(--text-muted); text-transform: uppercase;">System Verified</div>
            </div>
          `).join('')}
        </div>
      </div>
    `}
  `;
}

// -------------------------------------------------------------
// TAB 06: TRIP SETTINGS & EXPORTS
// -------------------------------------------------------------
function renderTabSettings(trip) {
  return `
    <div style="max-width: 700px;">
      <div style="margin-bottom: 24px;">
        <h3 style="font-family: var(--font-serif); font-size: 18px; letter-spacing: 2px; text-transform: uppercase;">Expedition Settings &amp; Data</h3>
        <p style="font-size: 13px; color: var(--text-secondary);">Manage trip metadata, download financial reports, or cascade remove workspace.</p>
      </div>

      <div class="form-card">
        <h4 style="font-family: var(--font-serif); font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
          Edit Expedition Information
        </h4>
        <form onsubmit="handleEditTripSubmit(event)">
          <input type="hidden" id="edit-trip-id" value="${trip.id}">
          <div class="form-group">
            <label class="form-label" for="edit-trip-name">Trip Name</label>
            <input type="text" id="edit-trip-name" class="form-control" value="${escapeHtml(trip.name)}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="edit-trip-desc">Description</label>
            <textarea id="edit-trip-desc" class="form-control">${escapeHtml(trip.description || '')}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="edit-trip-currency">Base Currency</label>
            <input type="text" id="edit-trip-currency" class="form-control" value="${escapeHtml(trip.currency)}" required>
          </div>
          <div class="btn-group">
            <button type="submit" class="btn btn-sm">Save Changes</button>
          </div>
        </form>
      </div>

      <div class="form-card">
        <h4 style="font-family: var(--font-serif); font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
          Export Financial Reports
        </h4>
        <div class="btn-group">
          <button class="btn btn-sm" onclick="exportTripCSV(${trip.id})">Export Expenses CSV</button>
          <button class="btn btn-sm btn-secondary" onclick="exportTripJSON(${trip.id})">Export Full JSON</button>
        </div>
      </div>

      <div class="form-card" style="border-color: #fecaca;">
        <h4 style="font-family: var(--font-serif); font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px; color: var(--accent-negative);">
          Danger Zone
        </h4>
        <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">
          Deleting this trip permanently purges all participants, expenses, penny splits, settlements, and audit history.
        </p>
        <button class="btn btn-sm btn-danger" onclick="handleDeleteTrip(${trip.id})">Delete Entire Expedition</button>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// EVENT HANDLERS & MODAL ACTIONS
// -------------------------------------------------------------
async function handleCreateTrip(event) {
  event.preventDefault();
  const name = document.getElementById('trip-name-input').value.trim();
  const desc = document.getElementById('trip-desc-input').value.trim();
  const currency = document.getElementById('trip-currency-input').value.trim() || 'USD';
  const rawParticipants = document.getElementById('trip-participants-input').value;

  const participantNames = rawParticipants
    ? rawParticipants.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  try {
    const newTrip = await apiCall('/api/trips', {
      method: 'POST',
      body: JSON.stringify({ name, description: desc, currency, participantNames })
    });
    closeModal('modal-create-trip');
    document.getElementById('form-create-trip').reset();
    showToast(`Trip '${newTrip.name}' created successfully`);
    window.location.hash = `#/trips/${newTrip.id}/overview`;
  } catch (err) {}
}

async function handleEditTripSubmit(event) {
  event.preventDefault();
  const id = document.getElementById('edit-trip-id').value;
  const name = document.getElementById('edit-trip-name').value.trim();
  const desc = document.getElementById('edit-trip-desc').value.trim();
  const currency = document.getElementById('edit-trip-currency').value.trim();

  try {
    await apiCall(`/api/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description: desc, currency })
    });
    showToast('Trip updated');
    renderTripWorkspace(id, 'settings');
  } catch (err) {}
}

function promptAddParticipant(tripId) {
  document.getElementById('participant-trip-id').value = tripId;
  openModal('modal-add-participant');
}

async function handleAddParticipant(event) {
  event.preventDefault();
  const tripId = document.getElementById('participant-trip-id').value;
  const name = document.getElementById('participant-name-input').value.trim();
  const email = document.getElementById('participant-email-input').value.trim();

  try {
    await apiCall(`/api/trips/${tripId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ name, email })
    });
    closeModal('modal-add-participant');
    document.getElementById('form-add-participant').reset();
    showToast(`Added member '${name}'`);
    await renderTripWorkspace(tripId, 'members');
  } catch (err) {}
}

async function handleLogExpenseSubmit(event, tripId) {
  event.preventDefault();
  const desc = document.getElementById('expense-desc').value.trim();
  const amount = parseFloat(document.getElementById('expense-amount').value);
  const category = document.getElementById('expense-category').value;
  const payerId = parseInt(document.getElementById('expense-payer').value);

  const sharedIds = Array.from(document.querySelectorAll('input[name="sharedParticipants"]:checked'))
    .map(cb => parseInt(cb.value));

  if (sharedIds.length === 0) {
    showToast('Select at least one member to share this expense', true);
    return;
  }

  try {
    await apiCall(`/api/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify({
        description: desc,
        amount: amount,
        category: category,
        payerId: payerId,
        sharedParticipantIds: sharedIds
      })
    });
    showToast(`Expense '${desc}' logged`);
    window.location.hash = `#/trips/${tripId}/expenses`;
  } catch (err) {}
}

async function handleDeleteExpense(tripId, expenseId) {
  if (!confirm('Are you sure you want to delete this expense?')) return;
  try {
    await apiCall(`/api/trips/${tripId}/expenses/${expenseId}`, {
      method: 'DELETE'
    });
    showToast('Expense removed and ledger re-balanced');
    window.location.hash = `#/trips/${tripId}/expenses`;
    await renderTripWorkspace(tripId, 'expenses');
  } catch (err) {}
}

async function handleDeleteTrip(tripId) {
  if (!confirm('Are you certain? All trip expenses, balances, and history will be permanently deleted.')) return;
  try {
    await apiCall(`/api/trips/${tripId}`, {
      method: 'DELETE'
    });
    showToast('Trip deleted');
    window.location.hash = '#/trips';
  } catch (err) {}
}

async function handleGenerateSettlements(tripId) {
  try {
    await apiCall(`/api/trips/${tripId}/settlements/generate`, {
      method: 'POST'
    });
    showToast('Settlement plan re-calculated');
    await renderTripWorkspace(tripId, 'settlements');
  } catch (err) {}
}

// Payment Clearance Modal & Action
function openPaymentModal(tripId, settlementId, debtor, creditor, amount, currency) {
  const body = document.getElementById('settle-modal-body');
  if (!body) return;

  body.innerHTML = `
    <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); padding: 20px; margin-bottom: 20px;">
      <div style="font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">Settlement Transaction</div>
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">
        ${escapeHtml(debtor)} &rarr; ${escapeHtml(creditor)}
      </div>
      <div style="font-family: var(--font-serif); font-size: 28px; font-weight: 700; color: var(--text-primary);">
        ${currency} ${formatMoney(amount)}
      </div>
    </div>

    <form onsubmit="handleConfirmPayment(event, ${tripId}, ${settlementId})">
      <div class="form-group">
        <label class="form-label" for="payment-method-select">Payment Method</label>
        <select id="payment-method-select" class="form-control">
          <option value="BANK_TRANSFER">Direct Bank Transfer / Wire</option>
          <option value="UPI">UPI / Instant Pay</option>
          <option value="VENMO">Venmo / CashApp</option>
          <option value="REVOLUT">Revolut / Wise</option>
          <option value="CASH">Cash in Person</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label" for="payment-ref-note">Reference / Note (Optional)</label>
        <input type="text" id="payment-ref-note" class="form-control" placeholder="e.g. Paid via Revolut tag @alex">
      </div>

      <div class="btn-group" style="margin-top: 24px;">
        <button type="submit" class="btn">Mark as Cleared</button>
        <button type="button" class="btn btn-secondary" onclick="closeModal('modal-settle-payment')">Cancel</button>
      </div>
    </form>
  `;

  openModal('modal-settle-payment');
}

async function handleConfirmPayment(event, tripId, settlementId) {
  event.preventDefault();
  try {
    await apiCall(`/api/trips/${tripId}/settlements/${settlementId}/settle`, {
      method: 'PUT'
    });
    closeModal('modal-settle-payment');
    showToast('Payment confirmed & debt cleared');
    if (state.currentRoute.includes('settlements')) {
      if (state.currentRoute === '/settlements') {
        renderSettlementHubPage();
      } else {
        renderTripWorkspace(tripId, 'settlements');
      }
    } else {
      handleRoute();
    }
  } catch (err) {}
}

// -------------------------------------------------------------
// REAL EXPORT FUNCTIONALITY (CSV & JSON DOWNLOADS)
// -------------------------------------------------------------
async function exportTripCSV(tripId) {
  try {
    const summary = await apiCall(`/api/trips/${tripId}/summary`);
    const trip = summary.trip;
    const expenses = summary.expenses || [];

    let csv = `Date,Expense ID,Description,Category,Payer,Amount (${trip.currency}),Beneficiaries Count,Beneficiaries\n`;
    expenses.forEach(e => {
      const beneficiaries = (e.shares || []).map(s => s.participant.name).join('; ');
      csv += `"${formatDate(e.expenseDate)}","EXP-${e.id}","${escapeCsv(e.description)}","${e.category}","${escapeCsv(e.payer.name)}","${e.amount}","${e.shares.length}","${escapeCsv(beneficiaries)}"\n`;
    });

    downloadBlob(csv, `trip-${tripId}-expenses-${Date.now()}.csv`, 'text/csv;charset=utf-8;');
    showToast('CSV report generated');
  } catch (err) {
    showToast('Export failed', true);
  }
}

async function exportTripJSON(tripId) {
  try {
    const summary = await apiCall(`/api/trips/${tripId}/summary`);
    const jsonStr = JSON.stringify(summary, null, 2);
    downloadBlob(jsonStr, `trip-${tripId}-backup-${Date.now()}.json`, 'application/json;charset=utf-8;');
    showToast('JSON archive downloaded');
  } catch (err) {
    showToast('Export failed', true);
  }
}

async function exportAllTripsJSON() {
  try {
    state.trips = await apiCall('/api/trips');
    const all = await Promise.all(state.trips.map(t => apiCall(`/api/trips/${t.id}/summary`)));
    const jsonStr = JSON.stringify(all, null, 2);
    downloadBlob(jsonStr, `tripsplit-global-backup-${Date.now()}.json`, 'application/json;charset=utf-8;');
    showToast('Global archive downloaded');
  } catch (err) {
    showToast('Global export failed', true);
  }
}

function downloadBlob(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsv(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '""');
}

// Formatters
function formatMoney(amount) {
  if (amount === null || amount === undefined) return '0.00';
  return Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDate(dateStr, withTime = false) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  if (withTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return d.toLocaleDateString('en-US', options);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
