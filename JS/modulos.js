/* ──────────────────────────────────────────────
   modulos.js — Carrega aulas de um modulo dinamicamente
   Usa dados hardcoded de aulas.js + progresso do backend
   Requer: api.js, shared.js, script.js, aulas.js
   Uso: <body data-module-order="1">
   ────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', function () {
  var body = document.body;
  var moduleOrder = parseInt(body.getAttribute('data-module-order'), 10);
  if (!moduleOrder) return;

  var mod = getModuloPorOrdem(moduleOrder);
  if (!mod) return;

  var grid = document.getElementById('lessons-grid');
  if (!grid) return;

  apiFetch('/progress/status').then(function (status) {
    var concluidas = {};
    var emAndamento = {};
    var i;
    for (i = 0; i < status.concluidas.length; i++) concluidas[status.concluidas[i]] = true;
    for (var k in status.emAndamento) emAndamento[k] = status.emAndamento[k];

    grid.innerHTML = '';

    for (i = 0; i < mod.aulas.length; i++) {
      var aula = mod.aulas[i];
      var href = '../' + mod.prefixo + aula.arquivo;
      var concluido = !!concluidas[aula.id];
      var progressoVideo = emAndamento[aula.id] || 0;
      var bloqueada = !isAulaDesbloqueada(aula.id, concluidas);

      var cssClass = 'card-elite';
      var extra = '';

      if (bloqueada) {
        cssClass += ' locked';
      } else if (concluido) {
        cssClass += ' done';
      } else if (progressoVideo > 0) {
        cssClass += ' in-progress';
      }

      var tag = bloqueada ? 'div' : 'a';
      var attrs = bloqueada ? '' : ' href="' + href + '"';

      var inner = '<h3>' + aula.titulo + '</h3>';
      if (progressoVideo > 0 && !concluido) {
        inner += '<div style="font-size:0.8rem;color:#6366F1;margin-top:8px;text-align:center;">' + progressoVideo + '% assistido</div>';
      }

      grid.innerHTML += '<' + tag + ' class="' + cssClass + '"' + attrs + '>' + inner + '</' + tag + '>';
    }

    var concluidasMod = 0;
    for (i = 0; i < mod.aulas.length; i++) {
      if (concluidas[mod.aulas[i].id]) concluidasMod++;
    }
    var pct = mod.aulas.length > 0 ? Math.round((concluidasMod / mod.aulas.length) * 100) : 0;

    var titleEl = document.getElementById('module-title');
    if (titleEl) {
      titleEl.textContent = mod.titulo + (pct > 0 ? ' (' + pct + '%)' : '');
    }
  }).catch(function (err) {
    console.error('Failed to load progress:', err);
    grid.innerHTML = '<p style="color:#EF4444;text-align:center;grid-column:1/-1;">Erro ao carregar aulas. Verifique sua conexao e tente novamente.</p>';
  });
});
