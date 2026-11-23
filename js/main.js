/* ==========================================================
   HBD VANESSA 2026 — Lógica de la pantalla de bienvenida
   ========================================================== */

(() => {
  'use strict';

  /* ---------- Configuración (aquí puedes ajustar tiempos y cantidades) ---------- */
  const STORAGE_KEY = 'vanessa-intro-v1';   // misma clave que en index.html
  const BALLOON_COUNT = 9;                  // pocos globos = animación fluida
  const BALLOON_COLORS = ['#E2A9BB', '#F3DCE3', '#A9BBA8', '#EBC3CF'];

  // Tiempos en milisegundos, contados desde que se pulsa el botón
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TIMING = prefersReducedMotion
    ? { balloonsAt: 0,    leaveAt: 2600, fadeMs: 500 }
    : { balloonsAt: 2300, leaveAt: 5200, fadeMs: 1400 };

  /* ---------- Elementos de la página ---------- */
  const root         = document.documentElement;
  const intro        = document.getElementById('intro');
  const main         = document.getElementById('main');
  const openBtn      = document.getElementById('open-btn');
  const letter       = document.getElementById('letter');
  const balloonLayer = document.getElementById('balloons');

  if (!intro || !main || !openBtn) return;   // por seguridad

  /* ---------- Funciones auxiliares ---------- */

  // Muestra la página principal y devuelve el scroll
  function revealMain() {
    main.inert = false;
    main.removeAttribute('aria-hidden');
    main.classList.add('is-visible');
    root.classList.remove('is-locked');
  }

  // Guarda que la bienvenida ya se vio (dura mientras la pestaña siga abierta)
  function markSeen() {
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) { /* modo privado: se ignora */ }
  }

  /* ---------- 1. ¿Ya se vio en esta visita? ---------- */
  if (root.classList.contains('intro-seen')) {
    intro.remove();
    revealMain();
    return;
  }

  // Mientras la bienvenida está activa, la página de atrás no es accesible
  // (ni con teclado ni con lector de pantalla)
  main.inert = true;
  main.setAttribute('aria-hidden', 'true');
  intro.style.setProperty('--fade', TIMING.fadeMs + 'ms');

  /* ---------- 2. Globos ---------- */
  function launchBalloons() {
    if (prefersReducedMotion || !balloonLayer) return;

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < BALLOON_COUNT; i++) {
      const balloon = document.createElement('div');
      balloon.className = 'balloon';

      // Repartimos los globos a lo ancho con un poco de azar
      const slot = 6 + ((i + 0.5) / BALLOON_COUNT) * 88;            // 6 % … 94 %
      const x = slot + (Math.random() - 0.5) * 6;

      balloon.style.setProperty('--x',     x.toFixed(1) + '%');
      balloon.style.setProperty('--size',  (36 + Math.random() * 20).toFixed(0) + 'px');
      balloon.style.setProperty('--dur',   (8 + Math.random() * 3).toFixed(1) + 's');
      balloon.style.setProperty('--delay', (Math.random() * 2.2).toFixed(2) + 's');
      balloon.style.setProperty('--drift', ((Math.random() - 0.5) * 50).toFixed(0) + 'px');
      balloon.style.setProperty('--sway',  (3 + Math.random() * 2).toFixed(1) + 's');
      balloon.style.setProperty('--c',     BALLOON_COLORS[i % BALLOON_COLORS.length]);

      const body = document.createElement('div');
      body.className = 'balloon__body';
      balloon.appendChild(body);

      // Cuando termina de subir, el globo se elimina para no acumular elementos
      balloon.addEventListener('animationend', (event) => {
        if (event.animationName === 'rise') balloon.remove();
      });

      fragment.appendChild(balloon);
    }

    balloonLayer.appendChild(fragment);   // una sola inserción en el DOM
  }

  /* ---------- 3. Salir de la bienvenida ---------- */
  function leaveIntro() {
    intro.classList.add('is-leaving');    // empieza el desvanecimiento (CSS)
    revealMain();                         // la página principal sube suavemente

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      intro.remove();                     // ya no hace falta en el DOM
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
    };

    intro.addEventListener('transitionend', (event) => {
      if (event.target === intro && event.propertyName === 'opacity') cleanup();
    });
    setTimeout(cleanup, TIMING.fadeMs + 300);   // plan B si no llega transitionend
  }

  /* ---------- 4. Abrir la sorpresa ---------- */
  let opened = false;

  function openSurprise() {
    if (opened) return;                   // la animación solo se ejecuta una vez
    opened = true;

    openBtn.disabled = true;
    markSeen();

    intro.classList.add('is-opening');    // el CSS hace todo el movimiento del sobre
    if (letter) letter.removeAttribute('aria-hidden');

    setTimeout(launchBalloons, TIMING.balloonsAt);
    setTimeout(leaveIntro, TIMING.leaveAt);
  }

  openBtn.addEventListener('click', openSurprise);
})();