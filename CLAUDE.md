# CLAUDE.md — Instructions for Das erste Wort

## READ FIRST
Before doing ANYTHING, read `HANDOVER.md` in this same folder. It contains the full project context, curriculum, bug list, and design principles.

## Golden Rules

1. **CHAPTER 7 IS THE GOLD STANDARD.** Read `v4-clean/v4-final/chapter7.html` before writing or modifying any chapter. Every chapter should match its structure, features, and quality.

2. **NEVER batch-modify files with regex/Python scripts.** This has corrupted the project THREE TIMES. Instead: fix ONE chapter, verify it renders in browser, then carefully apply to small batches (max 5-10 at a time).

3. **Test before scaling.** Every change gets prototyped on ONE file first. Only after confirmation does it get applied to others.

4. **Work phase by phase.** Fix Phase 1 (ch1-26) first, then Phase 2 (ch27-46), etc. Do not try to fix all 100 at once.

5. **When writing new chapters, produce COMPLETE standalone HTML files** — not JSON configs fed through a generator. The generator approach failed. Direct HTML writing by Opus agents (max 4 chapters per agent) produces the right quality.

## File Location
All chapter files: `v4-clean/v4-final/` inside the Thekla folder.

## Current Priority
Bug-fix the existing 100 chapters to match chapter 7's quality. See HANDOVER.md "CURRENT BUGS TO FIX" section for the specific issues.
