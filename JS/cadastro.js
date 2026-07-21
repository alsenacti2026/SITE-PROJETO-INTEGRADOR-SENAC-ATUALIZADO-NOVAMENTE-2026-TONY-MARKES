document.addEventListener('DOMContentLoaded', function () {

  // ── Menu perfil dropdown ──
  var btnMenu = document.getElementById('btn-menu-perfil');
  var menuPerfil = document.getElementById('idMenuPerfil');
  var arrowIcon = document.getElementById('arrowIcon');

  if (btnMenu && menuPerfil) {
    btnMenu.addEventListener('click', function (e) {
      e.stopPropagation();
      menuPerfil.classList.toggle('open');
      if (arrowIcon) arrowIcon.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!btnMenu.contains(e.target) && !menuPerfil.contains(e.target)) {
        menuPerfil.classList.remove('open');
        if (arrowIcon) arrowIcon.classList.remove('open');
      }
    });
  }

  // ── Foto de perfil ──
  var inputFile = document.getElementById('input-file');
  var avatarGrande = document.getElementById('avatar-grande');
  var avatarPequeno = document.getElementById('avatar-pequeno');
  var MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB

  if (inputFile) {
    inputFile.addEventListener('change', async function () {
      var arquivo = this.files[0];
      if (!arquivo) return;

      // Validação no frontend
      if (!arquivo.type.startsWith('image/')) {
        showToast('Formato não permitido. Use JPG, PNG, WebP ou GIF.');
        return;
      }
      if (arquivo.size > MAX_PHOTO_SIZE) {
        showToast('Foto muito grande. Tamanho máximo: 5MB.');
        return;
      }

      // Preview imediato
      var reader = new FileReader();
      reader.onload = function (e) {
        if (avatarGrande) avatarGrande.src = e.target.result;
        if (avatarPequeno) avatarPequeno.src = e.target.result;
      };
      reader.readAsDataURL(arquivo);

      // Upload para o servidor
      try {
        var data = await uploadFile('/auth/upload-photo', arquivo);
        if (avatarGrande) avatarGrande.src = data.fotoUrl;
        if (avatarPequeno) avatarPequeno.src = data.fotoUrl;
        showToast('Foto atualizada com sucesso!');
      } catch (err) {
        showToast('Erro ao enviar foto: ' + err.message);
      }
    });
  }

  // ── Salvar dados ──
  window.salvarDados = async function () {
    var nome = document.getElementById('inputNome');
    var sobrenome = document.getElementById('inputSobrenome');
    var telefone = document.getElementById('inputTelefone');
    var dataNascimento = document.getElementById('inputNascimento');

    var nomeCompleto = (nome ? nome.value.trim() : '') + ' ' + (sobrenome ? sobrenome.value.trim() : '');
    nomeCompleto = nomeCompleto.trim();

    if (!nomeCompleto) { showToast('Digite seu nome'); return; }

    try {
      var payload = { name: nomeCompleto };
      if (telefone && telefone.value.trim()) payload.phone = telefone.value.trim();
      if (dataNascimento && dataNascimento.value) payload.birthDate = dataNascimento.value;

      await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      localStorage.setItem('nomeUsuario', nomeCompleto);
      updateNomeDisplay(nomeCompleto);
      showToast('Dados salvos com sucesso!');
    } catch (err) {
      showToast('Erro: ' + err.message);
    }
  };

  function updateNomeDisplay(nome) {
    var el = document.getElementById('display-nome-curto');
    if (el) el.textContent = nome || 'Usuário';
  }

  // ── Carregar dados do perfil ──
  async function carregarDados() {
    try {
      var user = await apiFetch('/auth/profile');

      if (user.nome) {
        var partes = user.nome.split(' ');
        var inputNome = document.getElementById('inputNome');
        var inputSobrenome = document.getElementById('inputSobrenome');
        if (inputNome) inputNome.value = partes[0] || '';
        if (inputSobrenome) inputSobrenome.value = partes.slice(1).join(' ') || '';
        updateNomeDisplay(user.nome);
      }
      if (user.email) {
        var emailEl = document.getElementById('inputEmail');
        if (emailEl) emailEl.value = user.email;
      }
      if (user.telefone) {
        var telEl = document.getElementById('inputTelefone');
        if (telEl) telEl.value = user.telefone;
      }
      if (user.dataNascimento) {
        var dateEl = document.getElementById('inputNascimento');
        if (dateEl) dateEl.value = user.dataNascimento.split('T')[0];
      }
      if (user.fotoUrl && avatarGrande) {
        avatarGrande.src = user.fotoUrl;
        if (avatarPequeno) avatarPequeno.src = user.fotoUrl;
      }
    } catch (err) {
      var nomeSalvo = localStorage.getItem('nomeUsuario');
      if (nomeSalvo) {
        var partes = nomeSalvo.split(' ');
        var inputNome = document.getElementById('inputNome');
        var inputSobrenome = document.getElementById('inputSobrenome');
        if (inputNome) inputNome.value = partes[0] || '';
        if (inputSobrenome) inputSobrenome.value = partes.slice(1).join(' ') || '';
        updateNomeDisplay(nomeSalvo);
      }
    }
  }

  carregarDados();

  // ── ESC fecha menu ──
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (menuPerfil) menuPerfil.classList.remove('open');
      if (arrowIcon) arrowIcon.classList.remove('open');
    }
  });
});
