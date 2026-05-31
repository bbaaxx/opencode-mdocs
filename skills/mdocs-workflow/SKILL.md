---
name: mdocs-workflow
description: Use when starting new work, creating tasks, or managing the development workflow. Triggers on "start work", "new task", "begin initiative", "work on".
---

# Mdocs Workflow

## Overview

The mdocs workflow is a 9-step process for AI-assisted development:

1. **UNDERSTAND** — Clarify the request. Ask questions if ambiguous.
2. **DISCOVER** — Check `./mdocs/initiatives/` for related work. Use `mdocs_resume` to pick up where the last agent left off. Offer to resume or create.
3. **CONTEXT** — Read the initiative and related wiki entries. Use `mdocs_dispatch` to get assembled context with search-ranked memory and recent activity.
4. **PLAN** — Write an implementation plan to the initiative file.
5. **EXECUTE** — Dispatch subagents with assembled context via Task tool. `mdocs_dispatch` now includes retrieved memory, handoff summary, blockers, and recent audit events.
6. **VERIFY** — Check results (lint, tests). Run `mdocs_validate` to check initiative/wiki integrity and graph cross-links. Loop if needed.
7. **REPORT** — Write wiki entries for artifacts, update initiative. For done initiatives, ensure at least one wiki entry with `lifecycle: stable` captures durable learnings.
8. **COMPLETE** — Offer to commit, mark initiative done. Graph linter verifies done initiatives have stable wiki learnings.

## Rules

- Never skip steps. Each step sets a checkpoint.
- Read tools are always allowed. Write tools require PLAN state.
- Commits require COMPLETE state.
- If no active initiative exists, workflow is opt-in.
- Resume-first: start DISCOVER with `mdocs_resume` or `mdocs_status` to see active work, blockers, and next actions.
- Verification includes graph linting: cross-links, backlinks, and completion gates.

## Subagent Dispatch

When dispatching subagents, include:
- Initiative objective and current plan items
- Relevant wiki entries
- Handoff summary, blockers, and next action (v2 metadata)
- Retrieved memory (search-ranked related context)
- Recent audit events for the initiative
- Current step constraints
- Verification criteria

## Maintenance Commands

Use the `mdocs` command tool for safe filesystem-changing maintenance:
- `initiative.delete` removes an initiative and regenerates `initiatives/INDEX.md`.
- `initiative.archive` moves a done initiative to `initiatives/archive/` and regenerates active/archive indices.
- `wiki.delete` removes a wiki entry and regenerates wiki indices.
- `wiki.list` lists wiki entries, optionally filtered by category.
- `index.sync` force-regenerates initiative and wiki indices after direct file edits.
