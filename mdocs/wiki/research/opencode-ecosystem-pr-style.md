---
id: opencode-ecosystem-pr-style
title: OpenCode Ecosystem PR Style Notes
category: research
created: 2026-05-31
updated: 2026-05-31
related_initiatives: [add-opencode-mdocs-to-opencode-ecosystem]
tags: [opencode, ecosystem, pr, documentation, research]
lifecycle: draft
knowledge_type: research-note
confidence: medium
---

## Summary

Studied closed `anomalyco/opencode` PRs matching `is:pr is:closed ecosystem opencode-agents` on 2026-05-31 to prepare an `opencode-mdocs` ecosystem-directory submission.

## Relevant examples

- #6269 `docs: add opencode-notificator to ecosystem plugins list` — merged; single-row edit in `packages/web/src/content/docs/ecosystem.mdx` under Plugins.
- #24390 `docs: add opencode-claude-code-plugin to ecosystem plugins` — docs-only; PR body follows template; single table row with concise description and link verification.
- #22083 `docs(ecosystem): add opencode-bmad-workflow plugin` — adds plugin row, but closed after automated cleanup; useful style reference, but avoid its formatting issues (blank-row replacement, very long description).
- #19443 `docs(ecosystem): add awesome-opencode to agents section` — Agents section addition; adjusted table width to fit description.
- #19399 `docs(ecosystem): add jailoc to projects` — Projects section addition; verification mentions alphabetical placement.

## Observed contribution style

- Change is normally documentation-only and limited to `packages/web/src/content/docs/ecosystem.mdx`.
- PR titles commonly use `docs(ecosystem): add <name> to <section>` or `docs: add <name> to ecosystem <section>`.
- PR body usually includes:
  - Issue: `N/A — adding a community <plugin/project/agent> to the ecosystem list.` unless there is a tracking issue.
  - Type of change: Documentation checked.
  - What changed: one row added, with a concise description and links.
  - Verification: docs-only; link resolves; markdown table renders; no unrelated changes.
- Keep the table entry concise: `| [name](repo-url) | short capability-focused description |`.
- Best target section for `opencode-mdocs`: likely **Plugins** if positioned as an installable OpenCode plugin providing mdocs workflow tools, an orchestrator agent, and skills; **Agents** only if positioned primarily as reusable agent prompts/configs.
- Current upstream file path/branch from GitHub API: `dev`, file `packages/web/src/content/docs/ecosystem.mdx`.

## Proposed row draft

```md
| [opencode-mdocs](https://github.com/bbaaxx/opencode-mdocs) | Workflow memory system for OpenCode — initiatives, wiki notes, validation, and subagent context assembly |
```
