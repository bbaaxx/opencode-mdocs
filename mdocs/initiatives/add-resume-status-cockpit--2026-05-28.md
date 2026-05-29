---
id: add-resume-status-cockpit
title: Add Resume and Status Cockpit
status: done
priority: high
created: 2026-05-28
updated: 2026-05-29
owner: bbaaxx
tags: [phase-1, resume, status, ux, workflow]
related_wiki: [philosophy/core-principles, architecture/philosophy-implementation-gap-analysis, roadmap/philosophy-alignment-roadmap]
depends_on: [upgrade-dispatch-memory-retrieval]
---

## Objective
Create a resume-first cockpit experience so a fresh agent or human can quickly see active work, last progress, blockers, likely next action, stale workflow state, and suggested resume choices.

## Context
- Philosophy alignment principle: every session handoff should be frictionless.
- Current `mdocs_status` reports workflow state, active initiatives, blocked initiatives, and overdue initiatives, but lacks last activity and next action.
- There is no first-class `mdocs_resume` tool or cockpit output.

## Plan
- [x] Baseline status behavior
  - [x] Read `src/plugin.ts`, `src/workflow.ts`, `src/initiative.ts`, `src/audit.ts`, and status-related tests
  - [x] Capture current `mdocs_status` fields in this initiative progress log
- [x] Add tests for enhanced status
  - [x] Update `src/__tests__/plugin.test.ts` to expect `mdocs_status` includes `nextAction`, `lastActivity`, and richer active initiative summaries
  - [x] Add tests for active initiative summaries including id, title, priority, current plan item, and updated date
  - [x] Add tests for stale state detection when workflow state references a missing or done initiative
  - [x] Run targeted tests and confirm they fail before implementation
- [x] Implement cockpit summary helpers
  - [x] Add helper functions in `src/plugin.ts` or a new focused module such as `src/status.ts`
  - [x] Compute current plan item from first `in-progress` or `pending` plan item
  - [x] Compute last activity from progress log and audit events
  - [x] Compute next action using workflow step and current plan item
  - [x] Detect stale workflow state when active initiative is missing, done, or inconsistent
- [x] Add `mdocs_resume` custom tool
  - [x] Return resumable initiatives ordered by active status, priority, updated date, and blockers
  - [x] Include recommendation: resume existing, create new, recover stale state, or review roadmap
  - [x] Include enough context for an agent to ask the user a precise resume question
- [x] Update docs and skills
  - [x] Update `README.md` custom tools section with `mdocs_resume` and enhanced `mdocs_status`
  - [x] Update `agents/mdocs-orchestrator.md` to prefer resume cockpit during DISCOVER/CONTEXT
  - [x] Update `skills/mdocs-workflow/SKILL.md` to mention resume-first flow
- [x] Verify
  - [x] Run `npm test -- src/__tests__/plugin.test.ts`
  - [x] Run `npm test`
  - [x] Run `npm run build`
- [x] Report
  - [x] Update this initiative progress log with changed files and test evidence
  - [x] Update roadmap wiki if UX semantics change

## Acceptance Criteria
- `mdocs_status` surfaces next action, last activity, current plan item, active/blocked/overdue summaries, and stale state warnings.
- `mdocs_resume` returns resumable initiatives with recommendations.
- Orchestrator and workflow skill guide agents to use resume-first behavior.
- Tests cover normal, no-active, and stale-state cases.
- Full test suite and TypeScript build pass.

## Progress Log
- [2026-05-28] Created as Phase 1 implementation initiative from philosophy alignment roadmap.
- [2026-05-29] Implemented: WorkflowEngine.setActiveInitiative and resumeAt methods, mdocs_resume tool returns next action/blockers/latest progress/validation, mdocs_status enriched with resume info for active initiative. Full TDD with RED/GREEN evidence. All tests pass, TypeScript build passes.

## Artifacts
- `src/plugin.ts` — custom tool implementation target
- `src/status.ts` — optional focused status helper module
- `src/__tests__/plugin.test.ts` — status/resume tests
- `README.md` — user-facing tool docs
- `agents/mdocs-orchestrator.md` — orchestrator guidance
- `skills/mdocs-workflow/SKILL.md` — workflow skill guidance
