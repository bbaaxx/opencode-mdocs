---
id: "add-wiki-bidirectional-links"
title: "Add Bidirectional Wiki-Initiative Links and Back-Link Generation"
status: "done"
created: "2026-05-29"
updated: "2026-06-01"
owner: "bbaaxx"
tags: ["enhancement","wiki","links","back-reference","cross-reference"]
related_wiki: ["architecture/mdocs-tool-gates"]
priority: "medium"
---

## Objective
Add automatic back-link generation so wiki entries list all initiatives that reference them via `related_wiki`, and add a `mdocs wiki.link` command to establish bidirectional links programmatically.

## Plan
- [x] Add `addRelatedInitiative()` method to WikiManager (`src/wiki.ts`)
- [ ] - Reads existing `related_initiatives` array from frontmatter
- [ ] - Adds initiative id if not already present (no duplicates)
- [ ] - Updates frontmatter `related_initiatives`
- [ ] - Updates `updated` timestamp
- [x] Add `getReferencedBy()` method to WikiManager (`src/wiki.ts`)
- [ ] - Scans all initiatives for `related_wiki` entries matching this wiki entry
- [ ] - Returns list of initiative ids that reference this wiki
- [x] Modify `wiki.create` and `wiki.update` to auto-add back-link in wiki content
- [ ] - Appends `## Referenced By` section with initiative links
- [ ] - Strips and regenerates on update to avoid duplication
- [ ] - `wiki.read()` strips the auto-generated section so `content` is clean
- [x] Add `wiki.link` command to `mdocs` tool (`src/plugin.ts`)
- [ ] - Args: `{ initiativeId: string, wikiSlug: string }`
- [ ] - Updates initiative `related_wiki` and wiki `related_initiatives`
- [ ] - Returns `{ success: true, bidirectional: true }`
- [x] Add wiki-to-wiki cross-reference support (`src/wiki.ts`)
- [ ] - Added `addWikiCrossRef()` method with `related_wiki` frontmatter field
- [ ] - Added `extractWikiRefs()` helper for future auto-detection
- [ ] - Added `wiki.xref` command to plugin
- [x] Add tests for bidirectional link generation and cross-references (`src/__tests__/wiki.test.ts`)
- [x] Update `mdocs-workflow` SKILL.md to document bidirectional linking

## Progress Log
- [2026-05-29] Created initiative from wiki integration feedback: no bidirectional links, manual back-link addition required.
- [2026-05-29] Will implement after INITIATIVE 2 (add-mdocs-cli-commands) is complete.
- [2026-05-31] Implemented `addRelatedInitiative()`, `getReferencedBy()`, and `addWikiCrossRef()` in WikiManager.
- [2026-05-31] Auto-generate `## Referenced By` section on create/update; strip on read for clean content.
- [2026-05-31] Added `wiki.link` and `wiki.xref` commands to the `mdocs` tool.
- [2026-05-31] Added 7 new tests for bidirectional links, referenced-by sections, and wiki cross-references.
- [2026-05-31] Updated `mdocs-workflow` SKILL.md with bidirectional linking documentation.
- [2026-05-31] All 158 tests pass.
- [2026-06-01T02:58:35.380Z] Marked done via mdocs command

## Artifacts
- `mdocs/initiatives/add-wiki-bidirectional-links--2026-05-29.md` — this initiative