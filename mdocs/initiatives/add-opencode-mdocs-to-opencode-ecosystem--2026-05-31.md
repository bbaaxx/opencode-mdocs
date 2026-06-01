---
id: "add-opencode-mdocs-to-opencode-ecosystem"
title: "Add opencode-mdocs to OpenCode Ecosystem Directory"
status: "active"
created: "2026-05-31"
updated: "2026-06-01"
owner: "system"
tags: ["documentation","opencode","ecosystem","pr","directory"]
related_wiki: ["research/opencode-ecosystem-pr-style","research/opencode-ecosystem-pr-submission"]
priority: "medium"
phase: "verify"
handoff_summary: "OpenCode ecosystem PR is open at https://github.com/anomalyco/opencode/pull/30149. Branch bbaaxx:docs-add-opencode-mdocs-ecosystem targets anomalyco/opencode:dev and adds one Plugins row to packages/web/src/content/docs/ecosystem.mdx. Verification passed: docs-only diff, diff --check, canonical repo URL, clean branch, PR metadata."
next_action: "Monitor PR https://github.com/anomalyco/opencode/pull/30149 for review feedback or merge; after resolution, mark initiative done."
---

## Objective
Add `opencode-mdocs` to the official OpenCode ecosystem directory in `anomalyco/opencode` via a style-matching documentation PR.

## Plan
- [x] Confirm listing category and canonical URL: recommend **Plugins** with `https://github.com/bbaaxx/opencode-mdocs`.
- [x] Create or update a fork of `anomalyco/opencode` using `gh repo fork anomalyco/opencode --clone=false` if needed.
- [x] Clone the fork into a temporary work folder, e.g. `/var/folders/6p/bhp33vz103gcx_v02y26ch3m0000gn/T/opencode/opencode-ecosystem-mdocs`, and add upstream remote if missing.
- [x] Checkout a fresh branch from upstream `dev`, e.g. `docs/add-opencode-mdocs-ecosystem`.
- [x] Edit only `packages/web/src/content/docs/ecosystem.mdx`, adding one concise row for `opencode-mdocs` in the Plugins section unless category is changed.
- [x] Verify the diff is docs-only, the markdown table format is valid, the link resolves, and the row is placed consistently with nearby entries.
- [x] Commit with a concise docs message such as `docs(ecosystem): add opencode-mdocs plugin`.
- [x] Push the branch to the fork and open a PR to `anomalyco/opencode:dev`.
- [x] Use a PR body matching observed style: documentation checkbox, one-row change summary, link/table verification, screenshots N/A, unrelated-changes checkbox.
- [x] Record the PR URL and update this initiative's progress log.

## Progress Log
- [2026-05-31] User requested a style study of closed OpenCode ecosystem PRs and an initiative for adding `opencode-mdocs` to the directory via fork/temporary clone/PR workflow.
- [2026-05-31] Reviewed PR search results and representative diffs (#6269, #24390, #22083, #19443, #19399). Created supporting research wiki note and implementation plan.
- Opened OpenCode ecosystem directory PR https://github.com/anomalyco/opencode/pull/30149 from bbaaxx:docs-add-opencode-mdocs-ecosystem to anomalyco/opencode:dev. Change is docs-only: packages/web/src/content/docs/ecosystem.mdx, 1 insertion adding opencode-mdocs under Plugins. Verified clean branch, diff --check, canonical repo URL resolution, and PR metadata.
- Created stable artifact wiki note research/opencode-ecosystem-pr-submission documenting PR URL, branch, commit, diff, and verification results.
- Responded to PR template compliance warning on https://github.com/anomalyco/opencode/pull/30149. Updated PR body to exactly follow upstream .github/pull_request_template.md sections (Issue, Type of change, What does this PR do, Verification, Screenshots, Checklist). GitHub Actions replied that the PR now meets contributing guidelines; check-standards and check-compliance are passing.

## Artifacts
- `mdocs/wiki/research/opencode-ecosystem-pr-style.md` — style notes and draft row.
- `mdocs/wiki/research/opencode-ecosystem-pr-submission.md` — PR URL, branch, commit, diff, and verification results.