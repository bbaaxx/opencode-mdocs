---
id: upgrade-dispatch-memory-retrieval
title: Upgrade Dispatch into Memory Retrieval Assembly
status: done
priority: high
created: 2026-05-28
updated: 2026-05-29
owner: bbaaxx
tags: [phase-1, dispatch, memory, retrieval, subagent]
related_wiki: [philosophy/core-principles, architecture/philosophy-implementation-gap-analysis, roadmap/philosophy-alignment-roadmap]
depends_on: []
---

## Objective
Upgrade `mdocs_dispatch` from a thin concatenation of manually linked wiki entries into structured memory retrieval assembly that gives subagents richer continuity: objective, plan, acceptance criteria, progress, artifacts, recent audit events, explicit wiki links, search-ranked related memory, blockers, and recommended next action.

## Context
- Philosophy alignment principle: a fresh agent facet should resume with durable shared context quickly.
- Current `SubagentAssembler` only includes objective, plan, related wiki content, and current step.
- Current `mdocs_dispatch` only reads wiki entries listed in `initiative.relatedWiki`.
- Search and audit already exist but are not included in dispatch context.

## Plan
- [x] Baseline current dispatch behavior
  - [x] Read `src/subagent.ts`, `src/plugin.ts`, `src/search.ts`, `src/audit.ts`, and `src/__tests__/subagent.test.ts`
  - [x] Document current dispatch output shape in this initiative progress log
- [x] Add tests for richer dispatch context
  - [x] Update `src/__tests__/subagent.test.ts` to expect structured sections for objective, plan, acceptance criteria, progress log, artifacts, related wiki, current step, and recommended next action
  - [x] Add or update plugin-level tests in `src/__tests__/plugin.test.ts` for `mdocs_dispatch` returning related memory count and context containing progress/audit-derived content
  - [x] Run targeted tests and confirm they fail before implementation
- [x] Implement structured context assembly
  - [x] Extend `SubagentAssembler.assemble()` or create a focused `ContextAssembler` in `src/subagent.ts`
  - [x] Include initiative acceptance criteria by parsing the `## Acceptance Criteria` section where available
  - [x] Include recent progress log entries and artifacts
  - [x] Include linked wiki entries with provenance headings
  - [x] Include a deterministic recommended next action based on the first in-progress or pending plan item
- [x] Use retrieval beyond manual links
  - [x] In `src/plugin.ts`, have `mdocs_dispatch` query `SearchEngine` using initiative title, objective, tags, and active plan text
  - [x] Include top related wiki/initiative results while avoiding duplicates from explicit links
  - [x] Preserve token budget by including titles/snippets/scores before full content
- [x] Integrate audit summary
  - [x] Include recent audit events for the initiative when available
  - [x] Keep output deterministic for tests by limiting and sorting events consistently
- [x] Verify
  - [x] Run `npm test -- src/__tests__/subagent.test.ts src/__tests__/plugin.test.ts`
  - [x] Run `npm test`
  - [x] Run `npm run build`
- [x] Report
  - [x] Update this initiative progress log with changed files and test evidence
  - [x] Add or update wiki notes if context assembly semantics become stable knowledge

## Acceptance Criteria
- `mdocs_dispatch` includes objective, plan, current step, acceptance criteria, progress, artifacts, related wiki, retrieved related memory, and recommended next action.
- Explicit `related_wiki` entries remain supported and are not duplicated.
- Search-ranked related memory is included with provenance.
- Dispatch output remains deterministic enough for tests.
- Full test suite and TypeScript build pass.

## Progress Log
- [2026-05-28] Created as Phase 1 implementation initiative from philosophy alignment roadmap.
- [2026-05-29] Implemented: SearchResult extended with snippet and matchedFields, SubagentAssembler enriched with handoff/blockers/retrieved memory/recent activity, mdocs_dispatch queries search engine and audit log for context assembly. Full TDD with RED/GREEN evidence. All tests pass, TypeScript build passes.

## Artifacts
- `src/subagent.ts` — context assembly implementation target
- `src/plugin.ts` — `mdocs_dispatch` integration target
- `src/__tests__/subagent.test.ts` — unit test target
- `src/__tests__/plugin.test.ts` — plugin dispatch test target
