---
name: mdocs-initiative
description: Use when creating, updating, or querying initiatives. Triggers on "create initiative", "update initiative", "initiative status", "list initiatives".
---

# Mdocs Initiative Management

## File Format

Initiatives live in `/mdocs/initiatives/`.

**Filename:** `<slug>--<YYYY-MM-DD>.md`

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
---
```

**Status values:** `active` | `paused` | `done`

## Operations

- **Create:** Write a new markdown file with frontmatter + sections (Objective, Plan, Progress Log, Artifacts)
- **Update:** Edit existing file, update `updated` date, append to Progress Log
- **Search:** Look in `/mdocs/initiatives/INDEX.md` or scan files for tag matches
- **Link wiki:** Add `related_wiki` entries to connect knowledge
