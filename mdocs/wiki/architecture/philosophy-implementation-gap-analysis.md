---
id: philosophy-implementation-gap-analysis
title: Philosophy-to-Implementation Gap Analysis
category: architecture
created: 2026-05-28
updated: 2026-05-28
related_initiatives: [align-implementation-with-philosophy, define-v2-memory-metadata, upgrade-dispatch-memory-retrieval, add-resume-status-cockpit, add-cross-link-graph-linter]
tags: [philosophy, architecture, ux, memory, gap-analysis]
lifecycle: stable
knowledge_type: architecture
confidence: high
source_initiatives: [align-implementation-with-philosophy, define-v2-memory-metadata, upgrade-dispatch-memory-retrieval, add-resume-status-cockpit, add-cross-link-graph-linter]
supersedes: []
---

# Philosophy-to-Implementation Gap Analysis

## Summary

opencode-mdocs already implements the skeleton of its philosophy: initiatives, wiki, workflow gates, search, audit, linting, and dispatch. The gap is not absence of the core model; it is depth. The system still behaves mostly like a single-session workflow/documentation plugin rather than a durable shared memory substrate for one distributed agent.

## Principle 1: Distributed Single Entity

### Current alignment

- Workflow state is persisted in `/mdocs/.workflow-state.json`.
- Initiatives and wiki live in project-local files that any session can read.
- `mdocs_dispatch` assembles initiative context for subagents.
- Audit logs preserve tool/event history.

### Gaps

- There is one global workflow state and one active initiative, not multiple coordinated facets.
- Agent/session/facet identity is not tracked.
- Resume/discovery UX is manual and underpowered.
- Dispatch context is thin: objective, plan, related wiki, and current step only.
- Interrupted-session recovery is not first-class.
- Concurrent agents can overwrite local files without revision/lock semantics.

### Opportunities

- Add resume cockpit behavior or `mdocs_resume`.
- Add workflow tools for set-active, advance, pause, recover, and next action.
- Include audit summaries, last progress, blockers, artifacts, acceptance criteria, and open questions in dispatch context.
- Track instance/session/facet identity in audit and workflow state.
- Add atomic writes, revisions, and conflict handling.

## Principle 2: Agents Deserve Their Own Memory

### Current alignment

- Wiki entries are separated from initiatives.
- Agents can read/write mdocs knowledge files without normal workflow gate restrictions.
- Search and indices provide basic discoverability.

### Gaps

- Wiki organization is constrained to one-level human-readable categories.
- Wiki entries lack memory semantics such as confidence, stability, provenance, supersession, or freshness.
- Search is token-frequency based and does not yet behave like memory retrieval.
- Agent memory-writing policies are not operationalized.
- Human-readable indices are generated from the same constrained model rather than derived views over agent-owned memory.

### Opportunities

- Allow more flexible/nested agent-owned wiki organization.
- Generate human views from agent-owned memory rather than constraining memory to human categories.
- Add wiki metadata for knowledge type, stability, confidence, source initiatives, and supersession.
- Add policies for when agents should update wiki, compact logs, or promote learnings.
- Improve retrieval with snippets, metadata weighting, graph expansion, and recency.

## Principle 3: Two Layers of Memory

### Current alignment

- Initiatives hold objective, plan, progress log, and artifacts.
- Wiki holds longer-term entries with category metadata.
- Initiatives can reference related wiki; wiki can reference related initiatives.

### Gaps

- The initiative/wiki boundary is mostly conventional, not encoded in schema/lifecycle rules.
- Cross-links are manual and weakly validated.
- Initiative completion does not enforce promotion of stable learnings into wiki.
- Raw progress/audit logs grow without compaction into current state or durable knowledge.
- Human collaboration state and agent memory are connected but not yet graph-managed.

### Opportunities

- Add explicit initiative metadata: phase, handoff summary, open questions, blockers, next agent action.
- Add wiki metadata: knowledge type, lifecycle state, provenance, confidence, supersession.
- Add bidirectional link validation, backlink generation, orphan detection, and stale checks.
- Add compaction/summarization operations.
- Add completion gates that verify decisions/artifacts/learnings are captured.

## High-Leverage Gaps

1. **Resume-first memory experience** — A new agent should quickly know what happened and what to do next.
2. **Structured context assembly** — Dispatch should become memory retrieval, not manual wiki concatenation.
3. **Memory semantics** — Initiative and wiki schemas should encode their philosophical roles.
4. **Graph integrity** — Links, dependencies, artifacts, and provenance should be first-class.
5. **Distributed safety** — Multiple facets need identity, revisions, locks, and conflict recovery.

## Phase 1 Gap Closure

The following gaps were addressed in Phase 1:

| Gap | Phase 1 Closure |
|-----|-----------------|
| Resume/discovery UX is manual and underpowered | `mdocs_resume` tool returns next action, blockers, latest progress, and validation; `mdocs_status` enriched with resume info |
| Dispatch context is thin | `mdocs_dispatch` now includes search-ranked memory, audit events, handoff summary, blockers, and artifacts |
| Wiki entries lack memory semantics | v2 wiki metadata: lifecycle, knowledgeType, confidence, sourceInitiatives, supersedes |
| Initiative/wiki boundary is mostly conventional | v2 initiative metadata: phase, handoffSummary, openQuestions, blockers, nextAction |
| Cross-links are weakly validated | Graph linter checks broken links, missing backlinks, and done initiative completion gates |
| Initiative completion does not enforce promotion of stable learnings | Graph linter warns when done initiatives have no wiki entry with `lifecycle: stable` |

Remaining gaps (Phase 2+): agent/session identity, atomic writes, summarization and compaction, flexible wiki organization, richer human views.
