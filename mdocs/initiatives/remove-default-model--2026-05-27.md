---
id: remove-default-model
title: Remove Default Model from mdocs-orchestrator Agent
status: done
created: 2026-05-27
updated: 2026-05-27
owner: system
tags: [agent, config, model]
related_wiki: ["architecture/mdocs-tool-gates"]
---

## Objective
Remove the hardcoded `model` field from the mdocs-orchestrator agent so the system uses whatever model is available, rather than forcing a specific one.

## Plan
- [x] Remove `model` line from `agents/mdocs-orchestrator.md`
- [x] Remove `model` line from `.opencode/agents/mdocs-orchestrator.md`
- [x] Verify both files no longer specify a model
- [x] Update documentation

## Progress Log
- [2026-05-27] Created initiative
- [2026-05-27] Removed model field from both agent files
- [2026-05-27] Verified no `model:` line exists in either file

## Artifacts
- `agents/mdocs-orchestrator.md`
- `.opencode/agents/mdocs-orchestrator.md`
