---
id: fix-mdocs-first-activation-hook-error
title: Fix mdocs First Activation Hook Error
status: done
created: 2026-05-31
updated: 2026-05-31
owner: system
tags: [bug, plugin, hooks, tools, orchestrator, activation]
related_wiki: ["developer/opencode-custom-tool-result-contract"]
phase: done
handoff_summary: "Fixed and user-confirmed. Root cause: mdocs custom tools returned raw JSON objects, but opencode custom tools expect a ToolResult string or `{ output: string }`; the UI/bridge called `.split` on missing `output`. Default plugin export now wraps custom tool returns into `{ output: JSON.stringify(...), metadata: ... }`. Explicit args schemas were also added. Tests/build pass and fresh-session user retest confirmed the popup is gone."
open_questions: []
blockers: []
next_action: "No follow-up required; commit and push confirmed fix."
---

## Objective
Find and fix the error that appears on first activation of an Mdocs-Orchestrator task, likely from a hook or custom tool invocation. The observed UI error is:

```text
mdocs_status
undefined is not an object (evaluating 'p.split')
```

During creation of this initiative, invoking the generic `mdocs` command tool also returned the same error, suggesting the issue may affect multiple mdocs custom tool entrypoints rather than only `mdocs_status`.

## Plan
- [x] Reproduce the failure with `mdocs_status` and the generic `mdocs` command tool in the local opencode-mdocs environment.
- [x] Research opencode CLI/debug support for plugins, hooks, agents, resolved config, and startup logs.
- [x] Search source, generated `dist/`, plugin registration, and hook/config code for path splitting and custom tool argument handling that could call `.split` on `undefined`.
- [x] Identify whether the root cause is hook activation, custom tool schema/wrapper behavior, working-directory discovery, or missing argument defaults.
- [x] Add or update regression tests for the failing first-activation/custom-tool path.
- [x] Implement the fix in source and rebuild generated artifacts if this repo requires committed build output.
- [x] Verify `mdocs_status`, generic `mdocs` commands, and normal initiative discovery work without the `p.split` error after restarting opencode.
- [x] Document durable learning in a related wiki entry if the root cause is non-obvious.

## Progress Log
- [2026-05-31] Created initiative from user report and screenshot. Initial evidence: `mdocs_status` failed with `undefined is not an object (evaluating 'p.split')`; fallback direct read of `mdocs/initiatives/INDEX.md` succeeded. Attempt to call the generic `mdocs` command tool also failed with the same error.
- [2026-05-31] Researched opencode debugging support. Official CLI docs and local `opencode debug --help` confirm `opencode debug` subcommands plus global `--print-logs` and `--log-level DEBUG`. Useful commands: `opencode debug info`, `opencode debug config`, `opencode debug agent mdocs-orchestrator`, `opencode debug startup`, `opencode debug paths`, and `opencode debug wait`. `opencode debug agent mdocs-orchestrator --print-logs --log-level DEBUG` shows plugin loading from `file:///Users/bbaaxx/AgentsPlayground/opencode-mdocs/dist/index.js` and registers all mdocs tools (`mdocs`, `mdocs_status`, `mdocs_dispatch`, etc.) without failing during registry setup.
- [2026-05-31] User clarified the popup happens only on first attempts by the agent to use mdocs and then does not reappear, pointing toward lazy first-use tool schema/render/validation rather than persistent business logic failure.
- [2026-05-31] Implemented probable fix: added explicit Zod `args` schemas to all custom mdocs tool definitions (`mdocs`, `mdocs_init`, `mdocs_status`, `mdocs_validate`, `mdocs_search`, `mdocs_lookup`, `mdocs_dispatch`, `mdocs_audit`, `mdocs_resume`) and added a regression test asserting every custom tool exposes args. Added `zod` as a runtime dependency. Rebuilt `dist/`.
- [2026-05-31] Verification: `npm test -- --runInBand src/__tests__/plugin.test.ts` passes with 38 tests. `npm run build` passes. Direct dist verification confirms all tool definitions have `args` and `p.tool.mdocs_status.execute({})` returns without error. The current running opencode session still shows `p.split` because plugin/tool definitions are loaded once at session start; a restart is required to validate first-activation behavior in the actual UI.
- [2026-05-31] User tested a fresh opencode session and `mdocs_status` still failed with `undefined is not an object (evaluating 'p.split')`, disproving restored-session metadata as the cause and showing missing `args` schemas alone were insufficient.
- [2026-05-31] Identified a more likely opencode contract mismatch: custom tool `execute` functions should return `ToolResult` (`string` or `{ output: string, metadata?, attachments? }`), but mdocs tools returned raw objects. Patched `src/index.ts` default plugin export to wrap all mdocs custom tool results into `{ output: JSON.stringify(value, null, 2), metadata: value }` for opencode runtime while preserving `createPlugin`'s object-returning internal API/tests. Added regression test for default export ToolResult shape.
- [2026-05-31] Verification after ToolResult patch: plugin tests pass with 39 tests, TypeScript build passes, and direct default-export check confirms `mdocs_status.execute({})` returns an object with string `output`, metadata, and workflow content.
- [2026-05-31] User restarted opencode and tested in a fresh session. Fix confirmed: the first-activation `mdocs_status` popup no longer appears.
- [2026-05-31] Added stable wiki learning `developer/opencode-custom-tool-result-contract` and marked initiative done.

## Artifacts
- User screenshot showing first observed `mdocs_status` failure.
- `src/plugin.ts` — Added explicit custom tool arg schemas.
- `src/index.ts` — Wraps default-export custom tool returns into opencode `ToolResult` shape.
- `src/__tests__/plugin.test.ts` — Added regression coverage for tool args.
- `package.json`, `package-lock.json` — Added runtime `zod` dependency.
- `dist/` — Rebuilt generated plugin output.
