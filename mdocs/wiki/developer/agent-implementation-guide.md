---
id: agent-implementation-guide
title: Fresh Agent Implementation Guide
category: developer
created: 2026-05-29
updated: 2026-05-29
related_initiatives: [fix-slug-initiative-ux, add-mdocs-cli-commands, add-initiatives-wiki-validation]
tags: [developer, guide, implementation, handoff]
---

# Fresh Agent Implementation Guide: mdocs UX Improvements

## Context

You are implementing three initiatives for the `opencode-mdocs` plugin. Work in `/Users/bbaaxx/AgentsPlayground/opencode-mdocs`. The repo is already cloned and dependencies installed (`npm install` was run).

## Current State

- **Version**: 1.1.0
- **Tests**: 90/90 passing, `npm test` and `npm run build` both pass.
- **Source files to know**:
  - `src/plugin.ts` — exports `tool` object with `mdocs_init`, `mdocs_status`, `mdocs_search`, `mdocs_dispatch`, `mdocs_audit`. Custom tools go here.
  - `src/initiative.ts` — InitiativeManager with `create()`, `read()`, `update()`, `findById()`, `findBlocked()`, `findOverdue()`. Filename derived from `slugify(title)` + `--created.md`.
  - `src/wiki.ts` — WikiManager with `create()`, `read()`, `update()`, `delete()`.
  - `src/types.ts` — Initiative, WikiEntry, PlanItem interfaces.
  - `src/__tests__/plugin.test.ts` — plugin tests, all use `(plugin as any).tool.mdocs_xxx.execute(...)`.

## Initiative Files (read these first)

Read each initiative file to understand the goal before writing any code:
- `mdocs/initiatives/fix-slug-initiative-ux--2026-05-29.md`
- `mdocs/initiatives/add-mdocs-cli-commands--2026-05-29.md`
- `mdocs/initiatives/add-initiatives-wiki-validation--2026-05-29.md`

## Implementation Order

Do them in this order: `fix-slug-initiative-ux` → `add-mdocs-cli-commands` → `add-initiatives-wiki-validation`.

---

## Initiative 1: fix-slug-initiative-ux

### What's broken

`formatFileName` in `src/initiative.ts` always uses `slugify(title)` as the filename stem, ignoring the `id` field. Example: initiative with `title: "Install and Configure opencode-mdocs"` gets filename `install-and-configure-opencode-mdocs--2026-05-27.md`, but frontmatter `id: install-mdocs`. When an agent tries to read using the `id` as filename stem (`install-mdocs--2026-05-27.md`), it fails.

The INDEX.md shows title + tags but NOT the actual filename, so agents can't discover it without guessing.

### Required changes

**File: `src/initiative.ts`**

1. Modify `formatFileName()` to use `id` (slugified) as the filename stem when `id` is set and non-empty, falling back to `slugify(title)` otherwise:
   ```typescript
   private formatFileName(initiative: Initiative): string {
     const stem = initiative.id ? this.slugify(initiative.id) : this.slugify(initiative.title);
     return `${stem}--${initiative.created}.md`;
   }
   ```

2. Update `updateIndex()` in `src/initiative.ts` to include the actual filename in INDEX display using `this.formatFileName(i)`.

**File: `src/plugin.ts`**

3. Add `mdocs_lookup` tool to `tool`: look up initiatives by id/title/slug, return `{ results: [{ filename, id, title, status, tags }] }` or `{ error: '...' }`.

**File: `src/__tests__/plugin.test.ts`**

4. Add tests for `mdocs_lookup` and INDEX filename display.

---

## Initiative 2: add-mdocs-cli-commands

### What's broken

Agents had to manually create/edit files, edit INDEX.md, and use grep for searching. No programmatic API for initiative/wiki CRUD.

### Required changes

Add a `mdocs` tool with subcommands in `src/plugin.ts`:

- `initiative.create`: `{ title, id?, tags?, relatedWiki?, objective?, plan?[] }` — returns `{ success: true, filename, id }`
- `initiative.update`: `{ id, ...updates }` — findById, apply allowed updates, update() with correct filename
- `initiative.done`: `{ id }` — findById, set status='done', append to progressLog, update()
- `wiki.create`: `{ category, id, title, content?, tags?, relatedInitiatives? }` — returns `{ success: true }`
- `validate`: stub (covered by initiative 3)
- `index.sync`: stub (covered by initiative 4)

For filename derivation in update/done: use `formatFileName(init)` to get the correct filename from an initiative object.

Add tests for all commands.

---

## Initiative 3: add-initiatives-wiki-validation

### What's broken

No validation: duplicate IDs can be created, required fields aren't checked, `related_wiki` references can point to non-existent wiki entries, and INDEX consistency is never checked.

### Required changes

**File: `src/initiative.ts`**

Add `validate()` to InitiativeManager:
- Check for duplicate IDs
- Check required fields (id, title, status, created)
- Check related_wiki references exist (warn if missing)
Returns `{ valid: boolean, errors: string[], warnings: string[] }`

**File: `src/wiki.ts`**

Add `validate()` to WikiManager:
- Check required fields (id, title, category)
Returns `{ valid: boolean, errors: string[], warnings: string[] }`

**File: `src/plugin.ts`**

Add `mdocs_validate` tool: calls `initiatives.validate()` and `wiki.validate()`, returns aggregated results.

Add tests for validation paths.

---

## Verification After Each Initiative

After implementing each initiative:
1. `npm test` — all tests must pass
2. `npm run build` — TypeScript must compile cleanly
3. Update the initiative's Progress Log with what was done and verified

## Important Rules

- Use TDD: write failing test first, then minimal code to pass.
- Do NOT modify existing passing tests unless the test itself was testing the OLD (broken) behavior.
- Commit after each initiative is complete: one commit per initiative with a descriptive message.
- After all three are done, run `npm test` and `npm run build` one final time to confirm everything passes.
