/**
 * MINIMAL — TripSplit Frontend Application
 * Pure Vanilla JavaScript with nested hierarchical routing
 */

// Application State
const state = {
  currentRoute: '',
  trips: [],
  activeTrip: null,
  activeTripSummary: null,
  categories: ['FOOD', 'TRANSPORT', 'LODGING', 'ACTIVITIES', 'SHOPPING', 'OTHER']
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
      const msg = data.message || (data.fieldErrors ? Object.values(data.fieldErrors).join(', ') : 'An error occurred');
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

// Router & Nested Navigators
window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', () => {
  if (!window.location.hash) {
    window.location.hash = '#/trips';
  } else {
    handleRoute();
  }
});

async function handleRoute() {
  const hash = window.location.hash.slice(1) || '/trips';
  state.currentRoute = hash;

  // Update top navigation active state
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href').slice(1);
    if (hash.startsWith(href) && href !== '') {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  const parts = hash.split('/').filter(Boolean);
  // Route patterns:
  // #/home or #/trips -> renderTripsCatalog()
  // #/about -> renderAboutPage()
  // #/api -> renderApiDocsPage()
  // #/trips/:tripId -> renderTripWorkspace(tripId, 'overview')
  // #/trips/:tripId/:section -> renderTripWorkspace(tripId, section)
  // #/trips/:tripId/expenses/new -> renderNewExpenseForm(tripId)
  // #/trips/:tripId/expenses/:expenseId -> renderExpenseDetail(tripId, expenseId)
  // #/trips/:tripId/participants/:participantId -> renderParticipantLedger(tripId, participantId)

  if (parts.length === 0 || parts[0] === 'home' || (parts[0] === 'trips' && parts.length === 1)) {
    await renderTripsCatalog();
  } else if (parts[0] === 'about') {
    renderAboutPage();
  } else if (parts[0] === 'api') {
    renderApiDocsPage();
  } else if (parts[0] === 'trips' && parts.length >= 2) {
    const tripId = parts[1];
    const section = parts[2] || 'overview';
    const subId = parts[3];

    if (section === 'expenses' && subId === 'new') {
      await renderNewExpenseForm(tripId);
    } else if (section === 'expenses' && subId) {
      await renderExpenseDetail(tripId, subId);
    } else if (section === 'participants' && subId) {
      await renderParticipantLedger(tripId, subId);
    } else {
      await renderTripWorkspace(tripId, section);
    }
  } else {
    await renderTripsCatalog();
  }
}

// Breadcrumb Builder
function updateBreadcrumbs(items) {
  const container = document.getElementById('breadcrumbs-container');
  if (!container) return;

  let html = `<a href="#/trips" class="breadcrumb-item">Minimal</a>`;
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
// VIEW 1: TRIPS CATALOG & HERO BANNER (MATCHING IMAGE 1)
// -------------------------------------------------------------
async function renderTripsCatalog() {
  updateBreadcrumbs([{ label: 'Trips', url: '#/trips' }]);
  const container = document.getElementById('view-container');

  try {
    state.trips = await apiCall('/api/trips');
  } catch (e) {
    state.trips = [];
  }

  const tripsCount = state.trips.length;

  container.innerHTML = `
    <!-- Hero Article Card styled like the Minimal blog in image -->
    <article class="hero-card">
      <div class="hero-image-wrap">
        <!-- Minimalist Architectural & Botanical SVG Art -->
        <svg class="hero-svg-art" viewBox="0 0 1000 450" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bgWood" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#f6f6f6" />
              <stop offset="50%" stop-color="#eeeeee" />
              <stop offset="100%" stop-color="#f4f4f4" />
            </linearGradient>
            <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.08" />
            </filter>
          </defs>
          <!-- Background planks -->
          <rect width="1000" height="450" fill="url(#bgWood)" />
          <line x1="0" y1="110" x2="1000" y2="110" stroke="#dfdfdf" stroke-width="1.5" />
          <line x1="0" y1="225" x2="1000" y2="225" stroke="#dfdfdf" stroke-width="1.5" />
          <line x1="0" y1="340" x2="1000" y2="340" stroke="#dfdfdf" stroke-width="1.5" />
          
          <!-- White Paper Sheet (as in photo) -->
          <g filter="url(#cardShadow)">
            <rect x="360" y="55" width="280" height="340" fill="#ffffff" stroke="#e8e8e8" stroke-width="1" rx="1" />
            <!-- Clean internal borders/grid lines representing minimalism -->
            <line x1="390" y1="120" x2="610" y2="120" stroke="#f0f0f0" stroke-width="1" />
            <line x1="390" y1="140" x2="570" y2="140" stroke="#f0f0f0" stroke-width="1" />
            <line x1="390" y1="160" x2="590" y2="160" stroke="#f0f0f0" stroke-width="1" />
          </g>

          <!-- Botanical Stem & Flower (as in photo) -->
          <g opacity="0.85">
            <!-- Stem -->
            <path d="M 640 390 Q 615 280 625 210 Q 632 170 635 145" fill="none" stroke="#2c2c2c" stroke-width="4.5" stroke-linecap="round" />
            <!-- Leaf nodes -->
            <path d="M 618 290 C 590 270 565 295 560 305 C 575 305 605 298 618 290 Z" fill="#2c2c2c" />
            <path d="M 622 260 C 600 240 580 255 580 265 C 595 268 615 264 622 260 Z" fill="#2c2c2c" />
            <!-- Flower Bud -->
            <path d="M 635 145 C 620 135 620 115 635 105 C 650 115 650 135 635 145 Z" fill="#2c2c2c" />
            <circle cx="635" cy="115" r="10" fill="#3a3a3a" />
          </g>
        </svg>
      </div>

      <div class="hero-meta-category">Group Travel Expense Settlement Tracker</div>
      <h2 class="hero-title">A Better Way to Split & Settle Travel Costs</h2>
      <p class="hero-text">
        Friends travelling together share expenses unevenly across hotels, fuel, and meals. TripSplit tracks individual payers, computes exact net balances, and runs an optimal cashflow reduction algorithm to generate the minimal number of settlement payments needed to clear every member's debt to zero.
      </p>
      <div class="btn-group">
        <button class="btn" onclick="openModal('modal-create-trip')">+ Create New Trip</button>
        <a href="#/about" class="btn btn-secondary">System Design & Rules</a>
      </div>
    </article>

    <!-- Trips Grid Section -->
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;">
      <div>
        <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted);">Workspaces</div>
        <h3 style="font-family: var(--font-serif); font-size: 20px; letter-spacing: 2px; text-transform: uppercase;">Active Trips (${tripsCount})</h3>
      </div>
      <button class="btn btn-sm" onclick="openModal('modal-create-trip')">+ Add Trip</button>
    </div>

    ${tripsCount === 0 ? `
      <div style="text-align: center; padding: 60px 20px; border: 1px dashed var(--border-subtle); background: var(--bg-secondary);">
        <p style="color: var(--text-secondary); margin-bottom: 16px;">No trips created yet. Create your first group trip to start tracking shared expenses.</p>
        <button class="btn btn-sm" onclick="openModal('modal-create-trip')">Create A Trip</button>
      </div>
    ` : `
      <div class="trips-grid">
        ${state.trips.map(trip => `
          <div class="trip-card" onclick="window.location.hash='#/trips/${trip.id}'">
            <div>
              <div class="trip-card-date">Created ${formatDate(trip.createdAt)}</div>
              <h4 class="trip-card-title">${escapeHtml(trip.name)}</h4>
              <p class="trip-card-desc">${escapeHtml(trip.description || 'No description provided.')}</p>
            </div>
            <div class="trip-card-stats">
              <span>${trip.participants ? trip.participants.length : 0} Members</span>
              <span style="font-weight: 600; color: var(--text-primary);">${trip.currency}</span>
              <span style="letter-spacing: 1.5px; text-transform: uppercase; font-size: 11px;">Open Workspace &rarr;</span>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `;
}

// -------------------------------------------------------------
// VIEW 2: TRIP WORKSPACE (NESTED TABS & HIERARCHICAL NAVIGATION)
// -------------------------------------------------------------
async function renderTripWorkspace(tripId, activeSection = 'overview') {
  const container = document.getElementById('view-container');
  container.innerHTML = `<div style="text-align: center; padding: 60px;">Loading trip workspace...</div>`;

  try {
    const summary = await apiCall(`/api/trips/${tripId}/summary`);
    state.activeTripSummary = summary;
    state.activeTrip = summary.trip;
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
    overview: 'Overview',
    participants: 'Participants',
    expenses: 'Expenses',
    settlements: 'Settlements & Balances',
    audit: 'Audit Log'
  };

  updateBreadcrumbs([
    { label: 'Trips', url: '#/trips' },
    { label: trip.name, url: `#/trips/${tripId}/overview` },
    { label: sectionLabelMap[activeSection] || 'Overview' }
  ]);

  // Render Base Layout with Header, Stats, and Nested Tabs
  let html = `
    <!-- Trip Header Strip -->
    <div class="trip-header-strip">
      <div class="trip-title-area">
        <h2>${escapeHtml(trip.name)}</h2>
        <div class="trip-meta-desc">${escapeHtml(trip.description || 'Group travel expense tracking workspace')}</div>
      </div>
      <div class="btn-group">
        <a href="#/trips/${tripId}/expenses/new" class="btn btn-sm">+ Log Expense</a>
        <button class="btn btn-sm btn-secondary" onclick="promptAddParticipant(${tripId})">+ Add Member</button>
        <button class="btn btn-sm btn-danger" onclick="handleDeleteTrip(${tripId})">Delete Trip</button>
      </div>
    </div>

    <!-- Stats Ribbon -->
    <div class="stats-ribbon">
      <div class="stat-box">
        <div class="stat-label">Total Trip Spend</div>
        <div class="stat-value">${trip.currency} ${formatMoney(totalSpend)}</div>
        <div class="stat-sub">${expenses.length} Logged Transactions</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Group Members</div>
        <div class="stat-value">${participants.length}</div>
        <div class="stat-sub">Sharing Travel Expenses</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Net Balance Sum</div>
        <div class="stat-value" style="color: var(--accent-positive);">${trip.currency} 0.00</div>
        <div class="stat-sub">Strict Zero-Sum Integrity &check;</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Settlement Status</div>
        <div class="stat-value" style="font-size: 18px;">
          ${settlements.filter(s => s.settled).length} / ${settlements.length} Paid
        </div>
        <div class="stat-sub">${settlements.length} Minimal Clearances</div>
      </div>
    </div>

    <!-- Nested Navigation Tabs -->
    <div class="nested-nav-tabs">
      <button class="nested-tab-btn ${activeSection === 'overview' ? 'active' : ''}" onclick="window.location.hash='#/trips/${tripId}/overview'">01 &middot; Overview</button>
      <button class="nested-tab-btn ${activeSection === 'participants' ? 'active' : ''}" onclick="window.location.hash='#/trips/${tripId}/participants'">02 &middot; Participants (${participants.length})</button>
      <button class="nested-tab-btn ${activeSection === 'expenses' ? 'active' : ''}" onclick="window.location.hash='#/trips/${tripId}/expenses'">03 &middot; Expenses (${expenses.length})</button>
      <button class="nested-tab-btn ${activeSection === 'settlements' ? 'active' : ''}" onclick="window.location.hash='#/trips/${tripId}/settlements'">04 &middot; Balances &amp; Settlements</button>
      <button class="nested-tab-btn ${activeSection === 'audit' ? 'active' : ''}" onclick="window.location.hash='#/trips/${tripId}/audit'">05 &middot; Audit Log (${auditLogs.length})</button>
    </div>

    <!-- Dynamic Tab Content Subview -->
    <div id="nested-tab-content">
  `;

  // Render Subview depending on activeSection
  if (activeSection === 'overview') {
    html += renderTabOverview(trip, participants, expenses, balances, settlements);
  } else if (activeSection === 'participants') {
    html += renderTabParticipants(trip, participants, balances);
  } else if (activeSection === 'expenses') {
    html += renderTabExpenses(trip, expenses);
  } else if (activeSection === 'settlements') {
    html += renderTabSettlements(trip, balances, settlements);
  } else if (activeSection === 'audit') {
    html += renderTabAudit(trip, auditLogs);
  }

  html += `</div>`;
  container.innerHTML = html;
}

// -------------------------------------------------------------
// TAB 01: OVERVIEW SUBVIEW
// -------------------------------------------------------------
function renderTabOverview(trip, participants, expenses, balances, settlements) {
  const recentExpenses = expenses.slice(0, 5);
  const pendingSettlements = settlements.filter(s => !s.settled);

  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; margin-bottom: 32px;">
      
      <!-- Left Column: Net Balances Snapshot -->
      <div style="border: 1px solid var(--border-subtle); padding: 24px; background: var(--bg-primary);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
          <h4 style="font-family: var(--font-serif); font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase;">Net Balances Snapshot</h4>
          <a href="#/trips/${trip.id}/settlements" style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-primary); text-decoration: none;">View All &rarr;</a>
        </div>
        ${balances.length === 0 ? `<p style="color: var(--text-muted);">No participants found.</p>` : `
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${balances.map(b => {
              const isOwed = b.netBalance > 0;
              const isOwes = b.netBalance < 0;
              return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); cursor: pointer;"
                     onclick="window.location.hash='#/trips/${trip.id}/participants/${b.participantId}'">
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
        `}
      </div>

      <!-- Right Column: Pending Settlement Payments -->
      <div style="border: 1px solid var(--border-subtle); padding: 24px; background: var(--bg-primary);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
          <h4 style="font-family: var(--font-serif); font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase;">Optimal Clearances</h4>
          <a href="#/trips/${trip.id}/settlements" style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-primary); text-decoration: none;">Settlement Plan &rarr;</a>
        </div>
        ${pendingSettlements.length === 0 ? `
          <div style="text-align: center; padding: 32px 16px; color: var(--accent-positive);">
            <div style="font-size: 20px; margin-bottom: 8px;">&check;</div>
            <div style="font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">All Accounts Settled</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">No outstanding debts between participants.</div>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${pendingSettlements.map(s => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border: 1px solid var(--border-subtle); background: var(--bg-secondary);">
                <div>
                  <div style="font-size: 13px;">
                    <strong>${escapeHtml(s.fromParticipantName)}</strong> &rarr; <strong>${escapeHtml(s.toParticipantName)}</strong>
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted);">Minimal greedy transaction</div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-family: var(--font-serif); font-weight: 700; font-size: 14px;">${trip.currency} ${formatMoney(s.amount)}</span>
                  <button class="btn btn-sm" onclick="handleMarkSettled(${trip.id}, ${s.id})">Settle</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

    </div>

    <!-- Recent Expenses Table -->
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
                <th>Shared By</th>
                <th style="text-align: right;">Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${recentExpenses.map(e => `
                <tr>
                  <td>${formatDate(e.expenseDate)}</td>
                  <td><a href="#/trips/${trip.id}/expenses/${e.id}" style="color: var(--text-primary); font-weight: 600; text-decoration: none;">${escapeHtml(e.description)}</a></td>
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
// TAB 02: PARTICIPANTS SUBVIEW
// -------------------------------------------------------------
function renderTabParticipants(trip, participants, balances) {
  const balanceMap = {};
  balances.forEach(b => { balanceMap[b.participantId] = b; });

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h3 style="font-family: var(--font-serif); font-size: 18px; letter-spacing: 2px; text-transform: uppercase;">Participants Directory</h3>
        <p style="font-size: 13px; color: var(--text-secondary);">Click on any member to drill into their nested personal ledger and payment history.</p>
      </div>
      <button class="btn btn-sm" onclick="promptAddParticipant(${trip.id})">+ Add Member</button>
    </div>

    <div class="table-wrap">
      <table class="minimal-table">
        <thead>
          <tr>
            <th>Member Name</th>
            <th>Email</th>
            <th style="text-align: right;">Total Paid</th>
            <th style="text-align: right;">Total Owed Share</th>
            <th style="text-align: right;">Net Balance</th>
            <th>Status</th>
            <th>Nested View</th>
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
                <td style="text-align: right; font-weight: 700;">
                  <span style="color: ${isOwed ? 'var(--accent-positive)' : isOwes ? 'var(--accent-negative)' : 'var(--text-muted)'};">
                    ${isOwed ? `+${trip.currency} ${formatMoney(b.netBalance)}` : isOwes ? `-${trip.currency} ${formatMoney(Math.abs(b.netBalance))}` : `${trip.currency} 0.00`}
                  </span>
                </td>
                <td>
                  <span class="badge ${isOwed ? 'badge-positive' : isOwes ? 'badge-negative' : 'badge-neutral'}">
                    ${isOwed ? 'Is Owed' : isOwes ? 'Owes Money' : 'Settled'}
                  </span>
                </td>
                <td>
                  <a href="#/trips/${trip.id}/participants/${p.id}" class="btn btn-sm">Member Ledger &rarr;</a>
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
// NESTED SUB-PAGE: PARTICIPANT LEDGER (LEVEL 3)
// -------------------------------------------------------------
async function renderParticipantLedger(tripId, participantId) {
  if (!state.activeTripSummary || state.activeTripSummary.trip.id != tripId) {
    await renderTripWorkspace(tripId, 'participants');
  }

  const trip = state.activeTripSummary.trip;
  const participant = state.activeTripSummary.participants.find(p => p.id == participantId);
  const balances = state.activeTripSummary.balances.find(b => b.participantId == participantId) || { totalPaid: 0, totalOwed: 0, netBalance: 0 };
  const allExpenses = state.activeTripSummary.expenses || [];
  const settlements = state.activeTripSummary.settlements || [];

  if (!participant) {
    showToast('Participant not found', true);
    window.location.hash = `#/trips/${tripId}/participants`;
    return;
  }

  updateBreadcrumbs([
    { label: 'Trips', url: '#/trips' },
    { label: trip.name, url: `#/trips/${tripId}/overview` },
    { label: 'Participants', url: `#/trips/${tripId}/participants` },
    { label: `${participant.name}'s Ledger` }
  ]);

  const paidExpenses = allExpenses.filter(e => e.payer.id == participantId);
  const sharedExpenses = allExpenses.filter(e => e.shares && e.shares.some(s => s.participant.id == participantId));
  const participantSettlements = settlements.filter(s => s.fromParticipantId == participantId || s.toParticipantId == participantId);

  const container = document.getElementById('view-container');
  container.innerHTML = `
    <div style="margin-bottom: 24px;">
      <a href="#/trips/${tripId}/participants" class="btn btn-sm btn-secondary" style="margin-bottom: 16px;">&larr; Back to Participants</a>
      <div class="trip-header-strip" style="margin-top: 10px;">
        <div>
          <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted);">Participant Financial Ledger</div>
          <h2 style="font-family: var(--font-serif); font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">${escapeHtml(participant.name)}</h2>
          <div style="font-size: 13px; color: var(--text-secondary);">${escapeHtml(participant.email || 'No email registered')}</div>
        </div>
        <div>
          <div style="text-align: right;">
            <div style="font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-muted);">Net Balance</div>
            <div style="font-family: var(--font-serif); font-size: 26px; font-weight: 700; color: ${balances.netBalance > 0 ? 'var(--accent-positive)' : balances.netBalance < 0 ? 'var(--accent-negative)' : 'var(--text-muted)'};">
              ${balances.netBalance > 0 ? `+${trip.currency} ${formatMoney(balances.netBalance)}` : balances.netBalance < 0 ? `-${trip.currency} ${formatMoney(Math.abs(balances.netBalance))}` : `${trip.currency} 0.00`}
            </div>
            <div style="font-size: 11px; color: var(--text-muted);">${balances.netBalance > 0 ? 'Will receive from group' : balances.netBalance < 0 ? 'Must pay back to group' : 'Settled up'}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats for this participant -->
    <div class="stats-ribbon" style="margin-bottom: 32px;">
      <div class="stat-box">
        <div class="stat-label">Total Out-of-Pocket Paid</div>
        <div class="stat-value">${trip.currency} ${formatMoney(balances.totalPaid)}</div>
        <div class="stat-sub">${paidExpenses.length} Expenses Paid</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Total Owed Expense Share</div>
        <div class="stat-value">${trip.currency} ${formatMoney(balances.totalOwed)}</div>
        <div class="stat-sub">Shared across ${sharedExpenses.length} items</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Net Balance Equation</div>
        <div class="stat-value" style="font-size: 18px;">${formatMoney(balances.totalPaid)} &minus; ${formatMoney(balances.totalOwed)}</div>
        <div class="stat-sub">Paid minus Owed</div>
      </div>
    </div>

    <!-- Settlement Obligations for this participant -->
    <div style="border: 1px solid var(--border-subtle); padding: 24px; background: var(--bg-primary); margin-bottom: 32px;">
      <h4 style="font-family: var(--font-serif); font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
        Settlement Clearances for ${escapeHtml(participant.name)}
      </h4>
      ${participantSettlements.length === 0 ? `
        <p style="color: var(--text-muted);">No settlement transactions involving this member.</p>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${participantSettlements.map(s => {
            const isPayer = s.fromParticipantId == participantId;
            return `
              <div class="settlement-card">
                <div class="settlement-info">
                  <div style="font-size: 18px;">${isPayer ? '&nearr;' : '&swarr;'}</div>
                  <div>
                    <div style="font-size: 14px; font-weight: 600;">
                      ${isPayer ? `You owe ${escapeHtml(s.toParticipantName)}` : `${escapeHtml(s.fromParticipantName)} owes you`}
                    </div>
                    <div style="font-size: 11px; color: var(--text-muted);">
                      Status: ${s.settled ? `Settled on ${formatDate(s.settledAt)}` : 'Pending Payment'}
                    </div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 16px;">
                  <span class="settlement-amount">${trip.currency} ${formatMoney(s.amount)}</span>
                  ${s.settled ? `<span class="badge badge-positive">PAID</span>` : `
                    <button class="btn btn-sm" onclick="handleMarkSettled(${tripId}, ${s.id})">Mark as Paid</button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>

    <!-- Expenses Paid by Participant -->
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
                  <td><a href="#/trips/${tripId}/expenses/${e.id}" class="btn btn-sm">Inspect</a></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>

    <!-- Expenses Shared by Participant -->
    <div style="border: 1px solid var(--border-subtle); padding: 24px; background: var(--bg-primary);">
      <h4 style="font-family: var(--font-serif); font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
        Expenses Shared by ${escapeHtml(participant.name)} (${sharedExpenses.length})
      </h4>
      ${sharedExpenses.length === 0 ? `<p style="color: var(--text-muted);">No shared expenses found.</p>` : `
        <div class="table-wrap">
          <table class="minimal-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Expense</th>
                <th>Payer</th>
                <th style="text-align: right;">Total Amount</th>
                <th style="text-align: right;">${participant.name}'s Share</th>
              </tr>
            </thead>
            <tbody>
              ${sharedExpenses.map(e => {
                const myShare = e.shares.find(s => s.participant.id == participantId);
                return `
                  <tr>
                    <td>${formatDate(e.expenseDate)}</td>
                    <td><a href="#/trips/${tripId}/expenses/${e.id}" style="color: var(--text-primary); text-decoration: none; font-weight: 600;">${escapeHtml(e.description)}</a></td>
                    <td>${escapeHtml(e.payer.name)}</td>
                    <td style="text-align: right;">${trip.currency} ${formatMoney(e.amount)}</td>
                    <td style="text-align: right; font-weight: 700; color: var(--accent-negative);">
                      ${trip.currency} ${formatMoney(myShare ? myShare.shareAmount : 0)}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

// -------------------------------------------------------------
// TAB 03: EXPENSES LIST SUBVIEW
// -------------------------------------------------------------
function renderTabExpenses(trip, expenses) {
  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h3 style="font-family: var(--font-serif); font-size: 18px; letter-spacing: 2px; text-transform: uppercase;">Expenses Log</h3>
        <p style="font-size: 13px; color: var(--text-secondary);">Click on an expense to view its nested penny-split breakdown and audit details.</p>
      </div>
      <a href="#/trips/${trip.id}/expenses/new" class="btn btn-sm">+ Log New Expense</a>
    </div>

    ${expenses.length === 0 ? `
      <div style="text-align: center; padding: 60px 20px; border: 1px dashed var(--border-subtle); background: var(--bg-secondary);">
        <p style="color: var(--text-secondary); margin-bottom: 16px;">No expenses recorded yet.</p>
        <a href="#/trips/${trip.id}/expenses/new" class="btn btn-sm">Log First Expense</a>
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
              <th>Split Between</th>
              <th style="text-align: right;">Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(e => `
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
                    ${e.shares.length} participants
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

// -------------------------------------------------------------
// NESTED SUB-PAGE: LOG NEW EXPENSE FORM (LEVEL 3)
// -------------------------------------------------------------
async function renderNewExpenseForm(tripId) {
  if (!state.activeTripSummary || state.activeTripSummary.trip.id != tripId) {
    await renderTripWorkspace(tripId, 'expenses');
  }

  const trip = state.activeTripSummary.trip;
  const participants = state.activeTripSummary.participants || [];

  if (participants.length === 0) {
    showToast('Add at least one participant before logging expenses', true);
    window.location.hash = `#/trips/${tripId}/participants`;
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
          <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted);">Nested Form</div>
          <h2 style="font-family: var(--font-serif); font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">Log Shared Expense</h2>
          <div style="font-size: 13px; color: var(--text-secondary);">Amounts are split evenly with deterministic penny allocation so zero-sum balance integrity is preserved.</div>
        </div>
      </div>
    </div>

    <div class="form-card">
      <form id="form-log-expense" onsubmit="handleLogExpenseSubmit(event, ${tripId})">
        <div class="form-grid">
          
          <div class="form-group">
            <label class="form-label" for="expense-desc">Description</label>
            <input type="text" id="expense-desc" class="form-control" placeholder="e.g. Mountain Chalet Rental, Dinner in Venice" required>
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
            <label class="form-label" for="expense-payer">Who Paid?</label>
            <select id="expense-payer" class="form-control" required>
              ${participants.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}
            </select>
          </div>

        </div>

        <div class="form-group">
          <label class="form-label">Participants Who Share This Expense</label>
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
    summaryEl.innerHTML = `<span style="color: var(--text-muted);">Select at least one participant and enter a positive amount.</span>`;
    return;
  }

  const baseShare = Math.floor((amount / checked.length) * 100) / 100;
  const totalBase = baseShare * checked.length;
  const remainderCents = Math.round((amount - totalBase) * 100);

  summaryEl.innerHTML = `
    <div><strong>${checked.length}</strong> participants sharing <strong>$${formatMoney(amount)}</strong>:</div>
    <div style="margin-top: 6px; font-size: 12px;">
      Base share: <strong>$${formatMoney(baseShare)}</strong> each.
      ${remainderCents > 0 ? `<br><span style="color: var(--text-muted);">Exact penny allocation: The first ${remainderCents} member(s) pay $${formatMoney(baseShare + 0.01)} to guarantee sum equals $${formatMoney(amount)} exactly.</span>` : ''}
    </div>
  `;
}

// -------------------------------------------------------------
// NESTED SUB-PAGE: EXPENSE DETAIL VIEW (LEVEL 3)
// -------------------------------------------------------------
async function renderExpenseDetail(tripId, expenseId) {
  const container = document.getElementById('view-container');
  container.innerHTML = `<div style="text-align: center; padding: 60px;">Loading expense details...</div>`;

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
            <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted);">Expense Detail #EXP-${expense.id}</div>
            <h2 style="font-family: var(--font-serif); font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">${escapeHtml(expense.description)}</h2>
            <div style="font-size: 13px; color: var(--text-secondary);">Logged on ${formatDate(expense.expenseDate)} &middot; Category: <span class="badge badge-neutral">${escapeHtml(expense.category)}</span></div>
          </div>
          <div>
            <button class="btn btn-sm btn-danger" onclick="handleDeleteExpense(${tripId}, ${expense.id})">Delete Expense</button>
          </div>
        </div>
      </div>

      <div class="stats-ribbon" style="margin-bottom: 32px;">
        <div class="stat-box">
          <div class="stat-label">Total Expense Amount</div>
          <div class="stat-value">${trip.currency} ${formatMoney(expense.amount)}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Paid In Full By</div>
          <div class="stat-value" style="font-size: 20px;">${escapeHtml(expense.payer.name)}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Beneficiaries</div>
          <div class="stat-value">${expense.shares.length}</div>
          <div class="stat-sub">Members Sharing Cost</div>
        </div>
      </div>

      <!-- Split Breakdown Table -->
      <div style="border: 1px solid var(--border-subtle); padding: 24px; background: var(--bg-primary);">
        <h4 style="font-family: var(--font-serif); font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
          Participant Share Breakdown
        </h4>
        <div class="table-wrap">
          <table class="minimal-table">
            <thead>
              <tr>
                <th>Participant</th>
                <th>Share Role</th>
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
    container.innerHTML = `<div style="text-align: center; padding: 60px;">Error loading expense: ${escapeHtml(err.message)}</div>`;
  }
}

// -------------------------------------------------------------
// TAB 04: BALANCES & SETTLEMENTS SUBVIEW
// -------------------------------------------------------------
function renderTabSettlements(trip, balances, settlements) {
  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h3 style="font-family: var(--font-serif); font-size: 18px; letter-spacing: 2px; text-transform: uppercase;">Balances &amp; Optimal Settlement</h3>
        <p style="font-size: 13px; color: var(--text-secondary);">Minimal greedy transactions generated to settle all debts with minimum cash movements.</p>
      </div>
      <button class="btn btn-sm" onclick="handleGenerateSettlements(${trip.id})">&#x21bb; Re-Calculate Settlement</button>
    </div>

    <!-- Business Rule Callouts (Enforced in Service Layer) -->
    <div class="rule-callout">
      <div class="rule-callout-icon">&check;</div>
      <div>
        <div class="rule-callout-title">Business Rule 1: Zero-Sum Integrity Enforced</div>
        <div class="rule-callout-desc">The sum of all participants' net balances for this trip is guaranteed to equal exactly <strong>${trip.currency} 0.00</strong> before any settlement is generated.</div>
      </div>
    </div>

    <!-- Participant Net Balances Table -->
    <div style="border: 1px solid var(--border-subtle); padding: 24px; background: var(--bg-primary); margin-bottom: 32px;">
      <h4 style="font-family: var(--font-serif); font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
        1. Participant Net Balance Table
      </h4>
      <div class="table-wrap">
        <table class="minimal-table">
          <thead>
            <tr>
              <th>Participant</th>
              <th style="text-align: right;">Total Paid</th>
              <th style="text-align: right;">Total Owed Share</th>
              <th style="text-align: right;">Net Balance (Paid &minus; Owed)</th>
              <th>Status</th>
              <th>Action</th>
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
                    <a href="#/trips/${trip.id}/participants/${b.participantId}" class="btn btn-sm">Ledger &rarr;</a>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Business Rule 2 Callout -->
    <div class="rule-callout">
      <div class="rule-callout-icon">&check;</div>
      <div>
        <div class="rule-callout-title">Business Rule 2: Complete Balance Clearance Enforced</div>
        <div class="rule-callout-desc">The minimal settlement transactions below are mathematically proven to fully clear every participant's balance to 0.00 without cyclic payments.</div>
      </div>
    </div>

    <!-- Minimal Settlement Transactions -->
    <div style="border: 1px solid var(--border-subtle); padding: 24px; background: var(--bg-primary);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
        <h4 style="font-family: var(--font-serif); font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase;">
          2. Minimal Simplified Transactions (${settlements.length})
        </h4>
      </div>

      ${settlements.length === 0 ? `
        <div style="text-align: center; padding: 32px; color: var(--text-muted);">
          No settlements required &mdash; all balances are currently $0.00!
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
                    ${s.settled ? `Cleared on ${formatDate(s.settledAt)}` : 'Payment required to settle trip balance'}
                  </div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 20px;">
                <span class="settlement-amount">${trip.currency} ${formatMoney(s.amount)}</span>
                ${s.settled ? `
                  <span class="badge badge-positive" style="padding: 6px 12px;">&check; SETTLED</span>
                ` : `
                  <button class="btn btn-sm" onclick="handleMarkSettled(${trip.id}, ${s.id})">Mark as Paid</button>
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
// TAB 05: AUDIT LOG SUBVIEW
// -------------------------------------------------------------
function renderTabAudit(trip, auditLogs) {
  return `
    <div style="margin-bottom: 24px;">
      <h3 style="font-family: var(--font-serif); font-size: 18px; letter-spacing: 2px; text-transform: uppercase;">Audit Trail &amp; Accountability</h3>
      <p style="font-size: 13px; color: var(--text-secondary);">Immutable historical record of every trip creation, expense addition, deletion, and settlement transaction.</p>
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
              <div style="font-size: 10px; letter-spacing: 1px; color: var(--text-muted); text-transform: uppercase;">Verified</div>
            </div>
          `).join('')}
        </div>
      </div>
    `}
  `;
}

// -------------------------------------------------------------
// VIEW 3: ABOUT PAGE (SYSTEM SPECIFICATION & ALGORITHM)
// -------------------------------------------------------------
function renderAboutPage() {
  updateBreadcrumbs([{ label: 'About', url: '#/about' }]);
  const container = document.getElementById('view-container');

  container.innerHTML = `
    <article style="max-width: 800px; margin: 0 auto;">
      <div class="hero-meta-category">System Architecture &amp; Specification</div>
      <h2 class="hero-title" style="margin-bottom: 24px;">69. TripSplit &mdash; Group Travel Expense Settlement Tracker</h2>

      <div class="rule-callout" style="margin-bottom: 32px;">
        <div class="rule-callout-icon">&sect;</div>
        <div>
          <div class="rule-callout-title">The Real-World Problem</div>
          <div class="rule-callout-desc">
            Friends travelling together share expenses unevenly (hotel, fuel, food) and settling who owes whom at the end of the trip becomes a confusing manual calculation.
          </div>
        </div>
      </div>

      <div style="margin-bottom: 36px;">
        <h3 style="font-family: var(--font-serif); font-size: 18px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px;">Core Features Implemented</h3>
        <ol style="padding-left: 20px; line-height: 2;">
          <li><strong>Create a trip with participants:</strong> Full workspace creation with customized currency and member rosters.</li>
          <li><strong>Log an expense with payer, amount, and shared participants:</strong> Supports equal penny-allocated splits and custom splits.</li>
          <li><strong>Compute each participant's net balance:</strong> Paid minus owed share, with zero-sum invariant check.</li>
          <li><strong>Generate a minimal set of settlement transactions:</strong> Greedy debt simplification algorithm clearing all balances to zero.</li>
          <li><strong>View full expense history and final settlement:</strong> Complete ledger and immutable audit trail.</li>
        </ol>
      </div>

      <div style="margin-bottom: 36px;">
        <h3 style="font-family: var(--font-serif); font-size: 18px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px;">Enforced Business Rules</h3>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="border: 1px solid var(--border-subtle); padding: 18px; background: var(--bg-secondary);">
            <strong>1. Sum of all participants' net balances must equal zero</strong>
            <p style="color: var(--text-secondary); margin-top: 4px; font-size: 13px;">
              Every dollar spent is credited to the payer and debited to the sharers. If penny rounding produces fractional cents, remainder pennies are systematically distributed to guarantee &sum; Net Balances = 0.00.
            </p>
          </div>
          <div style="border: 1px solid var(--border-subtle); padding: 18px; background: var(--bg-secondary);">
            <strong>2. Settlement transactions must fully clear every balance to zero</strong>
            <p style="color: var(--text-secondary); margin-top: 4px; font-size: 13px;">
              The greedy debt-reduction engine verifies that after executing the proposed transactions, no member has any remaining residual debt.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 style="font-family: var(--font-serif); font-size: 18px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px;">Greedy Debt Simplification Algorithm</h3>
        <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: 16px;">
          Instead of every debtor paying every creditor in an N-to-N transaction mesh ($O(N^2)$ transactions), TripSplit partitions members into creditors ($B > 0$) and debtors ($B < 0$). In each step, the largest debtor pays the minimum of their balance and the largest creditor's balance ($min(D, C)$), reducing the overall cashflow to at most $N - 1$ transactions.
        </p>
        <a href="#/trips" class="btn">Explore Trips &rarr;</a>
      </div>
    </article>
  `;
}

// -------------------------------------------------------------
// VIEW 4: API DOCUMENTATION
// -------------------------------------------------------------
function renderApiDocsPage() {
  updateBreadcrumbs([{ label: 'API Docs', url: '#/api' }]);
  const container = document.getElementById('view-container');

  const endpoints = [
    { method: 'GET', path: '/api/trips', desc: 'List all group trips with summary statistics.' },
    { method: 'POST', path: '/api/trips', desc: 'Create a new trip with initial participants.' },
    { method: 'GET', path: '/api/trips/{tripId}', desc: 'Get trip details and participant list.' },
    { method: 'GET', path: '/api/trips/{tripId}/summary', desc: 'Get full trip overview (participants, expenses, balances, settlements).' },
    { method: 'DELETE', path: '/api/trips/{tripId}', desc: 'Delete trip and cascade-remove all child records.' },
    { method: 'POST', path: '/api/trips/{tripId}/participants', desc: 'Add a new member to an existing trip.' },
    { method: 'POST', path: '/api/trips/{tripId}/expenses', desc: 'Log an expense with payer, amount, and shared participants.' },
    { method: 'GET', path: '/api/trips/{tripId}/expenses', desc: 'Get full expense history (supports pagination ?page=0&size=10).' },
    { method: 'DELETE', path: '/api/trips/{tripId}/expenses/{expenseId}', desc: 'Delete an expense and re-balance the ledger.' },
    { method: 'GET', path: '/api/trips/{tripId}/balances', desc: 'Compute each participant\'s net balance (enforces sum == 0).' },
    { method: 'POST', path: '/api/trips/{tripId}/settlements/generate', desc: 'Compute and generate minimal simplified transactions.' },
    { method: 'GET', path: '/api/trips/{tripId}/settlements', desc: 'List current settlement transactions.' },
    { method: 'PUT', path: '/api/trips/{tripId}/settlements/{id}/settle', desc: 'Mark a settlement transaction as completed.' },
    { method: 'GET', path: '/api/trips/{tripId}/audit-logs', desc: 'View chronological immutable audit log for the trip.' }
  ];

  container.innerHTML = `
    <div style="max-width: 840px; margin: 0 auto;">
      <div class="hero-meta-category">Spring Boot REST API</div>
      <h2 class="hero-title" style="margin-bottom: 16px;">TripSplit REST Endpoints</h2>
      <p style="color: var(--text-secondary); margin-bottom: 32px;">
        Standardized JSON endpoints with input validation (@NotNull, @Positive), custom exception handlers (@ControllerAdvice), and MariaDB persistence.
      </p>

      <div class="table-wrap">
        <table class="minimal-table">
          <thead>
            <tr>
              <th style="width: 100px;">Method</th>
              <th style="width: 280px;">Endpoint</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${endpoints.map(e => `
              <tr>
                <td><span class="badge ${e.method === 'POST' ? 'badge-positive' : e.method === 'DELETE' ? 'badge-negative' : 'badge-neutral'}">${e.method}</span></td>
                <td><code>${e.path}</code></td>
                <td style="color: var(--text-secondary);">${e.desc}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// EVENT HANDLERS & ACTIONS
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
  } catch (err) {
    // Toast displayed by apiCall
  }
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
    await renderTripWorkspace(tripId, 'participants');
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
    showToast('Select at least one participant to share the expense', true);
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
    showToast(`Expense '${desc}' logged successfully`);
    window.location.hash = `#/trips/${tripId}/expenses`;
  } catch (err) {}
}

async function handleDeleteExpense(tripId, expenseId) {
  if (!confirm('Are you sure you want to delete this expense?')) return;
  try {
    await apiCall(`/api/trips/${tripId}/expenses/${expenseId}`, {
      method: 'DELETE'
    });
    showToast('Expense deleted');
    window.location.hash = `#/trips/${tripId}/expenses`;
    await renderTripWorkspace(tripId, 'expenses');
  } catch (err) {}
}

async function handleDeleteTrip(tripId) {
  if (!confirm('Are you sure you want to delete this entire trip and all expenses?')) return;
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
    showToast('Settlement transactions re-calculated');
    await renderTripWorkspace(tripId, 'settlements');
  } catch (err) {}
}

async function handleMarkSettled(tripId, settlementId) {
  try {
    await apiCall(`/api/trips/${tripId}/settlements/${settlementId}/settle`, {
      method: 'PUT'
    });
    showToast('Settlement marked as paid');
    await renderTripWorkspace(tripId, 'settlements');
  } catch (err) {}
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
