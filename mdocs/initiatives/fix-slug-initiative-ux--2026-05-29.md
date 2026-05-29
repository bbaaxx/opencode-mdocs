---
id: fix-slug-initiative-ux
title: Fix Initiative Filename/Slug UX Issues
status: active
priority: high
created: 2026-05-29
updated: 2026-05-29
owner: bbaaxx
tags: [bug, ux, initiatives, filename, slug, discovery]
related_wiki: []
---

## Objective

Fix three UX issues that cause agents to misresolve initiative filenames:

1. **Slug/id mismatch**: `formatFileName` derives filename from `slugify(title)` but frontmatter `id` can be a short independent value (e.g., `install-mdocs` vs `install-and-configure-opencode-mdocs`). When an agent uses the `id` as a filename, reads fail silently.
2. **INDEX display hides filename**: The INDEX shows title and tags but not the actual filename, so agents cannot discover the correct filename to read/write.
3. **No lookup command**: No `mdocs_lookup` tool or equivalent exists to resolve id/title/slug to an exact filename before tool operations.

## Context

- Agent session feedback reported: "When parsing 'Install and Configure opencode-mdocs', I incorrectly assumed the slug would be `setup` rather than deriving it properly from the title."
- Initiative `install-and-configure-opencode-mdocs--2026-05-27.md` has frontmatter `id: install-mdocs` — short and independent of the filename slug.
- Current INDEX.md shows `**Install and Configure opencode-mdocs** (done) — 2026-05-27 — [setup, plugin]` with no filename reference.
- No lookup tool exists to resolve `id` → filename.

## Plan

- [ ] Write stress-test scenarios covering: create initiative, read by id, read by title, update progress, search
  - Confirm exact failure modes before writing any fix code
- [ ] Add `mdocs_lookup` custom tool
  - Input: `{ query: string, field?: 'id' | 'title' | 'slug' }`
  - Searches by id, title, or filename slug
  - Returns: `{ filename, id, title, status, tags }` for each match
  - If no matches, returns `{ error: 'No initiatives found for query' }`
- [ ] Fix `formatFileName` to use `id` field directly when available, falling back to slugified title
  - Only use `id` as filename stem when `id` is set and non-empty
  - Fall back to `slugify(title)` when `id` is absent or equals a generic placeholder
- [ ] Update INDEX generation to show filename alongside title
  - Display: `**Title** (`filename`) — status — date — [tags]`
  - Example: `**Install and Configure opencode-mdocs** (install-and-configure-opencode-mdocs--2026-05-27.md)`
- [ ] Add regression tests covering slug/id/filename resolution
- [ ] Update `mdocs-initiative` SKILL.md with lookup command usage

## Acceptance Criteria

- `mdocs_lookup({ query: 'install-mdocs' })` returns the correct filename `install-and-configure-opencode-mdocs--2026-05-27.md`.
- `mdocs_lookup({ query: 'Install and Configure opencode-mdocs' })` returns the correct filename via title search.
- `createPlugin(directory).tool.mdocs_lookup.execute({ query: 'something' })` is callable.
- Creating an initiative with a custom `id` uses that `id` (slugified) as the filename stem, not the title.
- INDEX.md displays the actual filename so agents can discover it without guessing.
- All existing tests pass; new regression tests added.

## Progress Log
- [2026-05-29] Created initiative from agent feedback: slug/id mismatch, INDEX hides filename, no lookup tool.
- [2026-05-29] Read `src/initiative.ts` to understand `formatFileName` and `slugify` implementation.
- [2026-05-29] Will run stress-test scenarios to confirm exact failure modes before TDD implementation.
- [2026-05-29] Added `mdocs_lookup` usage guidance to `skills/mdocs-initiative/SKILL.md` after review noted the documentation acceptance criterion was still open.
- [2026-05-29] Task 1 RED: `npm test -- src/__tests__/plugin.test.ts` failed for id-stem filename creation, missing `mdocs_lookup`, and missing tool registration.
- [2026-05-29] Task 1 GREEN: `npm test -- src/__tests__/plugin.test.ts` passed 14 tests; `npm test` passed 92 tests across 11 suites; `npm run build` passed.
- [2026-05-29] Task 1 follow-up RED: `npm test -- src/__tests__/plugin.test.ts` failed for missing `field: 'slug'` lookup behavior, missing lookup metadata, missing partial-title match, and recomputed INDEX filenames for legacy files.
- [2026-05-29] Task 1 follow-up GREEN: `npm test -- src/__tests__/plugin.test.ts` passed 16 tests; `npm test` passed 94 tests across 11 suites; `npm run build` passed.
- [2026-05-29] Task 1 lookup coverage RED/GREEN: omitted-field slug lookup passed immediately as coverage; no-match error shape failed until `mdocs_lookup` returned `{ error: 'No initiatives found for query', query }`. `npm test -- src/__tests__/plugin.test.ts` passed 18 tests; `npm test` passed 96 tests across 11 suites; `npm run build` passed.

## Artifacts
- `mdocs/initiatives/fix-slug-initiative-ux--2026-05-29.md` — this initiative
