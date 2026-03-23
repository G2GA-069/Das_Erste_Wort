/**
 * card-overlay.js — Das erste Wort
 * Converts inline etymology cards (.ety-card) into centered modal overlays
 * so clicking a German word no longer scrolls you away from your reading position.
 *
 * Load AFTER the chapter's own <script> block.
 * Uses CAPTURE phase to intercept clicks before the chapter's handlers.
 */
(function () {
  'use strict';

  /* ── 1. Inject overlay CSS ── */
  const css = document.createElement('style');
  css.textContent = `
    /* Backdrop */
    .card-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(6, 6, 14, 0.70);
      z-index: 9000;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    .card-backdrop.visible {
      opacity: 1;
      pointer-events: auto;
    }

    /* Override: when open, card becomes a centered modal */
    .ety-card.open {
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      z-index: 9001 !important;
      width: 90vw !important;
      max-width: 520px !important;
      max-height: 75vh !important;
      overflow-y: auto !important;
      margin: 0 !important;
      padding: 28px 32px !important;
      opacity: 1 !important;
      border-radius: 14px !important;
      box-shadow: 0 24px 80px rgba(0,0,0,0.6),
                  0 0 60px rgba(232,164,74,0.08),
                  inset 0 1px 0 rgba(232,164,74,0.1) !important;
      animation: cardPopIn 0.3s ease forwards !important;
    }

    @keyframes cardPopIn {
      0%   { opacity: 0; transform: translate(-50%, -48%) scale(0.95); }
      100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }

    /* Close button */
    .card-close-btn {
      position: absolute;
      top: 10px;
      right: 14px;
      width: 28px;
      height: 28px;
      border: none;
      background: rgba(212, 202, 187, 0.08);
      color: rgba(212, 202, 187, 0.5);
      border-radius: 50%;
      font-size: 16px;
      line-height: 28px;
      text-align: center;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
      z-index: 10;
      font-family: sans-serif;
    }
    .card-close-btn:hover {
      background: rgba(212, 202, 187, 0.15);
      color: rgba(212, 202, 187, 0.8);
    }

    /* Scrollbar inside card */
    .ety-card.open::-webkit-scrollbar { width: 4px; }
    .ety-card.open::-webkit-scrollbar-track { background: transparent; }
    .ety-card.open::-webkit-scrollbar-thumb {
      background: rgba(232,164,74,0.2);
      border-radius: 2px;
    }

    /* Mobile adjustments */
    @media (max-width: 600px) {
      .ety-card.open {
        width: 94vw !important;
        max-height: 80vh !important;
        padding: 22px 20px !important;
      }
    }
  `;
  document.head.appendChild(css);

  /* ── 2. Create backdrop element ── */
  const backdrop = document.createElement('div');
  backdrop.className = 'card-backdrop';
  document.body.appendChild(backdrop);

  /* ── 3. Close all open cards ── */
  function closeAllCards() {
    document.querySelectorAll('.ety-card.open').forEach(function (card) {
      card.classList.remove('open');
    });
    backdrop.classList.remove('visible');
    document.body.style.overflow = '';
  }

  /* ── 4. Open a card as overlay ── */
  function openCardOverlay(card, word) {
    closeAllCards();

    // Mark word as revealed
    if (word) word.classList.add('revealed');

    // Add close button if not already there
    if (!card.querySelector('.card-close-btn')) {
      var closeBtn = document.createElement('button');
      closeBtn.className = 'card-close-btn';
      closeBtn.innerHTML = '&times;';
      closeBtn.setAttribute('aria-label', 'Close card');
      card.insertBefore(closeBtn, card.firstChild);
    }

    card.classList.add('open');
    backdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  /* ── 5. Intercept clicks on .german-word in CAPTURE phase ── */
  /*    This fires BEFORE the chapter's own addEventListener handlers */
  document.addEventListener('click', function (e) {
    var word = e.target.closest('.german-word');
    if (!word) return;
    if (!word.dataset.card) return;

    // Stop the event from reaching the chapter's own handler
    e.stopImmediatePropagation();
    e.preventDefault();

    var cardId = 'card-' + word.dataset.card;
    var card = document.getElementById(cardId);
    if (!card) return;

    if (card.classList.contains('open')) {
      closeAllCards();
    } else {
      openCardOverlay(card, word);
    }
  }, true);  // ← CAPTURE phase

  /* ── 6. Backdrop click → close ── */
  backdrop.addEventListener('click', closeAllCards);

  /* ── 7. Close button click (delegation) ── */
  document.addEventListener('click', function (e) {
    if (e.target.closest('.card-close-btn')) {
      e.stopPropagation();
      closeAllCards();
    }
  }, true);

  /* ── 8. Escape key → close ── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAllCards();
  });

})();
