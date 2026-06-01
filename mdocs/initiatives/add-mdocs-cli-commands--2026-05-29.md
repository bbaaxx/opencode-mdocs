---
id: add-mdocs-cli-commands
title: Add mdocs CLI Commands for Initiative and Wiki Operations
status: done
priority: high
created: 2026-05-29
updated: 2026-05-29
owner: bbaaxx
tags: [enhancement, cli, commands, initiatives, wiki, automation]
related_wiki: ["architecture/mdocs-tool-gates"]
---

## Objective

Add a `mdocs` custom tool with subcommands so agents can perform Initiative and Wiki CRUD operations without manual file manipulation. This replaces the need to manually create/edit files, edit INDEX.md, or search via grep.

## Context

- Agent feedback: "Had to manually create files, edit INDEX.md, search via grep, update frontmatter."
- Currently the plugin only has: `mdocs_init`, `mdocs_status`, `mdocs_search`, `mdocs_dispatch`, `mdocs_audit`.
- No command exists to create an initiative, update frontmatter fields, move an initiative to done, or create wiki entries programmatically.

## Plan

- [x] Design `mdocs` tool with subcommand interface
  - Input: `{ command: string, args: object }`
  - Commands: `initiative.create`, `initiative.update`, `initiative.done`, `wiki.create`, `wiki.update`, `validate`, `index.sync`
- [x] Implement `initiative.create`
  - Args: `{ title, id?, tags?, relatedWiki?, objective, plan? }`
  - Creates initiative file with proper frontmatter, calls manager.create(), returns filename
  - If `id` provided, uses it as filename stem; otherwise derives from title
  - Does NOT require manual file creation or INDEX editing
- [x] Implement `initiative.update`
  - Args: `{ id, field, value }` or `{ id, updates: object }`
  - Updates frontmatter fields: status, tags, priority, dueDate, dependsOn
  - Appends to Progress Log on significant changes
  - Calls manager.update() which auto-regenerates INDEX
- [x] Implement `initiative.done`
  - Args: `{ id }`
  - Sets status to `done`, updates `updated` date, appends completion entry to Progress Log
- [x] Implement `wiki.create`
  - Args: `{ category, id, title, content, tags?, relatedInitiatives? }`
  - Creates wiki entry file with frontmatter, auto-updates wiki indices
- [x] Implement `validate` (or integrate into `mdocs_status`)
  - Runs all validation checks from the validation initiative
  - Returns structured results
- [ ] Implement `index.sync`
  - Force-regenerates all INDEX.md files (initiatives, wiki root, wiki categories)
- [x] Add tests for all commands
- [ ] Update SKILL.md documentation

## Acceptance Criteria

- `mdocs` tool is callable with `{ command: 'initiative.create', args: { title: 'Test' } }` and creates the file without manual tool usage.
- `mdocs` tool with `{ command: 'initiative.done', args: { id: 'some-id' } }` marks the initiative done and auto-updates INDEX.
- `mdocs` tool with `{ command: 'wiki.create', args: {...} }` creates the wiki entry and updates indices.
- No manual file creation, INDEX editing, or grep-based searching required for standard operations.
- All existing tests pass; new tests added for CLI commands.

## Progress Log
- [2026-05-29] Created initiative from agent feedback: no CLI commands for initiative/wiki operations.
- [2026-05-29] Will implement as TDD: write failing tests for each command first.
- [2026-05-29] RED: `npm test -- src/__tests__/plugin.test.ts` failed as expected because `plugin.tool.mdocs` was undefined and the config hook list lacked `mdocs`.
- [2026-05-29] GREEN: `npm test -- src/__tests__/plugin.test.ts` passed after adding the `mdocs` command tool for initiative/wiki operations and placeholder validate/index.sync responses.
- [2026-05-29] Marked done for the v1.0.2 testing-round scope after final branch review approved commit `4277fe7`; fresh verification: `npm test` passed 11 suites / 113 tests and `npm run build` passed. Remaining expanded CLI work (`delete`, `archive`, full `index.sync`) is tracked separately by `complete-mdocs-cli-commands` / index initiatives.

## Artifacts
- `mdocs/initiatives/add-mdocs-cli-commands--2026-05-29.md` — this initiative
