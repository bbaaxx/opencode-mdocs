---
id: add-initiative-priorities-and-dependencies
title: Add Initiative Priorities and Dependencies
status: done
created: 2026-05-27
updated: 2026-05-27
owner: system
tags: [enhancement, initiatives, scheduling]
related_wiki: []
---

## Objective
Extend initiatives with priority levels, due dates, and dependency tracking so the orchestrator can suggest what to work on next and warn about blocked work.

## Context
- Initiative types are in `src/types.ts` (interface `Initiative`)
- Initiative CRUD is in `src/initiative.ts` (class `InitiativeManager`)
- Templates are in `templates/initiative.md`
- Custom tools are in `src/plugin.ts`
- The `mdocs_status` tool currently returns active initiatives; it should also show overdue and blocked

## Plan
- [x] Update `src/types.ts` `Initiative` interface with:
  - `priority: 'critical' | 'high' | 'medium' | 'low'` (default: 'medium')
  - `dueDate?: string` (ISO date, e.g. '2025-06-01')
  - `dependsOn?: string[]` (list of initiative IDs that must be done first)
- [x] Update `src/initiative.ts` frontmatter serialization (`toFrontmatter`) and parsing (`parseInitiative`) for new fields
- [x] Add `InitiativeManager.findBlocked()` → returns initiatives whose `dependsOn` IDs are not `status: 'done'`
- [x] Add `InitiativeManager.findOverdue()` → returns initiatives where `dueDate < today` and `status != 'done'`
- [x] Add `InitiativeManager.listByPriority()` → sorted by priority (critical > high > medium > low) then by dueDate ascending
- [x] Update `templates/initiative.md` to include `priority`, `due_date`, and `depends_on` in frontmatter
- [x] Add tests in `src/__tests__/initiative.test.ts` for:
  - Creating with new fields
  - Reading back new fields
  - `findBlocked` with mixed done/active dependencies
  - `findOverdue` with past/future dates
  - `listByPriority` sort order
- [x] Update `src/plugin.ts` `mdocs_status` tool to include `overdue` and `blocked` arrays in its response
- [x] Rebuild and run full test suite
- [ ] Update README with priority and dependency examples

## Acceptance Criteria
- `InitiativeManager.create()` accepts initiatives with `priority`, `dueDate`, and `dependsOn`
- `InitiativeManager.read()` returns these fields correctly (round-trip)
- `findBlocked()` only returns initiatives whose dependencies are NOT done
- `findOverdue()` only returns initiatives past dueDate that are not done
- `listByPriority()` sorts critical first, then by earliest dueDate
- `mdocs_status` output includes `overdue` and `blocked` arrays
- All 46+ tests pass; build succeeds

## Progress Log
- [2026-05-27] Added `Priority` type and extended `Initiative` interface with `priority`, `dueDate`, and `dependsOn` fields
- [2026-05-27] Updated `InitiativeManager` frontmatter serialization and parsing for new fields
- [2026-05-27] Implemented `findBlocked()` - returns initiatives with undone dependencies
- [2026-05-27] Implemented `findOverdue()` - returns initiatives past due date
- [2026-05-27] Implemented `listByPriority()` - sorts by priority then due date
- [2026-05-27] Updated `templates/initiative.md` with priority field in frontmatter
- [2026-05-27] Added 5 new tests covering priority, dueDate, dependsOn, findBlocked, findOverdue, listByPriority
- [2026-05-27] Updated `mdocs_status` tool to return `overdue` and `blocked` arrays
- [2026-05-27] All 63 tests pass; build succeeds; linter score 5/5

## Artifacts
- `src/types.ts` — Added `Priority` type and new fields to `Initiative`
- `src/initiative.ts` — Added findBlocked, findOverdue, listByPriority methods
- `src/plugin.ts` — Updated mdocs_status tool with overdue/blocked data
- `templates/initiative.md` — Added priority to frontmatter template
