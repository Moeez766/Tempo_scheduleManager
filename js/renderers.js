import { MINI_CALENDAR_DAYS, SITES } from './mockData.js';
import {
  getActiveWeekDays,
  getActiveWeekSummary,
  getFilteredShifts,
  getFilteredStaff,
  isManager,
  state,
} from './store.js';

const HOURS_AXIS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
];

export function renderLoginScreen(containerEl) {
  const isRegister = state.authMode === 'register';

  containerEl.innerHTML = `
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-brand-row">
          <div class="brand-logo" style="margin-bottom:0;">
            <span class="brand-text">Tempo</span>
            <span class="brand-badge">LAB</span>
          </div>
          <span class="status-tag confirmed">v2.0 RBAC</span>
        </div>
        <p class="auth-subtitle">
          Sign in to access your workspace. Managers have full roster editing privileges; employees can view schedules and request leave.
        </p>
      </div>

      <div class="auth-tabs" role="tablist">
        <button
          type="button"
          class="auth-tab-btn ${!isRegister ? 'active' : ''}"
          data-action="switch-auth-mode"
          data-mode="login"
        >
          Sign In
        </button>
        <button
          type="button"
          class="auth-tab-btn ${isRegister ? 'active' : ''}"
          data-action="switch-auth-mode"
          data-mode="register"
        >
          Register
        </button>
      </div>

      ${
        !isRegister
          ? `
        <div class="demo-role-box">
          <div class="demo-role-title">1-Click Role Demo Sign-In</div>
          <div class="demo-role-pills">
            <button
              type="button"
              class="demo-pill-btn"
              data-action="quick-demo-login"
              data-email="virk@tempo-lab.io"
            >
              <strong>Virk (Manager)</strong>
              <span>Full Edit &amp; Publish</span>
            </button>
            <button
              type="button"
              class="demo-pill-btn"
              data-action="quick-demo-login"
              data-email="carol@tempo-lab.io"
            >
              <strong>Carol (Employee)</strong>
              <span>View &amp; Leave Only</span>
            </button>
          </div>
        </div>
      `
          : ''
      }

      ${state.authError ? `<div class="auth-error-msg">${state.authError}</div>` : ''}

      <form id="authMainForm" style="display:flex; flex-direction:column; gap:12px;">
        <div class="form-section-card">
          ${
            isRegister
              ? `
            <label class="field-label">Full Name</label>
            <div class="input-surface">
              <input type="text" name="name" placeholder="e.g. Alex Mercer" required />
            </div>

            <label class="field-label">Account Role</label>
            <div class="input-surface">
              <select name="roleType">
                <option value="employee">Employee (View Schedule &amp; Request Leave)</option>
                <option value="manager">Manager (Full Roster Authority)</option>
              </select>
            </div>
          `
              : ''
          }

          <label class="field-label">Work Email</label>
          <div class="input-surface">
            <input
              type="email"
              name="email"
              value="${isRegister ? '' : 'virk@tempo-lab.io'}"
              placeholder="name@tempo-lab.io"
              required
            />
          </div>

          <label class="field-label">Password</label>
          <div class="input-surface">
            <input
              type="password"
              name="password"
              value="${isRegister ? '' : 'password123'}"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button type="submit" class="btn-auth-submit">
          ${isRegister ? 'Create Account & Enter Workspace →' : 'Sign In to Tempo LAB →'}
        </button>
      </form>
    </div>
  `;
}

export function renderFabPopover(popoverEl) {
  const manager = isManager();

  popoverEl.innerHTML = `
    <div class="fab-popover-header">
      ${manager ? 'Manager Quick Actions' : 'Employee Quick Actions'}
    </div>

    ${
      manager
        ? `
      <button class="fab-menu-item" type="button" data-action="open-new-shift">
        <span class="fab-badge mint">
          <svg class="icon-sm" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="12" y1="11" x2="12" y2="17" />
            <line x1="9" y1="14" x2="15" y2="14" />
          </svg>
        </span>
        <span class="fab-item-text">
          <strong>New shift</strong>
          <small>Create shift or open roster slot</small>
        </span>
      </button>
    `
        : ''
    }

    <button class="fab-menu-item" type="button" data-action="open-leave-request">
      <span class="fab-badge lavender">
        <svg class="icon-sm" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <circle cx="12" cy="15" r="2" />
        </svg>
      </span>
      <span class="fab-item-text">
        <strong>Leave request</strong>
        <small>Paid annual, sick, or day off</small>
      </span>
    </button>

    <button class="fab-menu-item" type="button" data-action="open-shift-swap">
      <span class="fab-badge peach">
        <svg class="icon-sm" viewBox="0 0 24 24">
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      </span>
      <span class="fab-item-text">
        <strong>${manager ? 'Inspect conflicts & swaps' : 'View shift schedule details'}</strong>
        <small>${manager ? 'Resolve team shift conflicts' : 'Check shift hours & assigned team'}</small>
      </span>
    </button>
  `;
}

export function renderAdvancedFilterPanel(container) {
  if (!state.isFilterOpen) {
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');

  const summary = getActiveWeekSummary();
  const availableTeams = ['Bar staff', 'Waiters/Waitresses'].filter(
    (t) => !state.selectedTeams.includes(t)
  );

  container.innerHTML = `
    <div>
      <div class="filter-panel-header">
        <div class="filter-panel-title">
          <svg class="icon-sm" viewBox="0 0 24 24">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span>Advanced Filter</span>
        </div>
        <button class="icon-btn-subtle" type="button" data-action="close-filter-panel" aria-label="Close filter">
          ✕
        </button>
      </div>

      <div class="custom-date-box">
        <label for="customJumpDate">Jump to Custom Date</label>
        <input
          id="customJumpDate"
          type="date"
          value="${state.selectedDateISO}"
          data-action="jump-custom-date"
        />
      </div>

      <div class="mini-cal-month">
        <span>${summary.monthTitle}</span>
        <span style="color: var(--accent-teal-link); font-size: 10px;">${summary.weekCode}</span>
      </div>

      <div class="mini-cal-grid">
        ${['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
          .map((w) => `<div class="mini-cal-weekday">${w}</div>`)
          .join('')}
        ${MINI_CALENDAR_DAYS.map(
          (item) => `
          <button
            type="button"
            class="mini-cal-day ${item.muted ? 'muted' : ''} ${
            !item.muted && state.selectedCalDay === item.day ? 'active' : ''
          }"
            data-action="select-cal-day"
            data-day="${item.day}"
          >
            <span>${item.day}</span>
            <span class="cal-dot-row">
              ${item.dots
                .map((color) => `<span class="cal-dot" style="background:${color};"></span>`)
                .join('')}
            </span>
          </button>
        `
        ).join('')}
      </div>

      <div class="filter-accordion-box">
        <span>By Status</span>
        <select data-action="filter-status-change">
          ${['All', 'Confirmed', 'Conflict', 'Open']
            .map(
              (st) =>
                `<option value="${st}" ${state.statusFilter === st ? 'selected' : ''}>${st}</option>`
            )
            .join('')}
        </select>
      </div>

      <div class="filter-accordion-box active-tint">
        <span>By Team</span>
        <strong>${state.selectedTeams.length} selected</strong>
      </div>

      <div class="filter-chips-wrap">
        ${state.selectedTeams
          .map(
            (team) => `
          <button
            type="button"
            class="team-filter-chip"
            data-action="remove-team-chip"
            data-team="${team}"
          >
            <span>${team}</span>
            <span>✕</span>
          </button>
        `
          )
          .join('')}
      </div>

      ${
        availableTeams.length > 0
          ? `
        <div class="filter-accordion-box">
          <span>Add Team</span>
          <select data-action="add-team-chip">
            <option value="">+ Select...</option>
            ${availableTeams.map((t) => `<option value="${t}">${t}</option>`).join('')}
          </select>
        </div>
      `
          : ''
      }

      <div class="filter-accordion-box">
        <span>By Site</span>
        <strong>Oatley NSW</strong>
      </div>
    </div>

    <div class="filter-footer-btns">
      <button class="btn-filter-reset" type="button" data-action="reset-filters">Reset Filter</button>
      <button class="btn-filter-apply" type="button" data-action="apply-filters">Apply</button>
    </div>
  `;
}

function renderScheduleHeader() {
  const isStaff = state.scheduleView === 'staff';
  const summary = getActiveWeekSummary();
  const days = getActiveWeekDays();

  return `
    <div class="days-header-row ${isStaff ? 'staff-mode' : ''}">
      <div class="day-header-cell budget-summary">
        <span class="day-kicker">${summary.weekCode}</span>
        <span class="day-budget-num">${summary.budgetText}</span>
        <span class="budget-link" data-action="navigate" data-page="dashboard">Weekly Budget →</span>
      </div>
      ${days
        .map(
          (d) => `
        <div class="day-header-cell ${d.highlight ? 'tue-highlight' : ''}">
          <span class="day-kicker">${d.short}</span>
          <span class="day-number">${d.dateNum}</span>
          <span class="day-meta">
            ${d.hoursLabel} · ${
            d.overBudget
              ? `<span class="over-budget-text">${d.budgetLabel}</span>`
              : d.budgetLabel
          }
          </span>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

function renderShiftTimelineView() {
  const shifts = getFilteredShifts();
  const days = getActiveWeekDays();
  const manager = isManager();

  return `
    <div class="schedule-scroll-container">
      ${renderScheduleHeader()}
      <div class="timeline-grid">
        <div class="current-time-indicator"></div>

        <div class="time-gutter">
          ${HOURS_AXIS.map((hr) => `<div class="time-label">${hr}</div>`).join('')}
        </div>

        ${days
          .map((day) => {
            const dayShifts = shifts.filter((s) => s.dayIndex === day.index);
            return `
            <div class="day-column-track ${day.highlight ? 'tue-highlight' : ''}">
              ${dayShifts
                .map((shift) => {
                  const topPx = Math.max(16, (shift.startHour - 8) * 46 + 66);
                  const heightPx = Math.max(134, shift.durationHours * 41);

                  return `
                    <article
                      class="shift-card ${shift.accentColor}"
                      style="top:${topPx}px; height:${heightPx}px;"
                      data-action="open-shift-details"
                      data-shift-id="${shift.id}"
                    >
                      <div class="shift-time-heading">${shift.cardTitle}</div>
                      <div class="shift-stat-line">
                        <svg class="icon-xs" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="9" />
                          <polyline points="12 7 12 12 15 15" />
                        </svg>
                        <span><strong>${shift.durationHours}h</strong></span>
                      </div>

                      ${
                        shift.cost !== null
                          ? `
                        <div class="shift-stat-line">
                          <span>$</span>
                          <span><strong>$${shift.cost}</strong></span>
                        </div>
                      `
                          : ''
                      }

                      ${
                        shift.isUnassigned
                          ? manager
                            ? `
                          <button
                            class="assign-cta-pill"
                            type="button"
                            data-action="open-shift-details"
                            data-shift-id="${shift.id}"
                          >
                            + Assign
                          </button>
                        `
                            : `<span style="font-size:10px; color:var(--text-muted); font-weight:600;">Open Shift</span>`
                          : `
                        <div class="shift-stat-line">
                          <svg class="icon-xs" viewBox="0 0 24 24">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                          </svg>
                          <span><strong>${shift.confirmedCount}</strong>/${shift.totalSlots} confirmed</span>
                        </div>
                        <div class="avatar-group">
                          ${shift.assignees
                            .map(
                              (a) => `
                            <span class="avatar-pill" style="background:${a.avatarBg || '#3BB2B8'};">
                              ${a.initials}
                            </span>
                          `
                            )
                            .join('')}
                          <span class="avatar-pill" style="background:#E6E3F0; color:#318389;">+6</span>
                        </div>
                      `
                      }
                    </article>
                  `;
                })
                .join('')}
            </div>
          `;
          })
          .join('')}
      </div>
    </div>
  `;
}

function renderStaffSwimlaneView() {
  const staffList = getFilteredStaff();
  const days = getActiveWeekDays();
  const isGroupCollapsed = Boolean(state.collapsedGroups['bar-staff']);

  return `
    <div class="schedule-scroll-container">
      ${renderScheduleHeader()}

      <div
        class="swimlane-group-header"
        data-action="toggle-swimlane-group"
        data-group="bar-staff"
      >
        <span>${isGroupCollapsed ? '▸' : '▾'} Bar &amp; Floor Staff (${staffList.length})</span>
        <span style="font-size:11px; color:var(--text-muted);">Click any block to inspect</span>
      </div>

      ${
        isGroupCollapsed
          ? ''
          : staffList
              .map(
                (member) => `
        <div class="swimlane-row">
          <div class="staff-identity-cell">
            <div>
              <div class="staff-name-row">
                <span class="staff-initials-tag">${member.initials}</span>
                <strong style="font-size:11.5px;">${member.name}</strong>
              </div>
              <div style="font-size:10px; color:var(--text-muted);">
                ${member.role} · ${member.weeklyHours}h
              </div>
            </div>
            <div>
              <div style="font-size:11px; font-weight:800;">$${member.weeklyPay}</div>
              <div style="font-size:9.5px; color:var(--accent-teal-dark); font-weight:600;">
                Leave: ${member.remainingLeaveDays}d left
              </div>
            </div>
          </div>

          ${days
            .map((day) => {
              const blocks = member.blocks.filter(
                (b) => (b.weekOffset ?? 0) === state.weekOffset && b.dayIndex === day.index
              );
              return `
              <div class="swimlane-day-cell ${day.highlight ? 'tue-highlight' : ''}">
                ${blocks
                  .map(
                    (blk) => `
                  <div
                    class="swimlane-block ${blk.type}"
                    data-action="open-swimlane-block"
                    data-block-type="${blk.type}"
                    data-shift-id="${blk.shiftId || 'sh-106'}"
                  >
                    <div style="font-weight:700;">${blk.title}</div>
                    <div style="font-size:8.5px; opacity:0.88;">${blk.meta}</div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            `;
            })
            .join('')}
        </div>
      `
              )
              .join('')
      }
    </div>
  `;
}

function renderMonthOverview() {
  const summary = getActiveWeekSummary();
  return `
    <div class="page-scroll-body">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h2 style="font-size:17px; font-weight:800;">${summary.monthTitle} — Monthly Coverage Overview</h2>
        <button class="btn-publish-pill" type="button" data-action="set-period" data-period="week">
          Return to Weekly Grid
        </button>
      </div>
      <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:8px;">
        ${MINI_CALENDAR_DAYS.map(
          (item) => `
          <div style="background:var(--bg-subtle); border-radius:12px; padding:12px; min-height:84px; opacity:${
            item.muted ? 0.5 : 1
          };">
            <div style="font-weight:800; font-size:13px; margin-bottom:6px;">${item.day} Aug</div>
            <div style="font-size:10px; color:var(--accent-teal-dark); font-weight:700;">
              ${item.dots.length * 4}h Scheduled
            </div>
          </div>
        `
        ).join('')}
      </div>
    </div>
  `;
}

function renderDashboardPage() {
  const manager = isManager();
  const summary = getActiveWeekSummary();
  const totalShifts = state.shifts.length;
  const conflictCount = state.shifts.reduce(
    (acc, s) => acc + s.assignees.filter((a) => a.status === 'conflict').length,
    0
  );

  return `
    <div class="page-scroll-body">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h1 style="font-size:20px; font-weight:800;">Operations &amp; Workforce Dashboard</h1>
          <p style="font-size:12px; color:var(--text-muted);">${summary.weekCode} · Oatley NSW Site Overview</p>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="pill-btn" type="button" data-action="open-leave-request">Request Leave</button>
          ${
            manager
              ? `<button class="btn-publish-pill" type="button" data-action="open-new-shift">+ New Shift</button>`
              : ''
          }
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div>
            <div style="font-size:11px; color:var(--text-muted); font-weight:600;">Weekly Labor Budget</div>
            <div style="font-size:24px; font-weight:800; margin-top:2px;">${summary.budgetText}</div>
          </div>
          <span class="status-tag confirmed">On Track</span>
        </div>

        <div class="kpi-card">
          <div>
            <div style="font-size:11px; color:var(--text-muted); font-weight:600;">Total Scheduled Shifts</div>
            <div style="font-size:24px; font-weight:800; margin-top:2px;">${totalShifts}</div>
          </div>
          <span class="status-tag pending">${summary.weekCode} Roster</span>
        </div>

        <div class="kpi-card">
          <div>
            <div style="font-size:11px; color:var(--text-muted); font-weight:600;">Schedule Conflicts</div>
            <div style="font-size:24px; font-weight:800; margin-top:2px;">${conflictCount}</div>
          </div>
          <button class="status-tag conflict" style="border:none; cursor:pointer;" data-action="open-shift-swap">
            ${manager ? 'Resolve →' : 'Inspect →'}
          </button>
        </div>
      </div>

      <div style="background:var(--bg-subtle); border-radius:16px; padding:18px;">
        <h3 style="font-size:14px; font-weight:800; margin-bottom:10px;">Recent Roster Activity</h3>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${state.shifts
            .slice(0, 4)
            .map(
              (s) => `
            <div
              style="background:#fff; padding:12px 14px; border-radius:12px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;"
              data-action="open-shift-details"
              data-shift-id="${s.id}"
            >
              <div>
                <strong style="font-size:12.5px;">${s.cardTitle} (${s.startDate})</strong>
                <div style="font-size:11px; color:var(--text-muted);">${s.site} · ${s.durationHours}h</div>
              </div>
              <span class="status-tag ${s.isUnassigned ? 'pending' : 'confirmed'}">
                ${s.isUnassigned ? 'Open Shift' : `${s.assignees.length} Assigned`}
              </span>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

function renderEmployeesPage() {
  return `
    <div class="page-scroll-body">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h1 style="font-size:20px; font-weight:800;">Team &amp; Staff Directory</h1>
          <p style="font-size:12px; color:var(--text-muted);">Manage hourly rates, roles, and leave balances</p>
        </div>
        <button class="btn-publish-pill" type="button" data-action="open-leave-request">
          + Request Employee Leave
        </button>
      </div>

      <div class="kpi-grid">
        ${state.staff
          .map(
            (m) => `
          <div style="background:var(--bg-subtle); border-radius:16px; padding:18px; display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="staff-initials-tag" style="width:40px; height:40px; font-size:13px;">
                ${m.initials}
              </div>
              <div>
                <div style="font-size:14px; font-weight:800;">${m.name}</div>
                <div style="font-size:11px; color:var(--text-muted);">${m.role} · ${m.team}</div>
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:12px; background:#fff; padding:10px 12px; border-radius:10px;">
              <span>Rate: <strong>$${m.hourlyRate}/h</strong></span>
              <span>Leave Balance: <strong style="color:var(--accent-teal-dark);">${m.remainingLeaveDays} days</strong></span>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderHomePage() {
  return `
    <div class="page-scroll-body" style="justify-content:center; align-items:center; text-align:center;">
      <div style="max-width:560px; display:flex; flex-direction:column; align-items:center; gap:16px;">
        <span class="status-tag confirmed" style="font-size:11px; padding:5px 12px;">
          Tempo LAB · Workforce Scheduling Suite
        </span>
        <h1 style="font-size:32px; font-weight:800; line-height:1.18;">
          Shift Planning, Staff Rosters &amp; Leave Approval in One Place
        </h1>
        <p style="font-size:13.5px; color:var(--text-secondary); line-height:1.6;">
          Switch seamlessly between hourly timeline blocks and staff swimlanes, inspect scheduling
          conflicts, and submit team leave requests with live duration math.
        </p>
        <div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center; margin-top:6px;">
          <button
            type="button"
            class="btn-filter-apply"
            style="padding:0 22px; height:40px; font-size:13px;"
            data-action="navigate"
            data-page="shifts"
          >
            Open Shift Schedule →
          </button>
          <button
            type="button"
            class="pill-btn"
            style="height:40px; padding:0 20px;"
            data-action="navigate"
            data-page="dashboard"
          >
            View HR Dashboard
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderWorkspace(container, toolbarRightEl, controlsLeftEl) {
  const isSchedulePage = state.activePage === 'shifts';
  toolbarRightEl.classList.toggle('hidden', !isSchedulePage);
  controlsLeftEl.classList.toggle('hidden', !isSchedulePage);

  if (state.activePage === 'home') {
    container.innerHTML = renderHomePage();
    return;
  }
  if (state.activePage === 'dashboard') {
    container.innerHTML = renderDashboardPage();
    return;
  }
  if (state.activePage === 'employees') {
    container.innerHTML = renderEmployeesPage();
    return;
  }

  if (state.periodMode === 'month') {
    container.innerHTML = renderMonthOverview();
    return;
  }

  container.innerHTML =
    state.scheduleView === 'staff' ? renderStaffSwimlaneView() : renderShiftTimelineView();
}

export function renderSlideDrawer(backdropEl, drawerEl) {
  if (!state.activeDrawer) {
    backdropEl.classList.add('hidden');
    drawerEl.innerHTML = '';
    return;
  }

  backdropEl.classList.remove('hidden');

  if (state.activeDrawer === 'shift-details') {
    const manager = isManager();
    const shift = state.shifts.find((s) => s.id === state.selectedShiftId) || state.shifts[0];
    const unassignedStaff = state.staff.filter(
      (st) => !shift.assignees.some((a) => a.id === st.id)
    );

    drawerEl.innerHTML = `
      <div class="drawer-top-header dashed">
        <div>
          <h2 class="drawer-title">Shift details</h2>
          <p class="drawer-subtitle">Last edited 3d ago</p>
        </div>
        <div class="drawer-header-actions">
          ${
            manager
              ? `
            <button
              class="btn-trash"
              type="button"
              data-action="delete-shift"
              data-shift-id="${shift.id}"
              title="Delete shift"
            >
              <svg class="icon-xs" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
            </button>
            <button class="btn-publish-pill" type="submit" form="shiftDetailsForm">
              <span>Re-publish</span>
              <span>✓</span>
            </button>
          `
              : `
            <button class="icon-btn-subtle" type="button" data-action="close-drawer">✕</button>
          `
          }
        </div>
      </div>

      <form id="shiftDetailsForm" class="drawer-form-body" data-shift-id="${shift.id}">
        ${
          !manager
            ? `
          <div class="readonly-banner">
            <span>🔒 Read-only view: Only Managers can edit or delete shifts.</span>
          </div>
        `
            : ''
        }

        <div class="form-section-card">
          <label class="field-label">Site</label>
          <div class="input-surface" style="height:auto; padding:9px 11px;">
            <div style="width:100%;">
              <select name="site" ${!manager ? 'disabled' : ''}>
                ${SITES.map(
                  (site) =>
                    `<option value="${site.name}" ${
                      shift.site === site.name ? 'selected' : ''
                    }>${site.name}</option>`
                ).join('')}
              </select>
              <div style="font-size:10.5px; color:var(--text-secondary); margin-top:2px;">
                ${shift.city}
              </div>
            </div>
          </div>
        </div>

        <div class="form-section-card">
          <label class="field-label">Start</label>
          <div class="two-col-inputs">
            <div class="input-surface">
              <input type="text" name="startTime" value="${shift.startTime}" data-live-duration="details" ${!manager ? 'disabled' : ''} />
            </div>
            <div class="input-surface">
              <input type="text" name="startDate" value="${shift.startDate}" ${!manager ? 'disabled' : ''} />
            </div>
          </div>

          <div class="field-label-row" style="margin-top:4px;">
            <label class="field-label">End</label>
            <label class="checkbox-label">
              <input type="checkbox" name="sameDay" ${shift.startDate === shift.endDate ? 'checked' : ''} ${!manager ? 'disabled' : ''} />
              <span>Same day</span>
            </label>
          </div>

          <div class="two-col-inputs">
            <div class="input-surface">
              <input type="text" name="endTime" value="${shift.endTime}" data-live-duration="details" ${!manager ? 'disabled' : ''} />
            </div>
            <div class="input-surface">
              <input type="text" name="endDate" value="${shift.endDate}" ${!manager ? 'disabled' : ''} />
            </div>
          </div>

          <div class="field-label-row" style="margin-top:4px;">
            <label class="checkbox-label">
              <input type="checkbox" name="hasBreak" data-live-duration="details" ${!manager ? 'disabled' : ''} />
              <span>Break</span>
            </label>
            <span class="duration-readout">
              Est Duration <strong id="detailsEstDuration">${shift.durationHours}h</strong>
            </span>
          </div>
        </div>

        <div class="form-section-card">
          <div class="field-label-row">
            <label class="field-label">Assignees (${shift.assignees.length})</label>
            <span style="font-size:11px; color:var(--text-muted);">
              ${shift.isUnassigned ? 'Open Shift' : 'Assigned'}
            </span>
          </div>

          ${
            manager && unassignedStaff.length > 0
              ? `
            <div class="input-surface">
              <select data-action="quick-assign-staff" data-shift-id="${shift.id}">
                <option value="">+ Assign team member...</option>
                ${unassignedStaff.map((st) => `<option value="${st.id}">${st.name} (${st.role})</option>`).join('')}
              </select>
            </div>
          `
              : ''
          }

          ${shift.assignees
            .map(
              (person) => `
            <div class="assignee-item-card">
              ${
                manager
                  ? `
                <button
                  class="remove-assignee-btn"
                  type="button"
                  data-action="remove-assignee"
                  data-shift-id="${shift.id}"
                  data-assignee-id="${person.id}"
                >
                  ✕
                </button>
              `
                  : ''
              }
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="staff-initials-tag" style="width:32px; height:32px;">${person.initials}</span>
                <div>
                  <div style="font-size:12.5px; font-weight:700;">${person.name}</div>
                  <div style="font-size:10px; color:#7E7A8F;">
                    ${person.role} · <strong style="color:var(--text-primary);">$${person.hourlyRate}</strong>/h
                  </div>
                </div>
              </div>
              <span class="status-tag ${person.status}">
                ${
                  person.status === 'conflict'
                    ? '! Schedule conflict'
                    : person.status === 'pending'
                    ? 'Pending'
                    : 'Confirmed'
                }
              </span>
            </div>
          `
            )
            .join('')}
        </div>
      </form>
    `;
    return;
  }

  if (state.activeDrawer === 'new-shift') {
    const days = getActiveWeekDays();
    drawerEl.innerHTML = `
      <div class="drawer-top-header">
        <h2 class="drawer-title">New shift</h2>
        <button class="btn-publish-pill" type="submit" form="newShiftForm">
          <span>Publish</span>
          <span>✓</span>
        </button>
      </div>

      <form id="newShiftForm" class="drawer-form-body">
        <div class="form-section-card">
          <label class="field-label">Site</label>
          <div class="input-surface">
            <select name="site">
              ${SITES.map((s) => `<option value="${s.name}">${s.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-section-card">
          <label class="field-label">Start</label>
          <div class="two-col-inputs">
            <div class="input-surface">
              <input type="text" name="startTime" value="09:00" data-live-duration="new" />
            </div>
            <div class="input-surface">
              <select name="dayIndex">
                ${days
                  .map(
                    (d) =>
                      `<option value="${d.index}" ${d.index === 4 ? 'selected' : ''}>${d.fullDate} (${d.short})</option>`
                  )
                  .join('')}
              </select>
            </div>
          </div>

          <div class="field-label-row" style="margin-top:4px;">
            <label class="field-label">End</label>
            <label class="checkbox-label">
              <input type="checkbox" name="sameDay" checked />
              <span>Same day</span>
            </label>
          </div>

          <div class="two-col-inputs">
            <div class="input-surface">
              <input type="text" name="endTime" value="15:00" data-live-duration="new" />
            </div>
            <div class="input-surface disabled">
              <span>Same Day</span>
            </div>
          </div>

          <div class="field-label-row" style="margin-top:4px;">
            <label class="checkbox-label">
              <input type="checkbox" name="hasBreak" data-live-duration="new" />
              <span>Break</span>
            </label>
            <span class="duration-readout">
              Est Duration <strong id="newShiftEstDuration">6h</strong>
            </span>
          </div>
        </div>

        <div class="form-section-card">
          <div class="field-label-row">
            <label class="field-label">Assignees</label>
            <label class="checkbox-label">
              <input type="checkbox" name="openShift" />
              <span>Open Shift</span>
            </label>
          </div>
          <div class="input-surface">
            <select name="assigneeId">
              ${state.staff
                .map((st) => `<option value="${st.id}">${st.name} · ${st.role}</option>`)
                .join('')}
            </select>
          </div>
        </div>

        <div class="form-section-card">
          <label class="field-label">Notes</label>
          <textarea class="textarea-surface" name="notes" placeholder="(Optional)"></textarea>
        </div>
      </form>
    `;
    return;
  }

  if (state.activeDrawer === 'leave-request') {
    const defaultEmpId = state.currentUser?.staffId || 'st-2';
    const selectedEmp = state.staff.find((s) => s.id === defaultEmpId) || state.staff[0];

    drawerEl.innerHTML = `
      <div class="drawer-top-header">
        <div>
          <h2 class="drawer-title">Request leave</h2>
          <p class="drawer-subtitle">Requires manager approval</p>
        </div>
        <button class="btn-publish-pill" type="submit" form="leaveRequestForm">
          <span>Submit</span>
          <span>✓</span>
        </button>
      </div>

      <form id="leaveRequestForm" class="drawer-form-body">
        <div class="form-section-card">
          <label class="field-label">Employee</label>
          <div class="input-surface" style="height:44px;">
            <select name="employeeId">
              ${state.staff
                .map(
                  (st) =>
                    `<option value="${st.id}" ${st.id === selectedEmp.id ? 'selected' : ''}>${st.name} (${st.team})</option>`
                )
                .join('')}
            </select>
          </div>
        </div>

        <div class="form-section-card">
          <label class="field-label">Leave type</label>
          <div class="input-surface">
            <select name="leaveType">
              <option value="Annual leave (Paid)">Annual leave (Paid)</option>
              <option value="Sick leave">Sick leave</option>
              <option value="Personal day off">Personal day off</option>
            </select>
          </div>
        </div>

        <div class="form-section-card">
          <label class="field-label">Start date</label>
          <div class="two-col-inputs">
            <div class="input-surface">
              <input type="text" name="startTime" value="08:00" />
            </div>
            <div class="input-surface">
              <input type="text" name="startDate" value="28 Aug 2024" />
            </div>
          </div>

          <div class="field-label-row" style="margin-top:4px;">
            <label class="field-label">End date</label>
            <label class="checkbox-label">
              <input type="checkbox" name="allDay" checked />
              <span>All day</span>
            </label>
          </div>

          <div class="two-col-inputs">
            <div class="input-surface">
              <input type="text" name="endTime" value="18:00" />
            </div>
            <div class="input-surface">
              <input type="text" name="endDate" value="29 Aug 2024" />
            </div>
          </div>

          <div class="field-label-row" style="margin-top:4px;">
            <span class="balance-pill">Remaining: ${selectedEmp.remainingLeaveDays} days</span>
            <span class="duration-readout">Est Duration <strong>2 days (16h)</strong></span>
          </div>
        </div>

        <div class="form-section-card">
          <label class="field-label">Reason</label>
          <textarea
            class="textarea-surface"
            name="reason"
            placeholder="(Optional) Add note or attach reason..."
          ></textarea>
        </div>
      </form>
    `;
  }
}