---
id: fix-local-dogfooding-agent-discovery
title: Fix Local Dogfooding Agent and Skills Discovery
status: done
created: 2026-05-27
updated: 2026-05-27
owner: system
tags: [bug, dogfooding, local-development, agent, config]
related_wiki: ["architecture/plugin-design-spec"]
---

## Objective
Fix the local development (dogfooding) setup so the mdocs-orchestrator agent and skills are discoverable by opencode when developing the plugin itself, while maintaining the auto-registration mechanism for consumers who install the plugin via npm.

## Context
- The plugin source lives in this repo (`/Users/bbaaxx/AgentsPlayground/opencode-mdocs`)
- For local development, opencode loads the plugin from `./dist/index.js` (the built output)
- opencode discovers agents at startup by scanning `.opencode/agents/` directory
- The plugin's `config` hook auto-registers the agent by mutating the live config, but this happens AFTER opencode's agent discovery phase
- Previously, `.opencode/agents/mdocs-orchestrator.md` was tracked in git as a manual copy
- We removed it and added `.opencode/` to `.gitignore` to avoid tracking runtime files
- After restart, the agent is no longer available locally because:
  1. The file is gone from `.opencode/agents/`
  2. The config hook's auto-registration doesn't affect opencode's startup discovery
- For consumers who `npm install opencode-mdocs`, the `config` hook auto-registration works fine because opencode re-scans after plugin load
- Skills have the same problem: they live in `./skills/` but opencode discovers them from config, not filesystem

## Plan
- [ ] Restore `.opencode/agents/mdocs-orchestrator.md` as a symlink to `./agents/mdocs-orchestrator.md`
  - This provides the local discovery path without duplicating content
  - Symlinks are tracked by git as symlinks (Unix-friendly)
  - On Windows, document manual copy as fallback
- [ ] Remove `.opencode/` from root `.gitignore` and add granular ignores instead
  - Ignore: `.opencode/node_modules/`, `.opencode/package*.json`, `.opencode/bun.lock`
  - Keep: `.opencode/agents/mdocs-orchestrator.md` (symlink)
- [ ] Add a `setup:local` npm script that creates the symlink/copy
  - `npm run setup:local` → creates symlink or copies agent file
  - Run automatically in `postinstall` or document in README
- [ ] Verify skills are discoverable locally
  - Check if `./skills/` is already in `opencode.json` skills.paths (it is)
  - Skills should work because they're referenced by path in config, not discovered
- [ ] Test the dual setup:
  - Local: agent file exists in `.opencode/agents/`, opencode discovers it at startup
  - Consumer: config hook auto-registers from npm package path
- [ ] Update README to document both setups clearly
  - Local dev: run `npm run setup:local` after clone
  - Consumer: just add `"plugin": ["opencode-mdocs"]` to opencode.json
- [ ] Update the v1 release initiative if needed

## Acceptance Criteria
- After `npm run setup:local`, restarting opencode discovers the mdocs-orchestrator agent
- The agent file is NOT duplicated in git (single source of truth in `./agents/`)
- Consumer setup still works via auto-registration (config hook)
- README documents both local and consumer installation clearly
- All tests pass

## Progress Log
- [2026-05-27] Created initiative after identifying the agent discovery breakage
- [2026-05-27] Restored `.opencode/agents/mdocs-orchestrator.md` as a symlink to `./agents/mdocs-orchestrator.md`
- [2026-05-27] Updated `.gitignore` with granular rules (ignore runtime files, keep symlink)
- [2026-05-27] Added `npm run setup:local` script for easy symlink creation
- [2026-05-27] Updated README with clear local dev instructions
- [2026-05-27] All tests pass (88/88); committed and pushed to GitHub

## Artifacts
- `.opencode/agents/mdocs-orchestrator.md` — symlink to `./agents/mdocs-orchestrator.md`
- `.gitignore` — granular ignore rules
- `package.json` — `setup:local` script
- `README.md` — updated local dev instructions
