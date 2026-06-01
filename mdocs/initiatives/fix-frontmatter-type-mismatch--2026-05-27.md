---
id: fix-frontmatter-type-mismatch
title: Fix Frontmatter Type Mismatch
status: done
created: 2026-05-27
updated: 2026-05-27
owner: system
tags: [bug, initiative, frontmatter]
related_wiki: ["decisions/opencode-tool-registration"]
---

## Objective
Fix the camelCase vs snake_case mismatch between TypeScript types and YAML frontmatter so that initiatives round-trip correctly (write → read → all fields preserved).

## Plan
- [x] Audit `src/types.ts`, `src/initiative.ts`, and `src/__tests__/initiative.test.ts` for mismatched keys
- [x] Decide on canonical convention: camelCase in TS, snake_case in YAML frontmatter
- [x] Update frontmatter serialization (`toFrontmatter`) to use snake_case keys
- [x] Update frontmatter parser to map snake_case YAML → camelCase TS
- [x] Add a round-trip test: write initiative → read it back → assert all fields match
- [x] Rebuild and run full test suite
- [x] Update any affected wiki entries or docs

## Progress Log
- [2026-05-27] Audited `src/initiative.ts`, `src/wiki.ts`, and `src/types.ts`
- [2026-05-27] Discovered that frontmatter serialization ALREADY uses snake_case (`related_wiki`, `related_initiatives`) and parser ALREADY maps back to camelCase correctly
- [2026-05-27] The external analysis report was based on a false positive; no bug exists in current code
- [2026-05-27] Added explicit round-trip test in `src/__tests__/initiative.test.ts` to guard against future regressions
- [2026-05-27] Full test suite passes: 43/43 tests green

## Artifacts
- `src/__tests__/initiative.test.ts` — added `round-trip: write initiative then read back all fields` test
