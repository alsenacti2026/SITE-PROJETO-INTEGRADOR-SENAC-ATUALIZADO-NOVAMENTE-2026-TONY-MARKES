  /**
   * mascaraCPF(input)
   * Formata o CPF automaticamente enquanto o usuário digita:
   * 000.000.000-00
   */
  function mascaraCPF(input) {
    let v = input.value.replace(/\D/g, ''); // remove tudo que não é número
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = v;
  }

  /**
   * checkPw()
   * Verifica os requisitos da senha e atualiza
   * a barra de força e os itens visuais.
   */
  function checkPw() {
    const val = document.getElementById('pw-nova').value;

    const rules = {
      'rule-len':     val.length >= 8,
      'rule-upper':   /[A-Z]/.test(val),
      'rule-num':     /[0-9]/.test(val),
      'rule-special': /[!@#$%^&*(),.?":{}|<>]/.test(val)
    };

    let score = Object.values(rules).filter(Boolean).length;

    // Marca cada requisito como ok ou não
    for (const [id, ok] of Object.entries(rules)) {
      document.getElementById(id).classList.toggle('ok', ok);
    }

    // Mostra/esconde a barra de força
    const bar = document.getElementById('pw-strength');
    bar.style.display = val.length > 0 ? 'block' : 'none';

    const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'];
    const labels = ['Fraca', 'Razoável', 'Boa', 'Forte'];

    // Pinta os segmentos da barra
    ['seg1','seg2','seg3','seg4'].forEach((id, i) => {
      document.getElementById(id).style.background = i < score ? colors[score - 1] : 'var(--border)';
    });

    document.getElementById('pw-strength-label').textContent =
      val.length > 0 ? 'Força: ' + (labels[score - 1] || 'Fraca') : 'Força: —';

    checkConfirm();
  }

  /**
   * checkConfirm()
   * Verifica se as duas senhas coincidem e exibe
   * uma mensagem de feedback abaixo do campo.
   */
  function checkConfirm() {
    const nova    = document.getElementById('pw-nova').value;
    const confirm = document.getElementById('pw-confirm').value;
    const hint    = document.getElementById('confirm-hint');

    if (!confirm) { hint.textContent = ''; return; }

    if (nova === confirm) {
      hint.textContent = '✓ As senhas coincidem';
      hint.style.color = '#10B981';
    } else {
      hint.textContent = '✗ As senhas não coincidem';
      hint.style.color = '#EF4444';
    }
  }

  /**
   * cadastrar()
   * Valida todos os campos antes de prosseguir.
   * Em um projeto real, aqui seria feita uma chamada à API.
   */
  function cadastrar() {
    const nome     = document.getElementById('nome').value.trim();
    const email    = document.getElementById('email').value.trim();
    const cpf      = document.getElementById('cpf').value.trim();
    const nova     = document.getElementById('pw-nova').value;
    const confirm  = document.getElementById('pw-confirm').value;
    const termos   = document.getElementById('termos').checked;

    if (!nome)              return alert('Digite seu nome.');
    if (!email.includes('@')) return alert('Digite um e-mail válido.');
    if (cpf.length < 14)    return alert('Digite um CPF válido.');
    if (nova.length < 8)    return alert('A senha deve ter pelo menos 8 caracteres.');
    if (nova !== confirm)   return alert('As senhas não coincidem.');
    if (!termos)            return alert('Você precisa aceitar os termos para continuar.');

    alert('Conta criada com sucesso! Faça login para entrar.');
    window.location.href = 'login.html';
  }