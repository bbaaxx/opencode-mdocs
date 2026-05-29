---
id: add-wiki-bidirectional-links
title: Add Bidirectional Wiki-Initiative Links and Back-Link Generation
status: active
priority: medium
created: 2026-05-29
updated: 2026-05-29
owner: bbaaxx
tags: [enhancement, wiki, links, back-reference, cross-reference]
related_wiki: []
---

## Objective

Add automatic back-link generation so wiki entries list all initiatives that reference them via `related_wiki`, and add a `mdocs wiki.link` command to establish bidirectional links programmatically.

## Context

- Agent feedback: "No bidirectional links — Initiative can link to wiki, but wiki doesn't auto-list related initiatives. Had to manually add note to testing-results.md."
- Also: "No wiki-to-wiki linking — If wiki entry A references wiki entry B, no automatic cross-reference."
- Currently wiki entries have `related_initiatives` in frontmatter but no automatic generation of a "Referenced by:" section in the wiki body.

## Plan

- [ ] Add `addRelatedInitiative()` method to WikiManager
  - Reads existing `related_initiatives` array from frontmatter
  - Adds initiative id if not already present (no duplicates)
  - Updates frontmatter `related_initiatives`
  - Updates `updated` timestamp
- [ ] Add `getReferencedBy()` method to WikiManager
  - Scans all initiatives for `related_wiki` entries matching this wiki entry
  - Returns list of initiative ids that reference this wiki
- [ ] Modify wiki.create and wiki.update to auto-add back-link in wiki content
  - After creating/updating, append to wiki entry body a section:
    `## Referenced By\n- initiative-id-1\n- initiative-id-2\n`
  - Only append if not already present (deduplicated)
- [ ] Add `wiki.link` command to `mdocs` tool
  - Args: `{ initiativeId: string, wikiSlug: string }`
  - Adds `related_wiki: [wikiSlug]` to initiative
  - Calls `addRelatedInitiative()` on wiki entry
  - Returns `{ success: true, bidirectional: true }`
- [ ] Add wiki-to-wiki cross-reference support
  - In wiki entries, detect references like `[[category/id]]` or `[id](category/id)` in body
  - Auto-add to `related_wiki` of the referenced entry (bidirectional)
  - Add `wiki.xref` command to manually create cross-references
- [ ] Add tests for bidirectional link generation and wiki.link command
- [ ] Update mdocs-workflow skill to document bidirectional linking

## Acceptance Criteria

- When `mdocs { command: 'wiki.link', args: { initiativeId: 'foo', wikiSlug: 'testing/results' } }` is called:
  - Initiative's `related_wiki` includes `testing/results`
  - Wiki entry's `related_initiatives` includes `foo`
  - Both frontmatter files are updated atomically
- Wiki entry body contains auto-generated "Referenced By" section listing all linking initiatives.
- All existing tests pass; new tests for bidirectional links.

## Progress Log
- [2026-05-29] Created initiative from wiki integration feedback: no bidirectional links, manual back-link addition required.
- [2026-05-29] Will implement after INITIATIVE 2 (add-mdocs-cli-commands) is complete.

## Artifacts
- `mdocs/initiatives/add-wiki-bidirectional-links--2026-05-29.md` — this initiative