---
id: core-principles
title: Core Principles — The Philosophy Behind opencode-mdocs
category: philosophy
created: 2026-05-28
updated: 2026-06-01
related_initiatives: [define-v2-memory-metadata, add-cross-link-graph-linter, upgrade-dispatch-memory-retrieval, add-resume-status-cockpit, align-implementation-with-philosophy]
tags: [philosophy, memory, distributed-agents, human-ai-collaboration]
lifecycle: stable
knowledge_type: foundational-principles
confidence: high
source_initiatives: [align-implementation-with-philosophy, define-v2-memory-metadata, add-cross-link-graph-linter, upgrade-dispatch-memory-retrieval, add-resume-status-cockpit]
supersedes: []
---

# Core Principles

> For the original narrative, see [Origin Narrative](origin-narrative.md).

## The Problem

In 2026, AI-assisted coding has become the norm. But it comes with a hidden cost: **context management**. Every time an agent restarts, every time a terminal closes, every time you switch from your main coding agent to a brainstorming agent, the conversation context is lost. Technical failures — a client computer restart, a network hiccup, a session timeout — force you to rebuild context from scratch.

Worse, when you want to launch a second agent to brainstorm next steps while your primary agent is busy implementing, that second agent starts with zero knowledge of what you've already built, discussed, and decided.

## The Insight

AI agents launched in different terminals, different applications, even different machines, are not truly separate entities. They are **one distributed agent** with different focal points. You can distribute focus and attention across multiple instances, but the underlying intelligence, the accumulated knowledge, the project memory — these should remain unified.

This means the distributed agent needs a **shared memory system**: a way to keep all knowledge about a particular topic accessible to every agent instance simultaneously. Whether the workspace is a monorepo, a messy "My Documents" folder, or a focused codebase, the memory should travel with the workstream.

## Three Core Principles

### 1. Distributed Single Entity

**AI agent instances are facets of a single distributed entity.** They can be focused on different tasks, but they share one memory system. When you talk to any instance, you're talking to the same intelligence — just with a different window open.

This is why context must be **durable and shared**, not ephemeral and isolated.

### 2. Agents Deserve Their Own Memory

After experimenting with markdown/Obsidian-based memory systems, RAG databases, and traditional wikis, one truth emerged: **agents should store knowledge in the way that makes the most sense to them** — not necessarily in human-optimized formats.

But humans also deserve access. We need to understand the knowledge, share it, derive from it, and reference it in conversations with both agents and other humans.

This tension led to the two-layer design.

### 3. Two Layers: Practical Collaboration + Stable Knowledge

The system splits memory into two distinct but connected layers:

- **Initiatives (The Practical Layer)** — Human-and-AI readable, collaborative, action-oriented. This is where statuses, logs, planning, prioritization, and reporting live. It is the "doing" layer: dynamic, task-bound, conversational.
- **Wiki (The Knowledge Layer)** — More stable, long-term, and agent-managed. Agents organize this freely, in structures that serve their reasoning. Humans can read it, but the agents own the organization.

Together, these layers ensure that **practical workflow state** (initiatives) and **accumulated project knowledge** (wiki) are both durable, shareable, and accessible to every instance of the distributed agent.

## Implications for Workflow Design

- **Planning before execution is not bureaucracy — it is memory creation.** An initiative file is not just a todo list; it is a context capsule that any agent instance can pick up.
- **The wiki is not documentation — it is the agent's own notes.** Humans can read it, but the structure is optimized for agent reasoning.
- **Every session handoff should be frictionless.** If an agent dies and a new one spawns, the new instance should resume with full context in seconds, not minutes.

## Related

- [Origin Narrative](origin-narrative.md) — the raw story behind these principles
- [Plugin Architecture Design](../architecture/plugin-design-spec.md) — how the system implements these ideas