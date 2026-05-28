---
id: origin-narrative
title: Origin Narrative — The Philosophy Behind opencode-mdocs
category: philosophy
created: 2026-05-28
updated: 2026-05-28
tags: [philosophy, origin, memory, distributed-agents]
---

# Origin Narrative

The original rationale behind this project is that the reality in 2026 AI coding is that as a human part of the AI assisted coding practice involves managing the context and its availability this creates the need to be able to share context with agent instances that are restarted or launched to refresh the context or because of technical failures such as the client computer restarting. There is also often the case where we need to launch a different agent to perform tasks for the a same feature we are working on the best example of this is when developing a feature wen we have our main  coder agent busy but we want to brainstorm about the next steps with another agent. 

This led the author to think that AI agents launched in different terminals and even different applications can be seen as the same entity, or a single ai agent with focus on different things, We can distribute the "focus and attention" of an agent but we can have a unified approach to enable talking with a predictable single entity. This basically requires us to understand this distributed agent will need a way to keep all the knowledge about a particular topic accesible to all the agent instances at the same time. This is basically a memory shared by a distributed single AI agent with focus on different aspects of a codebase or folder with files or a predefined workspace such as a monorepo or a user's messy "My Documents" folder depending on the usecase or workstream the Ai agent is being summoned to collaborate. 

After experimenting with md/obsidian based memory systems and wikis as well as with RAG knowledge databases, the author realized that Agents deserve their own memory that is they should be able to store the knowledge freely in the way that it will make more sense for the agents and not necesarily be created in a human-friendly way but in the personal preferred way of the agents. But also humans deserve to have a view into the knowledge and be able to understand it, share it, derive from it and the ability to make references to it with agents and humans alike. 

So the idea of having a 2 layered memory system allows to keep the "practical" aspects of a workflow such as planning, execution and high level definitions in a human-and-ai readable and collaborative format while letting the agents organize the content of the wiki in any way they want.

So the core principles of the philosophy: 1. AI agent instances are seen as a single distributed entity wich can be "focused" but share a single memory system  2. Agents deserve their own memory so the memory systems should allow for an AI agent-managed wiki and a collaborative space for human-ai collaboration. 3.- The human-ai collaboration area (initiatives) is where the statuses, logs planning prioritization and reporting provides the practical layer of knowlege while the wiki area holds knowledge that is more stable and long-term.