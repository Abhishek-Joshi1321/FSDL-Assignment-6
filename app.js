/* ============================================
   APPOINTLY — Frontend Application Logic
   ============================================ */

// =================== STATE ===================
let state = {
  user: null,
  services: [],
  appointments: [],
  allAppointments: [],
  booking: {
    service: null,
    date: null,
    time: null,
    notes: ''
  },
  currentStep: 1
};

// =================== INIT ===================
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  await loadServices();
  renderServicesPage();
  renderServicePicker();
  setMinDate();

  // Scroll navbar effect
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (window.scrollY > 10) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  });
});

// =================== AUTH ===================
async function checkAuth() {
  const res = await fetch('/api/me');
  const data = await res.json();
  state.user = data.user;
  updateNavbar();
}

function updateNavbar() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutLink = document.getElementById('logoutLink');
  const dashLink = document.getElementById('dashLink');

  if (state.user) {
    loginBtn.style.display = 'none';
    logoutLink.style.display = 'inline';
    dashLink.style.display = 'inline';
    dashLink.textContent = `👤 ${state.user.name.split(' ')[0]}`;
  } else {
    loginBtn.style.display = 'inline';
    logoutLink.style.display = 'none';
    dashLink.style.display = 'none';
  }
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  const msg = document.getElementById('loginMsg');

  if (!email || !pass) return showMsg(msg, 'Please fill all fields', 'error');

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass })
  });
  const data = await res.json();

  if (data.success) {
    state.user = data.user;
    updateNavbar();
    showMsg(msg, '✓ Signed in!', 'success');
    setTimeout(() => showUserInStep(), 500);
  } else {
    showMsg(msg, data.message, 'error');
  }
}

async function handleRegister() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value;
  const phone = document.getElementById('regPhone').value.trim();
  const msg = document.getElementById('regMsg');

  if (!name || !email || !pass) return showMsg(msg, 'Please fill all fields', 'error');

  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password: pass, phone })
  });
  const data = await res.json();

  if (data.success) {
    state.user = data.user;
    updateNavbar();
    showMsg(msg, '✓ Account created!', 'success');
    setTimeout(() => showUserInStep(), 500);
  } else {
    showMsg(msg, data.message, 'error');
  }
}

async function handlePageLogin() {
  const email = document.getElementById('pageLoginEmail').value.trim();
  const pass = document.getElementById('pageLoginPass').value;
  const msg = document.getElementById('pageLoginMsg');

  if (!email || !pass) return showMsg(msg, 'Please fill all fields', 'error');

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass })
  });
  const data = await res.json();

  if (data.success) {
    state.user = data.user;
    updateNavbar();
    showPage('dashboard');
  } else {
    showMsg(msg, data.message, 'error');
  }
}

async function handlePageRegister() {
  const name = document.getElementById('pageRegName').value.trim();
  const email = document.getElementById('pageRegEmail').value.trim();
  const pass = document.getElementById('pageRegPass').value;
  const phone = document.getElementById('pageRegPhone').value.trim();
  const msg = document.getElementById('pageRegMsg');

  if (!name || !email || !pass) return showMsg(msg, 'Please fill all fields', 'error');

  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password: pass, phone })
  });
  const data = await res.json();

  if (data.success) {
    state.user = data.user;
    updateNavbar();
    showPage('dashboard');
  } else {
    showMsg(msg, data.message, 'error');
  }
}

async function handleLogout() {
  await fetch('/api/logout', { method: 'POST' });
  state.user = null;
  updateNavbar();
  showPage('home');
}

function showUserInStep() {
  document.getElementById('authGate').style.display = 'none';
  document.getElementById('authStepActions').style.display = 'none';
  document.getElementById('userLoggedIn').style.display = 'block';
  const u = state.user;
  document.getElementById('userAvatarText').textContent = u.name.charAt(0).toUpperCase();
  document.getElementById('userGreetName').textContent = u.name;
  document.getElementById('userGreetEmail').textContent = u.email;
}

function switchAuthTab(formId) {
  document.getElementById('login-form').style.display = formId === 'login-form' ? 'block' : 'none';
  document.getElementById('register-form').style.display = formId === 'register-form' ? 'block' : 'none';
  document.querySelectorAll('.auth-tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && formId === 'login-form') || (i === 1 && formId === 'register-form'));
  });
}

// =================== SERVICES ===================
async function loadServices() {
  const res = await fetch('/api/services');
  const data = await res.json();
  state.services = data.services;
}

function renderServicesPage() {
  const grid = document.getElementById('servicesGrid');
  if (!grid || !state.services.length) return;

  grid.innerHTML = state.services.map(s => `
    <div class="service-card" style="--card-color:${s.color}" onclick="showPage('book');selectServiceById('${s._id}')">
      <span class="service-card-icon">${s.icon}</span>
      <h3>${s.name}</h3>
      <p>Professional healthcare service delivered with care and expertise by certified practitioners.</p>
      <div class="service-meta">
        <span class="meta-chip price">₹${s.price}</span>
        <span class="meta-chip">⏱ ${s.duration} min</span>
      </div>
    </div>
  `).join('');
}

function renderServicePicker() {
  const picker = document.getElementById('servicePicker');
  if (!picker || !state.services.length) return;

  picker.innerHTML = state.services.map(s => `
    <div class="picker-card" onclick="selectService('${s._id}', this)" data-id="${s._id}">
      <span class="p-icon">${s.icon}</span>
      <div class="p-name">${s.name}</div>
      <div class="p-info">₹${s.price} · ${s.duration} min</div>
    </div>
  `).join('');
}

function selectService(id, el) {
  document.querySelectorAll('.picker-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  state.booking.service = state.services.find(s => s._id === id);
  document.getElementById('step1Next').disabled = false;
}

function selectServiceById(id) {
  // Wait a tick for DOM
  setTimeout(() => {
    const el = document.querySelector(`.picker-card[data-id="${id}"]`);
    if (el) selectService(id, el);
    nextStep(2);
  }, 100);
}

// =================== BOOKING FLOW ===================
function setMinDate() {
  const input = document.getElementById('apptDate');
  if (input) {
    const today = new Date().toISOString().split('T')[0];
    input.min = today;
  }
}

async function loadSlots() {
  const date = document.getElementById('apptDate').value;
  if (!date) return;
  state.booking.date = date;
  state.booking.time = null;
  document.getElementById('step2Next').disabled = true;

  const slotsEl = document.getElementById('timeSlots');
  slotsEl.innerHTML = '<div class="slots-placeholder">Loading slots...</div>';

  const res = await fetch(`/api/slots?date=${date}`);
  const data = await res.json();

  slotsEl.innerHTML = data.slots.map(slot => `
    <button class="time-slot ${slot.available ? '' : 'booked'}" 
      onclick="${slot.available ? `selectSlot('${slot.time}', this)` : ''}"
      ${slot.available ? '' : 'disabled'}>
      ${slot.time}
      ${!slot.available ? ' 🚫' : ''}
    </button>
  `).join('');
}

function selectSlot(time, el) {
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  state.booking.time = time;
  document.getElementById('step2Next').disabled = false;
}

function nextStep(step) {
  // Validate current step
  if (step === 3 && (!state.booking.service || !state.booking.date || !state.booking.time)) {
    return;
  }

  // Hide all steps
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`step${i}`);
    if (el) el.style.display = 'none';
  }

  state.currentStep = step;

  const stepEl = document.getElementById(`step${step}`);
  if (stepEl) stepEl.style.display = 'block';

  // Update indicators
  document.querySelectorAll('.step-dot').forEach(dot => {
    const s = parseInt(dot.dataset.step);
    dot.classList.remove('active', 'done');
    if (s === step) dot.classList.add('active');
    else if (s < step) dot.classList.add('done');
  });

  // Step 3: check if already logged in
  if (step === 3) {
    if (state.user) {
      document.getElementById('authGate').style.display = 'none';
      document.getElementById('authStepActions').style.display = 'none';
      document.getElementById('userLoggedIn').style.display = 'block';
      document.getElementById('userAvatarText').textContent = state.user.name.charAt(0).toUpperCase();
      document.getElementById('userGreetName').textContent = state.user.name;
      document.getElementById('userGreetEmail').textContent = state.user.email;
    } else {
      document.getElementById('authGate').style.display = 'block';
      document.getElementById('authStepActions').style.display = 'flex';
      document.getElementById('userLoggedIn').style.display = 'none';
    }
  }

  // Step 4: render summary
  if (step === 4) {
    renderSummary();
  }
}

function renderSummary() {
  const s = state.booking;
  const svc = s.service;
  const dateStr = new Date(s.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  document.getElementById('bookingSummary').innerHTML = `
    <div class="summary-row">
      <span class="summary-label">Service</span>
      <span class="summary-value">${svc.icon} ${svc.name}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Date</span>
      <span class="summary-value">📅 ${dateStr}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Time</span>
      <span class="summary-value">🕐 ${s.time}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Duration</span>
      <span class="summary-value">⏱ ${svc.duration} minutes</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Patient</span>
      <span class="summary-value">👤 ${state.user.name}</span>
    </div>
    ${document.getElementById('apptNotes')?.value ? `
    <div class="summary-row">
      <span class="summary-label">Notes</span>
      <span class="summary-value">${document.getElementById('apptNotes').value}</span>
    </div>` : ''}
    <div class="summary-row">
      <span class="summary-label">Consultation Fee</span>
      <span class="summary-value price">₹${svc.price}</span>
    </div>
  `;
}

async function confirmBooking() {
  const btn = document.getElementById('confirmBtn');
  btn.disabled = true;
  btn.textContent = 'Booking...';

  const notes = document.getElementById('apptNotes')?.value || '';

  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serviceId: state.booking.service._id,
      date: state.booking.date,
      time: state.booking.time,
      notes
    })
  });

  const data = await res.json();

  if (data.success) {
    // Hide all steps and show success
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById(`step${i}`);
      if (el) el.style.display = 'none';
    }
    document.getElementById('stepSuccess').style.display = 'block';
  } else {
    const msg = document.getElementById('confirmMsg');
    showMsg(msg, data.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Confirm Booking ✓';
  }
}

function resetBooking() {
  state.booking = { service: null, date: null, time: null, notes: '' };
  document.getElementById('stepSuccess').style.display = 'none';
  // Reset step indicators
  document.querySelectorAll('.step-dot').forEach((dot, i) => {
    dot.classList.remove('active', 'done');
    if (i === 0) dot.classList.add('active');
  });
  // Reset picker
  document.querySelectorAll('.picker-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('step1Next').disabled = true;
  document.getElementById('apptDate').value = '';
  document.getElementById('timeSlots').innerHTML = '<div class="slots-placeholder">👆 Please select a date first</div>';
  nextStep(1);
  document.getElementById('step1').style.display = 'block';
}

// =================== DASHBOARD ===================
let currentFilter = 'all';

async function loadDashboard() {
  if (!state.user) { showPage('login'); return; }

  document.getElementById('dashTitle').textContent = state.user.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard';
  document.getElementById('dashSub').textContent = state.user.role === 'admin' ? 'Manage all appointments' : `Welcome back, ${state.user.name.split(' ')[0]}!`;

  await loadStats();
  await loadAppointments();
}

async function loadStats() {
  const res = await fetch('/api/stats');
  const data = await res.json();
  if (data.success) {
    document.getElementById('statTotal').textContent = data.total;
    document.getElementById('statPending').textContent = data.pending;
    document.getElementById('statConfirmed').textContent = data.confirmed;
    document.getElementById('statToday').textContent = data.today;
  }
}

async function loadAppointments() {
  const res = await fetch('/api/appointments');
  const data = await res.json();
  state.allAppointments = data.appointments || [];
  filterAppts(currentFilter, document.querySelector('.filter-tab.active'));
}

function filterAppts(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const list = filter === 'all' ? state.allAppointments : state.allAppointments.filter(a => a.status === filter);
  renderAppointments(list);
}

function renderAppointments(appts) {
  const container = document.getElementById('apptsList');
  if (!appts.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p>No appointments found</p>
        <button class="btn-primary small" style="margin-top:16px" onclick="showPage('book')">Book First Appointment</button>
      </div>
    `;
    return;
  }

  container.innerHTML = appts.map(a => {
    const svc = a.service || {};
    const dateStr = new Date(a.date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    const iconBg = svc.color ? `background:${svc.color}20;` : 'background:#f0f9f6;';

    return `
      <div class="appt-card" id="apptCard${a._id}">
        <div class="appt-icon" style="${iconBg}">${svc.icon || '🏥'}</div>
        <div class="appt-info">
          <div class="appt-service">${svc.name || 'Appointment'}</div>
          <div class="appt-datetime">
            <span>📅 ${dateStr}</span>
            <span>🕐 ${a.time}</span>
            ${svc.duration ? `<span>⏱ ${svc.duration}m</span>` : ''}
          </div>
          ${state.user?.role === 'admin' ? `<div class="appt-user">👤 ${a.userName} · ${a.userEmail}</div>` : ''}
          ${a.notes ? `<div class="appt-user">📝 ${a.notes}</div>` : ''}
        </div>
        <span class="status-badge status-${a.status}">${a.status}</span>
        <div class="appt-actions">
          ${a.status === 'pending' && state.user?.role === 'admin' ? `
            <button class="action-btn" onclick="updateStatus('${a._id}', 'confirmed')" title="Confirm">✅</button>
          ` : ''}
          ${a.status !== 'cancelled' ? `
            <button class="action-btn danger" onclick="cancelAppt('${a._id}')" title="Cancel">✕</button>
          ` : ''}
          <button class="action-btn danger" onclick="deleteAppt('${a._id}')" title="Delete">🗑</button>
        </div>
      </div>
    `;
  }).join('');
}

async function updateStatus(id, status) {
  const res = await fetch(`/api/appointments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (data.success) {
    await loadDashboard();
  }
}

async function cancelAppt(id) {
  if (!confirm('Cancel this appointment?')) return;
  await updateStatus(id, 'cancelled');
}

async function deleteAppt(id) {
  if (!confirm('Delete this appointment permanently?')) return;
  const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (data.success) await loadDashboard();
}

// =================== PAGE NAVIGATION ===================
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(`page-${page}`);
  if (el) {
    el.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (page === 'dashboard') loadDashboard();
  if (page === 'services') renderServicesPage();
  if (page === 'book') {
    renderServicePicker();
    setMinDate();
  }

  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
}

function toggleMobile() {
  document.getElementById('navLinks').classList.toggle('mobile-open');
}

// Close mobile menu on page click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.navbar')) {
    document.getElementById('navLinks')?.classList.remove('mobile-open');
  }
});

// =================== UTILITIES ===================
function showMsg(el, text, type) {
  el.textContent = text;
  el.className = `msg ${type}`;
}
