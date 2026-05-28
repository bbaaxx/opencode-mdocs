---
id: fix-v1-opencode-compatibility
title: Fix v1 opencode Plugin Compatibility
status: done
priority: high
created: 2026-05-28
updated: 2026-05-28
owner: bbaaxx
tags: [bug, compatibility, v1, plugin, config, agent, tools]
related_wiki: []
---

## Objective
Patch `opencode-mdocs@1.0.0` compatibility with current opencode so first install visibly registers the bundled `mdocs-orchestrator` agent, exposes custom tools, and keeps skill registration deduplicated.

## Context
- First-install report shows the plugin partially loads: `/mdocs` initializes and `mdocs/audit.log` records hook activity.
- The agent and custom tools do not appear because the plugin uses stale opencode field names.
- Current opencode config uses `agent` as an object keyed by agent name, not `agents` as an array.
- Current opencode plugin custom tools are exposed under `tool`, not `tools`.
- The earlier `auto-register-agent-and-skills` initiative explicitly noted uncertainty about `cfg.agent` vs `cfg.agents`; implementation landed on the incompatible shape.
- Related completed initiatives: `prepare-v1-release`, `auto-register-agent-and-skills`, `fix-local-dogfooding-agent-discovery`, `fix-mdocs-permissions`, and `add-mdocs-dispatch-tool`.

## Plan
- [x] Establish baseline and root cause
  - [x] Read related initiatives and current plugin tests/source
  - [x] Verify baseline test suite passes before changes
- [x] Write implementation plan
  - [x] Save detailed TDD plan to `docs/superpowers/plans/2026-05-28-fix-v1-opencode-compatibility.md`
- [x] Add failing compatibility tests
  - [x] Assert plugin exposes `tool.mdocs_status` and `tool.mdocs_dispatch`
  - [x] Assert config hook creates `cfg.agent['mdocs-orchestrator']`
  - [x] Assert legacy `cfg.agents` is not required or produced for new config
  - [x] Assert plugin default export behaves like opencode loader expects
- [x] Implement compatibility fix
  - [x] Change `tools` export to `tool`
  - [x] Change config hook registration from `cfg.agents` array to `cfg.agent` object
  - [x] Load agent markdown body as inline `prompt`, preserving frontmatter permission/mode metadata
  - [x] Keep skill path registration deduplicated
- [x] Update package/docs for patch release
  - [x] Bump package version to `1.0.1`
  - [x] Add `CHANGELOG.md` entry for compatibility fix
  - [x] Update README if it documents old tool/config names
- [x] Verify
  - [x] Run focused plugin tests
  - [x] Run full test suite
  - [x] Run TypeScript build
  - [x] Run package dry-run if release-ready
- [x] Report
  - [x] Update this initiative progress log and artifacts
  - [ ] Offer to commit and publish patch release

## Acceptance Criteria
- `createPlugin(directory).tool.mdocs_status` exists.
- `createPlugin(directory).tool.mdocs_dispatch` exists.
- Calling `plugin.config(cfg)` creates `cfg.agent['mdocs-orchestrator']` with `description`, `mode: 'primary'`, permissive mdocs workflow permissions, and non-empty `prompt` from `agents/mdocs-orchestrator.md`.
- The plugin does not depend on `cfg.agents` for current opencode compatibility.
- Skill path registration remains present and deduplicated.
- Default plugin export remains an async function compatible with opencode plugin loading.
- Full test suite and build pass.

## Progress Log
- [2026-05-28] Created initiative from first-install compatibility report.
- [2026-05-28] Root cause confirmed in `src/plugin.ts`: stale `cfg.agents` and `tools` field names.
- [2026-05-28] Baseline test suite passed: 88/88 tests.
- [2026-05-28] Added TDD compatibility tests; RED run failed as expected because `plugin.tool` and `cfg.agent` were missing.
- [2026-05-28] Implemented current opencode shapes: `tool` custom tools and `cfg.agent['mdocs-orchestrator']` inline prompt registration.
- [2026-05-28] Bumped package version to `1.0.1` and added CHANGELOG compatibility notes.
- [2026-05-28] Verification passed: `npm test` (90/90), `npm run build`, and `npm pack --dry-run`.
- [2026-05-28] Code review returned APPROVED_WITH_NOTES; minor test-strength note addressed by asserting agent frontmatter is stripped from prompt.
- [2026-05-28] Final verification passed after review note: focused plugin test (12/12), full suite (90/90), TypeScript build, and `npm pack --dry-run` for `opencode-mdocs@1.0.1`.
- [2026-05-28] Marked initiative done before committing the compatibility patch.

## Artifacts
- `mdocs/initiatives/fix-v1-opencode-compatibility--2026-05-28.md` — this initiative
- `docs/superpowers/plans/2026-05-28-fix-v1-opencode-compatibility.md` — implementation plan
- `src/plugin.ts` — current opencode `tool` and `agent` compatibility fix
- `src/__tests__/plugin.test.ts` — compatibility regression tests
- `package.json` — version bumped to `1.0.1`
- `CHANGELOG.md` — `1.0.1` compatibility fix notes
