---
id: add-wiki-stub-generation
title: Add Wiki Stub Generation and Auto-Create from Initiative Links
status: active
priority: medium
created: 2026-05-29
updated: 2026-05-29
owner: bbaaxx
tags: [enhancement, wiki, stub, auto-create, templates]
related_wiki: []
---

## Objective

When an initiative references a non-existent wiki entry via `related_wiki`, automatically scaffold a wiki stub with a template. Also provide a `mdocs wiki.stub` command for explicit stub creation.

## Context

- Agent feedback: "No stub generation — When adding related_wiki: [testing/results], the wiki file doesn't auto-create with a template."
- If an agent links to `testing/results` but `wiki/testing/results.md` doesn't exist, the reference is broken until manually created.
- Also: "Slug format mismatch — testing/results in frontmatter maps to testing-results.md filename. The / in the slug doesn't match file naming convention." (This is actually about understanding the mapping: `testing/results` → `category: testing`, `id: results` → `wiki/testing/results.md`. This needs documentation but is correct behavior.)

## Plan

- [ ] Add `stub()` method to WikiManager
  - Input: `{ category: string, id: string, title?: string, template?: string }`
  - If entry already exists, returns `{ error: 'Entry already exists', existing: true }`
  - Creates new entry with minimal content from template or default template:
    ```
    ---
    id: {id}
    title: {title || id}
    category: {category}
    created: {ISO date}
    updated: {ISO date}
    related_initiatives: []
    tags: []
    ---

    ## Overview

    <!-- Add overview here -->

    ## Details

    <!-- Add details here -->

    ## References

    - Linked from initiative: {linking initiative ids}
    ```
  - Updates category and root wiki indices
  - Returns `{ success: true, filePath }`
- [ ] Add `wiki.stub` command to `mdocs` tool
  - Args: `{ category: string, id: string, title?: string }`
  - Creates stub wiki entry
  - Returns `{ success: true, category, id, filePath }`
- [ ] Modify initiative validation (initiative 3) to warn about broken wiki links
  - When validate() detects `related_wiki: [cat/id]` where file doesn't exist, offer to auto-create stub
- [ ] Add `mdocs wiki.create` auto-stub option
  - When calling `wiki.create` with an initiative id in `relatedInitiatives`, auto-link the initiative's `related_wiki`
- [ ] Add tests for stub generation and auto-create from initiative validation
- [ ] Update mdocs-initiative SKILL.md to document stub generation

## Acceptance Criteria

- `mdocs { command: 'wiki.stub', args: { category: 'testing', id: 'new-entry', title: 'New Entry' } }` creates `wiki/testing/new-entry.md` with template content.
- When validate() finds a broken `related_wiki` reference, it can optionally auto-create the stub.
- All existing tests pass; new tests for stub generation.

## Progress Log
- [2026-05-29] Created initiative from wiki integration feedback: no stub generation when linking to non-existent wiki entries.
- [2026-05-29] Will implement after INITIATIVE 2 (add-mdocs-cli-commands) is complete.

## Artifacts
- `mdocs/initiatives/add-wiki-stub-generation--2026-05-29.md` — this initiative