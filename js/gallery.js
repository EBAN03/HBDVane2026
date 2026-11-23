/* ==========================================================
   HBD VANESSA 2026 — Sección 03: Recuerdos (carrusel)
   Qué hace este archivo:
     1. Crea los indicadores de posición (los puntitos).
     2. Conecta los botones anterior / siguiente.
     3. Añade navegación con el teclado (← → Inicio Fin).
     4. Detecta qué foto está al centro mientras se desliza.
     5. Avisa con un recuadro si falta alguna imagen.

   OJO: el deslizado con el dedo NO lo hace JavaScript, lo hace
   el navegador (CSS scroll-snap). Por eso es tan fluido, y por
   eso el carrusel sigue funcionando aunque este archivo falle.

   Para añadir / quitar / reordenar fotos NO hay que tocar este
   archivo: se hace en index.html (busca "FOTOS DEL CARRUSEL").
   ========================================================== */

(() => {
  'use strict';

  const track    = document.getElementById('gallery-track');
  const dotsBox  = document.getElementById('gallery-dots');
  const prevBtn  = document.getElementById('gallery-prev');
  const nextBtn  = document.getElementById('gallery-next');
  const status   = document.getElementById('gallery-status');

  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.polaroid'));
  if (!slides.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = -1;            // índice de la foto centrada
  let ticking = false;         // para no recalcular más de una vez por fotograma


  /* ---------- Utilidades ---------- */

  // Posición de scroll que deja la foto i exactamente al centro
  const centerOf = (slide) =>
    slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;

  const clamp = (i) => Math.max(0, Math.min(slides.length - 1, i));

  // Ir a la foto i (con animación suave, salvo movimiento reducido)
  function goTo(i, smooth = true) {
    const target = slides[clamp(i)];
    track.scrollTo({
      left: centerOf(target),
      behavior: smooth && !reduceMotion.matches ? 'smooth' : 'auto'
    });
  }


  /* ---------- 1. Indicadores de posición ---------- */
  const dots = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'gallery__dot';
    dot.setAttribute('aria-label', `Ir a la foto ${i + 1} de ${slides.length}`);
    dot.addEventListener('click', () => goTo(i));
    dotsBox && dotsBox.appendChild(dot);
    return dot;
  });


  /* ---------- 2. Estado visual de la foto activa ---------- */
  function setCurrent(i) {
    if (i === current) return;
    current = i;

    slides.forEach((slide, n) => slide.classList.toggle('is-active', n === i));
    dots.forEach((dot, n) => {
      if (n === i) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });

    if (prevBtn) prevBtn.disabled = i === 0;
    if (nextBtn) nextBtn.disabled = i === slides.length - 1;
    if (status)  status.textContent = `Foto ${i + 1} de ${slides.length}`;
  }

  // ¿Cuál es la foto más cercana al centro del carrusel?
  function updateFromScroll() {
    ticking = false;
    let best = 0;
    let bestDistance = Infinity;

    slides.forEach((slide, i) => {
      const distance = Math.abs(centerOf(slide) - track.scrollLeft);
      if (distance < bestDistance) { bestDistance = distance; best = i; }
    });
    setCurrent(best);
  }

  // Passive + requestAnimationFrame = el scroll nunca se frena por este código
  track.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateFromScroll);
  }, { passive: true });


  /* ---------- 3. Botones (visibles solo en escritorio) ---------- */
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));


  /* ---------- 4. Teclado ----------
     Funciona cuando el carrusel tiene el foco (con Tab se llega a él). */
  track.addEventListener('keydown', (event) => {
    const keys = {
      ArrowLeft:  () => goTo(current - 1),
      ArrowRight: () => goTo(current + 1),
      Home:       () => goTo(0),
      End:        () => goTo(slides.length - 1)
    };
    const action = keys[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  });


  /* ---------- 5. Imágenes que faltan ----------
     Si una foto no existe (aún no la has subido o el nombre no coincide),
     se muestra un recuadro con el nombre esperado en vez de una imagen rota. */
  slides.forEach((slide) => {
    const img = slide.querySelector('img');
    if (!img) return;

    const markMissing = () => slide.classList.add('is-missing');
    img.addEventListener('error', markMissing);

    // Por si el error ocurrió antes de que este script arrancara
    if (img.complete && img.naturalWidth === 0) markMissing();
  });


  /* ---------- 6. Si cambia el tamaño de pantalla (girar el móvil) ---------- */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => goTo(current, false), 150);
  });


  /* ---------- Arranque ---------- */
  setCurrent(0);
})();