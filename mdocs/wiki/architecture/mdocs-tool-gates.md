---
id: mdocs-tool-gates
title: mdocs Tool Gate Exemptions
category: architecture
created: 2026-05-27
updated: 2026-05-27
related_initiatives: [mdocs-autonomy]
tags: [workflow, permissions, gates]
---

## Overview

The workflow enforces tool gates to ensure planning happens before execution. However, operations on the **mdocs knowledge base** itself are exempt from these gates. This gives the agent full autonomy to manage initiatives, wiki entries, and workflow state at any point.

## Why This Matters

Without this exemption, the agent would be unable to:
- Update initiative progress logs during execution
- Create wiki entries while working
- Fix its own state files when errors occur
- Self-document its work in real-time

## Exempted Operations

Any tool call targeting paths containing `/mdocs/` (or `\mdocs\` on Windows) is allowed regardless of workflow step:

| Tool | Example Exempt Operation |
|------|------------------------|
| `read` | Reading an initiative file |
| `write` | Creating a new wiki entry |
| `edit` | Updating progress log |
| `glob` | Listing all initiative files |
| `grep` | Searching wiki content |
| `bash` | Running commands on mdocs files |

## Non-Exempt Operations

Operations outside mdocs still respect workflow gates:

- `write` on `src/` requires PLAN step or later
- `bash 'git commit'` requires COMPLETE step
- `edit` on `README.md` requires PLAN step or later

## Implementation

The `WorkflowEngine.canExecuteTool()` method calls `isMdocsOperation()` to detect mdocs paths. If detected, it returns `true` immediately before checking workflow step restrictions.

## Rationale

The mdocs system is **meta-work** — it tracks and documents the work but isn't the work itself. Blocking the agent from managing its own knowledge base would create a circular dependency where the agent can't document what it's doing.
