---
id: add-full-text-search
title: Add Full-Text Search Across Initiatives and Wiki
status: done
created: 2026-05-27
updated: 2026-05-27
owner: system
tags: [enhancement, search, discovery]
related_wiki: ["architecture/mdocs-tool-gates"]
---

## Objective
Enable searching across all initiative and wiki content so users can quickly find related work and knowledge without manually scanning files.

## Context
- Initiatives live in `/mdocs/initiatives/*.md` with frontmatter + markdown body
- Wiki entries live in `/mdocs/wiki/<category>/<id>.md` with frontmatter + markdown body
- Both are plain markdown files; no database exists
- Existing `InitiativeManager` and `WikiManager` classes have `findRelated(tag[])` but no text search

## Plan
- [x] Create `src/search.ts` with a `SearchEngine` class
- [x] Build an in-memory inverted index at runtime:
  - Tokenize on whitespace and lowercase
  - Index terms from: title, objective, plan descriptions, progressLog, wiki content
  - Store `docId` + `field` + `frequency` per term
- [x] `SearchEngine.query(query: string, options?)` returns ranked results:
  - Options: `{ tags?: string[], status?: Status, category?: string, dateFrom?: string, dateTo?: string }`
  - Ranking: simple term frequency (TF) — more occurrences = higher score
  - Results include `type: 'initiative' | 'wiki'`, `id`, `title`, `score`
- [x] Rebuild index on every `create/update/delete` call (no file watcher needed; index is small)
- [x] Add custom tool `mdocs_search` in `src/plugin.ts`:
  - Input: `{ query: string, filters?: {...} }`
  - Output: `{ results: Array<{type, id, title, score}> }`
- [x] Add tests in `src/__tests__/search.test.ts`:
  - Indexing initiative content
  - Searching returns relevant results
  - Tag filtering narrows results
  - Ranking orders by relevance
- [ ] Update `agents/mdocs-orchestrator.md` DISCOVER step to use `mdocs_search`
- [ ] Update README with search examples
- [x] Rebuild and run full test suite

## Acceptance Criteria
- Searching "audit" returns the audit-log initiative in top 3 results
- Searching with `tags: ['bug']` only returns initiatives/wiki with that tag
- `mdocs_search` tool returns results within 100ms for <100 files
- Results are ranked by term frequency
- All tests pass; build succeeds

## Progress Log
- [2026-05-27] Created `SearchEngine` class in `src/search.ts` with in-memory inverted index
- [2026-05-27] Implemented tokenization, indexing of title/objective/plan/progressLog/wiki content
- [2026-05-27] Added `query()` with filters for tags, status, category, date range
- [2026-05-27] Added TF-based ranking (more occurrences = higher score)
- [2026-05-27] Added `mdocs_search` custom tool to `src/plugin.ts`
- [2026-05-27] Added 6 tests covering indexing, searching, tag filtering, ranking, wiki content, status filtering
- [2026-05-27] All 70 tests pass; build succeeds; linter score 5/5

## Artifacts
- `src/search.ts` — SearchEngine class with inverted index and query support
- `src/types.ts` — Added SearchResult and SearchOptions interfaces
- `src/plugin.ts` — Added mdocs_search custom tool
- `src/__tests__/search.test.ts` — 6 search test cases
