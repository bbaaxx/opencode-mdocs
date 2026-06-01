---
id: add-wiki-manager-crud
title: Add Wiki Manager CRUD Operations
status: done
created: 2026-05-27
updated: 2026-05-27
owner: system
tags: [enhancement, wiki, api]
related_wiki: ["architecture/mdocs-tool-gates"]
---

## Objective
Make the WikiManager API symmetric with InitiativeManager by adding read, update, delete, and find operations.

## Context
- WikiManager is in `src/wiki.ts` (class `WikiManager`)
- It currently only has `create(entry)` and `updateIndices()`
- Wiki entries are stored at `/mdocs/wiki/<category>/<id>.md`
- Frontmatter uses snake_case: `related_initiatives`, `created`, `updated`, etc.
- `WikiEntry` type is in `src/types.ts`
- `InitiativeManager` (in `src/initiative.ts`) has full CRUD: `create`, `read`, `update`, `delete`, `findRelated` — use it as a reference for patterns

## Plan
- [x] Add `WikiManager.read(category, id)` → returns `WikiEntry | null`
  - Read file from `wiki/<category>/<id>.md`
  - Parse frontmatter (snake_case keys: `related_initiatives`) into `WikiEntry` (camelCase: `relatedInitiatives`)
  - Return `null` if file doesn't exist
- [x] Add `WikiManager.update(category, id, entry)` → rewrites file, updates indices
  - Overwrite existing file; update `updated` timestamp
  - Call `updateIndices()` after write
- [x] Add `WikiManager.delete(category, id)` → removes file, updates indices
  - Use `fs.unlinkSync`; call `updateIndices()` after
- [x] Add `WikiManager.findRelated(queryTags)` → scans all categories for tag matches
  - Walk all category directories
  - Return entries where `tags` array overlaps with `queryTags` (ANY match, not ALL)
- [x] Add corresponding tests in `src/__tests__/wiki.test.ts`:
  - `read` returns correct `WikiEntry`
  - `read` returns null for missing entry
  - `update` rewrites file and updates timestamp
  - `delete` removes file
  - `findRelated` matches by tag
- [x] Rebuild and run full test suite

## Acceptance Criteria
- `WikiManager.read('architecture', 'plugin-design')` returns the entry with correct `relatedInitiatives`
- `WikiManager.update()` persists changes and updates indices
- `WikiManager.delete()` removes the file and updates indices
- `WikiManager.findRelated(['plugin'])` returns entries tagged with 'plugin'
- All tests pass; build succeeds

## Progress Log
- [2026-05-27] Implemented WikiManager.read() with frontmatter parsing and snake_case to camelCase conversion
- [2026-05-27] Implemented WikiManager.update() with timestamp auto-update and index refresh
- [2026-05-27] Implemented WikiManager.delete() with fs.unlinkSync and index refresh
- [2026-05-27] Implemented WikiManager.findRelated() scanning all categories for tag matches
- [2026-05-27] Added 7 new tests covering read, update, delete, findRelated, and edge cases
- [2026-05-27] All 62 tests pass; build succeeds; linter score 5/5

## Artifacts
- `src/wiki.ts` — Added read, update, delete, findRelated methods
- `src/__tests__/wiki.test.ts` — Added 7 new test cases
