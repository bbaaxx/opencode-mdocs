---
id: complete-mdocs-cli-commands
title: Complete mdocs CLI Commands (delete, archive, index.sync)
status: active
priority: high
created: 2026-05-29
updated: 2026-05-29
owner: bbaaxx
tags: [enhancement, cli, commands, initiatives, delete, archive]
related_wiki: []
---

## Objective

Complete the `mdocs` CLI tool with commands that were stubs or missing in the first implementation pass:

1. **`initiative.delete`** — Permanently remove an initiative file and update INDEX.
2. **`initiative.archive`** — Move a `done` initiative to an `mdocs/initiatives/archive/` subdirectory, remove from main INDEX, update archive INDEX.
3. **`index.sync`** — Force-regenerate all INDEX.md files: initiatives INDEX, wiki root INDEX, wiki category indices.

Also add **`wiki.delete`** and **`wiki.list`** commands for completeness.

## Context

- Agent feedback: "No way to delete/archive — No command to properly remove an initiative, just manual file deletion."
- Edge case testing confirmed: no delete command exists.
- `index.sync` was stubbed in the first implementation pass.

## Plan

- [ ] Implement `initiative.delete`
  - Args: `{ id: string }`
  - Find initiative by id (findById), derive filename via formatFileName, delete file, call updateIndex()
  - Return `{ success: true, id }` or `{ error: 'Initiative not found' }`
  - Add test

- [ ] Implement `initiative.archive`
  - Args: `{ id: string }`
  - Find initiative, verify status is `done`, move file to `mdocs/initiatives/archive/`, regenerate archive INDEX
  - Archive INDEX at `mdocs/initiatives/archive/INDEX.md` lists all archived initiatives
  - Return `{ success: true, id, archivedFilename }`
  - Add test

- [ ] Implement `index.sync`
  - Force-regenerate: initiatives INDEX, wiki root INDEX, wiki category indices
  - Call updateIndex() on InitiativeManager and WikiManager
  - Return `{ success: true, regenerated: ['initiatives/INDEX.md', 'wiki/INDEX.md', ...] }`
  - Add test

- [ ] Implement `wiki.delete`
  - Args: `{ category: string, id: string }`
  - Call wiki.delete(category, id), update indices
  - Return `{ success: true }`

- [ ] Implement `wiki.list`
  - Args: `{ category?: string }`
  - Return all wiki entries, optionally filtered by category
  - Return `{ entries: [{ category, id, title, tags }] }`

- [ ] Update SKILL.md for mdocs-workflow to mention CLI commands for delete/archive
- [ ] Run full tests after all commands

## Acceptance Criteria

- `mdocs` tool with `{ command: 'initiative.delete', args: { id: 'some-id' } }` removes the file and updates INDEX.
- `mdocs` tool with `{ command: 'initiative.archive', args: { id: 'some-id' } }` moves done initiative to archive/ and updates archive INDEX.
- `mdocs` tool with `{ command: 'index.sync' }` regenerates all INDEX files.
- `mdocs` tool with `{ command: 'wiki.delete', args: { category: 'x', id: 'y' } }` removes entry and updates indices.
- All existing tests pass; new tests for each command.

## Progress Log
- [2026-05-29] Created initiative from edge case testing: missing delete, archive, index.sync, wiki.delete, wiki.list commands.
- [2026-05-29] Will implement after INITIATIVE 2 (add-mdocs-cli-commands) is complete, building on its mdocs tool structure.

## Artifacts
- `mdocs/initiatives/complete-mdocs-cli-commands--2026-05-29.md` — this initiative