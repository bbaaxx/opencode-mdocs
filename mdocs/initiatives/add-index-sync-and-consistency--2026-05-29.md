---
id: "add-index-sync-and-consistency"
title: "Add INDEX Auto-Sync and Consistency Utilities"
status: "done"
created: "2026-05-29"
updated: "2026-06-01"
owner: "bbaaxx"
tags: ["enhancement","index","sync","consistency","automation"]
related_wiki: ["architecture/mdocs-tool-gates"]
priority: "medium"
---

## Objective
Ensure INDEX.md always reflects the actual state of the filesystem, even when files are modified outside the API (e.g., direct edit tool usage).

1. **INDEX consistency checker** — Utility to detect and report: missing files listed in INDEX, orphan files not in INDEX, files with invalid frontmatter.
2. **INDEX auto-sync on read** — When INDEX is read via mdocs tools, optionally verify consistency and rebuild if stale (opt-in via flag).
3. **INDEX freshness timestamp** — Track when INDEX was last regenerated; warn if files have been modified after the last sync.

## Plan
- [x] Add INDEX consistency check to InitiativeManager (`src/initiative.ts`)
- [ ] - Method: `checkConsistency(): { consistent: boolean, missing: string[], orphans: string[], stale: boolean }`
- [ ] - Parse INDEX.md to extract listed filenames
- [ ] - `missing`: files listed in INDEX that don't exist on disk
- [ ] - `orphans`: files on disk not listed in INDEX
- [ ] - `stale`: true if any file's `updated` timestamp is newer than INDEX's last modified time
- [x] Add INDEX consistency check to WikiManager (`src/wiki.ts`)
- [ ] - Same pattern as InitiativeManager for root INDEX.md and category indices
- [x] Store last-sync timestamp in `mdocs/.index-meta.json` (`src/mdocs.ts`)
- [ ] - Write timestamp on every INDEX regeneration via InitiativeManager and WikiManager
- [ ] - Read on checkConsistency to detect staleness
- [x] Add `mdocs_index_check` custom tool (`src/plugin.ts`)
- [ ] - Execute: `mdocs_index_check({ mode: 'check' | 'repair' })`
- [ ] - `mode: 'check'`: returns consistency report, does not modify files
- [ ] - `mode: 'repair'`: regenerates INDEX files for any inconsistencies found
- [ ] - Returns: `{ consistent: boolean, missing: [], orphans: [], repaired: boolean }`
- [x] Add tests for consistency check and repair modes (`src/__tests__/initiative.test.ts`, `src/__tests__/wiki.test.ts`, `src/__tests__/plugin.test.ts`)
- [x] Update `mdocs-workflow` SKILL.md to document direct file edit workflow

## Progress Log
- [2026-05-29] Created initiative from edge case testing: INDEX auto-sync and consistency gaps.
- [2026-05-29] Will implement after INITIATIVE 2 (add-mdocs-cli-commands) is complete.
- [2026-05-31] Implemented `checkConsistency()` in both InitiativeManager and WikiManager.
- [2026-05-31] Added `.index-meta.json` timestamp tracking in MdocsManager.
- [2026-05-31] Added `mdocs_index_check` custom tool with check/repair modes.
- [2026-05-31] Added 9 new tests for consistency check and repair modes.
- [2026-05-31] Updated `mdocs-workflow` SKILL.md with INDEX consistency documentation.
- [2026-05-31] All 167 tests pass.
- [2026-06-01T03:02:40.335Z] Marked done via mdocs command

## Artifacts
- `mdocs/initiatives/add-index-sync-and-consistency--2026-05-29.md` — this initiative