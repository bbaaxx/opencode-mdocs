---
id: add-resume-status-cockpit
title: Add Resume and Status Cockpit
status: active
priority: high
created: 2026-05-28
updated: 2026-05-28
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
- [ ] Baseline status behavior
  - [ ] Read `src/plugin.ts`, `src/workflow.ts`, `src/initiative.ts`, `src/audit.ts`, and status-related tests
  - [ ] Capture current `mdocs_status` fields in this initiative progress log
- [ ] Add tests for enhanced status
  - [ ] Update `src/__tests__/plugin.test.ts` to expect `mdocs_status` includes `nextAction`, `lastActivity`, and richer active initiative summaries
  - [ ] Add tests for active initiative summaries including id, title, priority, current plan item, and updated date
  - [ ] Add tests for stale state detection when workflow state references a missing or done initiative
  - [ ] Run targeted tests and confirm they fail before implementation
- [ ] Implement cockpit summary helpers
  - [ ] Add helper functions in `src/plugin.ts` or a new focused module such as `src/status.ts`
  - [ ] Compute current plan item from first `in-progress` or `pending` plan item
  - [ ] Compute last activity from progress log and audit events
  - [ ] Compute next action using workflow step and current plan item
  - [ ] Detect stale workflow state when active initiative is missing, done, or inconsistent
- [ ] Add `mdocs_resume` custom tool
  - [ ] Return resumable initiatives ordered by active status, priority, updated date, and blockers
  - [ ] Include recommendation: resume existing, create new, recover stale state, or review roadmap
  - [ ] Include enough context for an agent to ask the user a precise resume question
- [ ] Update docs and skills
  - [ ] Update `README.md` custom tools section with `mdocs_resume` and enhanced `mdocs_status`
  - [ ] Update `agents/mdocs-orchestrator.md` to prefer resume cockpit during DISCOVER/CONTEXT
  - [ ] Update `skills/mdocs-workflow/SKILL.md` to mention resume-first flow
- [ ] Verify
  - [ ] Run `npm test -- src/__tests__/plugin.test.ts`
  - [ ] Run `npm test`
  - [ ] Run `npm run build`
- [ ] Report
  - [ ] Update this initiative progress log with changed files and test evidence
  - [ ] Update roadmap wiki if UX semantics change

## Acceptance Criteria
- `mdocs_status` surfaces next action, last activity, current plan item, active/blocked/overdue summaries, and stale state warnings.
- `mdocs_resume` returns resumable initiatives with recommendations.
- Orchestrator and workflow skill guide agents to use resume-first behavior.
- Tests cover normal, no-active, and stale-state cases.
- Full test suite and TypeScript build pass.

## Progress Log
- [2026-05-28] Created as Phase 1 implementation initiative from philosophy alignment roadmap.

## Artifacts
- `src/plugin.ts` — custom tool implementation target
- `src/status.ts` — optional focused status helper module
- `src/__tests__/plugin.test.ts` — status/resume tests
- `README.md` — user-facing tool docs
- `agents/mdocs-orchestrator.md` — orchestrator guidance
- `skills/mdocs-workflow/SKILL.md` — workflow skill guidance
