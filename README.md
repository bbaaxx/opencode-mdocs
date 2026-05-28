# opencode-mdocs

An opencode plugin that implements a **2-layer knowledge system** (initiatives + wiki) with a **9-step workflow** for AI-assisted development. The plugin is self-referential — its own installation and development are tracked as the first initiative in your knowledge base.

## What It Does

This plugin brings structure to AI-assisted development by:

1. **Tracking work as initiatives** — persistent, human-friendly task files that span multiple sessions
2. **Building a project wiki** — structured knowledge that persists across conversations
3. **Enforcing a workflow** — gates tool usage to ensure planning happens before execution
4. **Orchestrating subagents** — assembles context from initiatives and wiki to hand off to specialized agents

## Philosophy

opencode-mdocs is built on a simple but radical idea: **AI agents running in different terminals, applications, or machines are not separate entities — they are one distributed agent with different focal points.**

In 2026, AI-assisted coding is normal, but context is fragile. Every session restart, every new terminal, every handoff to a brainstorming agent while your primary agent is busy — all of these force you to rebuild context from scratch. The solution is not better prompts; it is **shared, durable memory**.

This plugin implements three core principles:

1. **Distributed Single Entity** — All agent instances share one memory system. When you talk to any instance, you talk to the same intelligence with a different window open.
2. **Agents Deserve Their Own Memory** — Agents should organize knowledge in the way that serves their reasoning, not force it into human-optimized formats. But humans still deserve to read, share, and reference it.
3. **Two Layers of Memory** — **Initiatives** hold the practical, collaborative, action-oriented state (planning, logs, status). **Wiki** holds stable, long-term knowledge that agents manage freely.

For the full story behind these principles, see the [Core Principles wiki entry](mdocs/wiki/philosophy/core-principles.md).

## Installation

### For Local Development (Dogfooding)

When working on the plugin itself, opencode loads it directly from the built output:

```bash
npm install
npm run build
npm run setup:local
```

The `setup:local` script creates a symlink in `.opencode/agents/` pointing to the package's agent file. This is required because opencode discovers agents at startup (before the plugin's config hook runs).

Create `opencode.json` in the project root:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["./dist/index.js"]
}
```

### For Consumers (after npm publish)

```bash
npm install --save-dev opencode-mdocs
```

In your project's `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-mdocs"]
}
```

That's it — the plugin auto-registers the agent and skills paths on startup.

## First Run

On first load, the plugin automatically:

1. Creates `/mdocs/` directory structure in your project root
2. Creates the first initiative tracking the plugin's own installation
3. Initializes index files for navigation

```
/mdocs/
├── initiatives/
│   ├── INDEX.md                          ← auto-generated list
│   └── install-and-configure-opencode-mdocs--YYYY-MM-DD.md
└── wiki/
    └── INDEX.md                          ← auto-generated list
```

## The 9-Step Workflow

```
IDLE → UNDERSTAND → DISCOVER → CONTEXT → PLAN → EXECUTE → VERIFY → REPORT → COMPLETE
```

| Step | What Happens | Tool Gates |
|------|-------------|------------|
| **IDLE** | Waiting for a task. All tools allowed (opt-in). | No restrictions |
| **UNDERSTAND** | Clarify the request with the user | Read only |
| **DISCOVER** | Check for related initiatives in `/mdocs/initiatives/` | Read only |
| **CONTEXT** | Read initiative + related wiki entries | Read only |
| **PLAN** | Write implementation plan to initiative | Read + Write allowed |
| **EXECUTE** | Dispatch subagents with assembled context | Read + Write allowed |
| **VERIFY** | Check results, loop if needed | Read + Write allowed |
| **REPORT** | Write wiki entries, update initiative | Read + Write allowed |
| **COMPLETE** | Offer to commit, mark initiative done | All tools allowed |

### Tool Enforcement

- **Read tools** (`read`, `glob`, `grep`, `list`) — always allowed
- **Write tools** (`edit`, `write`) — blocked until you reach PLAN
- **Destructive bash** (`rm`, `git commit`, `mv`) — blocked until COMPLETE
- **Non-destructive bash** (`ls`, `cat`, `echo`, `pwd`) — always allowed

## Knowledge System

### Initiatives

Persistent task files that track work across sessions:

**Location:** `/mdocs/initiatives/`

**Filename format:** `<slug>--<YYYY-MM-DD>.md`

Example: `add-authentication-system--2025-05-24.md`

**Structure:**
```markdown
---
id: add-authentication-system
title: Add authentication system
status: active
created: 2025-05-24
updated: 2025-05-24
owner: alice
tags: [auth, security]
related_wiki: [architecture/auth-design]
---

## Objective
Add JWT-based authentication to the API.

## Plan
- [ ] Research auth libraries
- [/] Implement middleware
- [x] Add tests

## Progress Log
- [2025-05-24] Created initiative
- [2025-05-25] Implemented middleware

## Artifacts
- wiki/decisions/why-jwt.md
```

**Status values:** `active` | `paused` | `done`

**Plan items** support checkable status markers:
- `- [ ] Task name` — pending
- `- [/] Task name` — in-progress
- `- [x] Task name` — done

### Wiki

Structured knowledge that persists across conversations:

**Location:** `/mdocs/wiki/<category>/`

**Structure:**
```
/mdocs/wiki/
├── INDEX.md
├── architecture/
│   ├── INDEX.md
│   └── plugin-design.md
├── decisions/
│   ├── INDEX.md
│   └── why-jwt.md
└── runbooks/
    ├── INDEX.md
    └── how-to-add-initiative.md
```

**Wiki entry format:**
```markdown
---
id: plugin-design
title: Plugin Architecture Design
category: architecture
created: 2025-05-24
updated: 2025-05-24
related_initiatives: [add-authentication-system]
tags: [plugin, architecture]
---

## Overview
The plugin follows a plugin-centric architecture...
```

### Indices

All indices are auto-generated:
- `/mdocs/initiatives/INDEX.md` — lists all initiatives with status and tags
- `/mdocs/wiki/INDEX.md` — categorized list of wiki entries
- `/mdocs/wiki/<category>/INDEX.md` — per-category entry list

## Usage

### Starting Work

The `mdocs-orchestrator` agent handles the workflow. When you say something like:

> "I want to add authentication to the API"

The agent will:
1. Ask clarifying questions (UNDERSTAND)
2. Check for existing initiatives (DISCOVER)
3. Read context from initiatives and wiki (CONTEXT)
4. Create or update a plan (PLAN)
5. Dispatch subagents to implement (EXECUTE)
6. Verify the results (VERIFY)
7. Update wiki and initiative (REPORT)
8. Offer to commit (COMPLETE)

### Custom Tools

The plugin provides custom tools:

- **`mdocs_init`** — Manually initialize the `/mdocs` structure
- **`mdocs_status`** — Show current workflow state and active initiatives
- **`mdocs_search`** — Search across initiatives and wiki by keyword
- **`mdocs_dispatch`** — Assemble subagent context from an initiative and its related wiki entries
- **`mdocs_audit`** — Query the audit log for events (filter by initiative, type, date)
- **`mdocs_lint`** — Lint initiatives and wiki entries for handoff readiness

### Managing Initiatives

Skills are included for:
- `mdocs-workflow` — guides the 9-step workflow
- `mdocs-initiative` — explains initiative creation and management

## Architecture

```
opencode-mdocs/
├── src/
│   ├── index.ts              ← plugin entry point
│   ├── plugin.ts             ← hook registrations (config, tool gates, events)
│   ├── types.ts              ← shared interfaces
│   ├── mdocs.ts              ← /mdocs directory initialization
│   ├── initiative.ts         ← initiative CRUD + search + indices
│   ├── wiki.ts               ← wiki CRUD + category indices
│   ├── workflow.ts           ← 9-step state machine + tool gates
│   └── subagent.ts           ← context assembly for Task tool handoffs
├── templates/
│   ├── initiative.md         ← new initiative template
│   └── wiki-entry.md         ← new wiki entry template
├── skills/
│   ├── mdocs-workflow/       ← workflow skill
│   └── mdocs-initiative/     ← initiative management skill
└── agents/
    └── mdocs-orchestrator.md ← primary workflow agent
```

## Hooks

The plugin registers these opencode hooks:

| Hook | Purpose |
|------|---------|
| `config` | Initialize `/mdocs` on first run |
| `tool.execute.before` | Gate tool access based on workflow step |
| `tool.execute.after` | Log tool calls to active initiative |
| `event` | Record significant events (workflow advances, creates) |
| `permission.ask` | Auto-allow tools aligned with current step |
| `tool` | Register `mdocs_init` and `mdocs_status` |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run the integration test script
node test-run.js
```

### Test Run

The `test-run.js` script simulates plugin loading without needing opencode:

```bash
node test-run.js
```

Output shows:
- `/mdocs` structure creation
- Bootstrap initiative generation
- Workflow state transitions
- Tool gate enforcement
- Custom tool responses

## Self-Referential Design

The plugin dogfoods its own system. When first loaded, it creates an initiative titled **"Install and Configure opencode-mdocs"** that tracks:
- Installation steps
- Configuration verification
- Workflow validation

This proves the system works and serves as living documentation.

## License

MIT

## Contributing

This project uses the mdocs workflow — all contributions should follow the 9-step process and update the relevant initiatives and wiki entries.

## Notes

- **Restart opencode after config changes** — the plugin loads config once at startup
- **Workflow is opt-in** — if no active initiative exists, all tools work normally
- **State persists** — workflow state is saved to `/mdocs/.workflow-state.json`
- **Initiatives are human-friendly** — file names include descriptive slugs and dates
- **Audit log** — all tool calls and significant events are written to `/mdocs/audit.log` in NDJSON format; rotates automatically at 10MB
