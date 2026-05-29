---
id: add-initiatives-wiki-validation
title: Add Validation for Initiatives and Wiki References
status: active
priority: high
created: 2026-05-29
updated: 2026-05-29
owner: bbaaxx
tags: [enhancement, validation, initiatives, wiki, integrity]
related_wiki: []
---

## Objective

Add integrity validation to prevent silent data corruption in initiatives and wiki entries:

1. **Duplicate ID detection** — Prevent two initiatives from having the same `id` field in frontmatter. Detect on create and update.
2. **Required frontmatter fields** — Validate that `id`, `title`, `status`, and `created` are present and non-empty on every initiative. Validate `id`, `title`, `category` on wiki entries.
3. **Broken related_wiki references** — Warn when an initiative's `related_wiki` array references a wiki entry that does not exist (category/id pair has no file).
4. **INDEX consistency check** — Detect when INDEX.md lists an initiative that has no corresponding file, and vice versa.
5. **Orphan wiki entries** — Detect wiki entries not referenced by any initiative's `related_wiki`.

## Context

- Agent feedback: "No validation — No checks for duplicate IDs, proper frontmatter format, or INDEX consistency."
- Currently `create()` in InitiativeManager throws only on existing filename conflict, not on duplicate `id`.
- WikiManager's `create()` does not verify the entry's content is non-empty.
- No utility exists to audit the consistency of the mdocs directory tree.

## Plan

- [ ] Add `validate()` method to InitiativeManager
  - Returns `{ valid: boolean, errors: string[], warnings: string[] }`
  - Checks: duplicate id, required fields, filename-frontmatter consistency
- [ ] Add `audit()` tool — a new `mdocs_audit` custom tool (already exists for audit log; add a separate `mdocs_validate` tool or extend existing tool)
  - Actually: extend `mdocs_status` to include validation results
  - Or add new `mdocs_validate` tool for explicit validation runs
- [ ] Add `validate()` method to WikiManager
  - Returns same shape: `{ valid, errors, warnings }`
  - Checks: required fields, orphaned entries (not referenced by any initiative)
- [ ] Add broken-wiki-reference check to InitiativeManager
  - When reading/updating an initiative, check each `related_wiki` entry exists
  - Return warning for each missing wiki entry
- [ ] Add INDEX consistency check utility
  - Compares INDEX.md listed filenames against actual `.md` files in initiatives/
  - Reports missing and orphan files
- [ ] Add tests for all validation paths
- [ ] Update mdocs-workflow skill to mention validation runs

## Acceptance Criteria

- `mdocs_validate` tool exists and returns validation results for all initiatives and wiki entries.
- Creating an initiative with a duplicate `id` throws a descriptive error.
- Updating an initiative's frontmatter to use an already-existing `id` throws a descriptive error.
- `mdocs_status` includes validation warnings for broken `related_wiki` references.
- INDEX consistency check reports any discrepancies.
- All existing tests pass; new tests added for validation paths.

## Progress Log
- [2026-05-29] Created initiative from agent feedback: no validation for duplicate IDs, frontmatter format, or INDEX consistency.
- [2026-05-29] Identified that InitiativeManager.create() only checks filename conflict, not id conflict.
- [2026-05-29] Will implement TDD: write failing tests first.
- [2026-05-29] RED: `npm test -- src/__tests__/initiative.test.ts src/__tests__/wiki.test.ts src/__tests__/plugin.test.ts` failed because `InitiativeManager.validate`, `WikiManager.validate`, and `mdocs_validate` were missing, and `mdocs_status` lacked validation output.
- [2026-05-29] GREEN focused: `npm test -- src/__tests__/initiative.test.ts src/__tests__/wiki.test.ts src/__tests__/plugin.test.ts` passed after adding validation and duplicate-id guards.

## Artifacts
- `mdocs/initiatives/add-initiatives-wiki-validation--2026-05-29.md` — this initiative
