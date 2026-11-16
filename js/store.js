import { INITIAL_SHIFTS, INITIAL_STAFF, USER_ACCOUNTS } from './mockData.js';

// Baseline Monday for Week 0 (matches W33 mockup columns MON 22 - SUN 28)
const BASE_MONDAY_MS = Date.UTC(2024, 7, 19); // Aug 19, 2024
const DISPLAY_DATE_OFFSET_DAYS = 3; // Aligns column 0 to "22" as shown in Figma mockup

const SHORT_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const state = {
  activePage: 'shifts',
  scheduleView: 'shift',
  periodMode: 'week',
  weekOffset: 0,               // 0 = Current Week (W33), +1 = Next Week (W34), -1 = Prev Week (W32)
  selectedDateISO: '2024-08-23',
  isFilterOpen: false,
  selectedCalDay: 23,
  statusFilter: 'All',
  selectedTeams: ['Bar staff', 'Waiters/Waitresses'],
  collapsedGroups: {},
  authMode: 'login',
  authError: '',
  accounts: structuredClone(USER_ACCOUNTS),
  currentUser: null,
  shifts: structuredClone(INITIAL_SHIFTS).map((s) => ({ ...s, weekOffset: 0 })),
  staff: structuredClone(INITIAL_STAFF),
  activeDrawer: null,
  selectedShiftId: 'sh-106',
};

export function isManager() {
  return state.currentUser?.roleType === 'manager';
}

/**
 * Generates dynamic 7-day column metadata for the active weekOffset.
 */
export function getActiveWeekDays() {
  const weekStartMs = BASE_MONDAY_MS + state.weekOffset * 7 * 86400000;

  return SHORT_DAYS.map((short, index) => {
    const colDate = new Date(weekStartMs + (index + DISPLAY_DATE_OFFSET_DAYS) * 86400000);
    const dateNum = colDate.getUTCDate();
    const monthName = SHORT_MONTHS[colDate.getUTCMonth()];
    const yearNum = colDate.getUTCFullYear();
    const iso = colDate.toISOString().slice(0, 10);

    const dayShifts = state.shifts.filter(
      (s) => (s.weekOffset ?? 0) === state.weekOffset && s.dayIndex === index
    );
    const totalHours = dayShifts.reduce((sum, s) => sum + (s.durationHours || 0), 0);
    const totalCost = dayShifts.reduce((sum, s) => sum + (s.cost || 0), 0);

    const isDefaultW33 = state.weekOffset === 0;
    const hoursLabel = isDefaultW33 ? '12h' : `${totalHours || 8}h`;
    const budgetLabel = isDefaultW33
      ? '$1.2k'
      : totalCost > 0
      ? `$${(totalCost / 1000).toFixed(1)}k`
      : '$0.8k';

    return {
      index,
      short,
      dateNum,
      monthName,
      yearNum,
      iso,
      fullDate: `${String(dateNum).padStart(2, '0')} ${monthName} ${yearNum}`,
      hoursLabel,
      budgetLabel,
      overBudget: isDefaultW33 && index === 2,
      highlight: iso === state.selectedDateISO,
    };
  });
}

export function getActiveWeekSummary() {
  const weekNum = 33 + state.weekOffset;
  const days = getActiveWeekDays();
  const label =
    state.weekOffset === 0
      ? 'Current Week'
      : `${days[0].dateNum} ${days[0].monthName} – ${days[6].dateNum} ${days[6].monthName}`;

  const weekShifts = state.shifts.filter((s) => (s.weekOffset ?? 0) === state.weekOffset);
  const rawBudget = weekShifts.reduce((sum, s) => sum + (s.cost || 0), 0);
  const budgetText =
    state.weekOffset === 0 ? '$16.5k' : `$${Math.max(4.2, rawBudget / 1000).toFixed(1)}k`;

  return {
    weekCode: `W${weekNum}`,
    label,
    budgetText,
    monthTitle: `${days[0].monthName} ${days[0].yearNum}`,
  };
}

export function jumpToCustomDate(isoString) {
  if (!isoString) return;
  const parsed = new Date(`${isoString}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return;

  const anchorMs = BASE_MONDAY_MS + DISPLAY_DATE_OFFSET_DAYS * 86400000;
  const diffDays = Math.floor((parsed.getTime() - anchorMs) / 86400000);
  state.weekOffset = Math.floor(diffDays / 7);
  state.selectedDateISO = isoString;
  state.selectedCalDay = parsed.getUTCDate();
}

export function loginWithCredentials(email, password) {
  const normalized = email.trim().toLowerCase();
  const match = state.accounts.find(
    (acc) => acc.email.toLowerCase() === normalized && acc.password === password
  );

  if (!match) {
    state.authError = 'Invalid email or password. Use the quick-fill demo buttons above.';
    return false;
  }

  state.authError = '';
  state.currentUser = { ...match };
  state.activePage = 'shifts';
  state.activeDrawer = null;
  return true;
}

export function registerAccount({ name, email, password, roleType }) {
  const normalized = email.trim().toLowerCase();
  if (state.accounts.some((a) => a.email.toLowerCase() === normalized)) {
    state.authError = 'An account with this email already exists.';
    return false;
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const created = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    initials: initials || 'U',
    email: normalized,
    password,
    roleType,
    roleTitle: roleType === 'manager' ? 'Operations Manager' : 'Floor Staff',
  };

  state.accounts.push(created);
  state.authError = '';
  state.currentUser = { ...created };
  state.activePage = 'shifts';
  return true;
}

export function logoutUser() {
  state.currentUser = null;
  state.activeDrawer = null;
  state.isFilterOpen = false;
  state.authError = '';
}

export function calculateDurationHours(startTime, endTime, hasBreak = false) {
  if (!startTime || !endTime || !startTime.includes(':') || !endTime.includes(':')) {
    return 0;
  }
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);

  if (Number.isNaN(sh) || Number.isNaN(eh)) return 0;

  let startMinutes = sh * 60 + (sm || 0);
  let endMinutes = eh * 60 + (em || 0);

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  let hours = (endMinutes - startMinutes) / 60;
  if (hasBreak && hours > 1) {
    hours -= 0.5;
  }
  return Math.round(hours * 10) / 10;
}

export function getFilteredShifts() {
  return state.shifts.filter((shift) => {
    if ((shift.weekOffset ?? 0) !== state.weekOffset) return false;
    if (state.statusFilter === 'Open' && !shift.isUnassigned) return false;
    if (state.statusFilter === 'Confirmed' && (shift.isUnassigned || shift.accentColor === 'orange')) {
      return false;
    }
    if (state.statusFilter === 'Conflict') {
      const hasConflict = shift.assignees.some((a) => a.status === 'conflict');
      if (!hasConflict) return false;
    }

    if (state.selectedTeams.length > 0 && shift.assignees.length > 0) {
      const matchesTeam = shift.assignees.some((assignee) => {
        const staffRecord = state.staff.find((st) => st.id === assignee.id);
        return staffRecord ? state.selectedTeams.includes(staffRecord.team) : true;
      });
      if (!matchesTeam) return false;
    }

    return true;
  });
}

export function getFilteredStaff() {
  if (state.selectedTeams.length === 0) return state.staff;
  return state.staff.filter((member) => state.selectedTeams.includes(member.team));
}

export function addShiftToStore(payload) {
  const duration = calculateDurationHours(payload.startTime, payload.endTime, payload.hasBreak);
  const startH = parseInt(payload.startTime.split(':')[0], 10) || 9;
  const assignedStaff = state.staff.find((s) => s.id === payload.assigneeId);
  const activeDays = getActiveWeekDays();
  const targetDay = activeDays[Number(payload.dayIndex)] || activeDays[0];

  const newShift = {
    id: `sh-${Date.now()}`,
    weekOffset: state.weekOffset,
    dayIndex: Number(payload.dayIndex),
    startHour: Math.min(15, Math.max(8, startH)),
    cardTitle: `${payload.startTime} - ${payload.endTime}`,
    startTime: payload.startTime,
    endTime: payload.endTime,
    startDate: targetDay.fullDate,
    endDate: payload.sameDay ? targetDay.fullDate : activeDays[Math.min(6, targetDay.index + 1)].fullDate,
    site: payload.site,
    city: 'Lorem Ipsum City, Yesland',
    durationHours: duration || 6,
    cost: payload.openShift ? null : Math.round((duration || 6) * 110),
    confirmedCount: payload.openShift ? 0 : 1,
    totalSlots: 4,
    accentColor: payload.openShift ? 'grey' : 'teal',
    isUnassigned: Boolean(payload.openShift),
    assignees:
      payload.openShift || !assignedStaff
        ? []
        : [
            {
              id: assignedStaff.id,
              name: assignedStaff.name,
              initials: assignedStaff.initials,
              role: assignedStaff.role,
              hourlyRate: assignedStaff.hourlyRate,
              status: 'confirmed',
              avatarBg: assignedStaff.avatarBg,
            },
          ],
  };

  state.shifts.push(newShift);

  if (assignedStaff && !payload.openShift) {
    assignedStaff.blocks.push({
      id: `b-${Date.now()}`,
      weekOffset: state.weekOffset,
      dayIndex: newShift.dayIndex,
      type: 'mint',
      title: `${newShift.startTime}-${newShift.endTime}`,
      meta: `${newShift.durationHours}h · $${newShift.cost}`,
      shiftId: newShift.id,
    });
  }

  return newShift;
}

export function updateShiftInStore(shiftId, updates) {
  const shift = state.shifts.find((s) => s.id === shiftId);
  if (!shift) return null;

  const duration = calculateDurationHours(updates.startTime, updates.endTime, updates.hasBreak);
  shift.site = updates.site;
  shift.startTime = updates.startTime;
  shift.endTime = updates.endTime;
  shift.startDate = updates.startDate;
  shift.endDate = updates.sameDay ? updates.startDate : updates.endDate;
  shift.durationHours = duration || shift.durationHours;
  shift.cardTitle = `${updates.startTime} - ${updates.endTime}`;
  return shift;
}

export function removeAssigneeFromShift(shiftId, assigneeId) {
  const shift = state.shifts.find((s) => s.id === shiftId);
  if (!shift) return;
  shift.assignees = shift.assignees.filter((a) => a.id !== assigneeId);
  shift.confirmedCount = shift.assignees.length;
  if (shift.assignees.length === 0) {
    shift.isUnassigned = true;
    shift.accentColor = 'grey';
  }
}

export function addAssigneeToShift(shiftId, staffId) {
  const shift = state.shifts.find((s) => s.id === shiftId);
  const member = state.staff.find((s) => s.id === staffId);
  if (!shift || !member) return;
  if (shift.assignees.some((a) => a.id === staffId)) return;

  shift.assignees.push({
    id: member.id,
    name: member.name,
    initials: member.initials,
    role: member.role,
    hourlyRate: member.hourlyRate,
    status: 'confirmed',
    avatarBg: member.avatarBg,
  });
  shift.isUnassigned = false;
  shift.accentColor = 'teal';
  shift.confirmedCount = shift.assignees.length;
}

export function deleteShiftFromStore(shiftId) {
  state.shifts = state.shifts.filter((s) => s.id !== shiftId);
}

export function submitLeaveRequestToStore(payload) {
  const member = state.staff.find((s) => s.id === payload.employeeId);
  if (!member) return null;

  const daysRequested = payload.allDay ? 2 : 1;
  member.remainingLeaveDays = Math.max(0, member.remainingLeaveDays - daysRequested);

  member.blocks.push({
    id: `lv-${Date.now()}`,
    weekOffset: state.weekOffset,
    dayIndex: 1,
    type: 'lavender',
    title: isManager() ? 'Approved leave' : 'Pending leave',
    meta: payload.allDay ? 'All day' : `${payload.startTime}-${payload.endTime}`,
  });

  return member;
}