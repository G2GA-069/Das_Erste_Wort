// progress-renderer.js — Cumulative progress display for Das Erste Wort
// Each chapter sets CURRENT_CHAPTER before including this script.
// Requires vocab-data.js to be loaded first.

(function() {
  'use strict';

  if (typeof VOCAB_DATA === 'undefined' || typeof CURRENT_CHAPTER === 'undefined') return;

  const TOTAL_WORDS = 467;
  const TOTAL_PATTERNS = 254;

  // Filter data up to current chapter
  const myWords = VOCAB_DATA.words.filter(w => w.c <= CURRENT_CHAPTER);
  const myPatterns = VOCAB_DATA.patterns.filter(p => p.c <= CURRENT_CHAPTER);

  // Group by chapter
  function groupByChapter(items, chKey) {
    const groups = {};
    items.forEach(item => {
      const ch = item[chKey || 'c'];
      if (!groups[ch]) groups[ch] = [];
      groups[ch].push(item);
    });
    return groups;
  }

  const wordsByChapter = groupByChapter(myWords, 'c');
  const patternsByChapter = groupByChapter(myPatterns, 'c');

  // Chapter titles (abbreviated)
  const CHAPTER_TITLES = {
    1:"Das erste Wort",2:"Die Waldsprache",3:"Die Lautverschiebung",4:"Der Adler und die Eiche",
    5:"Die Grenze",6:"Die Völkerwanderung",7:"Die Franken",8:"Die Feder und das Pergament",
    9:"Das Hildebrandslied",10:"Der Marktplatz",11:"Der Ritter und die Rose",12:"Der Kreuzzug",
    13:"Der schwarze Tod",14:"Die Druckerpresse",15:"Die Bibel auf Deutsch",16:"Die Spaltung",
    17:"Der Dreißigjährige Krieg",18:"Die Sprachgesellschaften",19:"Die Aufklärung",
    20:"Der Wanderer",21:"Die Fabrik",22:"Das Kaiserreich",23:"Die Republik",24:"Die Stille",
    25:"Die Mauer",26:"Die Gegenwart",27:"Der Schlüssel (ver-)",28:"Das Gegenteil (un-)",
    29:"Der Aufstieg (auf-)",30:"Der Ausgang (aus-)",31:"Die Einladung (ein-)",
    32:"Die Abfahrt (ab-)",33:"Die Zusammensetzung",34:"Das Zeug",35:"Die Verwandlung (-ung)",
    36:"Die Freiheit (-heit/-keit)",37:"Die Freundschaft (-schaft)",38:"Das Wunderbare (-lich/-bar/-ig)",
    39:"Der Denker (-er/-in)",40:"Die Entdeckung (ent-)",41:"Der Zerfall (zer-)",
    42:"Der Anfang (an-/bei-/mit-)",43:"Das Vorwort (vor-/nach-)",44:"Die Wiederholung (wieder-)",
    45:"Die Brücke (be-/er-/ge-)",46:"Das Gesamtbild",47:"Der/Die/Das",48:"Ich bin",
    49:"Ich habe",50:"Was machst du?",51:"Wollen, können, müssen",52:"Dürfen, sollen, mögen",
    53:"Den Mann (Akkusativ)",54:"Dem Kind (Dativ)",55:"Des Vaters (Genitiv)",56:"Die vier Fälle",
    57:"Wohin? Wo?",58:"Perfekt",59:"Präteritum",60:"Plusquamperfekt",61:"Futur",
    62:"Das Verb am Ende",63:"Weil, dass, obwohl",64:"Und, aber, denn",65:"Der Mann, der...",
    66:"Passiv",67:"Konjunktiv II",68:"Indirekte Rede",69:"Komparativ/Superlativ",
    70:"Reflexive Verben",71:"Lassen",72:"Um...zu, ohne...zu",73:"Adjektivdeklination I",
    74:"Adjektivdeklination II",75:"Zeitadverbien",76:"Konnektoren",77:"Partizipien",
    78:"Das Bauwerk",79:"Starke Verben I",80:"Starke Verben II",81:"Starke Verben III",
    82:"Starke Verben IV",83:"Falsche Freunde I",84:"Falsche Freunde II",85:"Doch, mal, ja",
    86:"Halt, eben, schon",87:"Eigentlich, übrigens",88:"Redewendungen I",89:"Redewendungen II",
    90:"Wortspiele",91:"Kollokationen",92:"Präpositionen I",93:"Präpositionen II",
    94:"Formelles Schreiben",95:"Wissenschaftliches Deutsch",96:"Literarisches Deutsch",
    97:"Zeitungsdeutsch",98:"Gesprochenes Deutsch",99:"Dialekte",100:"Das letzte Wort"
  };

  // Build the words table HTML
  function buildWordTable() {
    const chapters = Object.keys(wordsByChapter).map(Number).sort((a, b) => b - a); // current first
    let html = '';

    chapters.forEach(ch => {
      const words = wordsByChapter[ch];
      const isCurrent = ch === CURRENT_CHAPTER;
      const title = CHAPTER_TITLES[ch] || 'Chapter ' + ch;

      html += `<div class="progress-chapter-group${isCurrent ? ' current' : ''}" data-ch="${ch}">`;
      html += `<div class="progress-chapter-header" onclick="this.parentElement.classList.toggle('collapsed')">`;
      html += `<span class="progress-ch-arrow">▾</span>`;
      html += `<span class="progress-ch-title">Ch ${ch}: ${title}</span>`;
      html += `<span class="progress-ch-count">${words.length} word${words.length !== 1 ? 's' : ''}</span>`;
      html += `</div>`;
      html += `<div class="progress-ch-body">`;
      html += `<table class="progress-table"><tbody>`;
      words.forEach(w => {
        html += `<tr><td class="pt-word">${w.w}</td><td class="pt-meaning">${w.m}</td></tr>`;
      });
      html += `</tbody></table></div></div>`;
    });

    return html;
  }

  // Build the patterns table HTML
  function buildPatternTable() {
    const chapters = Object.keys(patternsByChapter).map(Number).sort((a, b) => b - a);
    let html = '';

    chapters.forEach(ch => {
      const patterns = patternsByChapter[ch];
      const isCurrent = ch === CURRENT_CHAPTER;
      const title = CHAPTER_TITLES[ch] || 'Chapter ' + ch;

      html += `<div class="progress-chapter-group${isCurrent ? ' current' : ''}" data-ch="${ch}">`;
      html += `<div class="progress-chapter-header" onclick="this.parentElement.classList.toggle('collapsed')">`;
      html += `<span class="progress-ch-arrow">▾</span>`;
      html += `<span class="progress-ch-title">Ch ${ch}: ${title}</span>`;
      html += `<span class="progress-ch-count">${patterns.length}</span>`;
      html += `</div>`;
      html += `<div class="progress-ch-body">`;
      html += `<table class="progress-table"><tbody>`;
      patterns.forEach(p => {
        const desc = p.d ? `<td class="pt-meaning">${p.d}</td>` : '';
        html += `<tr><td class="pt-word">${p.p}</td>${desc}</tr>`;
      });
      html += `</tbody></table></div></div>`;
    });

    return html;
  }

  // Inject CSS immediately (doesn't need DOM elements to exist)
  const style = document.createElement('style');
  style.textContent = `
    .progress-chapter-group {
      border-bottom: 1px solid rgba(232,164,74,0.06);
    }
    .progress-chapter-group.current {
      border-left: 3px solid #e8a44a;
      background: rgba(232,164,74,0.04);
      border-radius: 4px;
    }
    .progress-chapter-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      cursor: pointer;
      user-select: none;
      transition: background 0.15s;
    }
    .progress-chapter-header:hover {
      background: rgba(232,164,74,0.06);
    }
    .progress-ch-arrow {
      color: rgba(212,202,187,0.3);
      font-size: 0.75rem;
      transition: transform 0.2s;
      width: 12px;
    }
    .progress-chapter-group.collapsed .progress-ch-arrow {
      transform: rotate(-90deg);
    }
    .progress-ch-title {
      flex: 1;
      font-size: 0.8rem;
      color: rgba(212,202,187,0.6);
    }
    .progress-chapter-group.current .progress-ch-title {
      color: #e8a44a;
      font-weight: 600;
    }
    .progress-ch-count {
      font-size: 0.75rem;
      color: rgba(212,202,187,0.3);
      min-width: 50px;
      text-align: right;
    }
    .progress-ch-body {
      max-height: 500px;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }
    .progress-chapter-group.collapsed .progress-ch-body {
      max-height: 0;
    }
    .progress-table {
      width: 100%;
      border-collapse: collapse;
    }
    .progress-table td {
      padding: 3px 10px 3px 30px;
      font-size: 0.8rem;
      border-bottom: 1px solid rgba(212,202,187,0.03);
    }
    .pt-word {
      color: #e8a44a;
      font-weight: 600;
      white-space: nowrap;
    }
    .pt-meaning {
      color: rgba(212,202,187,0.6);
    }
    /* Pattern tables use purple */
    #patterns-detail .pt-word {
      color: #9b8ec4;
    }
    #patterns-detail .progress-chapter-group.current {
      border-left-color: #9b8ec4;
      background: rgba(155,142,196,0.04);
    }
    #patterns-detail .progress-chapter-header:hover {
      background: rgba(155,142,196,0.06);
    }
    #patterns-detail .progress-chapter-group.current .progress-ch-title {
      color: #9b8ec4;
    }
    /* Fix canvas overlap on progress section */
    #words-bar-row, #words-detail, #patterns-bar-row, #patterns-detail {
      position: relative;
      z-index: 10;
    }
  `;
  document.head.appendChild(style);

  // All DOM operations that target progress elements (which appear AFTER the script tag
  // in the HTML) must wait for the full DOM to be parsed. Without this, getElementById
  // returns null because those elements haven't been created yet.
  function updateProgressDOM() {
    // Inject grouped word/pattern tables
    const wordsDetail = document.getElementById('words-detail');
    const patternsDetail = document.getElementById('patterns-detail');

    if (wordsDetail) {
      wordsDetail.innerHTML = buildWordTable();
    }

    if (patternsDetail) {
      patternsDetail.innerHTML = buildPatternTable();
    }

    // Update the counts in the bar
    const wordsPct = Math.round((myWords.length / TOTAL_WORDS) * 100);
    const patternsPct = Math.round((myPatterns.length / TOTAL_PATTERNS) * 100);

    // Update bar text and fill width using DOM structure (not style-attribute selectors)
    function updateBarRow(barRowId, count, total, pct, color, pctColor) {
      const barRow = document.getElementById(barRowId);
      if (!barRow) return;

      // Bar row structure:
      //   div (flex row with two spans: label + bold count)
      //   div (bar track with one child: the fill)
      //   div (hint text)
      const firstDiv = barRow.querySelector('div');
      if (firstDiv) {
        const spans = firstDiv.querySelectorAll(':scope > span');
        if (spans.length >= 2) {
          spans[1].innerHTML = count + ' / ' + total +
            ' <span style="font-size:0.85rem;font-weight:400;color:' + pctColor + ';">(' + pct + '%)</span>';
        }
      }

      const childDivs = barRow.querySelectorAll(':scope > div');
      if (childDivs.length >= 2) {
        const barTrack = childDivs[1];
        const fill = barTrack.firstElementChild;
        if (fill) fill.style.width = pct + '%';
      }
    }

    updateBarRow('words-bar-row', myWords.length, TOTAL_WORDS, wordsPct,
      '#e8a44a', 'rgba(232,164,74,0.6)');
    updateBarRow('patterns-bar-row', myPatterns.length, TOTAL_PATTERNS, patternsPct,
      '#9b8ec4', 'rgba(155,142,196,0.6)');

    // Auto-collapse all non-current chapters
    document.querySelectorAll('.progress-chapter-group:not(.current)').forEach(g => {
      g.classList.add('collapsed');
    });

    // Hide old redundant word/concept collection sections
    document.querySelectorAll('#scene-collection, #concept-collection-box, .word-collection, .concept-collection').forEach(el => {
      if (!el.closest('#words-detail') && !el.closest('#patterns-detail')) {
        el.style.display = 'none';
      }
    });
    // Hide old h3 headings like "Words Gathered in Chapter X"
    document.querySelectorAll('h3').forEach(h3 => {
      const text = h3.textContent.toLowerCase();
      if ((text.includes('words') && (text.includes('gathered') || text.includes('this chapter') || text.includes('in chapter'))) ||
          (text.includes('concepts') && (text.includes('learned') || text.includes('this chapter') || text.includes('in chapter')))) {
        let parent = h3.closest('.scene, .word-collection, .concept-collection, [id*="collection"]');
        if (parent) {
          parent.style.display = 'none';
        } else {
          h3.parentElement.style.display = 'none';
        }
      }
    });
  }

  // Run after full DOM is parsed, or immediately if already ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateProgressDOM);
  } else {
    updateProgressDOM();
  }

  // FEATURE 1: Reading Time Estimate
  const bodyText = document.body.innerText || '';
  const wordCount = bodyText.split(/\s+/).length;
  const readingTime = Math.max(3, Math.round(wordCount / 200)); // ~200 wpm, min 3 min
  const titleEl = document.querySelector('h1, .chapter-title, .hero-title');
  if (titleEl && !document.querySelector('.reading-time')) {
    const rt = document.createElement('div');
    rt.className = 'reading-time';
    rt.style.cssText = 'text-align:center;font-size:0.75rem;color:rgba(212,202,187,0.35);letter-spacing:0.15em;text-transform:uppercase;margin-top:8px;';
    rt.textContent = '~' + readingTime + ' min read';
    titleEl.parentNode.insertBefore(rt, titleEl.nextSibling);
  }

  // FEATURE 2: "Remember These?" Sidebar - show 3-5 words from earlier chapters
  if (CURRENT_CHAPTER > 5) {
    const earlierWords = VOCAB_DATA.words.filter(w => w.c <= CURRENT_CHAPTER - 5);
    if (earlierWords.length > 0) {
      // Pick 4 random-but-deterministic words (seeded by chapter number)
      const seed = CURRENT_CHAPTER * 7;
      const picked = [];
      for (let i = 0; i < Math.min(4, earlierWords.length); i++) {
        picked.push(earlierWords[(seed + i * 13) % earlierWords.length]);
      }
      const rememberHTML = `
        <div class="remember-box" style="margin:24px auto;max-width:600px;padding:16px 20px;background:rgba(232,164,74,0.04);border:1px solid rgba(232,164,74,0.12);border-radius:10px;font-size:0.85rem;">
          <div style="color:rgba(232,164,74,0.5);font-size:0.7rem;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:10px;">Remember these?</div>
          <div style="display:flex;flex-wrap:wrap;gap:12px;">
            ${picked.map(w => `<span style="color:#e8a44a;font-weight:600;">${w.w}</span> <span style="color:rgba(212,202,187,0.5);">${w.m}</span>`).join(' · ')}
          </div>
        </div>`;
      const firstScene = document.querySelector('.scene, .scene-1, .chapter-intro');
      if (firstScene) {
        firstScene.insertAdjacentHTML('afterend', rememberHTML);
      }
    }
  }

})();
