---
id: fix-mdocs-status-error
title: Fix mdocs_status Tool Error
status: done
created: 2026-05-27
updated: 2026-05-27
owner: system
tags: [bug, plugin, tools]
related_wiki: []
---

## Objective
Fix the `mdocs_status` custom tool throwing `pA.execute is not a function` error.

## Plan
- [x] Diagnose root cause in plugin.ts
- [x] Fix tool registration key and method name
- [x] Rebuild and verify
- [x] Update documentation

## Progress Log
- [2026-05-27] Identified bug: `tool` key should be `tools`, `handler` should be `execute`
- [2026-05-27] Fixed plugin.ts, rebuilt, all 38 tests pass
- [2026-05-27] Fixed test-run.js to use corrected API (`tools`/`execute`)
- [2026-05-27] Integration test confirms custom tools working

## Artifacts
- Fixed `src/plugin.ts`
- Fixed `test-run.js`
- Rebuilt `dist/` output verified
