document.addEventListener('DOMContentLoaded', () => {

    // 1. MAPEAMENTO DE ELEMENTOS
    // Estes IDs precisam existir exatamente assim no HTML
    const elementos = {
        menu: document.getElementById("idMenuPerfil"),
        btnTrigger: document.getElementById("btn-menu-perfil"),
        nomeCurto: document.getElementById('display-nome-curto'),
        nomeCompleto: document.getElementById('user-full-name'),
        email: document.getElementById('user-email-address'),
        avatarPequeno: document.getElementById('avatar-pequeno'),
        avatarGrande: document.getElementById('avatar-grande'),
        inputFoto: document.getElementById('input-file')
    };

    // 2. FUNÇÃO PARA CARREGAR PADRÕES
    function carregarPadroes() {
        if (elementos.nomeCurto) elementos.nomeCurto.innerText = "Usuário";
        if (elementos.nomeCompleto) elementos.nomeCompleto.innerText = "Nome do Usuário";
        if (elementos.email) elementos.email.innerText = "email@exemplo.com";
    }

    // 3. MENU (ABRIR/FECHAR)
    if (elementos.btnTrigger && elementos.menu) {
        elementos.btnTrigger.addEventListener('click', (e) => {
            e.stopPropagation();

            // Verifica se está "none" ou vazio e alternar
            const isVisible = elementos.menu.style.display === "block";
            elementos.menu.style.display = isVisible ? "none" : "block";
        });
    }

    // FECHAR AO CLICAR FORA
    window.addEventListener('click', (e) => {
        if (elementos.menu && !e.target.closest('.perfil-wrapper')) {
            elementos.menu.style.display = "none";
        }
    });

    // 4.TROCA DE FOTO
    if (elementos.inputFoto) {
        elementos.inputFoto.addEventListener('change', function (e) {
            const arquivo = e.target.files[0];
            if (arquivo) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    const novaImgUrl = event.target.result;
                    if (elementos.avatarPequeno) elementos.avatarPequeno.src = novaImgUrl;
                    if (elementos.avatarGrande) elementos.avatarGrande.src = novaImgUrl;
                };
                reader.readAsDataURL(arquivo);
            }
        });
    }

    // Inicializa os textos padrão
    carregarPadroes();
});