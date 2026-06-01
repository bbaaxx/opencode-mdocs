---
id: fix-mdocs-permissions
title: Fix mdocs Permission Requests by Updating Agent Config
status: done
created: 2026-05-27
updated: 2026-05-27
owner: system
tags: [bug, permissions, agent, config]
related_wiki: ["architecture/mdocs-tool-gates"]
---

## Objective
Eliminate permission popups for mdocs operations by changing agent config to `allow`, letting plugin workflow gates handle restrictions.

## Plan
- [x] Change agent config `edit: ask` → `edit: allow`
- [x] Change agent config `write: ask` → `write: allow`
- [x] Change agent config `bash: ask` → `bash: allow`
- [x] Update both source and deployed agent files
- [x] Plugin gates still enforce non-mdocs restrictions

## Progress Log
- [2026-05-27] Identified root cause: agent config triggers permission popup before plugin hook runs
- [2026-05-27] Updated both agent files to allow all permissions
- [2026-05-27] Plugin workflow gates will continue to block non-mdocs operations appropriately

## Artifacts
- `agents/mdocs-orchestrator.md`
- `.opencode/agents/mdocs-orchestrator.md`
