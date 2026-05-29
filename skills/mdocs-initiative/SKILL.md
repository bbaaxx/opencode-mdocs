---
name: mdocs-initiative
description: Use when creating, updating, or querying initiatives. Triggers on "create initiative", "update initiative", "initiative status", "list initiatives".
---

# Mdocs Initiative Management

## File Format

Initiatives live in `./mdocs/initiatives/`.

**Filename:** `<id-slug>--<YYYY-MM-DD>.md` when `id` is set and non-empty; otherwise `<title-slug>--<YYYY-MM-DD>.md`.

Example: `add-authentication-system--2025-05-24.md`

**Frontmatter:**
```yaml
---
id: add-authentication-system
title: Add authentication system
status: active
created: 2025-05-24
updated: 2025-05-24
owner: human-name
tags: [auth, security]
related_wiki: [architecture/plugin-design]
phase: implementation
handoff_summary: "Auth flow is ready for review."
open_questions: ["Should we support SSO?"]
blockers: ["Waiting on API key"]
next_action: "Write integration tests."
---
```

**Status values:** `active` | `paused` | `done`

**Optional v2 metadata fields:**
- `phase`: `discovery` | `planning` | `implementation` | `verification` | `done`
- `handoff_summary`: Short summary for the next agent to pick up work
- `open_questions`: List of unresolved questions
- `blockers`: List of current blockers
- `next_action`: Recommended next step for a fresh agent

## Completion Gates

When marking an initiative `done`:
- Ensure at least one related wiki entry has `lifecycle: stable` to capture durable learnings
- The graph linter will warn about done initiatives without stable wiki learnings

## Operations

- **Create:** Write a new markdown file with frontmatter + sections (Objective, Plan, Progress Log, Artifacts)
- **Update:** Edit existing file, update `updated` date, append to Progress Log
- **Lookup filename:** Prefer `mdocs_lookup({ query: '<id-or-title-or-slug>' })` before reading/updating an initiative by filename. It returns the actual filename plus `id`, `title`, `status`, and `tags`.
- **Search:** Use `mdocs_lookup` for exact initiative filename discovery, then `./mdocs/initiatives/INDEX.md` or `mdocs_search` for broader tag/content matches.
- **Resume:** Use `mdocs_resume({ initiativeId: '<id>' })` to get next action, blockers, latest progress, and validation status
- **Link wiki:** Add `related_wiki` entries to connect knowledge. Wiki entries should have reciprocal `related_initiatives`.
