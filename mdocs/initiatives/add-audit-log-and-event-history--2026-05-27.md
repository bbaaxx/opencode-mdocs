---
id: add-audit-log-and-event-history
title: Add Audit Log and Event History
status: active
created: 2026-05-27
updated: 2026-05-27
owner: system
tags: [enhancement, observability, history]
related_wiki: []
---

## Objective
Create a persistent audit trail of all significant actions (tool executions, workflow transitions, initiative changes) so users can review what happened across sessions and debug workflow behavior.

## Context
- The plugin registers opencode hooks in `src/plugin.ts`: `tool.execute.before`, `tool.execute.after`, `event`, `permission.ask`, `config`
- These are called by the opencode runtime; the plugin exports an object with these hook methods
- `tool.execute.after` receives `(input, output)` where `input.name` is the tool name and `input.args` are arguments
- `event` hook receives `{ type: string, ... }`
- Existing `tool.execute.after` already logs to the active initiative's progress log — audit log is a separate, more comprehensive trail
- Workflow state is in `src/workflow.ts` (class `WorkflowEngine`)
- Initiative manager is in `src/initiative.ts`

## Plan
- [ ] Create `src/audit.ts` with an `AuditLog` class:
  - Constructor takes `baseDir` (mdocs root)
  - Log file: `baseDir/audit.log` (NDJSON format — one JSON object per line)
  - `append(event: AuditEvent)` → appends a line to `audit.log`
  - `query(options: { startDate?, endDate?, type?, initiativeId?, limit? })` → reads and filters lines
  - `summarize(initiativeId)` → returns chronological array of events for that initiative
- [ ] Define `AuditEvent` interface in `src/types.ts`:
  ```ts
  interface AuditEvent {
    timestamp: string; // ISO
    type: 'tool' | 'workflow' | 'initiative' | 'wiki';
    initiativeId?: string;
    step?: StepName;
    details: Record<string, any>;
  }
  ```
- [ ] Wire hooks in `src/plugin.ts`:
  - `tool.execute.after`: append `{ type: 'tool', details: { toolName, step } }`
  - `event`: append `{ type: 'workflow' | 'initiative', details: { eventType } }`
- [ ] Add custom tool `mdocs_audit` in `src/plugin.ts`:
  - Input: `{ initiativeId?: string, limit?: number }`
  - Output: `{ events: AuditEvent[] }`
- [ ] Add log rotation: when `audit.log` exceeds 10MB, rename to `audit.log.1` and start fresh (keep max 3 backups)
- [ ] Add tests in `src/__tests__/audit.test.ts`:
  - Events are written to `audit.log`
  - `query` filters by initiativeId
  - `summarize` returns chronological events
  - Rotation triggers at size threshold
- [ ] Rebuild and run full test suite
- [ ] Update README with audit log location and query examples

## Acceptance Criteria
- Every tool call during an active initiative creates an audit event
- `mdocs_audit({ initiativeId: 'xxx' })` returns events for that initiative
- `audit.log` is valid NDJSON (one parseable JSON object per line)
- Log rotates automatically at 10MB
- All tests pass; build succeeds

## Progress Log

## Artifacts
