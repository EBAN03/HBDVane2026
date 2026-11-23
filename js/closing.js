/* ==========================================================
   HBD VANESSA 2026 — Sección 05: Cupón (cierre)
   Qué hace este archivo:
     1. Guarda los DATOS DEL CUPÓN en un solo lugar (COUPON).
     2. Rellena el cupón con esos datos.
     3. Controla el botón «Reclamar mi sorpresa».

   La aparición suave del cupón NO se hace aquí: usa la clase
   .reveal, que ya controla celebration.js (igual que las demás
   secciones).
   ========================================================== */

(() => {
  'use strict';

  /* ==========================================================
     ✏️ CONFIGURACIÓN — AQUÍ ESCRIBES LOS DATOS DE LA CITA
     • Cambia solo el texto entre comillas.
     • Si dejas un dato vacío ('') esa fila desaparece del cupón.
     • No se inventó ningún lugar ni detalle: son marcadores.
     ========================================================== */
  const COUPON = {
    plan:     '[Escribe aquí el plan]',
    date:     '[Escribe aquí la fecha]',
    note:     '[Escribe aquí una frase sorpresa]',
    // Mensaje que aparece al pulsar «Reclamar mi sorpresa»
    surprise: '[Escribe aquí el mensaje que se revela al reclamar]'
  };

  const CLAIMED_LABEL = 'Sorpresa reclamada';


  const btn   = document.getElementById('claim-btn');
  const label = document.getElementById('claim-label');
  const panel = document.getElementById('claim-panel');
  const text  = document.getElementById('claim-text');
  const wrap  = document.getElementById('ticket-wrap');
  if (!btn || !panel) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');


  /* ---------- 1. Rellenar el cupón ---------- */
  document.querySelectorAll('[data-coupon]').forEach((el) => {
    const value = COUPON[el.dataset.coupon];
    if (value === undefined) return;

    if (value.trim() === '') {
      const row = el.closest('[data-coupon-row]');
      if (row) row.remove();
      return;
    }
    el.textContent = value;
  });


  /* ---------- 2. Reclamar la sorpresa ---------- */
  btn.addEventListener('click', () => {
    if (btn.getAttribute('aria-expanded') === 'true') return;

    btn.setAttribute('aria-expanded', 'true');
    btn.disabled = true;
    if (label) label.textContent = CLAIMED_LABEL;
    if (wrap) wrap.classList.add('is-claimed');

    panel.inert = false;                    // el mensaje ya es accesible
    panel.classList.add('is-open');
    if (text) text.focus({ preventScroll: true });

    // Cuando el mensaje se despliega, lo acercamos a la vista
    setTimeout(() => {
      panel.scrollIntoView({
        block: 'center',
        behavior: reduceMotion.matches ? 'auto' : 'smooth'
      });
    }, 450);
  });
})();