---
id: mdocs-autonomy
title: Grant Agent Autonomy Over mdocs Knowledge
status: done
created: 2026-05-27
updated: 2026-05-27
owner: system
tags: [enhancement, workflow, permissions]
related_wiki: []
---

## Objective
Allow the agent to freely read and modify mdocs files (initiatives, wiki) without being blocked by workflow step gates.

## Plan
- [x] Modify workflow.ts canExecuteTool to detect mdocs paths
- [x] Allow read/write/glob/grep/edit/write on mdocs regardless of step
- [x] Rebuild and test
- [x] Update documentation

## Progress Log
- [2026-05-27] Created initiative to track change
- [2026-05-27] Added isMdocsOperation() helper to detect mdocs paths
- [2026-05-27] Updated canExecuteTool to return true for mdocs operations regardless of step
- [2026-05-27] Added 3 new tests verifying mdocs autonomy
- [2026-05-27] All 41 tests pass, build succeeds

## Artifacts
- Modified `src/workflow.ts`
- Modified `src/__tests__/workflow.test.ts`
