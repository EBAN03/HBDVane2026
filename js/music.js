/* ==========================================================
   HBD VANESSA 2026 — Reproductor de música
   Qué hace este archivo:
     1. Crea UN solo audio (HTMLAudioElement) para toda la página.
     2. Lo inicia cuando se pulsa «Abrir sorpresa» (gesto del usuario).
     3. Si el navegador lo bloquea, muestra «Toca para escuchar».
     4. Conecta el botón flotante: reproducir / pausar / reanudar.

   Como la página es de una sola pieza (se navega con scroll),
   el audio nunca se reinicia al cambiar de sección.
   Nunca se intenta reproducir antes de una interacción.
   ========================================================== */

(() => {
  'use strict';

  /* ---------- Configuración ---------- */
  const AUDIO_SRC = 'assets/audio/cancion.mp3';   // ← aquí va tu canción
  const VOLUME    = 0.35;                         // 0 a 1 (moderado)
  const FADE_MS   = 1800;                         // entrada suave del volumen

  const player  = document.getElementById('player');
  const button  = document.getElementById('player-btn');
  const label   = document.getElementById('player-label');
  const openBtn = document.getElementById('open-btn');

  if (!player || !button || !label) return;

  const audio = new Audio();
  audio.src = AUDIO_SRC;
  audio.loop = true;
  audio.preload = 'metadata';

  // iPhone ignora audio.volume (siempre suena al 100 %): lo detectamos
  // para no intentar fundidos que no funcionarían.
  const volumeWorks = (() => {
    try { audio.volume = 0.5; return audio.volume === 0.5; } catch (e) { return false; }
  })();
  if (volumeWorks) audio.volume = VOLUME;


  /* ---------- Estado visual ----------
     Estados: playing · paused · blocked · error                  */
  function setState(state, message) {
    const playing = state === 'playing';
    player.dataset.state = state;
    label.textContent = message || '';
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
  }

  function showPlayer() {
    if (!player.hidden) return;
    player.hidden = false;
    // Dos fotogramas: así el navegador anima la entrada
    requestAnimationFrame(() => requestAnimationFrame(() => player.classList.add('is-on')));
  }


  /* ---------- Reproducir ---------- */
  let fadeTimer;

  function fadeIn() {
    clearInterval(fadeTimer);
    if (!volumeWorks) return;
    const steps = 20;
    let step = 0;
    audio.volume = 0;
    fadeTimer = setInterval(() => {
      step++;
      audio.volume = Math.min(VOLUME, VOLUME * (step / steps));
      if (step >= steps) clearInterval(fadeTimer);
    }, FADE_MS / steps);
  }

  function start() {
    const attempt = audio.play();
    if (!attempt || !attempt.then) return;

    attempt.then(fadeIn).catch((error) => {
      if (error && error.name === 'AbortError') return;      // se pausó mientras cargaba
      if (error && error.name === 'NotAllowedError') {
        setState('blocked', 'Toca para escuchar');            // el navegador lo bloqueó
      } else {
        setState('error', 'No se encontró la canción');       // archivo ausente o no válido
      }
    });
  }

  // La interfaz sigue siempre al audio real (también si el sistema lo pausa)
  audio.addEventListener('playing', () => setState('playing'));
  audio.addEventListener('pause', () => {
    const state = player.dataset.state;
    if (state !== 'blocked' && state !== 'error') setState('paused');
  });
  audio.addEventListener('error', () => setState('error', 'No se encontró la canción'));

  button.addEventListener('click', () => {
    if (player.dataset.state === 'error') return;
    if (audio.paused) start();
    else { clearInterval(fadeTimer); audio.pause(); }
  });


  /* ---------- Arranque ---------- */
  setState('paused');

  if (openBtn && !document.documentElement.classList.contains('intro-seen')) {
    // Primera vez: la música empieza con el mismo toque que abre el sobre
    openBtn.addEventListener('click', () => {
      showPlayer();
      start();
    }, { once: true });
  } else {
    // La bienvenida ya se vio (recarga en la misma pestaña): no hay toque
    // previo, así que no se reproduce solo; se ofrece el botón.
    showPlayer();
    setState('blocked', 'Toca para escuchar');
  }
})();