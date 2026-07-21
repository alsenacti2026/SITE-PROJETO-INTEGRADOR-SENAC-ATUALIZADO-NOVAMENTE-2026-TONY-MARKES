var abaAtual = 'email';

function trocarAba(aba) {
  abaAtual = aba;
  document.querySelectorAll('.tab').forEach(function (t, i) {
    t.classList.toggle('active', (i === 0 && aba === 'email') || (i === 1 && aba === 'telefone'));
  });
  document.getElementById('panel-email').classList.toggle('active', aba === 'email');
  document.getElementById('panel-telefone').classList.toggle('active', aba === 'telefone');
  document.getElementById('success-box').classList.remove('show');
  clearFieldErrors();
}

function mascaraTel(input) {
  var v = input.value.replace(/\D/g, '');
  v = v.replace(/^(\d{2})(\d)/, '($1) $2');
  v = v.replace(/(\d{5})(\d)/, '$1-$2');
  input.value = v;
}

async function enviar(tipo) {
  clearFieldErrors();
  var box = document.getElementById('success-box');

  if (tipo === 'email') {
    var emailEl = document.getElementById('email');
    if (!emailEl.value.trim() || !emailEl.value.includes('@')) {
      showFieldError('email', 'Digite um e-mail válido');
      return;
    }

    var btn = document.querySelector('#panel-email .btn-login');
    if (btn) btn.disabled = true;
    if (btn) btn.querySelector('span').textContent = 'Enviando...';

    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: emailEl.value.trim() }),
      });
      box.textContent = '✅ E-mail enviado! Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.';
      box.classList.add('show');
    } catch (err) {
      showFieldError('email', err.message);
    } finally {
      if (btn) btn.disabled = false;
      if (btn) btn.querySelector('span').textContent = 'ENVIAR LINK POR E-MAIL';
    }
  } else {
    showFieldError('telefone', 'Recuperação por SMS ainda não disponível');
  }
}
