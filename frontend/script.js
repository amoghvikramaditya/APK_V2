// ================================================
// APK Script v3 — Full Features
// ================================================

// ---- State ----
let currentView = 'myClasses';
let currentClassCode = null;
let uploadAssignmentId = null;
let uploadCourseCode = null;
let pendingDeleteId = null;
let userRole = '';
let userId = null;
let calYear, calMonth;
let pendingPasswordAction = null; // { type:'download'|'upload', data:{...} }
let editingDeadlineId = null;
let editingAssignmentPwId = null;
let settingsClassCode = null;
let filterClass = '';

// ---- Toast ----
function showToast(type, title, message, duration = 4000) {
    const c = document.getElementById('toastContainer'); if (!c) return;
    const icons = {
        success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };
    const t = document.createElement('div'); t.className = `toast toast-${type}`;
    t.innerHTML = `<div class="toast-icon">${icons[type]||icons.success}</div><div class="toast-content"><div class="toast-title">${title}</div>${message?`<div class="toast-message">${message}</div>`:''}</div><button class="toast-close" onclick="this.parentElement.classList.add('toast-out');setTimeout(()=>this.parentElement.remove(),200)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`;
    c.appendChild(t);
    setTimeout(() => { if(t.parentElement) { t.classList.add('toast-out'); setTimeout(()=>t.remove(),200); } }, duration);
}
function showError(m) { showToast('error','Error',m); }
function showSuccess(m) { showToast('success','Success',m); }

// ---- Theme with ripple transition ----
function initTheme() {
    const s = localStorage.getItem('theme');
    const p = window.matchMedia('(prefers-color-scheme:dark)').matches;
    applyTheme(s || (p ? 'dark' : 'light'), false);
}
function applyTheme(t, animate) {
    if (animate === false) {
        document.documentElement.setAttribute('data-theme', t);
    }
    localStorage.setItem('theme', t);
    const lbl = document.getElementById('themeLabel');
    if (lbl) lbl.textContent = t === 'dark' ? 'Light Mode' : 'Dark Mode';
}
function doThemeToggle(e) {
    const newTheme = (document.documentElement.getAttribute('data-theme')||'light') === 'dark' ? 'light' : 'dark';

    const x = e ? (e.clientX || window.innerWidth / 2) : window.innerWidth / 2;
    const y = e ? (e.clientY || window.innerHeight / 2) : window.innerHeight / 2;
    const maxDist = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) * 2.2;

    // Add slow-transition class for smooth color fade
    document.documentElement.classList.add('theme-transitioning');

    // Apply theme immediately — CSS transitions handle the smooth color fade
    document.documentElement.setAttribute('data-theme', newTheme);
    applyTheme(newTheme, false);

    // Spawn transparent water ripple rings (no solid overlay)
    const ringCount = 4;
    for (let i = 0; i < ringCount; i++) {
        const ring = document.createElement('div');
        ring.className = 'water-ripple-ring';
        const size = maxDist + (i * 150);
        const duration = 1400 + (i * 350);
        ring.style.setProperty('--ring-size', size + 'px');
        ring.style.setProperty('--ring-duration', duration + 'ms');
        ring.style.left = x + 'px';
        ring.style.top = y + 'px';
        ring.style.animationDelay = (i * 180) + 'ms';
        document.body.appendChild(ring);
        setTimeout(() => ring.remove(), duration + (i * 180) + 200);
    }

    // Gentle card bounce with distance-based wave propagation
    const cards = document.querySelectorAll('.class-card, .assignment-card, .submission-card, .widget');
    cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(cx - x, cy - y);
        const delay = Math.min(dist * 0.8, 600);
        card.style.animationDelay = delay + 'ms';
        card.classList.add('card-bounce');
    });

    // Cleanup after all animations done
    setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
        document.querySelectorAll('.card-bounce').forEach(c => c.classList.remove('card-bounce'));
    }, 1600);
}
document.addEventListener('DOMContentLoaded', () => { initTheme(); });

// ---- Cursor Glow ----
document.addEventListener('DOMContentLoaded', () => {
    const glow = document.getElementById('cursorGlow');
    if (!glow) return;
    document.addEventListener('mousemove', e => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
        glow.style.opacity = '1';
    });
    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
});

// ---- Loading ----
function showLoading(el) { el.disabled=true; el._ohtml=el.innerHTML; el.innerHTML='<div class="spinner" style="width:16px;height:16px;border-width:2px;margin:0 auto"></div>'; }
function hideLoading(el) { el.disabled=false; el.innerHTML=el._ohtml||''; }

// ---- Auth (login page) ----
function showLogin() { document.getElementById('loginForm').style.display='block'; document.getElementById('registerForm').style.display='none'; }
function showRegister() { document.getElementById('loginForm').style.display='none'; document.getElementById('registerForm').style.display='block'; }

async function register() {
    const btn = document.getElementById('registerButton'); showLoading(btn);
    const name = document.getElementById('registerName').value.trim();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    const teacherCode = document.getElementById('teacherCode')?.value || '';
    if (!name||!username||!password) { hideLoading(btn); return showError('Please fill in all fields'); }
    if (role==='teacher'&&!teacherCode) { hideLoading(btn); return showError('Teacher code is required'); }
    try {
        const r = await fetch(config.endpoints.register, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, username, role, password, teacherCode }) });
        const d = await r.json();
        if (r.ok) { showSuccess('Account created! Please login.'); showLogin(); } else { showError(d.error||'Registration failed'); }
    } catch(e) { showError('Error: '+e.message); }
    finally { hideLoading(btn); }
}

async function login() {
    const btn = document.getElementById('loginButton'); showLoading(btn);
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!username||!password) { hideLoading(btn); return showError('Please fill in all fields'); }
    try {
        const r = await fetch(config.endpoints.login, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username, password }) });
        const d = await r.json();
        if (r.ok) {
            localStorage.setItem('token', d.token); localStorage.setItem('role', d.user.role);
            localStorage.setItem('userId', d.user.id.toString()); localStorage.setItem('username', d.user.username);
            localStorage.setItem('userName', d.user.name); localStorage.setItem('courseCodes', d.user.course_codes||'');
            window.location.href = 'dashboard.html';
        } else { showError(d.error||'Login failed'); }
    } catch(e) { showError('Error: '+e.message); }
    finally { hideLoading(btn); }
}

// ============================================================
// DASHBOARD
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('dashboard.html')) return;
    const token = localStorage.getItem('token');
    if (!token) { window.location.href='index.html'; return; }
    userRole = localStorage.getItem('role') || '';
    userId = parseInt(localStorage.getItem('userId'));
    const sr = document.getElementById('sidebarRole');
    if (sr) sr.textContent = userRole === 'teacher' ? 'Teacher Dashboard' : 'Student Dashboard';
    // Populate user info tile
    const uit = document.getElementById('userInfoTile');
    if (uit) {
        const uname = localStorage.getItem('userName') || localStorage.getItem('username') || 'User';
        const uRole = userRole === 'teacher' ? 'Teacher' : 'Student';
        uit.innerHTML = `<svg class="user-info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><div class="user-info-text"><span class="user-info-name">${uname}</span><span class="user-info-role">${uRole}</span></div>`;
    }
    initClock(); initCalendar(); navigateTo('myClasses');
});

// ---- Widgets ----
function initClock() { updateClock(); setInterval(updateClock, 1000); }
function updateClock() {
    const now = new Date();
    const el = document.getElementById('clockDisplay');
    if (el) el.textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const de = document.getElementById('clockDate');
    if (de) de.textContent = now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
}
let allDeadlines = []; // [{date, filename, courseCode, id}]
function initCalendar() { const now = new Date(); calYear = now.getFullYear(); calMonth = now.getMonth(); fetchAllDeadlines(); }
function changeMonth(d) { calMonth+=d; if(calMonth>11){calMonth=0;calYear++;} if(calMonth<0){calMonth=11;calYear--;} renderCalendar(); }
async function fetchAllDeadlines() {
    allDeadlines = [];
    try {
        const token = localStorage.getItem('token');
        const cr = await fetch(config.endpoints.classes, { headers:{ Authorization: token } });
        const classes = await cr.json();
        for (const cls of classes) {
            const ar = await fetch(config.endpoints.classAssignments(cls.courseCode), { headers:{ Authorization: token } });
            const assignments = await ar.json();
            assignments.forEach(a => {
                if (a.deadline) {
                    const dl = new Date(a.deadline);
                    allDeadlines.push({ date: dl, filename: a.filename, courseCode: cls.courseCode, id: a.id,
                        dateKey: `${dl.getFullYear()}-${dl.getMonth()}-${dl.getDate()}` });
                }
            });
        }
    } catch(e) { /* silent */ }
    renderCalendar();
    updateUpcomingWidget();
}
function renderCalendar() {
    const me = document.getElementById('calMonth'), ge = document.getElementById('calGrid'); if(!me||!ge) return;
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    me.textContent = `${months[calMonth]} ${calYear}`;
    const fd = new Date(calYear,calMonth,1).getDay(), dim = new Date(calYear,calMonth+1,0).getDate(), dip = new Date(calYear,calMonth,0).getDate(), today = new Date();
    // Build deadline map for this month
    const dlMap = {};
    allDeadlines.forEach(d => { if(d.date.getMonth()===calMonth && d.date.getFullYear()===calYear) { const k=d.date.getDate(); if(!dlMap[k])dlMap[k]=[]; dlMap[k].push(d); } });
    let h = ['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=>`<span class="day-label">${d}</span>`).join('');
    for(let i=fd-1;i>=0;i--) h+=`<span class="day other">${dip-i}</span>`;
    for(let d=1;d<=dim;d++) {
        const isT = d===today.getDate()&&calMonth===today.getMonth()&&calYear===today.getFullYear();
        const hasDl = dlMap[d];
        h+=`<span class="day${isT?' today':''}${hasDl?' has-deadline':''}" ${hasDl?'onclick="showCalDeadlines('+d+',event)"':''}>${d}${hasDl?'<span class="cal-dot"></span>':''}</span>`;
    }
    const rem = (7-((fd+dim)%7))%7; for(let i=1;i<=rem;i++) h+=`<span class="day other">${i}</span>`;
    ge.innerHTML = h;
}
function showCalDeadlines(day, event) {
    if (event) event.stopPropagation();
    const dls = allDeadlines.filter(d => d.date.getMonth()===calMonth && d.date.getFullYear()===calYear && d.date.getDate()===day);
    if(!dls.length) return;
    document.querySelectorAll('.cal-popup').forEach(p=>p.remove());
    const popup = document.createElement('div');
    popup.className = 'cal-popup';
    popup.innerHTML = `<div class="cal-popup-title">Due ${day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][calMonth]}</div>` +
        dls.map(d => `<div class="cal-popup-item" onclick="document.querySelectorAll('.cal-popup').forEach(p=>p.remove());openClass('${esc(d.courseCode)}')">
            <span class="cal-popup-name">${d.filename}</span>
            <span class="cal-popup-class">${d.courseCode}</span>
        </div>`).join('') + `<button class="cal-popup-close" onclick="this.parentElement.remove()">×</button>`;
    document.body.appendChild(popup);
    setTimeout(()=>{ document.addEventListener('click', function closePopup(e){ if(!popup.contains(e.target)){popup.remove();document.removeEventListener('click',closePopup);}}, {once:false}); },10);
}
function updateUpcomingWidget() {
    const el = document.getElementById('deadlineList'); if(!el) return;
    const now = new Date();
    const upcoming = allDeadlines.filter(d => d.date > now).sort((a,b)=>a.date-b.date).slice(0,5);
    if(!upcoming.length) { el.innerHTML = '<div class="deadline-empty">No upcoming deadlines</div>'; return; }
    el.innerHTML = upcoming.map(d => {
        const diff = d.date - now, hours = Math.ceil(diff/3600000);
        const timeStr = hours < 24 ? hours+'h' : Math.ceil(hours/24)+'d';
        const cls = hours < 24 ? 'urgent' : hours < 72 ? 'soon' : 'normal';
        return `<div class="deadline-item ${cls}" onclick="openClass('${esc(d.courseCode)}')">
            <div class="deadline-item-name">${d.filename}</div>
            <div class="deadline-item-meta">${d.courseCode} · ${timeStr}</div>
        </div>`;
    }).join('');
}

// ---- Tabs ----
function renderTabs() {
    const isT = userRole === 'teacher';
    const tabs = isT
        ? [{id:'myClasses',label:'My Classes',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'},{id:'mySubmissions',label:'Student Submissions',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>'}]
        : [{id:'myClasses',label:'My Classes',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'},{id:'mySubmissions',label:'My Submissions',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'}];
    return `<div class="view-tabs">${tabs.map(t=>`<button class="view-tab${t.id===currentView?' active':''}" onclick="navigateTo('${t.id}')">${t.icon} ${t.label}</button>`).join('')}</div>`;
}
function navigateTo(view) { currentView=view; currentClassCode=null; filterClass=''; closeSidebar(); if(view==='myClasses')loadClasses(); else if(view==='mySubmissions')loadSubmissions(); }

// ---- Sidebar ----
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('sidebarOverlay').classList.toggle('active'); }
function closeSidebar() { document.getElementById('sidebar')?.classList.remove('open'); document.getElementById('sidebarOverlay')?.classList.remove('active'); }

// ---- Deadline helpers ----
function deadlineBadge(deadline) {
    if (!deadline) return '';
    const dl = new Date(deadline), now = new Date(), diff = dl - now, hours = diff / 3600000;
    if (diff < 0) return `<span class="badge badge-overdue">Overdue</span>`;
    if (hours < 24) return `<span class="badge badge-urgent">Due in ${Math.ceil(hours)}h</span>`;
    if (hours < 72) return `<span class="badge badge-soon">Due in ${Math.ceil(hours/24)}d</span>`;
    return `<span class="badge badge-upcoming">Due ${dl.toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</span>`;
}
function esc(s) { return (s||'').replace(/'/g,"\\'"); }

// ---- Load Classes ----
async function loadClasses() {
    const main = document.getElementById('mainContent');
    const isT = userRole === 'teacher';
    const actBtn = isT
        ? `<button class="btn btn-primary btn-sm" onclick="openClassModal('create')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Create Class</button>`
        : `<button class="btn btn-primary btn-sm" onclick="openClassModal('join')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Join Class</button>`;
    main.innerHTML = `${renderTabs()}<div class="page-header"><div class="page-header-left"><h1>My Classes</h1><p class="page-subtitle">${isT?'Manage your courses and assignments':'Your enrolled courses'}</p></div>${actBtn}</div><div class="class-grid" id="classGrid"><div style="padding:40px;text-align:center;color:var(--muted-fg)"><div class="spinner" style="margin:0 auto 12px"></div>Loading...</div></div>`;
    try {
        const token = localStorage.getItem('token');
        const r = await fetch(config.endpoints.classes, { headers:{ Authorization: token } });
        const classes = await r.json();
        const grid = document.getElementById('classGrid');
        if (!classes.length) { grid.innerHTML = `<div class="empty-state"><div class="empty-state-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div><p class="empty-state-title">No classes yet</p><p class="empty-state-text">${isT?'Create your first class':'Join a class using a course code'}</p></div>`; return; }
        grid.innerHTML = classes.map(c => `<div class="class-card" onclick="openClass('${esc(c.courseCode)}')">
            <div class="class-card-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>
            <div class="class-card-title">${c.courseCode}${c.hasPassword?' <svg class="icon-lock" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>':''}</div>
            <div class="class-card-desc">Course materials and assignments</div>
            <div class="class-card-divider"></div>
            <div class="class-card-footer">View assignments →</div>
        </div>`).join('');
    } catch(e) { showError('Failed to load classes: '+e.message); }
}

// ---- Open Class Detail ----
async function openClass(code) {
    currentClassCode = code;
    const main = document.getElementById('mainContent');
    const isT = userRole === 'teacher';
    const teacherBtns = isT ? `<div style="display:flex;gap:8px;flex-wrap:wrap;"><button class="btn btn-primary btn-sm" onclick="openTeacherUploadModal('${esc(code)}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Upload Assignment</button><button class="btn btn-secondary btn-sm" onclick="downloadClassZip('${esc(code)}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download All</button><button class="btn btn-secondary btn-sm" onclick="openClassSettings('${esc(code)}')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> Settings</button></div>` : `<button class="btn btn-secondary btn-sm" onclick="downloadClassZip('${esc(code)}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download All</button>`;

    main.innerHTML = `${renderTabs()}<button class="back-link" onclick="navigateTo('myClasses')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Back to Classes</button><div class="page-header"><div class="page-header-left"><h1>${code}</h1><p class="page-subtitle">Assignments for this class</p></div>${teacherBtns}</div><div class="assignment-list" id="assignmentList"><div style="padding:40px;text-align:center;color:var(--muted-fg)"><div class="spinner" style="margin:0 auto 12px"></div>Loading...</div></div>`;

    try {
        const token = localStorage.getItem('token');
        const r = await fetch(config.endpoints.classAssignments(code), { headers:{ Authorization: token } });
        const assignments = await r.json();
        const list = document.getElementById('assignmentList');
        if (!assignments.length) { list.innerHTML = `<div class="empty-state"><p class="empty-state-title">No assignments yet</p><p class="empty-state-text">${isT?'Upload your first assignment':'Check back later'}</p></div>`; return; }

        let submittedIds = new Set();
        if (!isT) { const sr = await fetch(config.endpoints.submissions, { headers:{ Authorization: token } }); const subs = await sr.json(); subs.forEach(s => { if(s.assignment_file_id) submittedIds.add(s.assignment_file_id); }); }

        list.innerHTML = assignments.map(a => {
            const date = new Date(a.upload_date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
            const submitted = submittedIds.has(a.id);
            const dlBadge = deadlineBadge(a.deadline);
            const ipBadge = a.ip_sharing ? '<span class="badge badge-ip-share"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> IP sharing found</span>' : '';
            const hasPw = !!(a.assignment_password && a.assignment_password.trim());

            if (isT) {
                return `<div class="assignment-card"><div class="assignment-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                <div class="assignment-card-info"><div class="assignment-card-name">${a.filename}${hasPw?' <svg class="icon-key" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>':''}${ipBadge}</div><div class="assignment-card-meta"><span>${date}</span><span>${a.submission_count||0} submissions</span>${dlBadge}</div></div>
                <div class="assignment-card-actions">
                    <button class="btn btn-secondary btn-sm" onclick="viewSubmissions(${a.id},'${esc(a.filename)}')">Submissions</button>
                    <button class="btn btn-secondary btn-sm" onclick="downloadAssignmentZip(${a.id})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
                    <button class="btn-icon" onclick="openDeadlineModal(${a.id},'${esc(a.filename)}','${a.deadline||''}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></button>
                    <button class="btn-icon" onclick="openAssignmentPwModal(${a.id},'${esc(a.filename)}','${esc(a.assignment_password)}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg></button>
                    <button class="btn-icon" style="color:var(--error)" onclick="requestDelete(${a.id},'${esc(a.filename)}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                </div></div>`;
            } else {
                return `<div class="assignment-card"><div class="assignment-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                <div class="assignment-card-info"><div class="assignment-card-name">${a.filename}${hasPw?' <svg class="icon-key" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>':''}${submitted?' <svg class="check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>':''}</div><div class="assignment-card-meta"><span>${a.uploader_name}</span><span>${date}</span>${dlBadge}</div></div>
                <div class="assignment-card-actions">
                    <button class="btn btn-secondary btn-sm" onclick="handleStudentDownload('${a.saved_name}','${esc(a.filename)}',${a.id},${submitted})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download</button>
                    <button class="submit-btn" onclick="handleStudentUpload(${a.id},'${esc(a.filename)}','${esc(code)}')" title="Submit assignment">+</button>
                </div></div>`;
            }
        }).join('');
    } catch(e) { showError('Failed to load assignments: '+e.message); }
}

// ---- Student password-gated actions ----
async function handleStudentDownload(savedName, originalName, assignmentId, hasSubmitted) {
    if (hasSubmitted) { downloadFile(savedName, originalName); return; }
    // Check if assignment has password
    try {
        const token = localStorage.getItem('token');
        const r = await fetch(config.endpoints.assignmentCheckPassword(assignmentId), { headers:{ Authorization: token } });
        const d = await r.json();
        if (d.hasPassword && !d.hasSubmitted) {
            pendingPasswordAction = { type:'download', data:{ savedName, originalName, assignmentId } };
            document.getElementById('passwordPromptInput').value = '';
            document.getElementById('passwordPromptModal').classList.add('active');
        } else { downloadFile(savedName, originalName); }
    } catch(e) { downloadFile(savedName, originalName); }
}
async function handleStudentUpload(assignmentId, name, code) {
    try {
        const token = localStorage.getItem('token');
        const r = await fetch(config.endpoints.assignmentCheckPassword(assignmentId), { headers:{ Authorization: token } });
        const d = await r.json();
        if (d.hasPassword) {
            document.getElementById('uploadPasswordGroup').style.display = 'block';
            document.getElementById('uploadAssignmentPassword').value = '';
        } else {
            document.getElementById('uploadPasswordGroup').style.display = 'none';
        }
    } catch(e) { document.getElementById('uploadPasswordGroup').style.display = 'none'; }
    openUploadModal(assignmentId, name, code);
}

// Password prompt modal
function closePasswordPrompt() { document.getElementById('passwordPromptModal').classList.remove('active'); pendingPasswordAction=null; }
async function submitPasswordPrompt() {
    const pw = document.getElementById('passwordPromptInput').value;
    if (!pendingPasswordAction) return;
    if (pendingPasswordAction.type === 'download') {
        const { savedName, originalName, assignmentId } = pendingPasswordAction.data;
        try {
            const token = localStorage.getItem('token');
            const r = await fetch(config.endpoints.assignmentValidatePassword(assignmentId), { method:'POST', headers:{'Content-Type':'application/json','Authorization':token}, body: JSON.stringify({ password: pw }) });
            if (r.ok) { closePasswordPrompt(); downloadFile(savedName + '?assignmentPassword=' + encodeURIComponent(pw), originalName); }
            else { const d = await r.json(); showError(d.error || 'Incorrect password'); }
        } catch(e) { showError('Error: '+e.message); }
    }
}

// ---- View Submissions (teacher) ----
async function viewSubmissions(assignmentId, assignmentName) {
    const main = document.getElementById('mainContent');
    main.innerHTML = `${renderTabs()}<button class="back-link" onclick="openClass('${esc(currentClassCode)}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Back to ${currentClassCode}</button>
    <div class="page-header"><div class="page-header-left"><h1>Submissions</h1><p class="page-subtitle">For: ${assignmentName}</p></div><button class="btn btn-secondary btn-sm" onclick="downloadAssignmentZip(${assignmentId})"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download All ZIP</button></div>
    <div class="assignment-list" id="subList"><div style="padding:40px;text-align:center;color:var(--muted-fg)"><div class="spinner" style="margin:0 auto 12px"></div>Loading...</div></div>`;
    try {
        const token = localStorage.getItem('token');
        const r = await fetch(config.endpoints.assignmentSubmissions(assignmentId), { headers:{ Authorization: token } });
        const subs = await r.json();
        const list = document.getElementById('subList');
        if (!subs.length) { list.innerHTML = `<div class="empty-state"><p class="empty-state-title">No submissions yet</p></div>`; return; }
        list.innerHTML = subs.map(s => {
            const d = new Date(s.upload_date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
            const flagged = s.ip_flagged ? ' ip-flagged' : '';
            return `<div class="submission-card${flagged}">
                <div class="submission-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                <div class="submission-card-info"><div class="submission-card-name${flagged}">${s.uploader_name}${s.ip_flagged?' <span class="badge badge-ip-share"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> IP match</span>':''}</div><div class="submission-card-file">${s.filename}</div><div class="submission-card-meta"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ${d}${s.ip_address?' · IP: '+s.ip_address:''}</div></div>
                <div class="submission-card-actions"><button class="btn btn-secondary btn-sm" onclick="downloadFile('${s.saved_name}','${esc(s.filename)}')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download</button></div>
            </div>`;
        }).join('');
    } catch(e) { showError('Failed: '+e.message); }
}

// ---- Load Submissions (with class filter) ----
async function loadSubmissions() {
    const main = document.getElementById('mainContent');
    const isT = userRole === 'teacher';
    // Get user classes for filter dropdown
    let classesList = [];
    try {
        const token = localStorage.getItem('token');
        const cr = await fetch(config.endpoints.classes, { headers:{ Authorization: token } });
        classesList = await cr.json();
    } catch(e) {}
    const filterOpts = classesList.map(c => `<option value="${c.courseCode}"${filterClass===c.courseCode?' selected':''}>${c.courseCode}</option>`).join('');
    const downloadBtn = filterClass ? `<button class="btn btn-secondary btn-sm" onclick="downloadClassZip('${esc(filterClass)}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Class ZIP</button>` : '';

    main.innerHTML = `${renderTabs()}<div class="page-header"><div class="page-header-left"><h1>${isT?'Student Submissions':'My Submissions'}</h1><p class="page-subtitle">${isT?'All student submissions':'Your submitted work'}</p></div><div style="display:flex;gap:8px;align-items:center;"><select class="form-input" style="width:auto;min-width:140px;" onchange="filterClass=this.value;loadSubmissions()"><option value="">All Classes</option>${filterOpts}</select>${downloadBtn}</div></div>
    <div class="assignment-list" id="subList"><div style="padding:40px;text-align:center;color:var(--muted-fg)"><div class="spinner" style="margin:0 auto 12px"></div>Loading...</div></div>`;
    try {
        const token = localStorage.getItem('token');
        let subs;
        if (isT) { const r = await fetch(config.endpoints.files, { headers:{ Authorization: token } }); const all = await r.json(); subs = all.filter(f => f.uploader_role === 'student'); }
        else { const r = await fetch(config.endpoints.submissions, { headers:{ Authorization: token } }); subs = await r.json(); }
        // Apply class filter
        if (filterClass) subs = subs.filter(s => s.course_code === filterClass);
        const list = document.getElementById('subList');
        if (!subs.length) { list.innerHTML = `<div class="empty-state"><p class="empty-state-title">No submissions${filterClass?' in '+filterClass:''}</p></div>`; return; }
        list.innerHTML = subs.map(s => {
            const d = new Date(s.upload_date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
            return `<div class="submission-card"><div class="submission-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
            <div class="submission-card-info"><div class="submission-card-name">${s.assignment_name||s.filename}</div><div class="submission-card-class">${s.course_code}</div><div class="submission-card-file">${s.filename}</div><div class="submission-card-meta"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ${d}</div></div>
            <div class="submission-card-actions"><button class="btn btn-secondary btn-sm" onclick="downloadFile('${s.saved_name}','${esc(s.filename)}')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download</button></div></div>`;
        }).join('');
    } catch(e) { showError('Failed: '+e.message); }
}

// ---- Class Modal ----
function openClassModal(mode) {
    document.getElementById('classModalTitle').textContent = mode==='create'?'Create Class':'Join Class';
    document.getElementById('classActionBtn').textContent = mode==='create'?'Create':'Join';
    document.getElementById('classActionBtn').dataset.mode = mode;
    document.getElementById('classCodeInput').value = '';
    document.getElementById('classPasswordInput').value = '';
    const pwLabel = document.querySelector('#classPasswordGroup .form-label');
    if (mode === 'join' && pwLabel) pwLabel.innerHTML = 'Password <span style="color:var(--muted-fg);font-weight:400">(if required)</span>';
    else if (pwLabel) pwLabel.innerHTML = 'Password <span style="color:var(--muted-fg);font-weight:400">(optional)</span>';
    document.getElementById('joinClassModal').classList.add('active');
    setTimeout(()=>document.getElementById('classCodeInput').focus(),100);
}
function closeClassModal() { document.getElementById('joinClassModal').classList.remove('active'); }
async function submitClassAction() {
    const btn = document.getElementById('classActionBtn');
    const mode = btn.dataset.mode;
    const code = document.getElementById('classCodeInput').value.trim();
    const pw = document.getElementById('classPasswordInput').value;
    if (!code) return showError('Enter a course code');
    showLoading(btn);
    try {
        const token = localStorage.getItem('token');
        const url = mode==='create' ? config.endpoints.classes : config.endpoints.classJoin;
        const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json','Authorization':token}, body: JSON.stringify({ courseCode: code, password: pw }) });
        const d = await r.json();
        if (r.ok) { showSuccess(d.message||'Success'); closeClassModal(); loadClasses(); } else { showError(d.error||'Failed'); }
    } catch(e) { showError('Error: '+e.message); }
    finally { hideLoading(btn); }
}

// ---- Class Settings Modal ----
function openClassSettings(code) {
    settingsClassCode = code;
    document.getElementById('settingsClassName').textContent = code;
    document.getElementById('settingsPassword').value = '';
    document.getElementById('classSettingsModal').classList.add('active');
    // Load current password
    const token = localStorage.getItem('token');
    fetch(config.endpoints.classPassword(code), { headers:{ Authorization: token } }).then(r=>r.json()).then(d => {
        document.getElementById('settingsPassword').value = d.password || '';
    }).catch(()=>{});
}
function closeClassSettingsModal() { document.getElementById('classSettingsModal').classList.remove('active'); }
async function saveClassSettings() {
    const btn = document.getElementById('saveSettingsBtn'); showLoading(btn);
    try {
        const token = localStorage.getItem('token');
        const pw = document.getElementById('settingsPassword').value;
        const r = await fetch(config.endpoints.classPassword(settingsClassCode), { method:'PUT', headers:{'Content-Type':'application/json','Authorization':token}, body: JSON.stringify({ password: pw }) });
        const d = await r.json();
        if (r.ok) { showSuccess('Password updated'); closeClassSettingsModal(); } else showError(d.error);
    } catch(e) { showError(e.message); }
    finally { hideLoading(btn); }
}

// ---- Deadline Modal ----
function openDeadlineModal(id, name, current) {
    editingDeadlineId = id;
    document.getElementById('deadlineAssignmentName').textContent = name;
    document.getElementById('deadlineInput').value = current ? current.slice(0,16) : '';
    document.getElementById('deadlineModal').classList.add('active');
}
function closeDeadlineModal() { document.getElementById('deadlineModal').classList.remove('active'); }
async function saveDeadline() {
    const val = document.getElementById('deadlineInput').value;
    try {
        const token = localStorage.getItem('token');
        const r = await fetch(config.endpoints.assignmentDeadline(editingDeadlineId), { method:'PUT', headers:{'Content-Type':'application/json','Authorization':token}, body: JSON.stringify({ deadline: val || null }) });
        if (r.ok) { showSuccess('Deadline saved'); closeDeadlineModal(); if(currentClassCode) openClass(currentClassCode); } else { const d=await r.json(); showError(d.error); }
    } catch(e) { showError(e.message); }
}

// ---- Assignment Password Modal ----
function openAssignmentPwModal(id, name, current) {
    editingAssignmentPwId = id;
    document.getElementById('assignmentPwName').textContent = name;
    document.getElementById('assignmentPwInput').value = current || '';
    document.getElementById('assignmentPwModal').classList.add('active');
}
function closeAssignmentPwModal() { document.getElementById('assignmentPwModal').classList.remove('active'); }
async function saveAssignmentPassword() {
    const val = document.getElementById('assignmentPwInput').value;
    try {
        const token = localStorage.getItem('token');
        const r = await fetch(config.endpoints.assignmentPassword(editingAssignmentPwId), { method:'PUT', headers:{'Content-Type':'application/json','Authorization':token}, body: JSON.stringify({ password: val }) });
        if (r.ok) { showSuccess('Assignment password saved'); closeAssignmentPwModal(); if(currentClassCode) openClass(currentClassCode); } else { const d=await r.json(); showError(d.error); }
    } catch(e) { showError(e.message); }
}

// ---- Upload Modals ----
function openUploadModal(aId, name, code) {
    uploadAssignmentId=aId; uploadCourseCode=code;
    document.getElementById('uploadAssignmentName').textContent=name;
    document.getElementById('uploadModal').classList.add('active');
    resetUploadZone('uploadZone','uploadZoneContent','filePreviewContainer','fileInput','uploadButton');
    initDragDrop('uploadZone','fileInput','uploadZoneContent','filePreviewContainer','uploadButton');
}
function closeUploadModal() { document.getElementById('uploadModal').classList.remove('active'); uploadAssignmentId=null; uploadCourseCode=null; }
async function uploadSubmission() {
    const fi=document.getElementById('fileInput'), btn=document.getElementById('uploadButton'), file=fi.files[0];
    if(!file) return showError('Select a file'); if(file.size>50*1024*1024) return showError('File must be under 50MB');
    showLoading(btn);
    const fd=new FormData(); fd.append('file',file); fd.append('courseCode',uploadCourseCode); fd.append('assignmentFileId',uploadAssignmentId);
    const pw = document.getElementById('uploadAssignmentPassword')?.value || '';
    if (pw) fd.append('submissionPassword', pw);
    try {
        const token=localStorage.getItem('token');
        const r=await fetch(config.endpoints.upload,{method:'POST',headers:{'Authorization':token},body:fd});
        const d=await r.json();
        if(r.ok){showSuccess('Submitted!');closeUploadModal();openClass(uploadCourseCode);}else{showError(d.error||'Upload failed');}
    }catch(e){showError(e.message);} finally{hideLoading(btn);}
}

function openTeacherUploadModal(code) {
    uploadCourseCode=code;
    document.getElementById('teacherUploadClass').textContent=code;
    document.getElementById('teacherDeadline').value='';
    document.getElementById('teacherAssignmentPassword').value='';
    document.getElementById('teacherUploadModal').classList.add('active');
    resetUploadZone('teacherUploadZone','teacherUploadZoneContent','teacherFilePreview','teacherFileInput','teacherUploadButton');
    initDragDrop('teacherUploadZone','teacherFileInput','teacherUploadZoneContent','teacherFilePreview','teacherUploadButton');
}
function closeTeacherUploadModal() { document.getElementById('teacherUploadModal').classList.remove('active'); }
async function uploadTeacherAssignment() {
    const fi=document.getElementById('teacherFileInput'), btn=document.getElementById('teacherUploadButton'), file=fi.files[0];
    if(!file) return showError('Select a file');
    showLoading(btn);
    const fd=new FormData(); fd.append('file',file); fd.append('courseCode',uploadCourseCode);
    const dl = document.getElementById('teacherDeadline').value;
    const pw = document.getElementById('teacherAssignmentPassword').value;
    if(dl) fd.append('deadline',dl); if(pw) fd.append('assignmentPassword',pw);
    try {
        const token=localStorage.getItem('token');
        const r=await fetch(config.endpoints.upload,{method:'POST',headers:{'Authorization':token},body:fd});
        const d=await r.json();
        if(r.ok){showSuccess('Assignment uploaded!');closeTeacherUploadModal();openClass(uploadCourseCode);}else{showError(d.error||'Failed');}
    }catch(e){showError(e.message);} finally{hideLoading(btn);}
}

// ---- Drag & Drop ----
function initDragDrop(z,i,c,p,b) { const zone=document.getElementById(z),fi=document.getElementById(i); if(!zone||!fi)return; zone.onclick=()=>fi.click(); zone.ondragenter=zone.ondragover=(e)=>{e.preventDefault();zone.classList.add('drag-over');}; zone.ondragleave=()=>zone.classList.remove('drag-over'); zone.ondrop=(e)=>{e.preventDefault();zone.classList.remove('drag-over');if(e.dataTransfer.files.length){fi.files=e.dataTransfer.files;showPreview(fi.files[0],c,p,b,i);}}; fi.onchange=()=>{if(fi.files.length)showPreview(fi.files[0],c,p,b,i);}; }
function showPreview(file,c,p,b,i) { const sz=file.size<1024*1024?(file.size/1024).toFixed(1)+' KB':(file.size/(1024*1024)).toFixed(1)+' MB'; document.getElementById(c).style.display='none'; const pc=document.getElementById(p);pc.style.display='block'; pc.innerHTML=`<div class="file-preview"><span class="file-preview-name">${file.name}</span><span class="file-preview-size">${sz}</span><button class="file-preview-remove" onclick="event.stopPropagation();clearPreview('${c}','${p}','${b}','${i}')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>`; document.getElementById(b).disabled=false; }
function clearPreview(c,p,b,i) { document.getElementById(c).style.display='block'; const pc=document.getElementById(p);pc.style.display='none';pc.innerHTML=''; document.getElementById(i).value=''; document.getElementById(b).disabled=true; }
function resetUploadZone(z,c,p,i,b) { const ce=document.getElementById(c);if(ce)ce.style.display='block';const pe=document.getElementById(p);if(pe){pe.style.display='none';pe.innerHTML='';}const ie=document.getElementById(i);if(ie)ie.value='';const be=document.getElementById(b);if(be)be.disabled=true; }

// ---- Downloads ----
async function downloadFile(savedName, originalName) {
    try {
        const token=localStorage.getItem('token');
        const r=await fetch(config.endpoints.download(savedName),{headers:{'Authorization':token}});
        if(!r.ok){const d=await r.json();throw new Error(d.error||'Download failed');}
        let dn=originalName||savedName; const cd=r.headers.get('Content-Disposition');
        if(cd){const m=/filename="(.+)"/.exec(cd);if(m&&m[1])dn=m[1];}
        const blob=await r.blob();const url=URL.createObjectURL(blob);
        const a=document.createElement('a');a.href=url;a.download=dn;document.body.appendChild(a);a.click();URL.revokeObjectURL(url);a.remove();
    } catch(e) { showError('Download error: '+e.message); }
}
async function downloadAssignmentZip(assignmentId) {
    try {
        const token=localStorage.getItem('token');
        const r=await fetch(config.endpoints.assignmentSubmissionsZip(assignmentId),{headers:{'Authorization':token}});
        if(!r.ok){const d=await r.json();showError(d.error||'No submissions');return;}
        const blob=await r.blob();const url=URL.createObjectURL(blob);
        const cd=r.headers.get('Content-Disposition'); let name='submissions.zip';
        if(cd){const m=/filename="(.+)"/.exec(cd);if(m)name=m[1];}
        const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();URL.revokeObjectURL(url);a.remove();
    } catch(e) { showError('ZIP error: '+e.message); }
}
async function downloadClassZip(code) {
    try {
        const token=localStorage.getItem('token');
        const r=await fetch(config.endpoints.classSubmissionsZip(code),{headers:{'Authorization':token}});
        if(!r.ok){const d=await r.json();showError(d.error||'No submissions');return;}
        const blob=await r.blob();const url=URL.createObjectURL(blob);
        const cd=r.headers.get('Content-Disposition'); let name=code+'_submissions.zip';
        if(cd){const m=/filename="(.+)"/.exec(cd);if(m)name=m[1];}
        const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();URL.revokeObjectURL(url);a.remove();
    } catch(e) { showError('ZIP error: '+e.message); }
}

// ---- Delete ----
function requestDelete(fId,name) { pendingDeleteId=fId; document.getElementById('confirmMsg').textContent=`Delete "${name}"?`; document.getElementById('confirmModal').classList.add('active'); }
function closeConfirmModal() { pendingDeleteId=null; document.getElementById('confirmModal').classList.remove('active'); }
async function confirmAction() {
    if(!pendingDeleteId)return;
    try { const token=localStorage.getItem('token'); const r=await fetch(config.endpoints.delete(pendingDeleteId),{method:'DELETE',headers:{'Authorization':token}}); const d=await r.json(); if(r.ok){showSuccess('Deleted');if(currentClassCode)openClass(currentClassCode);else loadClasses();}else{showError(d.error);} }catch(e){showError(e.message);}
    closeConfirmModal();
}

// ---- Logout ----
function logout() { localStorage.clear(); window.location.href='index.html'; }

// ---- Auth guard ----
if(window.location.pathname.includes('dashboard.html')&&!localStorage.getItem('token')){window.location.href='index.html';}

// ---- Keyboard ----
document.addEventListener('keydown', e => {
    if(e.key==='Escape') { closeUploadModal();closeTeacherUploadModal();closeClassModal();closeConfirmModal();closeClassSettingsModal();closeDeadlineModal();closeAssignmentPwModal();closePasswordPrompt(); }
});
document.addEventListener('click', e => {
    if(e.target.classList.contains('modal-overlay')&&e.target.classList.contains('active')) {
        closeUploadModal();closeTeacherUploadModal();closeClassModal();closeConfirmModal();closeClassSettingsModal();closeDeadlineModal();closeAssignmentPwModal();closePasswordPrompt();
    }
});