/* ──────────────────────────────────────────────
   shared.js — Funções utilitárias compartilhadas
   ────────────────────────────────────────────── */

// ── Sidebar mobile ──
function toggleSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('overlay');
  if (sidebar) sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('show');
}

// ── Toast ──
var _toastTimeout;
function showToast(msg) {
  var t = document.getElementById('toast');
  var m = document.getElementById('toast-msg');
  if (!t || !m) return;
  m.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimeout);
  _toastTimeout = setTimeout(function () { t.classList.remove('show'); }, 3000);
}

// ── Password strength checker ──
function checkPw() {
  var el = document.getElementById('pw-nova');
  if (!el) return;
  var val = el.value;

  var rules = {
    'rule-len': val.length >= 8,
    'rule-upper': /[A-Z]/.test(val),
    'rule-num': /[0-9]/.test(val),
    'rule-special': /[!@#$%^&*(),.?":{}|<>]/.test(val),
  };

  var score = Object.values(rules).filter(Boolean).length;

  for (var id in rules) {
    var node = document.getElementById(id);
    if (node) node.classList.toggle('ok', rules[id]);
  }

  var bar = document.getElementById('pw-strength');
  if (bar) bar.style.display = val.length > 0 ? 'block' : 'none';

  var colors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'];
  var labels = ['Fraca', 'Razoável', 'Boa', 'Forte'];

  ['seg1', 'seg2', 'seg3', 'seg4'].forEach(function (id, i) {
    var seg = document.getElementById(id);
    if (seg) seg.style.background = i < score ? colors[score - 1] : 'var(--border)';
  });

  var lbl = document.getElementById('pw-strength-label');
  if (lbl) lbl.textContent = val.length > 0 ? 'Força: ' + (labels[score - 1] || 'Fraca') : 'Força: —';

  checkConfirm();
}

// ── Confirm password match ──
function checkConfirm() {
  var nova = document.getElementById('pw-nova');
  var conf = document.getElementById('pw-confirm');
  var hint = document.getElementById('confirm-hint');
  if (!nova || !conf || !hint) return;

  if (!conf.value) { hint.textContent = ''; return; }

  if (nova.value === conf.value) {
    hint.textContent = '✓ As senhas coincidem';
    hint.style.color = '#10B981';
  } else {
    hint.textContent = '✗ As senhas não coincidem';
    hint.style.color = '#EF4444';
  }
}

// ── Show / hide password toggle ──
function togglePw(inputId) {
  var input = document.getElementById(inputId);
  if (!input) return;
  var isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  var btn = input.parentElement.querySelector('.pw-toggle');
  if (btn) btn.textContent = isPassword ? '🙈' : '👁';
}

// ── Inline error display ──
function showFieldError(fieldId, msg) {
  var el = document.getElementById(fieldId);
  if (!el) return;
  var existing = el.parentElement.querySelector('.field-error');
  if (existing) existing.remove();
  if (!msg) return;
  var span = document.createElement('span');
  span.className = 'field-error';
  span.style.cssText = 'color:#EF4444;font-size:0.8rem;margin-top:4px;display:block;';
  span.textContent = msg;
  el.parentElement.appendChild(span);
}

function clearFieldErrors() {
  document.querySelectorAll('.field-error').forEach(function (e) { e.remove(); });
}
