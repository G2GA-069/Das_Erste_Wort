/* ============================================================
   quiz-enhancer.js — Immediate feedback on quiz answers
   ============================================================
   Loaded by all chapters. Detects quiz clicks and shows
   explanations immediately instead of waiting until quiz end.

   Works with:
   - Pattern 1: selectAnswer(qIdx, optIdx) + quizData[]
   - Pattern 1b: selectAnswer(qi, ai) + quizData[]
   - Skips Pattern 3 chapters (already show inline explanations)
   - Skips Pattern 2/4 chapters (no quizData array)
   ============================================================ */

(function () {
  'use strict';

  /* --- 1. Inject CSS ---------------------------------------- */
  var css = document.createElement('style');
  css.textContent = [
    '.quiz-option.correct-reveal {',
    '  background: rgba(74, 180, 100, 0.15) !important;',
    '  border-color: #4ab464 !important;',
    '  color: #8ed69e !important;',
    '  pointer-events: none !important;',
    '}',
    '.quiz-explanation {',
    '  margin-top: 14px;',
    '  padding: 14px 18px;',
    '  font-size: 0.95rem;',
    '  line-height: 1.6;',
    '  color: rgba(212, 202, 187, 0.85);',
    '  background: rgba(232, 164, 74, 0.06);',
    '  border-left: 3px solid rgba(232, 164, 74, 0.3);',
    '  border-radius: 4px;',
    '  animation: fadeInExp 0.4s ease;',
    '}',
    '.quiz-explanation.correct-exp {',
    '  border-left-color: rgba(74, 180, 100, 0.4);',
    '  background: rgba(74, 180, 100, 0.06);',
    '}',
    '@keyframes fadeInExp {',
    '  from { opacity: 0; transform: translateY(-6px); }',
    '  to { opacity: 1; transform: translateY(0); }',
    '}'
  ].join('\n');
  document.head.appendChild(css);

  /* --- 2. Event delegation on quiz options ------------------- */
  document.addEventListener('click', function (e) {
    var opt = e.target.closest('.quiz-option');
    if (!opt) return;

    // Use requestAnimationFrame so the chapter's own handler runs first
    requestAnimationFrame(function () {
      // Only enhance if quizData exists with explanations
      if (typeof quizData === 'undefined' || !Array.isArray(quizData)) return;

      // Find the question container
      var qDiv = opt.closest('[id^="q-"], [id^="q"]');
      if (!qDiv) {
        // Try parent .quiz-question
        qDiv = opt.closest('.quiz-question');
      }
      if (!qDiv) return;

      // Skip if explanation already shown (Pattern 3 or re-click)
      if (qDiv.querySelector('.quiz-explanation')) return;

      // Only proceed if the option was actually marked by the original handler
      var wasSelected = opt.classList.contains('selected') ||
                        opt.classList.contains('incorrect') ||
                        opt.classList.contains('correct-reveal');
      if (!wasSelected) return;

      // Extract question index from container id
      var idMatch = qDiv.id.match(/q-?(\d+)/);
      if (!idMatch) return;
      var qIdx = parseInt(idMatch[1], 10);

      var q = quizData[qIdx];
      if (!q || !q.explanation) return;

      // Determine which option was clicked and if correct
      var allOpts = qDiv.querySelectorAll('.quiz-option');
      var optIdx = Array.from(allOpts).indexOf(opt);
      var isCorrect = (optIdx === q.correct);

      // Lock all options and highlight the correct one
      allOpts.forEach(function (o, i) {
        o.style.pointerEvents = 'none';
        if (i === q.correct) {
          o.classList.add('correct-reveal');
          o.classList.remove('incorrect');
        }
      });

      // Show explanation
      var exp = document.createElement('div');
      exp.className = 'quiz-explanation' + (isCorrect ? ' correct-exp' : '');
      exp.textContent = (isCorrect ? '\u2713 Correct. ' : '\u2717 ') + q.explanation;
      qDiv.appendChild(exp);
    });
  }, false);

  /* --- 3. Patch resetQuiz to clean up our additions ---------- */
  function patchResetQuiz() {
    if (typeof window.resetQuiz !== 'function') return;
    var orig = window.resetQuiz;
    window.resetQuiz = function () {
      orig.apply(this, arguments);
      // Remove all explanations we injected
      document.querySelectorAll('.quiz-explanation').forEach(function (el) {
        el.remove();
      });
      // Remove correct-reveal class and unlock options
      document.querySelectorAll('.quiz-option').forEach(function (el) {
        el.classList.remove('correct-reveal');
        el.style.pointerEvents = '';
      });
    };
  }

  /* --- 4. Patch checkDictation to show expected answer -------- */
  function patchCheckDictation() {
    if (typeof window.checkDictation !== 'function') return;
    if (typeof window.dictationSentences === 'undefined') return;

    var orig = window.checkDictation;
    window.checkDictation = function () {
      orig.apply(this, arguments);

      // After original runs, check if feedback says "Not quite" without expected answer
      var fb = document.getElementById('dictation-feedback');
      if (!fb) return;
      var text = fb.textContent || fb.innerText || '';
      if (text.indexOf('Not quite') === -1) return;
      // Already shows expected? Skip
      if (text.indexOf('Expected') !== -1) return;

      var idx = (typeof currentDictationIndex !== 'undefined') ? currentDictationIndex : 0;
      var expected = window.dictationSentences[idx];
      if (!expected) return;

      fb.innerHTML += '<div style="margin-top:8px;color:rgba(212,202,187,0.7);font-size:0.9rem;">'
        + 'Expected: <strong style="color:#e8a44a;">\u201c' + expected + '\u201d</strong></div>';
    };
  }

  // Patch after DOM is ready
  function patchAll() {
    patchResetQuiz();
    patchCheckDictation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchAll);
  } else {
    patchAll();
  }

})();
