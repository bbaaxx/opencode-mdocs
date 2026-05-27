---
id: auto-register-agent-and-skills
title: Auto-Register Agent and Skills in Config Hook
status: done
created: 2026-05-27
updated: 2026-05-27
owner: system
tags: [enhancement, ux, config]
related_wiki: []
---

## Objective
Eliminate manual setup steps by having the plugin's `config` hook automatically register the bundled `mdocs-orchestrator` agent and append the package's `skills/` directory to the live config.

## Context
- The plugin entry point is `src/index.ts` which exports a default async function receiving `{ client, project, directory }`
- It calls `createPlugin(directory)` from `src/plugin.ts`
- `createPlugin` returns an object with a `config` hook: `config: (cfg: any) => { ... }`
- This `config` hook is called by opencode at plugin load time with the live configuration object
- The agent file is at `agents/mdocs-orchestrator.md` (relative to package root)
- Skills are in `skills/mdocs-workflow/SKILL.md` and `skills/mdocs-initiative/SKILL.md`
- Currently, users must manually copy the agent to `.opencode/agents/` and add skills paths to `opencode.json`

## Plan
- [ ] In `src/plugin.ts`, update the `config` hook to mutate `cfg`:
  - Register agent: `cfg.agents = cfg.agents || []; cfg.agents.push({ name: 'mdocs-orchestrator', path: path.join(__dirname, '../agents/mdocs-orchestrator.md') })`
  - Register skills: `cfg.skills = cfg.skills || { paths: [] }; cfg.skills.paths.push(path.join(__dirname, '../skills'))`
  - Note: verify the exact opencode config schema — `cfg.agent` vs `cfg.agents`, `cfg.skills.paths` vs `cfg.skillPaths`
- [ ] Handle both local development (`./dist/`) and npm package (`node_modules/opencode-mdocs/`) paths
  - Use `path.resolve(__dirname, '../agents/mdocs-orchestrator.md')` to resolve from `src/` or `dist/`
- [ ] Add test in `src/__tests__/plugin.test.ts` (create if needed):
  - Mock config object; verify `config(mockCfg)` mutates it correctly
- [ ] Update `README.md`:
  - Remove manual agent copy instructions
  - Show minimal `opencode.json`: `{ "plugin": ["opencode-mdocs"] }`
- [ ] Rebuild and run full test suite

## Important Note on Config Schema
The exact opencode config hook API is not fully documented in this repo. The `cfg` object shape may vary. The implementation should:
1. Defensively check if fields exist before mutating
2. Log what it attempted to register (for debugging)
3. Not throw if registration fails (graceful degradation)

## Acceptance Criteria
- Loading the plugin mutates the config object to include the mdocs-orchestrator agent
- Skills path is appended to config
- Both local (`npm run build`) and package (`npm install`) paths resolve correctly
- README shows minimal one-line plugin config
- All tests pass; build succeeds

## Progress Log
- [2026-05-27] Updated `config` hook in `src/plugin.ts` to auto-register agent and skills
- [2026-05-27] Added defensive path resolution for both local (`src/`) and built (`dist/`) contexts
- [2026-05-27] Added deduplication logic to prevent duplicate registrations
- [2026-05-27] Added graceful error handling (never throws)
- [2026-05-27] Added 5 config hook tests in `src/__tests__/plugin.test.ts`
- [2026-05-27] Updated README: removed manual agent copy, simplified to one-line plugin config
- [2026-05-27] All tests pass (88/88); build succeeds; linter score 5/5

## Artifacts
- `src/plugin.ts` — auto-registration logic in `config` hook
- `src/__tests__/plugin.test.ts` — config hook tests
- `README.md` — simplified installation instructions
