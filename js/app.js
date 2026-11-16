import {
  addAssigneeToShift,
  addShiftToStore,
  calculateDurationHours,
  deleteShiftFromStore,
  getActiveWeekSummary,
  isManager,
  jumpToCustomDate,
  loginWithCredentials,
  logoutUser,
  registerAccount,
  removeAssigneeFromShift,
  state,
  submitLeaveRequestToStore,
  updateShiftInStore,
} from './store.js';
import {
  renderAdvancedFilterPanel,
  renderFabPopover,
  renderLoginScreen,
  renderSlideDrawer,
  renderWorkspace,
} from './renderers.js';

const dom = {
  loginScreen: document.getElementById('loginScreen'),
  appShell: document.getElementById('appShell'),
  filterPanel: document.getElementById('advancedFilterPanel'),
  workspace: document.getElementById('workspaceContent'),
  toolbarLeft: document.getElementById('scheduleControlsLeft'),
  toolbarRight: document.getElementById('scheduleControlsRight'),
  quickPills: document.getElementById('quickFilterPills'),
  quickStatusLabel: document.getElementById('quickStatusLabel'),
  quickTeamLabel: document.getElementById('quickTeamLabel'),
  currentWeekLabel: document.getElementById('currentWeekLabel'),
  fabPopover: document.getElementById('fabPopover'),
  fabTriggerBtn: document.getElementById('fabTriggerBtn'),
  drawerBackdrop: document.getElementById('drawerBackdrop'),
  drawerContainer: document.getElementById('drawerContainer'),
  toastBanner: document.getElementById('toastBanner'),
  sidebarUserAvatar: document.getElementById('sidebarUserAvatar'),
  sidebarUserName: document.getElementById('sidebarUserName'),
  sidebarUserRoleChip: document.getElementById('sidebarUserRoleChip'),
};

let toastTimer = null;

function showToast(message) {
  clearTimeout(toastTimer);
  dom.toastBanner.innerHTML = `<span class="toast-dot"></span><span>${message}</span>`;
  dom.toastBanner.classList.remove('hidden');
  toastTimer = setTimeout(() => {
    dom.toastBanner.classList.add('hidden');
  }, 3000);
}

function requireManagerPermission() {
  if (!isManager()) {
    showToast('Restricted: Manager permissions required for this action');
    return false;
  }
  return true;
}

function syncUserBadge() {
  if (!state.currentUser) return;
  dom.sidebarUserAvatar.textContent = state.currentUser.initials;
  dom.sidebarUserName.textContent = state.currentUser.name;
  dom.sidebarUserRoleChip.textContent = isManager() ? 'Manager' : 'Employee';
  dom.sidebarUserRoleChip.className = `role-chip-sidebar ${
    isManager() ? 'manager' : 'employee'
  }`;
}

function syncToolbarUI() {
  document.querySelectorAll('.nav-item[data-page]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.page === state.activePage);
  });

  document.querySelectorAll('[data-action="set-view"]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === state.scheduleView);
  });

  document.querySelectorAll('[data-action="set-period"]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.period === state.periodMode);
  });

  dom.quickStatusLabel.textContent = state.statusFilter;
  dom.quickTeamLabel.textContent =
    state.selectedTeams.length === 2 ? 'All' : `${state.selectedTeams.length} selected`;

  const weekSummary = getActiveWeekSummary();
  dom.currentWeekLabel.textContent = weekSummary.label;
  dom.quickPills.classList.toggle('hidden', state.isFilterOpen);
}

function renderAll() {
  if (!state.currentUser) {
    dom.appShell.classList.add('hidden');
    dom.loginScreen.classList.remove('hidden');
    renderLoginScreen(dom.loginScreen);
    return;
  }

  dom.loginScreen.classList.add('hidden');
  dom.appShell.classList.remove('hidden');

  syncUserBadge();
  syncToolbarUI();
  renderFabPopover(dom.fabPopover);
  renderAdvancedFilterPanel(dom.filterPanel);
  renderWorkspace(dom.workspace, dom.toolbarRight, dom.toolbarLeft);
  renderSlideDrawer(dom.drawerBackdrop, dom.drawerContainer);
}

function closeFabMenu() {
  dom.fabPopover.classList.add('hidden');
  dom.fabTriggerBtn.classList.remove('open');
}

/* ================= GLOBAL CLICK EVENT DELEGATION ================= */
document.addEventListener('click', (event) => {
  const actionEl = event.target.closest('[data-action]');
  if (!actionEl) {
    if (!event.target.closest('.fab-anchor')) {
      closeFabMenu();
    }
    return;
  }

  const action = actionEl.dataset.action;

  switch (action) {
    case 'switch-auth-mode':
      state.authMode = actionEl.dataset.mode;
      state.authError = '';
      renderLoginScreen(dom.loginScreen);
      break;

    case 'quick-demo-login':
      if (loginWithCredentials(actionEl.dataset.email, 'password123')) {
        renderAll();
        showToast(`Signed in as ${state.currentUser.name} (${state.currentUser.roleTitle})`);
      }
      break;

    case 'logout':
      closeFabMenu();
      logoutUser();
      renderAll();
      break;

    case 'toggle-sidebar':
      dom.appShell.classList.toggle('sidebar-collapsed');
      break;

    case 'toggle-mobile-nav':
      dom.appShell.classList.toggle('mobile-nav-open');
      break;

    case 'close-mobile-nav':
      dom.appShell.classList.remove('mobile-nav-open');
      break;

    case 'navigate':
      state.activePage = actionEl.dataset.page;
      dom.appShell.classList.remove('mobile-nav-open');
      renderAll();
      break;

    case 'set-view':
      state.scheduleView = actionEl.dataset.view;
      renderAll();
      break;

    case 'set-period':
      state.periodMode = actionEl.dataset.period;
      renderAll();
      break;

    case 'prev-week':
      state.weekOffset -= 1;
      renderAll();
      break;

    case 'next-week':
      state.weekOffset += 1;
      renderAll();
      break;

    case 'reset-today':
      state.weekOffset = 0;
      state.selectedDateISO = '2024-08-23';
      state.selectedCalDay = 23;
      renderAll();
      showToast('Returned to Current Week (W33)');
      break;

    case 'cycle-quick-status': {
      const order = ['All', 'Confirmed', 'Conflict', 'Open'];
      const nextIdx = (order.indexOf(state.statusFilter) + 1) % order.length;
      state.statusFilter = order[nextIdx];
      renderAll();
      break;
    }

    case 'cycle-quick-team':
      state.selectedTeams =
        state.selectedTeams.length === 2 ? ['Bar staff'] : ['Bar staff', 'Waiters/Waitresses'];
      renderAll();
      break;

    case 'toggle-filter-panel':
      state.isFilterOpen = !state.isFilterOpen;
      if (state.isFilterOpen) {
        state.scheduleView = 'staff';
        dom.appShell.classList.add('sidebar-collapsed');
      }
      renderAll();
      break;

    case 'close-filter-panel':
    case 'apply-filters':
      state.isFilterOpen = false;
      renderAll();
      break;

    case 'select-cal-day': {
      const dayNum = Number(actionEl.dataset.day);
      state.selectedCalDay = dayNum;
      const iso = `2024-08-${String(dayNum).padStart(2, '0')}`;
      jumpToCustomDate(iso);
      renderAll();
      break;
    }

    case 'remove-team-chip':
      state.selectedTeams = state.selectedTeams.filter((t) => t !== actionEl.dataset.team);
      renderAll();
      break;

    case 'reset-filters':
      state.statusFilter = 'All';
      state.selectedTeams = ['Bar staff', 'Waiters/Waitresses'];
      state.selectedCalDay = 23;
      state.weekOffset = 0;
      state.selectedDateISO = '2024-08-23';
      renderAll();
      showToast('Filters reset');
      break;

    case 'toggle-swimlane-group': {
      const grp = actionEl.dataset.group;
      state.collapsedGroups[grp] = !state.collapsedGroups[grp];
      renderAll();
      break;
    }

    case 'toggle-fab-menu':
      dom.fabPopover.classList.toggle('hidden');
      dom.fabTriggerBtn.classList.toggle('open');
      break;

    case 'open-new-shift':
      closeFabMenu();
      if (!requireManagerPermission()) return;
      state.activeDrawer = 'new-shift';
      renderSlideDrawer(dom.drawerBackdrop, dom.drawerContainer);
      break;

    case 'open-leave-request':
      closeFabMenu();
      state.activeDrawer = 'leave-request';
      renderSlideDrawer(dom.drawerBackdrop, dom.drawerContainer);
      break;

    case 'open-shift-swap':
      closeFabMenu();
      state.selectedShiftId = 'sh-106';
      state.activeDrawer = 'shift-details';
      renderSlideDrawer(dom.drawerBackdrop, dom.drawerContainer);
      break;

    case 'open-shift-details':
      state.selectedShiftId = actionEl.dataset.shiftId;
      state.activeDrawer = 'shift-details';
      renderSlideDrawer(dom.drawerBackdrop, dom.drawerContainer);
      break;

    case 'open-swimlane-block':
      if (actionEl.dataset.blockType === 'lavender') {
        state.activeDrawer = 'leave-request';
      } else {
        state.selectedShiftId = actionEl.dataset.shiftId;
        state.activeDrawer = 'shift-details';
      }
      renderSlideDrawer(dom.drawerBackdrop, dom.drawerContainer);
      break;

    case 'close-drawer':
      state.activeDrawer = null;
      renderSlideDrawer(dom.drawerBackdrop, dom.drawerContainer);
      break;

    case 'delete-shift':
      if (!requireManagerPermission()) return;
      deleteShiftFromStore(actionEl.dataset.shiftId);
      state.activeDrawer = null;
      renderAll();
      showToast('Shift deleted from schedule');
      break;

    case 'remove-assignee':
      if (!requireManagerPermission()) return;
      removeAssigneeFromShift(actionEl.dataset.shiftId, actionEl.dataset.assigneeId);
      renderAll();
      showToast('Assignee removed');
      break;

    default:
      break;
  }
});

/* ================= CHANGE & LIVE DURATION DELEGATION ================= */
document.addEventListener('change', (event) => {
  const target = event.target;

  if (target.dataset.action === 'jump-custom-date' && target.value) {
    jumpToCustomDate(target.value);
    renderAll();
    showToast(`Jumped to ${target.value}`);
    return;
  }

  if (target.dataset.action === 'filter-status-change') {
    state.statusFilter = target.value;
    renderAll();
    return;
  }

  if (target.dataset.action === 'add-team-chip' && target.value) {
    if (!state.selectedTeams.includes(target.value)) {
      state.selectedTeams.push(target.value);
    }
    renderAll();
    return;
  }

  if (target.dataset.action === 'quick-assign-staff' && target.value) {
    if (!requireManagerPermission()) return;
    addAssigneeToShift(target.dataset.shiftId, target.value);
    renderAll();
    showToast('Team member assigned to shift');
  }
});

document.addEventListener('input', (event) => {
  const target = event.target;
  const mode = target.dataset.liveDuration;
  if (!mode) return;

  const form = target.closest('form');
  if (!form) return;

  const startVal = form.elements.startTime?.value || '';
  const endVal = form.elements.endTime?.value || '';
  const hasBreak = Boolean(form.elements.hasBreak?.checked);
  const hours = calculateDurationHours(startVal, endVal, hasBreak);

  const outputEl =
    mode === 'details'
      ? document.getElementById('detailsEstDuration')
      : document.getElementById('newShiftEstDuration');

  if (outputEl && hours > 0) {
    outputEl.textContent = `${hours}h`;
  }
});

/* ================= FORM SUBMISSIONS ================= */
document.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;

  if (form.id === 'authMainForm') {
    const fd = new FormData(form);
    const success =
      state.authMode === 'register'
        ? registerAccount({
            name: fd.get('name'),
            email: fd.get('email'),
            password: fd.get('password'),
            roleType: fd.get('roleType'),
          })
        : loginWithCredentials(fd.get('email'), fd.get('password'));

    if (!success) {
      renderLoginScreen(dom.loginScreen);
      return;
    }

    renderAll();
    showToast(`Welcome, ${state.currentUser.name} (${isManager() ? 'Manager' : 'Employee'})`);
    return;
  }

  if (form.id === 'newShiftForm') {
    if (!requireManagerPermission()) return;
    const fd = new FormData(form);
    addShiftToStore({
      site: fd.get('site'),
      startTime: fd.get('startTime'),
      endTime: fd.get('endTime'),
      dayIndex: fd.get('dayIndex'),
      sameDay: form.elements.sameDay.checked,
      hasBreak: form.elements.hasBreak.checked,
      openShift: form.elements.openShift.checked,
      assigneeId: fd.get('assigneeId'),
      notes: fd.get('notes'),
    });
    state.activeDrawer = null;
    state.activePage = 'shifts';
    renderAll();
    showToast('New shift published to schedule');
    return;
  }

  if (form.id === 'shiftDetailsForm') {
    if (!requireManagerPermission()) return;
    const fd = new FormData(form);
    updateShiftInStore(form.dataset.shiftId, {
      site: fd.get('site'),
      startTime: fd.get('startTime'),
      endTime: fd.get('endTime'),
      startDate: fd.get('startDate'),
      endDate: fd.get('endDate'),
      sameDay: form.elements.sameDay.checked,
      hasBreak: form.elements.hasBreak.checked,
    });
    state.activeDrawer = null;
    renderAll();
    showToast('Shift details updated & re-published');
    return;
  }

  if (form.id === 'leaveRequestForm') {
    const fd = new FormData(form);
    const updatedMember = submitLeaveRequestToStore({
      employeeId: fd.get('employeeId'),
      leaveType: fd.get('leaveType'),
      startTime: fd.get('startTime'),
      endTime: fd.get('endTime'),
      allDay: form.elements.allDay.checked,
    });
    state.activeDrawer = null;
    state.activePage = 'shifts';
    state.scheduleView = 'staff';
    renderAll();
    if (updatedMember) {
      showToast(
        `${isManager() ? 'Leave approved' : 'Leave request submitted'} for ${updatedMember.name}`
      );
    }
  }
});

renderAll();