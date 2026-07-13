 // ===============================
  // TOGGLE SIDEBAR
  // ===============================
  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  }

  // ===============================
  // TOAST
  // ===============================
  let toastTimeout;

  function showToast(msg) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    msgEl.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // ===============================
  // MENU PERFIL (dropdown)
  // ===============================
  const btnMenu = document.getElementById('btn-menu-perfil');
  const menuPerfil = document.getElementById('idMenuPerfil');
  const arrowIcon = document.getElementById('arrowIcon');

  if (btnMenu) {
    btnMenu.addEventListener('click', function(e) {
      e.stopPropagation();
      menuPerfil.classList.toggle('open');
      arrowIcon.classList.toggle('open');
    });

    document.addEventListener('click', function(e) {
      if (!btnMenu.contains(e.target) && !menuPerfil.contains(e.target)) {
        menuPerfil.classList.remove('open');
        arrowIcon.classList.remove('open');
      }
    });
  }

  // ===============================
  // FOTO DE PERFIL
  // ===============================
  const inputFile = document.getElementById('input-file');
  const avatarGrande = document.getElementById('avatar-grande');
  const avatarPequeno = document.getElementById('avatar-pequeno');

  const fotoSalva = localStorage.getItem('fotoPerfil');
  if (fotoSalva) {
    avatarGrande.src = fotoSalva;
    avatarPequeno.src = fotoSalva;
  }

  if (inputFile) {
    inputFile.addEventListener('change', function() {
      const arquivo = this.files[0];
      if (!arquivo) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        const resultado = e.target.result;
        avatarGrande.src = resultado;
        avatarPequeno.src = resultado;
        localStorage.setItem('fotoPerfil', resultado);
        showToast('📸 Foto atualizada com sucesso!');
      };
      reader.readAsDataURL(arquivo);
    });
  }

  // ===============================
  // SALVAR DADOS DO FORMULÁRIO
  // ===============================
  function salvarDados() {
    const nome = document.getElementById('inputNome').value.trim();
    const sobrenome = document.getElementById('inputSobrenome').value.trim();
    const nomeCompleto = nome + ' ' + sobrenome;

    const nomeCurtoEl = document.getElementById('display-nome-curto');
    const nomeMenuEl = document.getElementById('nome-menu');
    const headerNameEl = document.getElementById('headerUserName');
    const profileNameEl = document.getElementById('profileName');
    const avatarBigEl = document.getElementById('profileAvatarBig');

    if (nomeCurtoEl) nomeCurtoEl.textContent = nomeCompleto || 'Usuário';
    if (nomeMenuEl) nomeMenuEl.textContent = nomeCompleto || 'Usuário';
    if (headerNameEl) headerNameEl.textContent = nomeCompleto || 'Usuário';
    if (profileNameEl) profileNameEl.textContent = nomeCompleto || 'Usuário';

    const iniciais = nome.charAt(0).toUpperCase() + (sobrenome ? sobrenome.charAt(0).toUpperCase() : '');
    if (avatarBigEl) avatarBigEl.textContent = iniciais || 'U';

    const headerAvatar = document.getElementById('headerAvatar');
    if (headerAvatar) headerAvatar.textContent = iniciais || 'U';

    localStorage.setItem('nomeUsuario', nomeCompleto);
    localStorage.setItem('iniciaisUsuario', iniciais);

    showToast('✅ Dados salvos com sucesso!');
  }

  // ===============================
  // CARREGAR DADOS SALVOS
  // ===============================
  (function carregarDadosSalvos() {
    const nomeSalvo = localStorage.getItem('nomeUsuario');
    if (nomeSalvo) {
      const nomeCurtoEl = document.getElementById('display-nome-curto');
      const nomeMenuEl = document.getElementById('nome-menu');
      const headerNameEl = document.getElementById('headerUserName');
      const profileNameEl = document.getElementById('profileName');

      if (nomeCurtoEl) nomeCurtoEl.textContent = nomeSalvo;
      if (nomeMenuEl) nomeMenuEl.textContent = nomeSalvo;
      if (headerNameEl) headerNameEl.textContent = nomeSalvo;
      if (profileNameEl) profileNameEl.textContent = nomeSalvo;

      const partes = nomeSalvo.split(' ');
      if (partes.length >= 1) {
        document.getElementById('inputNome').value = partes[0] || '';
        document.getElementById('inputSobrenome').value = partes.slice(1).join(' ') || '';
      }
    }

    const iniciaisSalvas = localStorage.getItem('iniciaisUsuario');
    if (iniciaisSalvas) {
      const avatarBigEl = document.getElementById('profileAvatarBig');
      const headerAvatar = document.getElementById('headerAvatar');
      if (avatarBigEl) avatarBigEl.textContent = iniciaisSalvas;
      if (headerAvatar) headerAvatar.textContent = iniciaisSalvas;
    }
  })();

  // ===============================
  // FECHAR MENU COM ESC
  // ===============================
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      menuPerfil.classList.remove('open');
      arrowIcon.classList.remove('open');
    }
  });