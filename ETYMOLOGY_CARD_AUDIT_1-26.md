# ETYMOLOGY CARD AUDIT: CHAPTERS 1-26
**Date:** 2026-03-21  
**Focus:** Clickable German words and etymology card system functionality

---

## EXECUTIVE SUMMARY

| Metric | Count |
|--------|-------|
| Total chapters audited | 26 |
| Chapters with NO issues | 17 |
| Chapters with issues | 9 |
| Critical (broken functionality) | 5 |
| Minor (mismatch only) | 4 |

---

## CRITICAL FAILURES (5 chapters)

### CHAPTER 3 - COMPLETELY NON-FUNCTIONAL
- **Clickable words:** 0
- **Card divs:** 9 (fully populated but unreachable)
- **Click handler:** ❌ MISSING
- **Root causes:**
  - Words lack `class="german-word"` entirely
  - No `data-card` attributes on any words in main text
  - No JavaScript handler for `.german-word` clicks
- **Impact:** Etymology cards cannot be opened at all

### CHAPTER 9 - WRONG STRUCTURE
- **Clickable words:** 10 (with numeric data-card IDs: "1" through "10")
- **Card divs:** 10 (with matching numeric IDs)
- **Click handler:** ✓ Present
- **Root cause:** Uses numeric card IDs instead of German word names
- **Impact:** This chapter appears to be a special quiz format; card system doesn't match standard word→card mapping (may be intentional)

### CHAPTER 10 - MISSING HANDLER
- **Clickable words:** 10 (proper `data-card` attributes: arbeit, burger, geld, handel, etc.)
- **Card divs:** 10 (matching `id="card-*"`)
- **Click handler:** ❌ MISSING
- **Root cause:** No `document.querySelectorAll('.german-word').forEach()` handler
- **Impact:** Words are marked clickable but cards won't toggle open

### CHAPTER 15 - SEVERE MISMATCH
- **Clickable words:** 4 (deutsch, gewissen, glauben, kanzlei)
- **Card divs:** 10 (bibel, buchstabe, deutsch, freiheit, gewissen, glaube, lesen, sprache, volk, wahrheit)
- **Mismatches:**
  - Missing cards: 2 (glauben, kanzlei)
  - Orphaned cards: 8 (only 4 of 10 cards are connected to any word)
- **Click handler:** ✓ Present
- **Impact:** Only 40% of cards are reachable; clicking glauben/kanzlei does nothing

### CHAPTER 25 - COMPLETELY NON-FUNCTIONAL
- **Clickable words:** 0
- **Card divs:** 10 (fully populated but unreachable)
- **Click handler:** ❌ MISSING
- **Root causes:**
  - No words marked with `class="german-word"`
  - No `data-card` attributes
  - No `.german-word` click handler
- **Impact:** Etymology cards cannot be opened; functionality identical to Chapter 3

---

## MINOR ISSUES (4 chapters)

### CHAPTER 6 - ORPHANED CARD
- **Clickable words:** 10 ✓
- **Card divs:** 11
- **Orphaned:** 1 (card-wandern has no corresponding word reference)
- **Handler:** ✓ Present
- **Impact:** Extra unused card; clicking words works fine, but one card is unreachable

### CHAPTER 18 - MISSING CARD
- **Clickable words:** 10
- **Card divs:** 9
- **Missing:** 1 (word "adresse" references non-existent card-adresse)
- **Handler:** ✓ Present
- **Impact:** Clicking "adresse" won't open a card

### CHAPTER 21 - MISSING CARD
- **Clickable words:** 10
- **Card divs:** 9
- **Missing:** 1 (word "hochdeutsch" references non-existent card-hochdeutsch)
- **Handler:** ✓ Present
- **Impact:** Clicking "hochdeutsch" won't open a card

### CHAPTER 23 - MISSING CARD
- **Clickable words:** 8
- **Card divs:** 7
- **Missing:** 1 (word "inflation" references non-existent card-inflation)
- **Handler:** ✓ Present
- **Impact:** Clicking "inflation" won't open a card

### CHAPTER 22 - ORPHANED CARD
- **Clickable words:** 9
- **Card divs:** 10
- **Orphaned:** 1 (card-angst has no corresponding word reference)
- **Handler:** ✓ Present
- **Impact:** Extra unused card; functionality works for all 9 connected words

### CHAPTER 26 - ORPHANED CARD
- **Clickable words:** 7
- **Card divs:** 8
- **Orphaned:** 1 (card-handy has no corresponding word reference)
- **Handler:** ✓ Present
- **Impact:** Extra unused card; functionality works for all 7 connected words

---

## PASSING CHAPTERS (17 chapters) ✓

All clickable words match their card divs, and proper click handlers are present:

**1, 2, 4, 5, 7, 8, 11, 12, 13, 14, 16, 17, 19, 20, 24**

These chapters follow the Chapter 7 gold standard:
- Words have `class="german-word"` + `data-card="wordname"`
- Cards have `class="ety-card"` + `id="card-wordname"`
- JavaScript handler present: `document.querySelectorAll('.german-word').forEach(word => { word.addEventListener('click', ...) })`

---

## GOLD STANDARD (Chapter 7)

**Correct implementation pattern:**
```html
<!-- Clickable word in text -->
<span class="german-word" data-card="apfel">Apfel</span>

<!-- Corresponding card div -->
<div class="ety-card" id="card-apfel">
  <div class="word-header">
    <span class="word-main">Apfel</span>
    <span class="word-pron">/ˈapfəl/</span>
  </div>
  <!-- ... content ... -->
</div>
```

```javascript
// Handler at end of chapter
document.querySelectorAll('.german-word').forEach(word => {
  word.addEventListener('click', () => {
    const cardId = 'card-' + word.dataset.card;
    const card = document.getElementById(cardId);
    if (card) {
      const isOpen = card.classList.contains('open');
      document.querySelectorAll('.ety-card.open').forEach(c => c.classList.remove('open'));
      if (!isOpen) {
        card.classList.add('open');
        word.classList.add('revealed');
      }
    }
  });
});
```

---

## CARD CONTENT STATUS

**All examined cards contain proper content:**
- Word header with pronunciation
- German meaning
- PIE etymology bridge
- Germanic transformation bridge
- Story/explanation sections

**No truly "empty" cards found** — orphaned cards are fully populated but unreachable due to missing word references.

---

## RECOMMENDATIONS BY SEVERITY

### IMMEDIATE FIX (Critical path):
1. **Chapter 3:** Add `class="german-word"` to word spans; add `data-card` attributes; add click handler
2. **Chapter 10:** Add click handler (structure is correct)
3. **Chapter 25:** Add `class="german-word"` to word spans; add `data-card` attributes; add click handler

### HIGH PRIORITY (Breaks user interaction):
4. **Chapter 15:** Sync 4 words with cards (or remove orphaned cards and add missing ones)

### MEDIUM PRIORITY (Incomplete features):
5. **Chapters 18, 21, 23:** Add missing card divs
6. **Chapters 6, 22, 26:** Remove orphaned card divs

### NOTES ON CHAPTER 9:
- May be intentional (quiz chapter with numeric structure)
- Verify intended behavior before "fixing"

