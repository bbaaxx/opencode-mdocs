---
id: philosophy-alignment-roadmap
title: Philosophy Alignment Roadmap
category: roadmap
created: 2026-05-28
updated: 2026-05-28
related_initiatives: [align-implementation-with-philosophy, define-v2-memory-metadata, upgrade-dispatch-memory-retrieval, add-resume-status-cockpit, add-cross-link-graph-linter]
tags: [roadmap, philosophy, memory, distributed-agents, ux, architecture]
---

# Philosophy Alignment Roadmap

## Direction

The project should evolve from a workflow/documentation plugin into a durable shared memory substrate for one distributed agent, with human-readable collaboration views.

The roadmap uses two correlated tracks:

- **Experience track** — How humans and agent instances resume, discover, understand, and collaborate.
- **Memory architecture track** — How storage, workflow state, identity, retrieval, and graph semantics support durable shared memory.

## Phase 1: Philosophical Coherence

Goal: make the existing model clearly embody the philosophy without large rewrites.

### Experience track

- Add resume-first UX: active work, last progress, blockers, and recommended next action.
- Enhance `mdocs_status` with next action and latest activity.
- Add or simulate workflow controls: resume, set active, advance, pause, recover.
- Improve onboarding so the first run explains what memory was created and how to resume later.
- Add handoff summaries and open questions to initiatives.

### Memory architecture track

- Enhance `mdocs_dispatch` to include audit/progress summaries, artifacts, acceptance criteria, blockers, and recent changes.
- Use search-ranked related memory in dispatch, not only manually linked wiki entries.
- Add explicit initiative/wiki boundary semantics to schemas and docs.
- Add link validation for `related_wiki`, `related_initiatives`, artifacts, and dependencies.
- Add tests for richer context assembly and link integrity.

### Candidate follow-up initiatives

- Upgrade dispatch into memory retrieval assembly.
- Add resume/status cockpit.
- Define v2 initiative/wiki metadata.
- Add cross-link graph linter rules.

## Phase 2: Durable Memory Operations

Goal: turn logs and markdown into maintained memory.

### Experience track

- Generate richer human views: initiative dashboard, wiki map, decision index, roadmap index.
- Add human-readable handoff reports and “what changed since” reports.
- Improve wiki discoverability with snippets, descriptions, tags, and related entries.
- Add completion UX that confirms stable learnings were captured.

### Memory architecture track

- Add summarization and compaction for progress logs and audit history.
- Add durable initiative fields: current summary, key decisions, latest state, next resume prompt.
- Add wiki lifecycle metadata: draft, stable, superseded, needs-review.
- Add knowledge metadata: confidence, source initiatives, derived-from, supersedes.
- Support more flexible agent-owned wiki organization while generating human views.
- Improve retrieval with metadata weighting, recency, graph links, and snippets.

### Candidate follow-up initiatives

- Add memory compaction and resume summaries.
- Add generated human dashboards and wiki maps.
- Add wiki lifecycle/provenance metadata.
- Improve mdocs search into memory retrieval.

## Phase 3: Distributed Memory Infrastructure

Goal: support true multi-agent, multi-terminal, and potentially multi-machine coordination.

### Experience track

- Show what other facets are doing.
- Add conflict and stale-state recovery prompts.
- Support concurrent work visibility by initiative/session/facet.
- Add robust cross-terminal/app continuity patterns.

### Memory architecture track

- Add instance/session/facet identity to audit and workflow state.
- Replace one global workflow state with per-initiative/per-session workflow state.
- Add storage abstraction with atomic writes, revisions, and locks.
- Add memory graph APIs for links, dependencies, artifacts, and provenance.
- Add pluggable backends: filesystem, git-backed sync, shared folder, or remote API.
- Consider optional semantic retrieval while keeping markdown as canonical durable memory.

### Candidate follow-up initiatives

- Add agent/session/facet identity.
- Add storage abstraction and atomic writes.
- Add multi-workflow state.
- Add memory graph APIs.
- Add pluggable sync/storage backend.

## Prioritization Heuristic

Prioritize work that improves all three of these at once:

1. **Continuity** — a new agent can resume faster and with less ambiguity.
2. **Durability** — knowledge survives sessions and remains reliable under change.
3. **Memory quality** — the system captures stable knowledge without burying it in logs.

## Recommended Starting Point

Start with Phase 1, specifically:

1. Upgrade `mdocs_dispatch` into structured memory retrieval assembly.
2. Add a resume/status cockpit.
3. Define v2 initiative/wiki metadata for handoff, lifecycle, and provenance.
4. Add cross-link validation.

These create visible product value while laying the architectural foundation for later distributed-memory work.

## Implementation Initiatives Created

Phase 1 has been converted into concrete implementation initiatives:

1. [Upgrade Dispatch into Memory Retrieval Assembly](../../initiatives/upgrade-dispatch-memory-retrieval--2026-05-28.md)
2. [Add Resume and Status Cockpit](../../initiatives/add-resume-status-cockpit--2026-05-28.md)
3. [Define v2 Initiative and Wiki Memory Metadata](../../initiatives/define-v2-memory-metadata--2026-05-28.md)
4. [Add Cross-Link Graph Linter Rules](../../initiatives/add-cross-link-graph-linter--2026-05-28.md)

Suggested execution order:

1. `define-v2-memory-metadata` — establishes memory semantics used by later initiatives.
2. `upgrade-dispatch-memory-retrieval` — gives subagents richer continuity.
3. `add-resume-status-cockpit` — exposes continuity as product/UX behavior.
4. `add-cross-link-graph-linter` — hardens graph integrity after metadata is defined.
