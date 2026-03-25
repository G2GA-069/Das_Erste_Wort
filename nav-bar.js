/**
 * Das erste Wort — Persistent Navigation Bar + Chapter Drawer + Scroll Memory
 *
 * Injects a fixed bottom nav bar into every chapter page with:
 *  - Back / Forward arrows for prev/next chapter
 *  - Chapter title (tap to open drawer)
 *  - Chapter list drawer with completion states
 *  - Scroll position save/restore
 *  - Time tracking per chapter
 */
(function () {
  'use strict';

  // ─── Detect current chapter ───
  const chMatch = window.location.pathname.match(/chapter(\d+)\.html/);
  const isPrologue = window.location.pathname.includes('prologue.html');
  const isIndex = !chMatch && !isPrologue;
  const currentCh = chMatch ? parseInt(chMatch[1]) : (isPrologue ? 0 : null);

  // Don't render nav on index page
  if (isIndex) return;

  // ─── Chapter titles (compact) ───
  const TITLES = {0:"Prologue",1:"Das erste Wort",2:"Die Waldsprache",3:"Die Lautverschiebung",4:"Der Adler und die Eiche",5:"Die Grenze",6:"Die Völkerwanderung",7:"Die Franken",8:"Die Feder und das Pergament",9:"Das Hildebrandslied",10:"Der Marktplatz",11:"Der Ritter und die Rose",12:"Der Kreuzzug",13:"Der schwarze Tod",14:"Die Druckerpresse",15:"Die Bibel auf Deutsch",16:"Die Spaltung",17:"Der Dreißigjährige Krieg",18:"Die Sprachgesellschaften",19:"Die Aufklärung",20:"Der Wanderer",21:"Die Fabrik",22:"Das Kaiserreich",23:"Die Republik",24:"Die Stille",25:"Die Mauer",26:"Die Gegenwart",27:"Der Schlüssel",28:"Das Gegenteil",29:"Der Aufstieg",30:"Der Ausgang",31:"Die Einladung",32:"Die Abfahrt",33:"Die Zusammensetzung",34:"Das Zeug",35:"Die Verwandlung",36:"Die Freiheit",37:"Die Freundschaft",38:"Das Wunderbare",39:"Der Denker",40:"Die Entdeckung",41:"Der Zerfall",42:"Der Anfang",43:"Das Vorwort",44:"Die Wiederholung",45:"Die Brücke",46:"Das Gesamtbild",47:"Der/Die/Das",48:"Ich bin",49:"Ich habe",50:"Was machst du?",51:"Wollen, können, müssen",52:"Dürfen, sollen, mögen",53:"Den Mann",54:"Dem Kind",55:"Des Vaters",56:"Die vier Fälle",57:"Wohin? Wo?",58:"Perfekt",59:"Präteritum",60:"Plusquamperfekt",61:"Futur",62:"Das Verb am Ende",63:"Weil, dass, obwohl",64:"Und, aber, denn",65:"Der Mann, der...",66:"Passiv",67:"Konjunktiv II",68:"Indirekte Rede",69:"Komparativ/Superlativ",70:"Reflexive Verben",71:"Lassen",72:"Um...zu, ohne...zu",73:"Adjektivdeklination I",74:"Adjektivdeklination II",75:"Zeitadverbien",76:"Konnektoren",77:"Partizipien",78:"Das Bauwerk",79:"Starke Verben I",80:"Starke Verben II",81:"Starke Verben III",82:"Starke Verben IV",83:"Falsche Freunde I",84:"Falsche Freunde II",85:"Doch, mal, ja",86:"Halt, eben, schon",87:"Eigentlich, übrigens",88:"Redewendungen I",89:"Redewendungen II",90:"Wortspiele",91:"Kollokationen",92:"Präpositionen I",93:"Präpositionen II",94:"Formelles Schreiben",95:"Wissenschaftliches Deutsch",96:"Literarisches Deutsch",97:"Zeitungsdeutsch",98:"Gesprochenes Deutsch",99:"Dialekte",100:"Das letzte Wort"};

  const PHASES = [
    { name: 'The Story of German', start: 1, end: 26, color: '#e8a44a' },
    { name: 'Word Architecture', start: 27, end: 46, color: '#c47a4a' },
    { name: 'The Grammar Quest', start: 47, end: 78, color: '#9b8ec4' },
    { name: 'Mastery', start: 79, end: 100, color: '#c45d5d' }
  ];

  // ─── Inject CSS ───
  const css = document.createElement('style');
  css.textContent = `
    /* Bottom nav bar */
    .dew-nav {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 8000;
      height: 56px;
      background: linear-gradient(180deg, rgba(8,8,16,0.92) 0%, rgba(8,8,16,0.98) 100%);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid rgba(232,164,74,0.12);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px;
      font-family: 'Inter', 'Cormorant Garamond', sans-serif;
      user-select: none;
      -webkit-user-select: none;
    }
    .dew-nav-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px; height: 48px;
      border: none;
      background: none;
      color: #d4cabb;
      font-size: 1.3rem;
      cursor: pointer;
      border-radius: 50%;
      transition: all 0.2s;
      flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
    }
    .dew-nav-btn:hover { background: rgba(232,164,74,0.1); color: #e8a44a; }
    .dew-nav-btn:active { transform: scale(0.92); }
    .dew-nav-btn[disabled] { opacity: 0.2; pointer-events: none; }
    .dew-nav-center {
      flex: 1;
      text-align: center;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 8px;
      transition: background 0.2s;
      min-width: 0;
      -webkit-tap-highlight-color: transparent;
    }
    .dew-nav-center:hover { background: rgba(232,164,74,0.06); }
    .dew-nav-center:active { background: rgba(232,164,74,0.12); }
    .dew-nav-ch-label {
      font-size: 0.55rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(232,164,74,0.45);
      margin-bottom: 1px;
    }
    .dew-nav-ch-title {
      font-size: 0.8rem;
      color: #d4cabb;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-weight: 500;
    }
    .dew-nav-home {
      font-size: 1.1rem;
    }

    /* Spacer so page content isn't hidden behind nav */
    .dew-nav-spacer { height: 64px; }

    /* Chapter drawer / overlay */
    .dew-drawer-backdrop {
      position: fixed;
      inset: 0;
      z-index: 8500;
      background: rgba(0,0,0,0.7);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    .dew-drawer-backdrop.open { opacity: 1; pointer-events: auto; }

    .dew-drawer {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 8600;
      max-height: 75vh;
      background: linear-gradient(180deg, #12121e 0%, #0a0a14 100%);
      border-top: 1px solid rgba(232,164,74,0.15);
      border-radius: 20px 20px 0 0;
      transform: translateY(100%);
      transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .dew-drawer.open { transform: translateY(0); }

    .dew-drawer-handle {
      text-align: center;
      padding: 12px 0 8px;
      cursor: grab;
      flex-shrink: 0;
    }
    .dew-drawer-handle::before {
      content: '';
      display: inline-block;
      width: 40px; height: 4px;
      background: rgba(232,164,74,0.25);
      border-radius: 2px;
    }
    .dew-drawer-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.1rem;
      color: #e8a44a;
      text-align: center;
      padding: 0 20px 12px;
      font-weight: 500;
      flex-shrink: 0;
    }
    .dew-drawer-scroll {
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      padding: 0 16px 24px;
      flex: 1;
    }

    /* Phase groups */
    .dew-phase-group {
      margin-bottom: 16px;
    }
    .dew-phase-header {
      font-family: 'Inter', sans-serif;
      font-size: 0.6rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      padding: 8px 4px 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dew-phase-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .dew-phase-count {
      margin-left: auto;
      opacity: 0.5;
      font-size: 0.55rem;
    }

    /* Chapter items */
    .dew-ch-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s;
      text-decoration: none;
      color: #d4cabb;
      -webkit-tap-highlight-color: transparent;
    }
    .dew-ch-item:hover { background: rgba(232,164,74,0.06); }
    .dew-ch-item.active {
      background: rgba(232,164,74,0.1);
      border: 1px solid rgba(232,164,74,0.15);
    }
    .dew-ch-num {
      font-family: 'Inter', sans-serif;
      font-size: 0.65rem;
      color: rgba(232,164,74,0.4);
      width: 24px;
      text-align: right;
      flex-shrink: 0;
    }
    .dew-ch-name {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 0.95rem;
      flex: 1;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dew-ch-status {
      flex-shrink: 0;
      font-size: 0.75rem;
      opacity: 0.5;
    }
    .dew-ch-item.completed .dew-ch-status { color: #6cc070; opacity: 0.8; }
    .dew-ch-item.completed .dew-ch-name { color: rgba(212,202,187,0.6); }

    /* Scroll-to-top pill (shows after scrolling past title) */
    .dew-scroll-restore {
      position: fixed;
      bottom: 68px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      z-index: 7900;
      background: rgba(232,164,74,0.12);
      border: 1px solid rgba(232,164,74,0.2);
      color: #e8a44a;
      font-family: 'Inter', sans-serif;
      font-size: 0.65rem;
      letter-spacing: 0.08em;
      padding: 8px 18px;
      border-radius: 20px;
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s ease;
      -webkit-tap-highlight-color: transparent;
    }
    .dew-scroll-restore.visible {
      opacity: 1;
      pointer-events: auto;
      transform: translateX(-50%) translateY(0);
    }
  `;
  document.head.appendChild(css);

  // ─── Build nav bar HTML ───
  const prevCh = currentCh === 0 ? null : (currentCh === 1 ? 0 : currentCh - 1);
  const nextCh = currentCh === 0 ? 1 : (currentCh < 100 ? currentCh + 1 : null);
  const prevHref = prevCh === null ? '#' : (prevCh === 0 ? 'prologue.html' : `chapter${prevCh}.html`);
  const nextHref = nextCh === null ? '#' : `chapter${nextCh}.html`;

  const chLabel = isPrologue ? 'Prologue' : `Chapter ${currentCh}`;
  const chTitle = TITLES[currentCh] || chLabel;

  const nav = document.createElement('nav');
  nav.className = 'dew-nav';
  nav.innerHTML = `
    <button class="dew-nav-btn" id="dew-prev" ${prevCh === null ? 'disabled' : ''} title="Previous chapter">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4L7 10L13 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div class="dew-nav-center" id="dew-center" title="Open chapter list">
      <div class="dew-nav-ch-label">${chLabel}</div>
      <div class="dew-nav-ch-title">${chTitle}</div>
    </div>
    <button class="dew-nav-btn dew-nav-home" id="dew-home" title="Home">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10L10 3L17 10M5 8.5V16.5H8.5V12H11.5V16.5H15V8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <button class="dew-nav-btn" id="dew-next" ${nextCh === null ? 'disabled' : ''} title="Next chapter">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 4L13 10L7 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  `;

  // Spacer to prevent content being hidden behind nav
  const spacer = document.createElement('div');
  spacer.className = 'dew-nav-spacer';

  // ─── Build chapter drawer ───
  const backdrop = document.createElement('div');
  backdrop.className = 'dew-drawer-backdrop';

  const drawer = document.createElement('div');
  drawer.className = 'dew-drawer';

  let drawerHTML = `
    <div class="dew-drawer-handle"></div>
    <div class="dew-drawer-title">Chapters</div>
    <div class="dew-drawer-scroll" id="dew-drawer-scroll">
  `;

  // Prologue
  drawerHTML += `
    <div class="dew-phase-group">
      <a class="dew-ch-item ${isPrologue ? 'active' : ''}" href="prologue.html">
        <span class="dew-ch-num">&bull;</span>
        <span class="dew-ch-name">Prologue</span>
        <span class="dew-ch-status"></span>
      </a>
    </div>
  `;

  for (const phase of PHASES) {
    let completedCount = 0;
    let itemsHTML = '';

    for (let i = phase.start; i <= phase.end; i++) {
      const isComplete = !!(window.DEW && window.DEW.store && window.DEW.store.isChapterComplete(i))
        || !!localStorage.getItem('dew-completed-' + i);
      if (isComplete) completedCount++;

      const isCurrent = i === currentCh;
      itemsHTML += `
        <a class="dew-ch-item ${isCurrent ? 'active' : ''} ${isComplete ? 'completed' : ''}" href="chapter${i}.html">
          <span class="dew-ch-num">${i}</span>
          <span class="dew-ch-name">${TITLES[i] || 'Chapter ' + i}</span>
          <span class="dew-ch-status">${isComplete ? '✓' : ''}</span>
        </a>
      `;
    }

    const total = phase.end - phase.start + 1;
    drawerHTML += `
      <div class="dew-phase-group">
        <div class="dew-phase-header" style="color: ${phase.color};">
          <span class="dew-phase-dot" style="background: ${phase.color};"></span>
          Phase: ${phase.name}
          <span class="dew-phase-count">${completedCount}/${total}</span>
        </div>
        ${itemsHTML}
      </div>
    `;
  }

  drawerHTML += '</div>';
  drawer.innerHTML = drawerHTML;

  // ─── Append to DOM ───
  document.body.appendChild(spacer);
  document.body.appendChild(nav);
  document.body.appendChild(backdrop);
  document.body.appendChild(drawer);

  // ─── Nav button handlers ───
  document.getElementById('dew-prev').addEventListener('click', () => {
    if (prevCh !== null) window.location.href = prevHref;
  });
  document.getElementById('dew-next').addEventListener('click', () => {
    if (nextCh !== null) window.location.href = nextHref;
  });
  document.getElementById('dew-home').addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // Drawer open/close
  let drawerOpen = false;
  function openDrawer() {
    drawerOpen = true;
    backdrop.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Scroll to current chapter in drawer
    requestAnimationFrame(() => {
      const active = drawer.querySelector('.dew-ch-item.active');
      if (active) {
        active.scrollIntoView({ block: 'center', behavior: 'instant' });
      }
    });
  }
  function closeDrawer() {
    drawerOpen = false;
    backdrop.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('dew-center').addEventListener('click', () => {
    if (drawerOpen) closeDrawer(); else openDrawer();
  });
  backdrop.addEventListener('click', closeDrawer);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawerOpen) closeDrawer();
  });

  // ─── Swipe to dismiss drawer ───
  let touchStartY = 0;
  drawer.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  drawer.addEventListener('touchmove', (e) => {
    const dy = e.touches[0].clientY - touchStartY;
    if (dy > 60) closeDrawer();
  }, { passive: true });

  // ─── Scroll position save/restore ───
  if (currentCh !== null && currentCh >= 1) {
    // Register visit
    if (window.DEW && window.DEW.store) {
      window.DEW.store.visitChapter(currentCh);
    }

    // Save scroll position periodically
    let scrollSaveTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollSaveTimeout);
      scrollSaveTimeout = setTimeout(() => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll > 0 && window.DEW && window.DEW.store) {
          window.DEW.store.setScrollPos(currentCh, window.scrollY / maxScroll);
        }
      }, 500);
    }, { passive: true });

    // Check if there's a saved position to restore
    if (window.DEW && window.DEW.store) {
      const savedPos = window.DEW.store.getScrollPos(currentCh);
      if (savedPos > 0.02) {
        // Show "Continue where you left off?" pill
        const pill = document.createElement('button');
        pill.className = 'dew-scroll-restore';
        pill.textContent = '↓ Continue where you left off';
        document.body.appendChild(pill);

        setTimeout(() => pill.classList.add('visible'), 1500);

        pill.addEventListener('click', () => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({ top: maxScroll * savedPos, behavior: 'smooth' });
          pill.classList.remove('visible');
          setTimeout(() => pill.remove(), 400);
        });

        // Auto-hide after 8 seconds
        setTimeout(() => {
          pill.classList.remove('visible');
          setTimeout(() => pill.remove(), 400);
        }, 8000);
      }
    }

    // ─── Time tracking ───
    let sessionStart = Date.now();
    window.addEventListener('beforeunload', () => {
      const elapsed = Date.now() - sessionStart;
      if (window.DEW && window.DEW.store && elapsed > 2000) {
        window.DEW.store.addTime(currentCh, elapsed);
      }
    });
  }

  // ─── Swipe navigation between chapters ───
  let swipeStartX = 0;
  let swipeStartY = 0;
  let swiping = false;

  document.addEventListener('touchstart', (e) => {
    if (drawerOpen) return;
    swipeStartX = e.touches[0].clientX;
    swipeStartY = e.touches[0].clientY;
    swiping = true;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (!swiping || drawerOpen) return;
    swiping = false;
    const dx = e.changedTouches[0].clientX - swipeStartX;
    const dy = e.changedTouches[0].clientY - swipeStartY;
    // Only trigger if horizontal swipe is dominant and long enough
    if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 2) {
      if (dx > 0 && prevCh !== null) {
        window.location.href = prevHref;
      } else if (dx < 0 && nextCh !== null) {
        window.location.href = nextHref;
      }
    }
  }, { passive: true });

})();
