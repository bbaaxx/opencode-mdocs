---
id: "add-wiki-stub-generation"
title: "Add Wiki Stub Generation and Auto-Create from Initiative Links"
status: "done"
created: "2026-05-29"
updated: "2026-06-01"
owner: "bbaaxx"
tags: ["enhancement","wiki","stub","auto-create","templates"]
related_wiki: ["architecture/mdocs-tool-gates"]
priority: "medium"
---

## Objective
When an initiative references a non-existent wiki entry via `related_wiki`, automatically scaffold a wiki stub with a template. Also provide a `mdocs wiki.stub` command for explicit stub creation.

## Plan
- [x] Add `stub()` method to WikiManager (`src/wiki.ts`)
- [ ] - Input: `{ category: string, id: string, title?: string, template?: string }`
- [ ] - If entry already exists, returns `{ existing: true, filePath }`
- [ ] - Creates new entry with a default stub template containing Overview/Details/References sections
- [ ] - Frontmatter: `id`, `title`, `category`, `created`, `updated`, `related_initiatives: []`, `tags: []`
- [ ] - Updates category and root wiki indices via `updateIndices()`
- [ ] - Returns `{ success: true, filePath }`
- [x] Add `wiki.stub` command to `mdocs` tool (`src/plugin.ts`)
- [ ] - Args: `{ category: string, id: string, title?: string }`
- [ ] - Calls `wiki.stub()` and returns `{ success: true, category, id, filePath }`
- [ ] - Add to `supportedMdocsCommands` list
- [x] Add `wiki.update` command to `mdocs` tool (`src/plugin.ts`)
- [ ] - Currently missing; needed for completeness alongside stub creation
- [ ] - Args: `{ category: string, id: string, content?: string, tags?: string[], relatedInitiatives?: string[] }`
- [x] Enhance initiative validation to detect broken `related_wiki` links (`src/wiki.ts`)
- [ ] - In `WikiManager.validate()`, add check: for each initiative's `related_wiki` refs, if the wiki file does not exist, add an error (not just warning)
- [ ] - This provides the "warn about broken wiki links" requirement
- [x] Add tests for stub generation (`src/__tests__/wiki.test.ts`)
- [ ] - `stub()` creates a new entry with correct template
- [ ] - `stub()` returns `existing: true` when entry already exists
- [ ] - `stub()` updates indices
- [ ] - `stub()` accepts custom template
- [ ] - Validate reports broken `related_wiki` links as errors
- [x] Update `mdocs-initiative` SKILL.md to document stub generation workflow

## Progress Log
- [2026-05-29] Created initiative from wiki integration feedback: no stub generation when linking to non-existent wiki entries.
- [2026-05-29] Will implement after INITIATIVE 2 (add-mdocs-cli-commands) is complete.
- [2026-05-31] Implemented `WikiManager.stub()` with default template and custom template support.
- [2026-05-31] Added `wiki.stub` and `wiki.update` commands to the `mdocs` tool.
- [2026-05-31] Enhanced `WikiManager.validate()` to detect broken `related_wiki` links as errors.
- [2026-05-31] Added 5 new tests: stub creation, existing stub handling, index updates, custom template, and broken link validation.
- [2026-05-31] Updated `mdocs-initiative` SKILL.md with wiki stub generation documentation.
- [2026-05-31] All 151 tests pass.
- [2026-06-01T02:55:33.954Z] Marked done via mdocs command

## Artifacts
- `mdocs/initiatives/add-wiki-stub-generation--2026-05-29.md` — this initiative