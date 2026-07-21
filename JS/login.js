document.addEventListener('DOMContentLoaded', function () {
  var form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearFieldErrors();

    var email = document.getElementById('email');
    var password = document.getElementById('password');
    var btn = form.querySelector('button[type="submit"]');
    var btnText = btn ? btn.querySelector('span') : null;

    if (!email.value.trim()) { showFieldError('email', 'Digite seu e-mail'); return; }
    if (!password.value) { showFieldError('password', 'Digite sua senha'); return; }

    if (btn) btn.disabled = true;
    if (btnText) btnText.textContent = 'Entrando...';

    try {
      var data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.value.trim(), password: password.value }),
      });
      saveToken(data.token);
      window.location.href = '/index.html';
    } catch (err) {
      showFieldError('password', err.message);
    } finally {
      if (btn) btn.disabled = false;
      if (btnText) btnText.textContent = 'ENTRAR';
    }
  });
});
