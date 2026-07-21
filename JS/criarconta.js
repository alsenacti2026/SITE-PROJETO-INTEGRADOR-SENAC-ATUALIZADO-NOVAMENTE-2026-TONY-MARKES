function mascaraCPF(input) {
  var v = input.value.replace(/\D/g, '');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  input.value = v;
}

function mascaraTel(input) {
  var v = input.value.replace(/\D/g, '');
  v = v.replace(/^(\d{2})(\d)/, '($1) $2');
  v = v.replace(/(\d{5})(\d)/, '$1-$2');
  input.value = v;
}

async function cadastrar() {
  clearFieldErrors();

  var nome = document.getElementById('nome');
  var email = document.getElementById('email');
  var nova = document.getElementById('pw-nova');
  var confirm = document.getElementById('pw-confirm');
  var termos = document.getElementById('termos');
  var telefone = document.getElementById('telefone');
  var dataNascimento = document.getElementById('data-nascimento');
  var btn = document.querySelector('.btn-login');

  var hasError = false;
  if (!nome.value.trim()) { showFieldError('nome', 'Digite seu nome'); hasError = true; }
  if (!email.value.trim() || !email.value.includes('@')) { showFieldError('email', 'Digite um e-mail válido'); hasError = true; }
  if (nova.value.length < 8) { showFieldError('pw-nova', 'A senha deve ter pelo menos 8 caracteres'); hasError = true; }
  if (nova.value !== confirm.value) { showFieldError('pw-confirm', 'As senhas não coincidem'); hasError = true; }
  if (!termos.checked) { showFieldError('termos', 'Você precisa aceitar os termos'); hasError = true; }
  if (hasError) return;

  var body = {
    name: nome.value.trim() + ' ' + (document.getElementById('sobrenome').value.trim() || ''),
    email: email.value.trim(),
    password: nova.value,
  };
  if (telefone.value.trim()) body.phone = telefone.value.trim();
  if (dataNascimento.value) body.birthDate = dataNascimento.value;

  if (btn) btn.disabled = true;
  if (btn) btn.querySelector('span').textContent = 'CRIANDO CONTA...';

  try {
    var data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    saveToken(data.token);
    window.location.href = '/index.html';
  } catch (err) {
    showFieldError('email', err.message);
  } finally {
    if (btn) btn.disabled = false;
    if (btn) btn.querySelector('span').textContent = 'CRIAR MINHA CONTA';
  }
}
