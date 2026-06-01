---
id: add-checkable-plan-items
title: Add Checkable Plan Items to Initiatives
status: done
created: 2026-05-27
updated: 2026-05-27
owner: system
tags: [enhancement, workflow, initiatives]
related_wiki: ["architecture/mdocs-tool-gates"]
---

## Objective
Replace the plain string array for plan items with a checkable format so that progress can be tracked per item (pending, in-progress, done) rather than just logging free-form text.

## Plan
- [x] Update `src/types.ts` `Initiative` interface: change `plan: string[]` to `plan: PlanItem[]`
- [x] Define `PlanItem` type with `description`, `status: 'pending' | 'in-progress' | 'done'`, and optional `startedAt` / `completedAt` dates
- [x] Update `src/initiative.ts` serialization and parsing to handle new plan format
- [x] Support backward compatibility: auto-convert plain string arrays on read
- [x] Update `templates/initiative.md` to show checkable plan items
- [x] Add tests for creating, updating, and toggling plan item status
- [ ] Update `src/plugin.ts` event logging to record plan item transitions
- [x] Rebuild and run full test suite
- [ ] Update README with new plan item format example

## Progress Log
- [2026-05-27] Added `PlanItem` and `PlanItemStatus` types to `src/types.ts`
- [2026-05-27] Updated `src/initiative.ts` with `formatPlanItem()` and `parsePlanItem()` helpers
- [2026-05-27] Plan items serialize as `- [ ] desc`, `- [/] desc`, `- [x] desc` in markdown
- [2026-05-27] Backward compatibility: plain `- desc` items parsed as `status: 'pending'`
- [2026-05-27] Updated `src/subagent.ts` to render checkable plan items in context
- [2026-05-27] Updated `src/plugin.ts` bootstrap initiative to use PlanItem objects
- [2026-05-27] Updated `templates/initiative.md` with checkable format examples
- [2026-05-27] Added 4 new tests: checkable serialization, parsing, backward compatibility, round-trip
- [2026-05-27] All 46 tests pass, build succeeds

## Artifacts
- Modified `src/types.ts`
- Modified `src/initiative.ts`
- Modified `src/subagent.ts`
- Modified `src/plugin.ts`
- Modified `templates/initiative.md`
- Modified `src/__tests__/initiative.test.ts`
- Modified `src/__tests__/types.test.ts`
- Modified `src/__tests__/integration.test.ts`
- Modified `src/__tests__/subagent.test.ts`
