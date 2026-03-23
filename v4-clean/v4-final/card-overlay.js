/**
 * card-overlay.js — Das erste Wort
 * Converts inline etymology cards (.ety-card) into centered modal overlays.
 *
 * Key fix: cards live inside .scene elements which have transform/opacity
 * (for scroll animations), creating stacking contexts that trap z-index.
 * Solution: physically move the card to <body> when opening, move it back
 * to its original DOM position when closing.
 */
(function () {
  'use strict';

  /* ── 1. Inject overlay CSS ── */
  var css = document.createElement('style');
  css.textContent = [
    '/* Backdrop */',
    '.card-backdrop {',
    '  position: fixed; inset: 0;',
    '  background: rgba(6, 6, 14, 0.72);',
    '  z-index: 9000;',
    '  opacity: 0;',
    '  transition: opacity 0.3s ease;',
    '  pointer-events: none;',
    '}',
    '.card-backdrop.visible {',
    '  opacity: 1;',
    '  pointer-events: auto;',
    '}',
    '',
    '/* Card as centered modal (only when moved to body) */',
    'body > .ety-card.card-modal {',
    '  position: fixed !important;',
    '  top: 50% !important;',
    '  left: 50% !important;',
    '  transform: translate(-50%, -50%) !important;',
    '  z-index: 9001 !important;',
    '  width: 90vw !important;',
    '  max-width: 520px !important;',
    '  max-height: 75vh !important;',
    '  overflow-y: auto !important;',
    '  margin: 0 !important;',
    '  padding: 28px 32px !important;',
    '  opacity: 1 !important;',
    '  max-height: 75vh !important;',
    '  border-radius: 14px !important;',
    '  background: linear-gradient(135deg, rgba(26, 35, 55, 0.97), rgba(15, 20, 35, 0.97)) !important;',
    '  border: 1px solid rgba(232, 164, 74, 0.18) !important;',
    '  box-shadow: 0 24px 80px rgba(0,0,0,0.6),',
    '              0 0 60px rgba(232,164,74,0.08),',
    '              inset 0 1px 0 rgba(232,164,74,0.1) !important;',
    '  animation: cardPopIn 0.3s ease forwards !important;',
    '}',
    '',
    '@keyframes cardPopIn {',
    '  0%   { opacity: 0; transform: translate(-50%, -48%) scale(0.95); }',
    '  100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }',
    '}',
    '',
    '/* Close button */',
    '.card-close-btn {',
    '  position: sticky;',
    '  top: 0; right: 0;',
    '  float: right;',
    '  width: 32px; height: 32px;',
    '  border: none;',
    '  background: rgba(212, 202, 187, 0.08);',
    '  color: rgba(212, 202, 187, 0.5);',
    '  border-radius: 50%;',
    '  font-size: 18px;',
    '  line-height: 32px;',
    '  text-align: center;',
    '  cursor: pointer;',
    '  transition: background 0.2s, color 0.2s;',
    '  z-index: 10;',
    '  font-family: sans-serif;',
    '  margin: -4px -8px 8px 8px;',
    '}',
    '.card-close-btn:hover {',
    '  background: rgba(212, 202, 187, 0.18);',
    '  color: rgba(212, 202, 187, 0.9);',
    '}',
    '',
    '/* Scrollbar */',
    'body > .ety-card.card-modal::-webkit-scrollbar { width: 5px; }',
    'body > .ety-card.card-modal::-webkit-scrollbar-track { background: transparent; }',
    'body > .ety-card.card-modal::-webkit-scrollbar-thumb {',
    '  background: rgba(232,164,74,0.2);',
    '  border-radius: 3px;',
    '}',
    '',
    '/* Mobile */',
    '@media (max-width: 600px) {',
    '  body > .ety-card.card-modal {',
    '    width: 94vw !important;',
    '    max-height: 80vh !important;',
    '    padding: 22px 18px !important;',
    '  }',
    '}'
  ].join('\n');
  document.head.appendChild(css);

  /* ── 2. Create backdrop ── */
  var backdrop = document.createElement('div');
  backdrop.className = 'card-backdrop';
  document.body.appendChild(backdrop);

  /* ── 3. Track the active card's original position ── */
  var activeCard = null;
  var originalParent = null;
  var originalNext = null;   // the sibling it sat before (for reinsertion)

  /* ── 4. Close ── */
  function closeCard() {
    if (!activeCard) return;

    // Remove modal class and close button
    activeCard.classList.remove('open');
    activeCard.classList.remove('card-modal');
    var btn = activeCard.querySelector('.card-close-btn');
    if (btn) btn.remove();

    // Move card back to its original DOM position
    if (originalParent) {
      if (originalNext) {
        originalParent.insertBefore(activeCard, originalNext);
      } else {
        originalParent.appendChild(activeCard);
      }
    }

    backdrop.classList.remove('visible');
    document.body.style.overflow = '';

    activeCard = null;
    originalParent = null;
    originalNext = null;
  }

  /* ── 5. Open ── */
  function openCard(card, word) {
    // Close any currently open card first
    closeCard();

    if (word) word.classList.add('revealed');

    // Remember where the card lives in the DOM
    originalParent = card.parentNode;
    originalNext = card.nextSibling;

    // Move the card to body so it escapes any stacking context
    document.body.appendChild(card);

    // Add close button
    if (!card.querySelector('.card-close-btn')) {
      var closeBtn = document.createElement('button');
      closeBtn.className = 'card-close-btn';
      closeBtn.innerHTML = '\u00d7';
      closeBtn.setAttribute('aria-label', 'Close');
      card.insertBefore(closeBtn, card.firstChild);
    }

    // Activate
    card.classList.add('open');
    card.classList.add('card-modal');
    backdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';

    activeCard = card;
  }

  /* ── 6. Intercept .german-word clicks (CAPTURE phase) ── */
  document.addEventListener('click', function (e) {
    // Let clicks inside the open card pass through (speaker btn, links, etc.)
    if (activeCard && activeCard.contains(e.target)) {
      // But handle close button
      if (e.target.closest('.card-close-btn')) {
        e.stopPropagation();
        closeCard();
      }
      return;
    }

    // Handle german-word clicks
    var word = e.target.closest('.german-word');
    if (word && word.dataset.card) {
      e.stopImmediatePropagation();
      e.preventDefault();

      var card = document.getElementById('card-' + word.dataset.card);
      if (!card) return;

      if (card === activeCard) {
        closeCard();
      } else {
        openCard(card, word);
      }
      return;
    }

    // Click on backdrop or outside → close
    if (activeCard) {
      closeCard();
    }
  }, true);

  /* ── 7. Backdrop click ── */
  backdrop.addEventListener('click', function (e) {
    e.stopPropagation();
    closeCard();
  });

  /* ── 8. Escape key ── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeCard();
  });

})();
