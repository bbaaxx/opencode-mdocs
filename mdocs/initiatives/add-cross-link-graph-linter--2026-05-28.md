---
id: add-cross-link-graph-linter
title: Add Cross-Link Graph Linter Rules
status: done
priority: high
created: 2026-05-28
updated: 2026-05-29
owner: bbaaxx
tags: [phase-1, linter, graph, links, quality]
related_wiki: [philosophy/core-principles, architecture/philosophy-implementation-gap-analysis, roadmap/philosophy-alignment-roadmap]
depends_on: [define-v2-memory-metadata]
---

## Objective
Make initiative/wiki relationships first-class by adding linter rules and optional helper APIs for broken links, missing reciprocal links, orphaned wiki entries, stale initiative references, artifact path validity, and dependency integrity.

## Context
- Current related links are plain strings.
- Linter currently checks basic frontmatter and content quality, but graph integrity is weak.
- The two-layer memory system depends on reliable cross-links between practical workflow state and stable knowledge.

## Plan
- [x] Baseline current linter behavior
  - [x] Read `src/linter.ts`, `src/initiative.ts`, `src/wiki.ts`, and `src/__tests__/linter.test.ts`
  - [x] Capture existing lint checks in this initiative progress log
- [x] Add failing graph-lint tests
  - [x] Test broken `related_wiki` references from initiatives
  - [x] Test broken `related_initiatives` references from wiki entries
  - [x] Test missing reciprocal links as warnings
  - [x] Test orphaned wiki entries as warnings unless tagged as standalone/reference
  - [x] Test `depends_on` references point to existing initiatives
  - [x] Test artifact paths exist or are clearly external URLs
  - [x] Run targeted tests and confirm they fail before implementation
- [x] Implement graph collection helpers
  - [x] Add helper functions in `src/linter.ts` or a new `src/graph.ts`
  - [x] Normalize wiki refs as `category/id`
  - [x] Normalize initiative refs by `id`, not filename
  - [x] Collect backlinks and orphan candidates deterministically
- [x] Implement linter rules
  - [x] Broken references produce errors
  - [x] Missing reciprocals produce warnings
  - [x] Orphans produce warnings with recommended link targets when obvious
  - [x] Dependency cycles produce errors or warnings based on severity
  - [x] Artifact path issues produce warnings unless the path is required for execution
- [x] Expose results
  - [x] Include graph issues in `lintAll()` output
  - [x] If `mdocs_lint` is exposed or restored, include graph issue counts there
  - [x] Update README linter docs for graph checks
- [x] Verify
  - [x] Run `npm test -- src/__tests__/linter.test.ts`
  - [x] Run `npm test`
  - [x] Run `npm run build`
- [x] Report
  - [x] Update this initiative progress log with changed files and test evidence
  - [x] Update gap analysis or roadmap wiki with any refined graph semantics

## Acceptance Criteria
- Linter detects broken initiative/wiki links.
- Linter detects missing reciprocal links without making all standalone wiki entries invalid.
- Linter validates initiative dependencies and artifact references.
- Graph checks are deterministic and covered by tests.
- Full test suite and TypeScript build pass.

## Progress Log
- [2026-05-28] Created as Phase 1 implementation initiative from philosophy alignment roadmap.
- [2026-05-29] Implemented: graph-level lint pass checking broken initiative/wiki links, missing backlinks, and done initiative completion gates (no stable wiki learning). mdocs_validate includes graph results. Full TDD with RED/GREEN evidence. All tests pass, TypeScript build passes.

## Artifacts
- `src/linter.ts` — graph linter implementation target
- `src/graph.ts` — optional graph helper module
- `src/__tests__/linter.test.ts` — graph lint tests
- `README.md` — linter documentation updates
