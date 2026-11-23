/* ==========================================================
   HBD VANESSA 2026 — Sección 02: Cumpleaños
   Qué hace este archivo:
     1. Guarda la FECHA DE CUMPLEAÑOS en un solo lugar (BIRTHDAY).
     2. Rellena los textos de la página con esa fecha.
     3. Dibuja el calendario del mes y marca el día.
     4. Hace aparecer los elementos suavemente al desplazarse.
     5. Muestra/oculta la indicación "Sigue bajando".
   ========================================================== */

(() => {
  'use strict';

  /* ==========================================================
     ✏️ CONFIGURACIÓN — AQUÍ CAMBIAS LA FECHA
     month: 1 = enero … 12 = diciembre
     ========================================================== */
  const BIRTHDAY = { year: 2026, month: 11, day: 25 };

  // Cuánto esperar (ms) después de que desaparece la bienvenida
  // para mostrar "Sigue bajando"
  const SCROLL_CUE_DELAY = 2200;


  /* ---------- Datos de apoyo ---------- */
  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
                        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  const main = document.getElementById('main');
  const calendar = document.getElementById('calendar');
  const grid = document.getElementById('calendar-grid');
  const scrollCue = document.getElementById('scroll-cue');

  if (!main) return;

  const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
  const daysInMonth = new Date(BIRTHDAY.year, BIRTHDAY.month, 0).getDate();


  /* ---------- 1. Rellenar textos con la fecha ----------
     Cualquier elemento con data-bday="..." recibe su texto:
       month → Noviembre     year  → 2026
       long  → 25 de noviembre
       short → 25 · Nov · 2026                              */
  function fillTexts() {
    const texts = {
      month: capitalize(MONTHS[BIRTHDAY.month - 1]),
      year:  String(BIRTHDAY.year),
      long:  `${BIRTHDAY.day} de ${MONTHS[BIRTHDAY.month - 1]}`,
      short: `${BIRTHDAY.day} · ${capitalize(MONTHS_SHORT[BIRTHDAY.month - 1])} · ${BIRTHDAY.year}`
    };

    document.querySelectorAll('[data-bday]').forEach((el) => {
      const value = texts[el.dataset.bday];
      if (value) el.textContent = value;
    });
  }


  /* ---------- 2. Dibujar el calendario ---------- */
  function buildCalendar() {
    if (!calendar || !grid) return;

    if (BIRTHDAY.day < 1 || BIRTHDAY.day > daysInMonth) {
      console.warn('BIRTHDAY.day no existe en ese mes:', BIRTHDAY);
    }

    // Día de la semana en que empieza el mes, con la semana empezando en lunes
    // (getDay(): domingo = 0 … sábado = 6  →  lunes = 0 … domingo = 6)
    const firstDay = new Date(BIRTHDAY.year, BIRTHDAY.month - 1, 1).getDay();
    const offset = (firstDay + 6) % 7;

    const fragment = document.createDocumentFragment();

    // Casillas vacías antes del día 1
    for (let i = 0; i < offset; i++) {
      const empty = document.createElement('span');
      empty.className = 'cal__day cal__day--empty';
      fragment.appendChild(empty);
    }

    // Los días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('span');
      cell.className = 'cal__day';

      const number = document.createElement('span');
      number.className = 'cal__num';
      number.textContent = day;
      cell.appendChild(number);

      if (day === BIRTHDAY.day) {
        cell.classList.add('cal__day--bday');
        cell.insertAdjacentHTML('beforeend',
          // Trazo dibujado a mano alrededor del día + corazón pequeño
          '<svg class="cal__ring" viewBox="0 0 60 60" aria-hidden="true">' +
            '<path pathLength="1" d="M30 6 C46 4 57 16 55 31 C53 46 40 56 27 54 C12 52 4 40 6 27 C8 14 20 7 33 8"/>' +
          '</svg>' +
          '<svg class="cal__heart" aria-hidden="true"><use href="#heart"/></svg>'
        );
      }

      fragment.appendChild(cell);
    }

    grid.appendChild(fragment);

    // Descripción para lectores de pantalla (el dibujo en sí está oculto)
    calendar.setAttribute('role', 'img');
    calendar.setAttribute('aria-label',
      `Calendario de ${MONTHS[BIRTHDAY.month - 1]} de ${BIRTHDAY.year} con el día ${BIRTHDAY.day} marcado`);
  }


  /* ---------- 3. Animaciones de entrada ----------
     Los elementos .reveal empiezan invisibles. Cuando entran en
     pantalla se les añade la clase .is-in y el CSS los anima.      */
  function startReveal() {
    const items = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));   // navegadores muy antiguos
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);                // cada elemento solo anima una vez
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

      items.forEach((el) => observer.observe(el));
    }

    startScrollCue();
  }


  /* ---------- 4. Indicación "Sigue bajando" ---------- */
  function startScrollCue() {
    if (!scrollCue) return;

    let ready = false;
    let shown = false;

    const update = () => {
      const shouldShow = ready && window.scrollY < 40;
      if (shouldShow !== shown) {
        shown = shouldShow;
        scrollCue.classList.toggle('is-shown', shown);
      }
    };

    // Passive = el navegador no espera a este código para desplazar la página
    window.addEventListener('scroll', update, { passive: true });
    setTimeout(() => { ready = true; update(); }, SCROLL_CUE_DELAY);
  }


  /* ---------- Arranque ---------- */
  fillTexts();
  buildCalendar();

  // Las animaciones empiezan cuando la bienvenida ya se está yendo.
  // main.js avisa con el evento "intro:revealed". Si la bienvenida ya
  // se vio en esta visita, main ya está visible y arrancamos directo.
  if (main.classList.contains('is-visible')) {
    startReveal();
  } else {
    document.addEventListener('intro:revealed', startReveal, { once: true });
  }
})();