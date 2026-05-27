---
id: add-mdocs-linter-for-handoff-quality
title: Add mdocs Linter for Handoff Quality Gates
status: done
created: 2026-05-27
updated: 2026-05-27
owner: system
tags: [enhancement, quality, automation, linting]
related_wiki: []
---

## Objective
Create an automated linting/validation system that checks every initiative and wiki entry for "handoff readiness" — ensuring a fresh agent with zero prior context can read the file and start implementing without asking clarifying questions.

## Context
- Initiatives live in `/mdocs/initiatives/*.md` with frontmatter + markdown sections
- Wiki entries live in `/mdocs/wiki/<category>/<id>.md` with frontmatter + markdown content
- Both are human-written and prone to gaps (missing context, vague plans, no file paths, no acceptance criteria)
- Currently, quality is checked manually — this initiative automates that check
- The plugin already has custom tools (`mdocs_init`, `mdocs_status`) and hooks (`tool.execute.after`)

## Plan
- [x] Create `src/linter.ts` with a `MdocsLinter` class
- [x] Define `LintResult` type in `src/types.ts`
- [x] Implement initiative validation rules
- [x] Implement wiki entry validation rules
- [x] Add `lintFile()` and `lintAll()` methods
- [x] Add custom tool `mdocs_lint` in `src/plugin.ts`
- [x] Add tests in `src/__tests__/linter.test.ts`
- [x] Rebuild and run full test suite
- [x] Run linter on all existing initiatives and fix issues
- [x] Update README with `mdocs_lint` usage

## Acceptance Criteria
- `mdocs_lint()` on a perfect initiative returns `score: 5, passed: true, issues: []`
- `mdocs_lint()` on an initiative with "Research how..." in plan returns warning
- `mdocs_lint()` on an initiative with no file paths returns error and `passed: false`
- `mdocs_lint()` on an initiative missing frontmatter fields returns errors
- All 55 tests pass; build succeeds
- Existing initiatives in `/mdocs/initiatives/` all score 4+ after fixes

## Progress Log
- [2026-05-27] Added `LintResult` and `LintIssue` types to `src/types.ts`
- [2026-05-27] Created `src/linter.ts` with `MdocsLinter` class
- [2026-05-27] Implemented initiative linting: frontmatter, objective, plan concreteness, file paths, acceptance criteria, progress log
- [2026-05-27] Implemented wiki linting: frontmatter, content length, category match, related initiatives
- [2026-05-27] Added `mdocs_lint` custom tool to `src/plugin.ts`
- [2026-05-27] Added 9 comprehensive tests in `src/__tests__/linter.test.ts`
- [2026-05-27] All 55 tests pass, build succeeds
- [2026-05-27] Ran linter on all 18 mdocs files — 1 initiative failed (bootstrap), fixed by adding file paths and acceptance criteria
- [2026-05-27] Updated bootstrap initiative generation in `src/plugin.ts` to create linter-compliant initiatives

## Artifacts
- `src/types.ts` — added `LintIssue` and `LintResult` interfaces
- `src/linter.ts` — new `MdocsLinter` class
- `src/plugin.ts` — added `mdocs_lint` custom tool
- `src/__tests__/linter.test.ts` — 9 linter tests
