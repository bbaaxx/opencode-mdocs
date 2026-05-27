# opencode-mdocs Readiness for v1

> Tracking issues, gaps, and improvement opportunities identified during analysis of the opencode-mdocs plugin codebase.

---

## 1. Frontmatter Type Mismatch (Bug)

**Severity:** High — breaks round-trip reads

**Problem:**
- `types.ts` uses **camelCase** (`relatedWiki`, `progressLog`)
- YAML frontmatter is written with camelCase keys
- Parser expects **snake_case** (`related_wiki`, `progress_log`)
- Result: reading an initiative back after writing it fails to map fields correctly

**Fix:**
- Align frontmatter serialization to use snake_case keys
- Ensure parser maps snake_case YAML → camelCase TS consistently
- Add a round-trip test: write initiative → read it back → assert all fields match

**Files:** `src/initiative.ts`, `src/types.ts`, `src/__tests__/initiative.test.ts`

---

## 2. Plan/Spec vs. Implementation Drift

**Severity:** Medium — confusing for contributors

**Problem:**
- Design spec (`docs/superpowers/specs/`) and plan use snake_case everywhere
- Actual TypeScript code uses camelCase
- Frontmatter uses snake_case
- Three naming conventions in one codebase

**Fix:**
- Document the convention: **camelCase in TS, snake_case in YAML frontmatter**
- Update spec/plan docs to match implementation, or vice versa
- Add a `CONTRIBUTING.md` section explaining naming rules

**Files:** `docs/superpowers/specs/2025-05-24-opencode-mdocs-plugin-design.md`, `docs/superpowers/plans/2025-05-24-opencode-mdocs-plugin-plan.md`

---

## 3. Plugin Does Not Auto-Register Agent and Skills

**Severity:** Medium — poor UX for adopters

**Problem:**
- The `config` hook initializes `/mdocs` but does **not** inject the bundled `mdocs-orchestrator` agent or skills paths into the live config
- Users must manually add agent and skills paths to their `opencode.json`
- The README shows an outdated/incorrect agent registration pattern

**Fix:**
- In the `config` hook, mutate `cfg.agent` to register `mdocs-orchestrator` from the package path
- In the `config` hook, append the package's `skills/` directory to `cfg.skills.paths`
- Verify the registration works when the plugin loads from `node_modules/`
- Update README with correct, minimal `opencode.json` example

**Files:** `src/plugin.ts`, `README.md`

---

## 4. Missing Plugin Integration Test

**Severity:** Medium — no end-to-end validation

**Problem:**
- The implementation plan calls for `src/__tests__/plugin.test.ts`
- No such test exists
- Hook behavior (tool gates, event logging, permission integration) is not tested end-to-end

**Fix:**
- Create `src/__tests__/plugin.test.ts`
- Test: `config` hook initializes `/mdocs` and creates bootstrap initiative
- Test: `tool.execute.before` blocks write tools before PLAN
- Test: `tool.execute.before` allows write tools at PLAN
- Test: `tool.execute.after` appends to progress log
- Test: `permission.ask` auto-allows aligned tools
- Test: custom tools `mdocs_init` and `mdocs_status` return correct shapes

**Files:** `src/__tests__/plugin.test.ts`

---

## 5. Wiki Manager Lacks Read / Update / Find

**Severity:** Medium — asymmetric API

**Problem:**
- `InitiativeManager` has full CRUD: `create`, `read`, `update`, `delete`, `findRelated`
- `WikiManager` only has `create` + `updateIndices`
- No way to read a wiki entry back, update it, or find related entries

**Fix:**
- Add `WikiManager.read(category, id)` → returns `WikiEntry | null`
- Add `WikiManager.update(category, id, entry)` → rewrites file, updates indices
- Add `WikiManager.delete(category, id)` → removes file, updates indices
- Add `WikiManager.findRelated(queryTags)` → scans all categories for tag matches
- Add corresponding tests in `src/__tests__/wiki.test.ts`

**Files:** `src/wiki.ts`, `src/__tests__/wiki.test.ts`

---

## 6. SubagentAssembler Is Not Wired Into Task Dispatch

**Severity:** Medium — utility without a caller

**Problem:**
- `SubagentAssembler.assemble()` builds a nice context string
- Nothing in the plugin actually calls it
- The agent/skill documentation says "use Task tool to dispatch subagents" but there's no hook or custom tool that does this

**Fix:**
- Add a custom tool `mdocs_dispatch` that:
  1. Reads the active initiative
  2. Fetches related wiki entries
  3. Calls `assembler.assemble()`
  4. Returns the assembled context (or optionally triggers an actual subagent if opencode API allows)
- OR: expose `assembler` from the plugin export so external code can use it
- Document how the agent is expected to use it

**Files:** `src/plugin.ts`, `src/subagent.ts`, `agents/mdocs-orchestrator.md`

---

## 7. Initiative Discovery Is Too Simple

**Severity:** Low-Medium — spec describes smarter matching

**Problem:**
- `InitiativeManager.findRelated()` only does exact tag matching
- The design spec describes fuzzy title matching (Levenshtein) + tag overlap (Jaccard similarity)
- No scoring or threshold logic exists

**Fix:**
- Implement `findRelated(queryTags, queryTitle?)` with:
  - Tag overlap using Jaccard similarity
  - Optional title slug fuzzy matching using Levenshtein distance
  - Return scored results sorted by relevance
  - Threshold at 0.6 as spec'd
- Add tests for fuzzy matching edge cases

**Files:** `src/initiative.ts`, `src/__tests__/initiative.test.ts`

---

## 8. README Agent Registration Example Is Incorrect

**Severity:** Low — documentation bug

**Problem:**
- README shows:
  ```json
  "agent": {
    "mdocs-orchestrator": "node_modules/opencode-mdocs/agents/mdocs-orchestrator.md"
  }
  ```
- opencode's agent config expects either inline JSON or a file path under `.opencode/agent/`
- Referencing `node_modules/...` directly may not resolve correctly

**Fix:**
- Correct the README example
- If auto-registration (issue #3) is implemented, simplify README to just `"plugin": ["opencode-mdocs"]`
- Otherwise, document the correct manual setup: copy or symlink agent file to `.opencode/agents/`

**Files:** `README.md`

---

## 9. No CLI Command Hook

**Severity:** Low — nice-to-have

**Problem:**
- Users might want to run `opencode mdocs status` or `opencode mdocs init` from the shell
- The plugin only provides custom tools, not CLI commands

**Fix:**
- Add a `command` hook registering:
  - `mdocs status` → prints workflow step + active initiatives
  - `mdocs init` → forces re-initialization of `/mdocs`
  - `mdocs list` → lists all initiatives
- Map to `command.execute.before` if needed for preprocessing

**Files:** `src/plugin.ts`

---

## 10. Workflow State Only Tracks One Active Initiative

**Severity:** Low — limits concurrency

**Problem:**
- `WorkflowState.activeInitiative` is a single string
- You cannot have two active initiatives at once
- Switching initiatives requires resetting workflow state

**Fix:**
- Consider making `activeInitiative` an array, or
- Add a `setActiveInitiative(id)` method that updates state without resetting step
- Document the intended workflow: one active initiative at a time by design, or support multiple

**Files:** `src/workflow.ts`, `src/types.ts`

---

## 11. Missing Compaction / Archiving Logic

**Severity:** Low — future enhancement

**Problem:**
- Long-running initiatives accumulate huge progress logs
- No automatic summarization or archiving
- `.workflow-state.json` grows unbounded in step history

**Fix:**
- Add `compact()` to `InitiativeManager` that summarizes progress log entries older than N days
- Add `archive()` that moves `done` initiatives to `/mdocs/initiatives/archive/`
- Truncate step history in `.workflow-state.json` after COMPLETE

**Files:** `src/initiative.ts`, `src/workflow.ts`

---

## 12. Test-Run Script Hardcodes Paths

**Severity:** Low — brittle for different environments

**Problem:**
- `test-run.js` uses `/tmp/opencode-mdocs-test-run`
- Not cross-platform (Windows doesn't have `/tmp`)
- Hardcodes `dist/` path resolution

**Fix:**
- Use `os.tmpdir()` instead of `/tmp`
- Use `path.join()` consistently
- Accept optional `--project-dir` CLI argument

**Files:** `test-run.js`

---

## Summary Priority Queue

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 1 | Frontmatter type mismatch | High | Small |
| 3 | Auto-register agent/skills | Medium | Small |
| 4 | Missing plugin integration test | Medium | Medium |
| 5 | Wiki lacks read/update/find | Medium | Medium |
| 2 | Naming convention drift | Medium | Small |
| 6 | SubagentAssembler unwired | Medium | Medium |
| 7 | Fuzzy discovery | Low-Med | Medium |
| 8 | README agent example wrong | Low | Small |
| 9 | CLI command hook | Low | Small |
| 10 | Single active initiative | Low | Small |
| 11 | Compaction/archiving | Low | Large |
| 12 | test-run portability | Low | Small |

---

*Document created: 2026-05-27*
*Based on analysis of opencode-mdocs repository at `/Users/bbaaxx/AgentsPlayground/opencode-mdocs/`*
