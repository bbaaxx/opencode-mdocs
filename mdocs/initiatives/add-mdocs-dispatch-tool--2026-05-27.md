---
id: add-mdocs-dispatch-tool
title: Add mdocs_dispatch Custom Tool for Subagent Context Assembly
status: done
created: 2026-05-27
updated: 2026-05-27
owner: system
tags: [enhancement, subagent, orchestration]
related_wiki: ["architecture/mdocs-tool-gates"]
---

## Objective
Wire the existing `SubagentAssembler` into a new custom tool (`mdocs_dispatch`) that reads the active initiative, fetches related wiki entries, assembles context, and returns it ready for subagent dispatch.

## Context
- `SubagentAssembler` lives in `src/subagent.ts` and has an `assemble(initiative, wikiEntries, currentStep)` method that returns a markdown string
- The plugin entry point is `src/plugin.ts` which exports custom tools under the `tools` key
- Existing custom tools: `mdocs_init` and `mdocs_status`
- `InitiativeManager` is in `src/initiative.ts`; `WikiManager` is in `src/wiki.ts`
- Initiatives have a `relatedWiki` field (array of category/id strings like `['architecture/plugin-design']`)

## Plan
- [ ] In `src/plugin.ts`, add `mdocs_dispatch` to the `tools` export:
  - Input: `{ initiativeId: string }` (optional; defaults to `workflow.status().activeInitiative`)
  - Behavior:
    1. Read initiative via `initiatives.read('${initiativeId}.md')`
    2. For each `relatedWiki` entry, read corresponding wiki entry via `wiki` manager
    3. Call `assembler.assemble(initiative, wikiEntries, workflow.getCurrentStep())`
    4. Return `{ context: string, initiativeId, step, relatedWikiCount }`
  - Error: return `{ error: 'Initiative not found' }` if initiative doesn't exist
- [ ] Add tests in `src/__tests__/plugin.test.ts` (create if needed):
  - `mdocs_dispatch` returns assembled context for existing initiative
  - `mdocs_dispatch` returns error for missing initiative
  - `mdocs_dispatch` includes related wiki entries in context
- [ ] Update `agents/mdocs-orchestrator.md` EXECUTE step to reference `mdocs_dispatch`:
  - "Use the `mdocs_dispatch` custom tool to assemble context before dispatching subagents"
- [ ] Update README custom tools section with `mdocs_dispatch` description
- [ ] Rebuild and run full test suite

## Acceptance Criteria
- `mdocs_dispatch({ initiativeId: 'add-checkable-plan-items' })` returns a markdown context string
- The context string includes the initiative title, objective, plan items, and related wiki content
- Missing initiative returns a clear error object, not an exception
- All tests pass; build succeeds

## Progress Log
- [2026-05-27] Added `findById` method to `InitiativeManager` for ID-based lookup
- [2026-05-27] Implemented `mdocs_dispatch` custom tool in `src/plugin.ts`
- [2026-05-27] Created `src/__tests__/plugin.test.ts` with 5 test cases
- [2026-05-27] Updated `agents/mdocs-orchestrator.md` EXECUTE step to reference `mdocs_dispatch`
- [2026-05-27] Updated README custom tools section with `mdocs_dispatch` description
- [2026-05-27] All tests pass (75/75); build succeeds; linter score 5/5

## Artifacts
- `src/plugin.ts` — added `mdocs_dispatch` tool
- `src/initiative.ts` — added `findById` method
- `src/__tests__/plugin.test.ts` — tests for mdocs_dispatch
- `agents/mdocs-orchestrator.md` — updated EXECUTE step
- `README.md` — updated custom tools documentation
