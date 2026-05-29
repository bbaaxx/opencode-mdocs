---
id: consolidate-docs-superpowers
title: Consolidate docs/superpowers into mdocs Knowledge Management
status: done
priority: high
created: 2026-05-29
updated: 2026-05-29
owner: bbaaxx
tags: [enhancement, documentation, knowledge-management, cleanup]
related_wiki: [developer/agent-implementation-guide]
---

## Objective

Consolidate all knowledge management into the `/mdocs` structure, eliminating the antipattern `docs/superpowers/` folder. The `docs/superpowers/` folder was created by the superpowers plugin but does not belong in this project — all knowledge should live in `/mdocs/wiki/` and `/mdocs/initiatives/`.

## Actions

### 1. Delete docs/superpowers/

Remove the entire `docs/superpowers/` directory and its contents:
- `docs/superpowers/plans/2026-05-28-fix-v1-opencode-compatibility.md` — already represented in `mdocs/initiatives/fix-v1-opencode-compatibility--2026-05-28.md`
- `docs/superpowers/plans/2026-05-29-v102-testing-round-fixes.md` — working document superseded by mdocs initiative files
- `docs/superpowers/specs/2026-05-28-philosophy-alignment-roadmap-design.md` — already captured in `mdocs/wiki/roadmap/philosophy-alignment-roadmap.md` and `mdocs/wiki/architecture/philosophy-implementation-gap-analysis.md`

All meaningful content from these files is already preserved in mdocs initiative/wiki entries. The plans were working documents that fed into mdocs; the specs' output was captured in wiki entries.

### 2. Ingest fresh-agent-implementation-prompt.md into mdocs/wiki

Move `docs/fresh-agent-implementation-prompt.md` into `mdocs/wiki/developer/agent-implementation-guide.md`.

This is a one-time hand-off document with implementation guidance for a fresh agent session. It has ongoing reference value for future implementation work and should be preserved in mdocs as a developer reference, not deleted.

### 3. Policy enforcement

No future implementation plans should be created outside `/mdocs/initiatives/`. The `docs/` folder is reserved only for project documentation (README, LICENSE, CHANGELOG) and must not be used as a parallel knowledge base.

## Plan

- [x] Create this consolidation initiative
- [x] Ingest `docs/fresh-agent-implementation-prompt.md` → `mdocs/wiki/developer/agent-implementation-guide.md`
  - [x] Create `mdocs/wiki/developer/INDEX.md` if category doesn't exist
  - [x] Add frontmatter with id, title, category, tags, related_initiatives
- [x] Delete `docs/superpowers/plans/` directory
- [x] Delete `docs/superpowers/specs/` directory
- [x] Remove `docs/superpowers/` root directory if empty
- [x] Delete `docs/fresh-agent-implementation-prompt.md` after ingestion
- [x] Verify no orphaned references to `docs/superpowers/` remain in mdocs files
- [x] Update INDEX.md files to reflect new wiki entries

## Acceptance Criteria

- `docs/superpowers/` directory no longer exists.
- `mdocs/wiki/developer/agent-implementation-guide.md` exists with the content from `docs/fresh-agent-implementation-prompt.md`.
- `mdocs/wiki/developer/INDEX.md` exists.
- No references to `docs/superpowers/` in any mdocs file.
- `npm test` and `npm run build` pass.

## Progress Log

- [2026-05-29] Created initiative to consolidate docs/superpowers into mdocs structure.
- [2026-05-29] Evaluated all files in docs/superpowers/ — all are redundant with existing mdocs content or one-time use documents.
- [2026-05-29] Identified fresh-agent-implementation-prompt.md as the only file worth preserving (ingest to mdocs/wiki/developer/).
- [2026-05-29] Ingested fresh-agent-implementation-prompt.md → mdocs/wiki/developer/agent-implementation-guide.md with proper frontmatter.
- [2026-05-29] Created mdocs/wiki/developer/INDEX.md.
- [2026-05-29] Deleted docs/superpowers/ and docs/fresh-agent-implementation-prompt.md. Removed empty docs/ directory.

## Artifacts

- `mdocs/initiatives/consolidate-docs-superpowers--2026-05-29.md` — this initiative