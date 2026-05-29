---
id: define-v2-memory-metadata
title: Define v2 Initiative and Wiki Memory Metadata
status: done
priority: high
created: 2026-05-28
updated: 2026-05-29
owner: bbaaxx
tags: [phase-1, schema, metadata, memory-model, wiki]
related_wiki: [philosophy/core-principles, architecture/philosophy-implementation-gap-analysis, roadmap/philosophy-alignment-roadmap]
depends_on: []
---

## Objective
Define and implement backward-compatible v2 metadata for initiatives and wiki entries so the two-layer memory philosophy is encoded in schemas, templates, parsing, linting, and generated docs.

## Context
- Current initiative and wiki schemas are minimal and mostly distinguish memory layers by directory placement.
- The philosophy requires initiatives to represent practical collaborative state and wiki to represent stable agent-owned knowledge.
- This initiative should avoid large migrations; v1 files must keep working.

## Plan
- [ ] Design v2 metadata fields
  - [ ] For initiatives: `schema_version`, `phase`, `handoff_summary`, `open_questions`, `blocked_by`, `next_agent_action`, `decision_state`
  - [ ] For wiki: `schema_version`, `knowledge_type`, `stability`, `confidence`, `source_initiatives`, `supersedes`, `derived_from`
  - [ ] Document defaults for old files that omit these fields
- [ ] Add type tests
  - [ ] Update `src/__tests__/types.test.ts` for new optional fields
  - [ ] Run targeted test and confirm failure before implementation
- [ ] Update TypeScript types and parsers
  - [ ] Modify `src/types.ts` with optional v2 fields
  - [ ] Modify `src/initiative.ts` frontmatter parsing/writing to preserve and emit v2 fields when provided
  - [ ] Modify `src/wiki.ts` frontmatter parsing/writing to preserve and emit v2 fields when provided
- [ ] Update templates
  - [ ] Update `templates/initiative.md` with v2 metadata and human-readable sections for handoff/open questions
  - [ ] Update `templates/wiki-entry.md` with v2 metadata placeholders
- [ ] Update linting
  - [ ] Update `src/linter.ts` to encourage, but not initially require, v2 metadata
  - [ ] Add tests in `src/__tests__/linter.test.ts` for v2-aware warnings and backward compatibility
- [ ] Update docs
  - [ ] Update README file format sections
  - [ ] Update `skills/mdocs-initiative/SKILL.md` with v2 metadata guidance
  - [ ] Add or update wiki entry describing initiative/wiki boundary semantics
- [ ] Verify
  - [ ] Run `npm test -- src/__tests__/types.test.ts src/__tests__/initiative.test.ts src/__tests__/wiki.test.ts src/__tests__/linter.test.ts`
  - [ ] Run `npm test`
  - [ ] Run `npm run build`
- [ ] Report
  - [ ] Update this initiative progress log with changed files and test evidence
  - [ ] Add migration notes to wiki if needed

## Acceptance Criteria
- v1 initiative/wiki files continue to parse without errors.
- New v2 metadata fields are typed, parsed, written, and documented.
- Templates reflect v2 memory semantics.
- Linter recognizes v2 metadata and gives actionable warnings without breaking existing files.
- Full test suite and TypeScript build pass.

## Progress Log
- [2026-05-28] Created as Phase 1 implementation initiative from philosophy alignment roadmap.
- [2026-05-29] Implemented: v2 initiative fields (phase, handoffSummary, openQuestions, blockers, nextAction) and wiki fields (lifecycle, knowledgeType, confidence, sourceInitiatives, supersedes). Full TDD with RED/GREEN evidence. All tests pass, TypeScript build passes.

## Artifacts
- `src/types.ts` — metadata type definitions
- `src/initiative.ts` — initiative parser/writer updates
- `src/wiki.ts` — wiki parser/writer updates
- `src/linter.ts` — v2-aware linting
- `templates/initiative.md` — v2 initiative template
- `templates/wiki-entry.md` — v2 wiki template
- `README.md` — file format documentation
- `skills/mdocs-initiative/SKILL.md` — initiative guidance
