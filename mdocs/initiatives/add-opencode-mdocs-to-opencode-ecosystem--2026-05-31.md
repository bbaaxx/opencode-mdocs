---
id: add-opencode-mdocs-to-opencode-ecosystem
title: Add opencode-mdocs to OpenCode Ecosystem Directory
status: active
created: 2026-05-31
updated: 2026-05-31
owner: system
tags: [documentation, opencode, ecosystem, pr, directory]
related_wiki: [research/opencode-ecosystem-pr-style]
phase: plan
handoff_summary: "Studied closed anomalyco/opencode ecosystem PRs. Preferred pattern is a docs-only PR touching packages/web/src/content/docs/ecosystem.mdx with a single concise table row, likely under Plugins for opencode-mdocs. Use a temporary clone/fork workflow, branch from upstream dev, verify links/table formatting, then open PR with docs template."
open_questions: ["Confirm the canonical public repository URL remains https://github.com/bbaaxx/opencode-mdocs before opening the PR.", "Confirm whether opencode-mdocs should be listed under Plugins (recommended) or Agents."]
blockers: []
next_action: "Fork/clone anomalyco/opencode into a temporary subfolder, add the ecosystem.mdx row, verify docs-only diff, push branch, and open PR."
---

## Objective

Add `opencode-mdocs` to the official OpenCode ecosystem directory in `anomalyco/opencode` via a style-matching documentation PR.

## Plan

- [ ] Confirm listing category and canonical URL: recommend **Plugins** with `https://github.com/bbaaxx/opencode-mdocs`.
- [ ] Create or update a fork of `anomalyco/opencode` using `gh repo fork anomalyco/opencode --clone=false` if needed.
- [ ] Clone the fork into a temporary work folder, e.g. `/var/folders/6p/bhp33vz103gcx_v02y26ch3m0000gn/T/opencode/opencode-ecosystem-mdocs`, and add upstream remote if missing.
- [ ] Checkout a fresh branch from upstream `dev`, e.g. `docs/add-opencode-mdocs-ecosystem`.
- [ ] Edit only `packages/web/src/content/docs/ecosystem.mdx`, adding one concise row for `opencode-mdocs` in the Plugins section unless category is changed.
- [ ] Verify the diff is docs-only, the markdown table format is valid, the link resolves, and the row is placed consistently with nearby entries.
- [ ] Commit with a concise docs message such as `docs(ecosystem): add opencode-mdocs plugin`.
- [ ] Push the branch to the fork and open a PR to `anomalyco/opencode:dev`.
- [ ] Use a PR body matching observed style: documentation checkbox, one-row change summary, link/table verification, screenshots N/A, unrelated-changes checkbox.
- [ ] Record the PR URL and update this initiative's progress log.

## Style Findings

See related wiki: `research/opencode-ecosystem-pr-style`.

Key implications:

- Keep the change to one row in `packages/web/src/content/docs/ecosystem.mdx`.
- Use a title like `docs(ecosystem): add opencode-mdocs plugin`.
- Prefer a short capability description over a long feature list.
- Verification should state: documentation-only, link resolves, markdown table renders/formats correctly, no unrelated changes.

## Draft Ecosystem Row

```md
| [opencode-mdocs](https://github.com/bbaaxx/opencode-mdocs) | Workflow memory system for OpenCode — initiatives, wiki notes, validation, and subagent context assembly |
```

## Progress Log

- [2026-05-31] User requested a style study of closed OpenCode ecosystem PRs and an initiative for adding `opencode-mdocs` to the directory via fork/temporary clone/PR workflow.
- [2026-05-31] Reviewed PR search results and representative diffs (#6269, #24390, #22083, #19443, #19399). Created supporting research wiki note and implementation plan.

## Artifacts

- `mdocs/wiki/research/opencode-ecosystem-pr-style.md` — style notes and draft row.
