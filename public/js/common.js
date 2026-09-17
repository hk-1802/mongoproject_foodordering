// Shared helpers for all pages
const Auth = {
  get token() { return localStorage.getItem('fo_token'); },
  get user() { try { return JSON.parse(localStorage.getItem('fo_user')); } catch { return null; } },
  save(token, user) { localStorage.setItem('fo_token', token); localStorage.setItem('fo_user', JSON.stringify(user)); },
  // Silent — also used when the server reports an expired session.
  logout() { localStorage.removeItem('fo_token'); localStorage.removeItem('fo_user'); location.href = '/'; },
  // What the Logout buttons call: always asks first.
  confirmLogout(extra) {
    if (confirm('Log out of FoodHub?' + (extra ? '\n\n' + extra : ''))) this.logout();
  },
  require(role) {
    const u = this.user;
    if (!this.token || !u) { location.href = '/'; return null; }
    if (role && u.role !== role) { location.href = u.role === 'admin' ? '/admin.html' : '/menu.html'; return null; }
    return u;
  },
};

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(Auth.token ? { Authorization: 'Bearer ' + Auth.token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && Auth.token) { Auth.logout(); }
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rupee = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtTime = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const statusClass = (s) => 's-' + String(s).split(' ')[0];

function toast(msg, type = '') {
  let box = document.getElementById('toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.18);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.16);
      o.start(ctx.currentTime + i * 0.18); o.stop(ctx.currentTime + i * 0.18 + 0.17);
    });
  } catch {}
}

function connectSocket(onStatus) {
  const socket = io({ auth: { token: Auth.token } });
  socket.on('connect', () => onStatus && onStatus(true));
  socket.on('disconnect', () => onStatus && onStatus(false));
  socket.on('connect_error', () => onStatus && onStatus(false));
  return socket;
}
