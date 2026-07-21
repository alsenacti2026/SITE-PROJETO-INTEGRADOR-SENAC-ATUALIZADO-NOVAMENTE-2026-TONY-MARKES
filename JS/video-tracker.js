/* ──────────────────────────────────────────────
   video-tracker.js — Rastreamento de video YouTube
   Usa a YouTube IFrame API para rastrear progresso.
   Requer: api.js (authFetch, isAuthenticated)
   ────────────────────────────────────────────── */

var VideoTracker = (function () {
  var player = null;
  var lessonId = null;
  var duration = 0;
  var progress = 0;
  var sentComplete = false;
  var saveInterval = null;
  var statusEl = null;

  function init() {
    var body = document.body;
    lessonId = body.getAttribute('data-lesson-id');
    if (!lessonId || !isAuthenticated()) return;

    loadYouTubeAPI();
    createStatusUI();
  }

  function loadYouTubeAPI() {
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }

  function createStatusUI() {
    var container = document.querySelector('.video-wrapper');
    if (!container) return;

    statusEl = document.createElement('div');
    statusEl.id = 'video-status';
    statusEl.style.cssText =
      'margin-top:12px;padding:12px 20px;border-radius:12px;' +
      'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);' +
      'display:flex;align-items:center;gap:12px;font-size:0.9rem;color:rgba(255,255,255,0.7);';
    statusEl.innerHTML =
      '<span id="vs-text"></span>' +
      '<div style="flex:1;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;">' +
      '<div id="vs-bar" style="height:100%;width:0%;background:var(--action-blue,#0ea5e9);border-radius:2px;transition:width 0.5s ease;"></div>' +
      '</div>' +
      '<span id="vs-pct" style="font-weight:600;min-width:36px;text-align:right;">0%</span>';

    container.parentElement.insertBefore(statusEl, container.nextSibling);
  }

  function updateStatus(pct, text) {
    var bar = document.getElementById('vs-bar');
    var pctEl = document.getElementById('vs-pct');
    var textEl = document.getElementById('vs-text');
    if (bar) bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = Math.round(pct) + '%';
    if (textEl) textEl.textContent = text || '';
  }

  function onYouTubeReady(event) {
    player = event.target;
    duration = player.getDuration();
    updateStatus(0, '');

    setInterval(tick, 2000);
  }

  function tick() {
    if (!player || typeof player.getCurrentTime !== 'function') return;

    var state = player.getPlayerState();
    if (state !== 1 && state !== 0) return; // playing ou ended

    var time = player.getCurrentTime();
    var dur = player.getDuration();
    if (dur <= 0) return;

    progress = Math.min(100, Math.round((time / dur) * 100));
    updateStatus(progress, state === 0 ? 'Video finalizado' : 'Assistindo...');

    if (progress >= 90 && !sentComplete) {
      sentComplete = true;
      markComplete();
    }
  }

  function saveProgress() {
    if (!player || !lessonId || !isAuthenticated()) return;

    var time = player.getCurrentTime();
    var dur = player.getDuration();
    if (dur <= 0) return;

    var pct = Math.min(100, Math.round((time / dur) * 100));

    apiFetch('/lessons/' + lessonId + '/video-progress', {
      method: 'POST',
      body: JSON.stringify({ progress: pct, currentTime: Math.round(time) }),
    }).catch(function (err) { console.error('Erro ao salvar progresso:', err); });
  }

  function markComplete() {
    if (!lessonId || !isAuthenticated()) return;

    updateStatus(100, 'Aula concluida!');

    apiFetch('/lessons/' + lessonId + '/complete', {
      method: 'POST',
    }).then(function () {
      showCompletionBadge();
    }).catch(function (err) { console.error('Erro ao marcar conclusao:', err); });
  }

  function showCompletionBadge() {
    if (statusEl) {
      statusEl.style.borderColor = '#10B981';
      statusEl.style.background = 'rgba(16,185,129,0.1)';
    }
    var wrapper = document.querySelector('.video-wrapper');
    if (wrapper) wrapper.classList.add('concluido');
    updateStatus(100, 'Aula concluida! Parabens!');

    var nextBtn = document.querySelector('.btn-next-lesson');
    if (nextBtn) nextBtn.style.display = 'inline-block';
  }

  function loadProgress() {
    if (!lessonId || !isAuthenticated()) return;

    apiFetch('/progress/status').then(function (status) {
      var id = parseInt(lessonId, 10);
      var concluido = status.concluidas.indexOf(id) !== -1;
      var progressoVideo = status.emAndamento[id] || 0;

      if (concluido) {
        sentComplete = true;
        showCompletionBadge();
      } else if (progressoVideo > 0) {
        updateStatus(progressoVideo, 'Progresso salvo: ' + progressoVideo + '%');
      }
    }).catch(function (err) { console.error('Erro ao carregar progresso:', err); });
  }

  // Called by YouTube IFrame API
  window.onYouTubeIframeAPIReady = function () {
    var frame = document.getElementById('youtube-player');
    if (!frame) return;

    player = new YT.Player('youtube-player', {
      events: {
        onReady: onYouTubeReady,
      },
    });

    loadProgress();

    saveInterval = setInterval(function () {
      var st = player && player.getPlayerState && player.getPlayerState();
      if (st === 1 || st === 0) {
        saveProgress();
      }
    }, 10000);
  };

  return { init: init };
})();

document.addEventListener('DOMContentLoaded', function () {
  VideoTracker.init();
});
