---
id: add-cross-link-graph-linter
title: Add Cross-Link Graph Linter Rules
status: active
priority: high
created: 2026-05-28
updated: 2026-05-28
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
- [ ] Baseline current linter behavior
  - [ ] Read `src/linter.ts`, `src/initiative.ts`, `src/wiki.ts`, and `src/__tests__/linter.test.ts`
  - [ ] Capture existing lint checks in this initiative progress log
- [ ] Add failing graph-lint tests
  - [ ] Test broken `related_wiki` references from initiatives
  - [ ] Test broken `related_initiatives` references from wiki entries
  - [ ] Test missing reciprocal links as warnings
  - [ ] Test orphaned wiki entries as warnings unless tagged as standalone/reference
  - [ ] Test `depends_on` references point to existing initiatives
  - [ ] Test artifact paths exist or are clearly external URLs
  - [ ] Run targeted tests and confirm they fail before implementation
- [ ] Implement graph collection helpers
  - [ ] Add helper functions in `src/linter.ts` or a new `src/graph.ts`
  - [ ] Normalize wiki refs as `category/id`
  - [ ] Normalize initiative refs by `id`, not filename
  - [ ] Collect backlinks and orphan candidates deterministically
- [ ] Implement linter rules
  - [ ] Broken references produce errors
  - [ ] Missing reciprocals produce warnings
  - [ ] Orphans produce warnings with recommended link targets when obvious
  - [ ] Dependency cycles produce errors or warnings based on severity
  - [ ] Artifact path issues produce warnings unless the path is required for execution
- [ ] Expose results
  - [ ] Include graph issues in `lintAll()` output
  - [ ] If `mdocs_lint` is exposed or restored, include graph issue counts there
  - [ ] Update README linter docs for graph checks
- [ ] Verify
  - [ ] Run `npm test -- src/__tests__/linter.test.ts`
  - [ ] Run `npm test`
  - [ ] Run `npm run build`
- [ ] Report
  - [ ] Update this initiative progress log with changed files and test evidence
  - [ ] Update gap analysis or roadmap wiki with any refined graph semantics

## Acceptance Criteria
- Linter detects broken initiative/wiki links.
- Linter detects missing reciprocal links without making all standalone wiki entries invalid.
- Linter validates initiative dependencies and artifact references.
- Graph checks are deterministic and covered by tests.
- Full test suite and TypeScript build pass.

## Progress Log
- [2026-05-28] Created as Phase 1 implementation initiative from philosophy alignment roadmap.

## Artifacts
- `src/linter.ts` — graph linter implementation target
- `src/graph.ts` — optional graph helper module
- `src/__tests__/linter.test.ts` — graph lint tests
- `README.md` — linter documentation updates
