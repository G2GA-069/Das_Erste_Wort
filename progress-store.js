/**
 * Das erste Wort — Progress Store
 * Centralized state management for user progress across all 100 chapters.
 * Stores data in localStorage as structured JSON.
 *
 * Usage:
 *   DEW.store.markChapterComplete(7);
 *   DEW.store.setQuizScore(7, 85);
 *   DEW.store.getOverallProgress();
 *   DEW.store.setScrollPos(7, 0.45);
 *   DEW.store.getScrollPos(7); // → 0.45
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'dew-progress';
  const VERSION = 1;

  // ─── Default state shape ───
  function createDefault() {
    return {
      version: VERSION,
      lastChapter: null,
      lastVisited: null,        // ISO timestamp
      totalTimeMs: 0,
      chapters: {}              // keyed by chapter number (string)
    };
  }

  function chapterDefault() {
    return {
      completed: false,
      quizBest: 0,              // percentage 0-100
      quizAttempts: 0,
      wordsViewed: [],          // array of word IDs viewed
      scrollPos: 0,             // 0.0 to 1.0
      timeSpentMs: 0,
      firstVisit: null,         // ISO timestamp
      lastVisit: null           // ISO timestamp
    };
  }

  // ─── Load / Save ───
  let _state = null;

  function load() {
    if (_state) return _state;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        _state = JSON.parse(raw);
        // Migration: ensure version compatibility
        if (!_state.version || _state.version < VERSION) {
          _state.version = VERSION;
        }
        if (!_state.chapters) _state.chapters = {};
      } else {
        _state = createDefault();
        // Migrate from old localStorage keys
        migrateOldData(_state);
      }
    } catch (e) {
      console.warn('[DEW Store] Failed to load, resetting:', e);
      _state = createDefault();
    }
    return _state;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
    } catch (e) {
      console.warn('[DEW Store] Failed to save:', e);
    }
  }

  // Migrate from old dew-last-chapter / dew-completed-N keys
  function migrateOldData(state) {
    const last = localStorage.getItem('dew-last-chapter');
    if (last) {
      const n = parseInt(last);
      if (n >= 1 && n <= 100) state.lastChapter = n;
    }
    for (let i = 1; i <= 100; i++) {
      if (localStorage.getItem('dew-completed-' + i)) {
        ensureChapter(state, i);
        state.chapters[i].completed = true;
      }
    }
  }

  function ensureChapter(state, ch) {
    const key = String(ch);
    if (!state.chapters[key]) {
      state.chapters[key] = chapterDefault();
    }
    return state.chapters[key];
  }

  // ─── Public API ───
  const store = {

    // Chapter visits
    visitChapter(ch) {
      const s = load();
      const c = ensureChapter(s, ch);
      const now = new Date().toISOString();
      if (!c.firstVisit) c.firstVisit = now;
      c.lastVisit = now;
      s.lastChapter = ch;
      s.lastVisited = now;
      // Also write old key for backward compat with index.html
      localStorage.setItem('dew-last-chapter', String(ch));
      save();

      // Tell service worker to precache nearby chapters
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'PRECACHE_CHAPTERS',
          chapter: ch
        });
      }
    },

    markChapterComplete(ch) {
      const s = load();
      const c = ensureChapter(s, ch);
      c.completed = true;
      // Also write old key for backward compat
      localStorage.setItem('dew-completed-' + ch, '1');
      save();
    },

    isChapterComplete(ch) {
      const s = load();
      const c = s.chapters[String(ch)];
      return c ? c.completed : false;
    },

    // Quiz
    setQuizScore(ch, score) {
      const s = load();
      const c = ensureChapter(s, ch);
      c.quizAttempts++;
      if (score > c.quizBest) c.quizBest = score;
      if (score >= 80) c.completed = true;
      save();
    },

    getQuizBest(ch) {
      const s = load();
      const c = s.chapters[String(ch)];
      return c ? c.quizBest : 0;
    },

    // Scroll position
    setScrollPos(ch, pos) {
      const s = load();
      const c = ensureChapter(s, ch);
      c.scrollPos = Math.min(1, Math.max(0, pos));
      save();
    },

    getScrollPos(ch) {
      const s = load();
      const c = s.chapters[String(ch)];
      return c ? c.scrollPos : 0;
    },

    // Word tracking
    trackWord(ch, wordId) {
      const s = load();
      const c = ensureChapter(s, ch);
      if (!c.wordsViewed.includes(wordId)) {
        c.wordsViewed.push(wordId);
        save();
      }
    },

    // Time tracking
    addTime(ch, ms) {
      const s = load();
      const c = ensureChapter(s, ch);
      c.timeSpentMs += ms;
      s.totalTimeMs += ms;
      save();
    },

    // Overall stats
    getLastChapter() {
      return load().lastChapter;
    },

    getOverallProgress() {
      const s = load();
      let completed = 0;
      let totalQuizBest = 0;
      let chaptersWithQuiz = 0;
      for (let i = 1; i <= 100; i++) {
        const c = s.chapters[String(i)];
        if (c) {
          if (c.completed) completed++;
          if (c.quizAttempts > 0) {
            totalQuizBest += c.quizBest;
            chaptersWithQuiz++;
          }
        }
      }
      return {
        completed,
        total: 100,
        percent: Math.round((completed / 100) * 100),
        avgQuizScore: chaptersWithQuiz > 0 ? Math.round(totalQuizBest / chaptersWithQuiz) : 0,
        totalTimeMs: s.totalTimeMs
      };
    },

    getPhaseProgress(phase) {
      const PHASES = {
        1: { start: 1, end: 26 },
        2: { start: 27, end: 46 },
        3: { start: 47, end: 78 },
        4: { start: 79, end: 100 }
      };
      const p = PHASES[phase];
      if (!p) return { completed: 0, total: 0 };
      const s = load();
      let completed = 0;
      const total = p.end - p.start + 1;
      for (let i = p.start; i <= p.end; i++) {
        const c = s.chapters[String(i)];
        if (c && c.completed) completed++;
      }
      return { completed, total, percent: Math.round((completed / total) * 100) };
    },

    // Export / Import
    exportData() {
      return JSON.stringify(load(), null, 2);
    },

    importData(json) {
      try {
        const data = JSON.parse(json);
        if (data.version && data.chapters) {
          _state = data;
          save();
          return true;
        }
      } catch (e) {
        console.warn('[DEW Store] Import failed:', e);
      }
      return false;
    },

    // Get raw state (for debugging)
    _debug() {
      return load();
    }
  };

  // ─── Expose globally ───
  window.DEW = window.DEW || {};
  window.DEW.store = store;

})();
