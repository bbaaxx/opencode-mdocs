---
name: mdocs-workflow
description: Use when starting new work, creating tasks, or managing the development workflow. Triggers on "start work", "new task", "begin initiative", "work on".
---

# Mdocs Workflow

## Overview

The mdocs workflow is a 9-step process for AI-assisted development:

1. **UNDERSTAND** — Clarify the request. Ask questions if ambiguous.
2. **DISCOVER** — Check `/mdocs/initiatives/` for related work. Offer to resume or create.
3. **CONTEXT** — Read the initiative and related wiki entries.
4. **PLAN** — Write an implementation plan to the initiative file.
5. **EXECUTE** — Dispatch subagents with assembled context via Task tool.
6. **VERIFY** — Check results (lint, tests). Loop if needed.
7. **REPORT** — Write wiki entries for artifacts, update initiative.
8. **COMPLETE** — Offer to commit, mark initiative done.

## Rules

- Never skip steps. Each step sets a checkpoint.
- Read tools are always allowed. Write tools require PLAN state.
- Commits require COMPLETE state.
- If no active initiative exists, workflow is opt-in.

## Subagent Dispatch

When dispatching subagents, include:
- Initiative objective and current plan items
- Relevant wiki entries
- Current step constraints
- Verification criteria
