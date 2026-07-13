// ── Sidebar mobile ──
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('show');
}

// ── Toast ──
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Alterar senha ──
function checkPw() {
  const val = document.getElementById('pw-nova')?.value;
  if (val === undefined) return;

  const rules = {
    'rule-len':     val.length >= 8,
    'rule-upper':   /[A-Z]/.test(val),
    'rule-num':     /[0-9]/.test(val),
    'rule-special': /[!@#$%^&*(),.?":{}|<>]/.test(val)
  };

  let score = Object.values(rules).filter(Boolean).length;

  for (const [id, ok] of Object.entries(rules)) {
    document.getElementById(id)?.classList.toggle('ok', ok);
  }

  const bar = document.getElementById('pw-strength');
  if (bar) bar.style.display = val.length > 0 ? 'block' : 'none';

  const colors = ['#EF4444','#F59E0B','#3B82F6','#10B981'];
  const labels = ['Fraca','Razoável','Boa','Forte'];

  ['seg1','seg2','seg3','seg4'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.style.background = i < score ? colors[score - 1] : 'var(--border)';
  });

  const lbl = document.getElementById('pw-strength-label');
  if (lbl) lbl.textContent = val.length > 0 ? 'Força: ' + (labels[score - 1] || 'Fraca') : 'Força: —';

  checkConfirm();
}

function checkConfirm() {
  const nova    = document.getElementById('pw-nova')?.value;
  const confirm = document.getElementById('pw-confirm')?.value;
  const hint    = document.getElementById('confirm-hint');
  if (!hint || !confirm) return;

  if (nova === confirm) {
    hint.textContent = '✓ As senhas coincidem';
    hint.style.color = '#10B981';
  } else {
    hint.textContent = '✗ As senhas não coincidem';
    hint.style.color = '#EF4444';
  }
}

function resetSenha() {
  ['pw-atual','pw-nova','pw-confirm'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.querySelectorAll('.pw-rule').forEach(r => r.classList.remove('ok'));
  const bar = document.getElementById('pw-strength');
  if (bar) bar.style.display = 'none';
  const hint = document.getElementById('confirm-hint');
  if (hint) hint.textContent = '';
  showToast('Alterações descartadas.');
}

function salvarSenha() {
  const atual   = document.getElementById('pw-atual')?.value;
  const nova    = document.getElementById('pw-nova')?.value;
  const confirm = document.getElementById('pw-confirm')?.value;

  if (!atual)          return alert('Digite sua senha atual.');
  if (nova.length < 8) return alert('A nova senha deve ter pelo menos 8 caracteres.');
  if (nova !== confirm) return alert('As senhas não coincidem.');

  showToast('Senha alterada com sucesso!');
  resetSenha();
}
