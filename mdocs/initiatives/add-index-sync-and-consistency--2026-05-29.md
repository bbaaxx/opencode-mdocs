---
id: add-index-sync-and-consistency
title: Add INDEX Auto-Sync and Consistency Utilities
status: active
priority: medium
created: 2026-05-29
updated: 2026-05-29
owner: bbaaxx
tags: [enhancement, index, sync, consistency, automation]
related_wiki: []
---

## Objective

Ensure INDEX.md always reflects the actual state of the filesystem, even when files are modified outside the API (e.g., direct edit tool usage).

1. **INDEX consistency checker** — Utility to detect and report: missing files listed in INDEX, orphan files not in INDEX, files with invalid frontmatter.
2. **INDEX auto-sync on read** — When INDEX is read via mdocs tools, optionally verify consistency and rebuild if stale (opt-in via flag).
3. **INDEX freshness timestamp** — Track when INDEX was last regenerated; warn if files have been modified after the last sync.

## Context

- Agent feedback: "No INDEX auto-sync — Manual edits required for every status change."
- Edge case testing: "No atomic operations — If you create an initiative but forget to update INDEX, the system is inconsistent."
- The API methods (create/update/delete) all call updateIndex() atomically — the issue is direct file edits bypass this.

## Plan

- [ ] Add INDEX consistency check to InitiativeManager
  - Method: `checkConsistency(): { consistent: boolean, missing: string[], orphans: string[], stale: boolean }`
  - `missing`: files listed in INDEX that don't exist on disk
  - `orphans`: files on disk not listed in INDEX
  - `stale`: true if any file's `updated` timestamp is newer than INDEX's last modified time
- [ ] Add INDEX consistency check to WikiManager (same pattern)
- [ ] Store last-sync timestamp in `mdocs/.index-meta.json`
  - Write timestamp on every INDEX regeneration
  - Read on checkConsistency to detect staleness
- [ ] Add `mdocs_index_check` tool
  - Execute: `mdocs_index_check({ mode: 'check' | 'repair' })`
  - `mode: 'check'`: returns consistency report, does not modify files
  - `mode: 'repair'`: regenerates INDEX files for any inconsistencies found
  - Returns: `{ consistent: boolean, missing: [], orphans: [], repaired: boolean }`
- [ ] Add tests for consistency check and repair modes
- [ ] Update mdocs-workflow skill to document that direct file edits require manual INDEX sync or use `mdocs_index_check({ mode: 'repair' })`

## Acceptance Criteria

- `mdocs_index_check({ mode: 'check' })` on a clean repo returns `consistent: true, missing: [], orphans: []`.
- `mdocs_index_check({ mode: 'repair' })` regenerates INDEX files and returns `repaired: true`.
- Orphan files (mdoc files on disk but not in INDEX) are detected and listed.
- Missing files (INDEX entries with no corresponding file) are detected and reported.
- All existing tests pass.

## Progress Log
- [2026-05-29] Created initiative from edge case testing: INDEX auto-sync and consistency gaps.
- [2026-05-29] Will implement after INITIATIVE 2 (add-mdocs-cli-commands) is complete.

## Artifacts
- `mdocs/initiatives/add-index-sync-and-consistency--2026-05-29.md` — this initiative