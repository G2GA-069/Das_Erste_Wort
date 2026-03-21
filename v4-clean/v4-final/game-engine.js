/* ═══════════════════════════════════════════════════════════════
   DAS ERSTE WORT — GAME ENGINE v1.0

   A single script that transforms every chapter into a living,
   trackable quest. Handles: save/load, word collection,
   achievements, reading progress, journal UI, and loot feedback.

   Drop into any chapter with:
   <link rel="stylesheet" href="game-engine.css">
   <script src="game-engine.js" defer></script>
   ═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── CONFIGURATION ────────────────────────────────────────
  const STORAGE_KEY = 'dew_save';
  const VERSION = 1;

  const PHASE_MAP = {
    prologue: { phase: 0, name: 'Prologue' },
    interlude1: { phase: 0, name: 'Interlude' },
    interlude2: { phase: 0, name: 'Interlude' },
    interlude3: { phase: 0, name: 'Interlude' },
    epilogue: { phase: 0, name: 'Epilogue' }
  };
  // Chapters 1-26 = Phase 1, 27-46 = Phase 2, 47-78 = Phase 3, 79-100 = Phase 4
  function getPhase(chNum) {
    if (chNum <= 26) return 1;
    if (chNum <= 46) return 2;
    if (chNum <= 78) return 3;
    return 4;
  }

  const PHASE_NAMES = {
    1: 'The Fire',
    2: 'The Workshop',
    3: 'The Architecture',
    4: 'The Forge'
  };

  const PHASE_CHAPTERS = {
    1: [1, 26],
    2: [27, 46],
    3: [47, 78],
    4: [79, 100]
  };

  const PHASE_CSS = {
    1: 'fire',
    2: 'workshop',
    3: 'architecture',
    4: 'forge'
  };

  // English subtitles for every chapter
  const CHAPTER_SUBTITLES = {
    1: 'The First Word', 2: 'The Forest Language', 3: 'The Sound Shift',
    4: 'The Eagle and the Oak', 5: 'The Border', 6: 'The Great Migration',
    7: 'The Franks', 8: 'The Quill and the Parchment', 9: 'The Song of Hildebrand',
    10: 'The Marketplace', 11: 'The Knight and the Rose', 12: 'The Crusade and the Merchant',
    13: 'The Black Death', 14: 'The Printing Press', 15: 'The Bible in German',
    16: 'The Schism', 17: 'The Thirty Years\' War', 18: 'The Language Societies',
    19: 'The Enlightenment', 20: 'The Wanderer', 21: 'The Factory',
    22: 'The Empire', 23: 'The Republic', 24: 'The Silence',
    25: 'The Wall', 26: 'The Present',
    27: 'The Key', 28: 'The Opposite', 29: 'The Ascent',
    30: 'The Exit', 31: 'The Invitation', 32: 'The Departure',
    33: 'The Compound', 34: 'The Stuff', 35: 'The Transformation',
    36: 'Freedom', 37: 'Friendship', 38: 'The Wonderful',
    39: 'The Thinker', 40: 'The Discovery', 41: 'The Decay',
    42: 'The Beginning', 43: 'The Foreword', 44: 'The Repetition',
    45: 'The Bridge', 46: 'The Big Picture',
    47: 'Der/Die/Das', 48: 'I Am', 49: 'I Have',
    50: 'What Are You Doing?', 51: 'Want, Can, Must', 52: 'May, Should, Like',
    53: 'The Man (Accusative)', 54: 'The Child (Dative)', 55: 'The Father\'s (Genitive)',
    56: 'The Four Cases', 57: 'Where To? Where? Where From?', 58: 'I Have Done',
    59: 'I Did', 60: 'I Had Done', 61: 'I Will Do',
    62: 'The Verb at the End', 63: 'Because, That, Although', 64: 'And, But, For',
    65: 'The Man Who...', 66: 'It Is Done', 67: 'If I Were...',
    68: 'He Said That...', 69: 'The More, the Better', 70: 'Reflexive Verbs',
    71: 'Let Us Go', 72: 'In Order To, Without', 73: 'Adjective Endings I',
    74: 'Adjective Endings II', 75: 'Time Expressions', 76: 'Connectors',
    77: 'Participles', 78: 'The Structure',
    79: 'Strong Verbs I', 80: 'Strong Verbs II', 81: 'Strong Verbs III',
    82: 'Strong Verbs IV', 83: 'False Friends I', 84: 'False Friends II',
    85: 'Modal Particles I', 86: 'Modal Particles II', 87: 'Modal Particles III',
    88: 'Idioms I', 89: 'Idioms II', 90: 'Wordplay',
    91: 'Collocations', 92: 'Prepositions I', 93: 'Prepositions II',
    94: 'Dear Sir or Madam', 95: 'Academic German', 96: 'Literary German',
    97: 'Newspaper German', 98: 'Spoken German', 99: 'Standard and Dialect',
    100: 'The Last Word'
  };

  // ─── ACHIEVEMENTS ─────────────────────────────────────────
  const ACHIEVEMENTS = [
    { id: 'first_word', icon: '🔥', name: 'First Spark', desc: 'Complete Chapter 1', check: s => s.completedChapters.includes(1) },
    { id: 'ten_words', icon: '📖', name: 'Collector', desc: 'Collect 10 words', check: s => s.wordsCollected >= 10 },
    { id: 'fifty_words', icon: '📚', name: 'Hoarder', desc: 'Collect 50 words', check: s => s.wordsCollected >= 50 },
    { id: 'hundred_words', icon: '🏆', name: 'Centurion', desc: 'Collect 100 words', check: s => s.wordsCollected >= 100 },
    { id: 'phase1', icon: '🌋', name: 'Flame Keeper', desc: 'Complete Phase 1 — The Fire', check: s => phaseComplete(s, 1) },
    { id: 'phase2', icon: '🔧', name: 'Word Smith', desc: 'Complete Phase 2 — The Workshop', check: s => phaseComplete(s, 2) },
    { id: 'phase3', icon: '🏛️', name: 'Architect', desc: 'Complete Phase 3 — The Architecture', check: s => phaseComplete(s, 3) },
    { id: 'phase4', icon: '⚔️', name: 'Forged in Fire', desc: 'Complete Phase 4 — The Forge', check: s => phaseComplete(s, 4) },
    { id: 'five_chapters', icon: '🗺️', name: 'Explorer', desc: 'Complete 5 chapters', check: s => s.completedChapters.length >= 5 },
    { id: 'marathon', icon: '🏃', name: 'Marathon', desc: 'Complete 25 chapters', check: s => s.completedChapters.length >= 25 },
    { id: 'halfway', icon: '⚡', name: 'Halfway There', desc: 'Complete 50 chapters', check: s => s.completedChapters.length >= 50 },
    { id: 'master', icon: '👑', name: 'Das letzte Wort', desc: 'Complete all 100 chapters', check: s => s.completedChapters.length >= 100 },
    { id: 'quiz_ace', icon: '💎', name: 'Perfectionist', desc: 'Score 100% on any quiz', check: s => s.perfectQuizzes > 0 },
    { id: 'ten_patterns', icon: '🔍', name: 'Pattern Seeker', desc: 'Discover 10 patterns', check: s => s.patternsDiscovered >= 10 },
    { id: 'night_owl', icon: '🦉', name: 'Night Owl', desc: 'Study after midnight', check: s => s.nightOwl },
  ];

  function phaseComplete(s, phase) {
    const [start, end] = PHASE_CHAPTERS[phase];
    for (let i = start; i <= end; i++) {
      if (!s.completedChapters.includes(i)) return false;
    }
    return true;
  }

  // ─── DETECT CURRENT PAGE ──────────────────────────────────
  function detectPage() {
    const path = window.location.pathname;
    const file = path.split('/').pop().replace('.html', '');

    if (file === 'index') return { type: 'index', chapter: null };
    if (file === 'prologue') return { type: 'prologue', chapter: 0 };
    if (file === 'epilogue') return { type: 'epilogue', chapter: 101 };
    if (file.startsWith('interlude')) return { type: 'interlude', chapter: file };

    const match = file.match(/chapter(\d+)/);
    if (match) return { type: 'chapter', chapter: parseInt(match[1]) };

    return { type: 'unknown', chapter: null };
  }

  // ─── SAVE SYSTEM ──────────────────────────────────────────
  function getDefaultSave() {
    return {
      version: VERSION,
      lastChapter: 0,
      lastPage: 'prologue.html',
      lastScrollPercent: 0,
      lastVisit: Date.now(),
      completedChapters: [],
      wordsCollected: 0,
      patternsDiscovered: 0,
      perfectQuizzes: 0,
      nightOwl: false,
      unlockedAchievements: [],
      totalTimeSeconds: 0,
      chapterScrollPositions: {}
    };
  }

  function loadSave() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultSave();
      const data = JSON.parse(raw);
      // Merge with defaults for forward compatibility
      return { ...getDefaultSave(), ...data };
    } catch(e) {
      return getDefaultSave();
    }
  }

  function writeSave(save) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    } catch(e) {
      // localStorage full or unavailable — degrade gracefully
    }
  }

  // ─── STATE ────────────────────────────────────────────────
  const page = detectPage();
  const save = loadSave();
  let sessionStart = Date.now();

  // Night owl check
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) {
    save.nightOwl = true;
  }

  // Update last visit
  if (page.type === 'chapter') {
    save.lastChapter = page.chapter;
    save.lastPage = window.location.pathname.split('/').pop();
    save.lastVisit = Date.now();
  }

  // ─── READING PROGRESS BAR ────────────────────────────────
  function createProgressBar() {
    if (page.type === 'index') return;
    const bar = document.createElement('div');
    bar.id = 'ge-progress-bar';
    document.body.appendChild(bar);

    // Check if chapter already has a #progressBar — if so, hide it
    const existing = document.getElementById('progressBar');
    if (existing) existing.style.display = 'none';

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          bar.style.width = percent + '%';

          // Save scroll position for this chapter
          if (page.type === 'chapter') {
            save.lastScrollPercent = percent;
            save.chapterScrollPositions[page.chapter] = percent;
          }

          // Auto-mark chapter complete at 90% scroll
          if (percent > 90 && page.type === 'chapter' && !save.completedChapters.includes(page.chapter)) {
            save.completedChapters.push(page.chapter);
            save.completedChapters.sort((a, b) => a - b);
            checkAchievements();
            writeSave(save);
          }

          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ─── ESTIMATED READING TIME ───────────────────────────────
  function addReadingTime() {
    if (page.type !== 'chapter' && page.type !== 'prologue') return;

    const content = document.querySelector('.content') || document.querySelector('.page-wrapper') || document.querySelector('.container');
    if (!content) return;

    const text = content.innerText || content.textContent;
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200); // 200 WPM reading speed

    // Find the subtitle or title screen area
    const subtitle = document.querySelector('.subtitle') || document.querySelector('.title-screen .chapter-label');
    if (subtitle) {
      const timeEl = document.createElement('div');
      timeEl.className = 'ge-reading-time';
      timeEl.textContent = minutes + ' min read';
      subtitle.parentNode.insertBefore(timeEl, subtitle.nextSibling);
    }
  }

  // ─── WORD COLLECTION TRACKING ─────────────────────────────
  function trackWords() {
    // Count German words on this page (words with class 'german-word')
    const germanWords = document.querySelectorAll('.german-word');

    germanWords.forEach(word => {
      // Add loot burst on first click
      const originalClick = word.onclick;
      word.addEventListener('click', function(e) {
        createLootBurst(e.clientX, e.clientY);
      });
    });

    // Update word count from progress bars if they exist
    const wordBar = document.querySelector('[onclick*="words-detail"]') ||
                    document.querySelector('.progress-label');
    if (wordBar) {
      const text = wordBar.textContent || '';
      const match = text.match(/(\d+)\s*\/\s*(\d+)/);
      if (match) {
        const current = parseInt(match[1]);
        if (current > save.wordsCollected) {
          save.wordsCollected = current;
        }
      }
    }

    // Also try to extract from any progress text
    document.querySelectorAll('.progress-text, .prog-text').forEach(el => {
      const text = el.textContent || '';
      const match = text.match(/(\d+)\s*\/\s*(\d+)/);
      if (match) {
        const current = parseInt(match[1]);
        const label = el.closest('.progress-section')?.textContent || '';
        if (label.toLowerCase().includes('word') && current > save.wordsCollected) {
          save.wordsCollected = current;
        }
        if (label.toLowerCase().includes('pattern') && current > save.patternsDiscovered) {
          save.patternsDiscovered = current;
        }
      }
    });
  }

  // ─── LOOT BURST ANIMATION ────────────────────────────────
  function createLootBurst(x, y) {
    const container = document.createElement('div');
    container.className = 'ge-loot-burst';
    container.style.left = x + 'px';
    container.style.top = y + 'px';

    const count = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'ge-loot-particle';
      const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.5);
      const dist = 20 + Math.random() * 30;
      p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      p.style.width = (2 + Math.random() * 3) + 'px';
      p.style.height = p.style.width;
      container.appendChild(p);
    }

    document.body.appendChild(container);
    setTimeout(() => container.remove(), 1000);
  }

  // ─── TOAST NOTIFICATIONS ──────────────────────────────────
  function showToast(icon, text, subtext) {
    let container = document.getElementById('ge-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ge-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'ge-toast';
    toast.innerHTML = `
      <div class="icon">${icon}</div>
      <div class="text">${text}${subtext ? '<span class="sub">' + subtext + '</span>' : ''}</div>
    `;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 4500);
  }

  // ─── ACHIEVEMENT SYSTEM ───────────────────────────────────
  function checkAchievements() {
    ACHIEVEMENTS.forEach(ach => {
      if (!save.unlockedAchievements.includes(ach.id) && ach.check(save)) {
        save.unlockedAchievements.push(ach.id);
        showToast(ach.icon, 'Achievement Unlocked', ach.name + ' — ' + ach.desc);
        // Pulse the journal button
        const btn = document.getElementById('ge-journal-btn');
        if (btn) {
          const dot = btn.querySelector('.notif-dot');
          if (dot) dot.classList.add('show');
        }
      }
    });
    writeSave(save);
  }

  // ─── QUEST JOURNAL UI ────────────────────────────────────
  function createJournal() {
    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'ge-journal-overlay';
    overlay.addEventListener('click', toggleJournal);
    document.body.appendChild(overlay);

    // Panel
    const panel = document.createElement('div');
    panel.id = 'ge-journal';
    panel.innerHTML = buildJournalHTML();
    document.body.appendChild(panel);

    // Floating button
    const btn = document.createElement('button');
    btn.id = 'ge-journal-btn';
    btn.setAttribute('aria-label', 'Open Quest Journal');
    btn.innerHTML = '📜<div class="notif-dot"></div>';
    btn.addEventListener('click', toggleJournal);
    document.body.appendChild(btn);
  }

  function toggleJournal() {
    const panel = document.getElementById('ge-journal');
    const overlay = document.getElementById('ge-journal-overlay');
    if (panel && overlay) {
      const isOpen = panel.classList.contains('open');
      panel.classList.toggle('open');
      overlay.classList.toggle('open');
      if (!isOpen) {
        // Refresh content
        panel.innerHTML = buildJournalHTML();
        // Clear notification dot
        const dot = document.querySelector('#ge-journal-btn .notif-dot');
        if (dot) dot.classList.remove('show');
      }
    }
  }

  function buildJournalHTML() {
    const completedCount = save.completedChapters.length;
    const lastCh = save.lastChapter || 0;
    const lastChapterName = lastCh > 0 ? (CHAPTER_SUBTITLES[lastCh] || 'Chapter ' + lastCh) : 'Prologue';

    // Calculate next chapter to continue
    let nextChapter = lastCh;
    if (save.completedChapters.includes(lastCh)) {
      nextChapter = lastCh + 1;
    }
    const nextFile = nextChapter === 0 ? 'prologue.html' :
                     nextChapter > 100 ? 'epilogue.html' :
                     'chapter' + nextChapter + '.html';
    const nextName = nextChapter === 0 ? 'The Bookshop' :
                     nextChapter > 100 ? 'Epilogue' :
                     (CHAPTER_SUBTITLES[nextChapter] || 'Chapter ' + nextChapter);

    // Phase progress
    let phaseBars = '';
    for (let p = 1; p <= 4; p++) {
      const [start, end] = PHASE_CHAPTERS[p];
      const total = end - start + 1;
      const done = save.completedChapters.filter(c => c >= start && c <= end).length;
      const pct = Math.round((done / total) * 100);
      phaseBars += `
        <div class="ge-phase">
          <div class="ge-phase-label">
            <span class="name">Phase ${p}: ${PHASE_NAMES[p]}</span>
            <span class="count">${done}/${total}</span>
          </div>
          <div class="ge-phase-bar">
            <div class="ge-phase-bar-fill ${PHASE_CSS[p]}" style="width:${pct}%"></div>
          </div>
        </div>`;
    }

    // Achievements
    let achievementHTML = '';
    ACHIEVEMENTS.forEach(ach => {
      const unlocked = save.unlockedAchievements.includes(ach.id);
      achievementHTML += `
        <div class="ge-achievement ${unlocked ? 'unlocked' : ''}">
          <div class="icon">${unlocked ? ach.icon : '?'}</div>
          <div class="info">
            <div class="name">${unlocked ? ach.name : '???'}</div>
            <div class="desc">${ach.desc}</div>
          </div>
        </div>`;
    });

    // Time played
    const totalMins = Math.round(save.totalTimeSeconds / 60);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    return `
      <button class="ge-j-close" onclick="document.getElementById('ge-journal').classList.remove('open');document.getElementById('ge-journal-overlay').classList.remove('open');">&times;</button>
      <div class="ge-j-header">
        <h2>Quest Journal</h2>
        <div class="subtitle">Das erste Wort</div>
      </div>

      <div class="ge-j-section">
        <h3>Continue Your Journey</h3>
        <a href="${nextFile}" class="ge-continue-btn">
          Continue → Chapter ${nextChapter > 100 ? 'Epilogue' : nextChapter}
          <span class="chapter-name">${nextName}</span>
        </a>
      </div>

      <div class="ge-j-section">
        <h3>Progress</h3>
        <div class="ge-progress-row">
          <div class="ge-progress-item">
            <div class="number">${completedCount}</div>
            <div class="label">Chapters</div>
          </div>
          <div class="ge-progress-item">
            <div class="number">${save.wordsCollected}</div>
            <div class="label">Words</div>
          </div>
          <div class="ge-progress-item patterns">
            <div class="number">${save.patternsDiscovered}</div>
            <div class="label">Patterns</div>
          </div>
        </div>
      </div>

      <div class="ge-j-section">
        <h3>Phases</h3>
        ${phaseBars}
      </div>

      <div class="ge-j-section">
        <h3>Achievements (${save.unlockedAchievements.length}/${ACHIEVEMENTS.length})</h3>
        ${achievementHTML}
      </div>

      <div class="ge-j-section" style="text-align:center; opacity:0.4;">
        <div style="font-size:0.85rem;">Time studied: ${timeStr}</div>
      </div>
    `;
  }

  // ─── FIX CANVAS Z-INDEX ───────────────────────────────────
  function fixCanvasZIndex() {
    // Ensure ALL canvas elements sit behind content
    document.querySelectorAll('canvas').forEach(canvas => {
      const z = parseInt(window.getComputedStyle(canvas).zIndex);
      if (isNaN(z) || z > 0) {
        canvas.style.zIndex = '0';
      }
      canvas.style.pointerEvents = 'none';
    });

    // Ensure content sits above canvas
    const content = document.querySelector('.content') || document.querySelector('.page-wrapper') || document.querySelector('.container');
    if (content) {
      const z = parseInt(window.getComputedStyle(content).zIndex);
      if (isNaN(z) || z < 1) {
        content.style.position = 'relative';
        content.style.zIndex = '1';
      }
    }
  }

  // ─── WIRE AUDIO TO ALL GERMAN WORDS ──────────────────────
  function wireAudio() {
    // If speakGerman doesn't exist globally, create it
    if (typeof window.speakGerman !== 'function') {
      window.speakGerman = function(text, btn) {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'de-DE';
          utterance.rate = 0.85;
          const voices = window.speechSynthesis.getVoices();
          const deVoice = voices.find(v => v.lang.startsWith('de')) || voices.find(v => v.lang.includes('de'));
          if (deVoice) utterance.voice = deVoice;
          if (btn) {
            btn.classList.add('speaking');
            utterance.onend = () => btn.classList.remove('speaking');
            utterance.onerror = () => btn.classList.remove('speaking');
          }
          window.speechSynthesis.speak(utterance);
        }
      };
      // Pre-load voices
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
      }
    }

    // Wire all .german-word elements that don't already have onclick
    document.querySelectorAll('.german-word').forEach(el => {
      if (!el.getAttribute('onclick') && !el.dataset.geWired) {
        el.dataset.geWired = '1';
        el.addEventListener('click', function() {
          const word = this.textContent.trim().replace(/[.,;:!?()]/g, '');
          if (word) window.speakGerman(word);
        });
        // Add cursor hint
        el.style.cursor = 'pointer';
        el.title = 'Click to hear pronunciation';
      }
    });
  }

  // ─── QUIZ HOOK (track perfect scores) ─────────────────────
  function hookQuiz() {
    // Monitor for quiz completion by watching for score elements
    const observer = new MutationObserver(() => {
      const scoreEl = document.getElementById('quiz-score');
      if (scoreEl && scoreEl.textContent.includes('100%')) {
        if (save.perfectQuizzes === 0 || !save.perfectQuizzes) {
          save.perfectQuizzes = (save.perfectQuizzes || 0) + 1;
          checkAchievements();
          writeSave(save);
        }
      }
    });

    const quizContainer = document.querySelector('.quiz-container');
    if (quizContainer) {
      observer.observe(quizContainer, { childList: true, subtree: true, characterData: true });
    }
  }

  // ─── TIME TRACKING ────────────────────────────────────────
  function startTimeTracking() {
    // Save time every 30 seconds
    setInterval(() => {
      const elapsed = Math.round((Date.now() - sessionStart) / 1000);
      save.totalTimeSeconds = (save.totalTimeSeconds || 0) + 30;
      sessionStart = Date.now();
      writeSave(save);
    }, 30000);

    // Save on page unload
    window.addEventListener('beforeunload', () => {
      const elapsed = Math.round((Date.now() - sessionStart) / 1000);
      save.totalTimeSeconds = (save.totalTimeSeconds || 0) + elapsed;
      writeSave(save);
    });
  }

  // ─── FIX "COMING SOON" NAVIGATION ────────────────────────
  function fixNavigation() {
    // Find and fix any "COMING SOON" text in navigation
    document.querySelectorAll('.nav-section, .chapter-nav, [class*="nav"]').forEach(el => {
      const text = el.textContent;
      if (text && text.includes('COMING SOON')) {
        // Replace with actual chapter link
        el.querySelectorAll('a, span').forEach(child => {
          if (child.textContent.includes('COMING SOON')) {
            const chMatch = child.textContent.match(/CHAPTER\s+(\w+)/i);
            // Don't modify — just remove "COMING SOON"
            child.textContent = child.textContent.replace(/\s*—\s*COMING SOON/gi, '');
          }
        });
      }
    });

    // Also fix standalone text nodes
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      if (el.children.length === 0 && el.textContent.includes('COMING SOON')) {
        el.textContent = el.textContent.replace(/\s*—\s*COMING SOON/gi, '');
      }
    });
  }

  // ─── INDEX PAGE ENHANCEMENTS ──────────────────────────────
  function enhanceIndex() {
    if (page.type !== 'index') return;

    // Add "Continue Where You Left Off" banner
    if (save.lastChapter > 0) {
      const heroSection = document.querySelector('.hero') || document.querySelector('[class*="hero"]');
      const insertPoint = heroSection ? heroSection.nextSibling : (document.querySelector('.content') || document.querySelector('.page-wrapper'))?.firstChild;

      if (insertPoint && insertPoint.parentNode) {
        const banner = document.createElement('div');
        banner.style.cssText = `
          max-width: 720px; margin: 0 auto 40px; padding: 20px 28px;
          background: linear-gradient(135deg, rgba(232,164,74,0.08), rgba(232,164,74,0.03));
          border: 1px solid rgba(232,164,74,0.2); border-radius: 12px;
          text-align: center; position: relative; z-index: 10;
        `;
        const nextCh = save.completedChapters.includes(save.lastChapter) ? save.lastChapter + 1 : save.lastChapter;
        const nextFile = nextCh > 100 ? 'epilogue.html' : 'chapter' + nextCh + '.html';
        const nextName = CHAPTER_SUBTITLES[nextCh] || 'Chapter ' + nextCh;
        banner.innerHTML = `
          <div style="font-size:0.8rem;letter-spacing:0.15em;text-transform:uppercase;color:rgba(212,202,187,0.4);margin-bottom:8px;">Continue Your Journey</div>
          <a href="${nextFile}" style="color:#e8a44a;font-size:1.3rem;text-decoration:none;font-family:'Cormorant Garamond',serif;">
            Chapter ${nextCh}: ${nextName} →
          </a>
        `;
        insertPoint.parentNode.insertBefore(banner, insertPoint);
      }
    }

    // Add English subtitles to chapter links
    document.querySelectorAll('a[href*="chapter"]').forEach(link => {
      const href = link.getAttribute('href');
      const match = href.match(/chapter(\d+)/);
      if (match) {
        const chNum = parseInt(match[1]);
        const subtitle = CHAPTER_SUBTITLES[chNum];
        if (subtitle && !link.querySelector('.ge-subtitle')) {
          // Check if subtitle is already shown
          const existingText = link.textContent;
          if (!existingText.includes(subtitle)) {
            const sub = document.createElement('span');
            sub.className = 'ge-subtitle';
            sub.style.cssText = 'display:block;font-size:0.75rem;color:rgba(212,202,187,0.3);font-style:italic;margin-top:2px;';
            sub.textContent = subtitle;
            link.appendChild(sub);
          }
        }

        // Add completion checkmark
        if (save.completedChapters.includes(chNum)) {
          if (!link.querySelector('.ge-check')) {
            const check = document.createElement('span');
            check.className = 'ge-check';
            check.style.cssText = 'color:#8ed69e;margin-left:8px;font-size:0.9rem;';
            check.textContent = '✓';
            link.appendChild(check);
          }
        }

        // Dim future chapters (more than 2 ahead of current progress)
        const maxCompleted = Math.max(0, ...save.completedChapters, save.lastChapter);
        if (chNum > maxCompleted + 3 && save.completedChapters.length > 0) {
          link.style.opacity = '0.35';
        }
      }
    });
  }

  // ─── INITIALIZATION ───────────────────────────────────────
  function init() {
    // Only run on chapter/story pages and index
    if (page.type === 'unknown') return;

    createProgressBar();
    createJournal();
    fixCanvasZIndex();
    startTimeTracking();

    if (page.type === 'chapter' || page.type === 'prologue') {
      addReadingTime();
      wireAudio();
      trackWords();
      hookQuiz();
      fixNavigation();
    }

    if (page.type === 'index') {
      enhanceIndex();
    }

    // Initial achievement check
    checkAchievements();
    writeSave(save);

    // Restore scroll position if returning to a chapter
    if (page.type === 'chapter' && save.chapterScrollPositions[page.chapter]) {
      const pct = save.chapterScrollPositions[page.chapter];
      if (pct > 5 && pct < 95) {
        // Slight delay to let the page render
        setTimeout(() => {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const targetScroll = (pct / 100) * docHeight;
          // Only restore if user hasn't already scrolled
          if (window.scrollY < 50) {
            // Show a "resume" toast instead of auto-scrolling
            showToast('📖', 'Welcome back', 'You were ' + Math.round(pct) + '% through this chapter');
          }
        }, 1500);
      }
    }
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
