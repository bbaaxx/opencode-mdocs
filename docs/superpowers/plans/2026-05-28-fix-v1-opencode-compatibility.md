# Fix v1 opencode Compatibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `opencode-mdocs` compatible with current opencode plugin/config shapes so first install registers the agent and custom tools.

**Architecture:** Keep the plugin API surface centralized in `src/plugin.ts`. Update config mutation to current opencode schema (`agent` object) and expose custom tools through the singular `tool` hook object. Tests in `src/__tests__/plugin.test.ts` should encode the current opencode contract and prevent regression to legacy field names.

**Tech Stack:** TypeScript, CommonJS build output, Jest with ts-jest, opencode plugin hooks/config schema.

---

## File Structure

- Modify `src/plugin.ts`: current opencode-compatible config hook and custom tool export.
- Modify `src/__tests__/plugin.test.ts`: failing tests first, then update tool call sites from `plugin.tools` to `plugin.tool`.
- Modify `src/index.ts` only if default export compatibility needs a test-driven type/runtime adjustment.
- Modify `package.json`: bump patch version from `1.0.0` to `1.0.1` after behavior is fixed.
- Modify `CHANGELOG.md`: add `1.0.1` compatibility fix entry.
- Modify `README.md` only if it documents stale `tools`/`agents` behavior.

---

### Task 1: Encode current opencode plugin contract in failing tests

**Files:**
- Modify: `src/__tests__/plugin.test.ts`
- Read: `src/plugin.ts`
- Read: `src/index.ts`

- [ ] **Step 1: Change tool call sites in tests to desired current API**

Replace `plugin.tools.` with `plugin.tool.` in `src/__tests__/plugin.test.ts`. This should make existing plugin tool tests fail before implementation because `tool` does not exist yet.

- [ ] **Step 2: Replace legacy agent config assertions with current schema assertions**

Use this test body for `auto-registers agent and skills on empty config`:

```ts
test('auto-registers agent and skills on empty config', () => {
  const plugin = createPlugin(testDir);
  const cfg: any = {};
  plugin.config(cfg);

  expect(cfg.agent).toBeDefined();
  expect(cfg.agent['mdocs-orchestrator']).toBeDefined();
  expect(cfg.agent['mdocs-orchestrator'].description).toBe('Orchestrates work using the mdocs initiative/wiki workflow.');
  expect(cfg.agent['mdocs-orchestrator'].mode).toBe('primary');
  expect(cfg.agent['mdocs-orchestrator'].permission).toEqual({
    read: 'allow',
    glob: 'allow',
    grep: 'allow',
    list: 'allow',
    edit: 'allow',
    write: 'allow',
    bash: 'allow'
  });
  expect(cfg.agent['mdocs-orchestrator'].prompt).toContain('You are a workflow orchestrator using the mdocs system.');
  expect(cfg.agents).toBeUndefined();

  expect(cfg.skills).toBeDefined();
  expect(cfg.skills.paths).toBeDefined();
  expect(cfg.skills.paths.length).toBeGreaterThan(0);
});
```

- [ ] **Step 3: Replace duplicate-agent test with current schema version**

Use this test body:

```ts
test('does not duplicate agent if already registered', () => {
  const plugin = createPlugin(testDir);
  const cfg: any = {
    agent: {
      'mdocs-orchestrator': {
        description: 'Existing agent',
        mode: 'primary',
        prompt: 'Existing prompt'
      }
    }
  };
  plugin.config(cfg);

  expect(Object.keys(cfg.agent)).toEqual(['mdocs-orchestrator']);
  expect(cfg.agent['mdocs-orchestrator'].prompt).toBe('Existing prompt');
  expect(cfg.agents).toBeUndefined();
});
```

- [ ] **Step 4: Add explicit custom tool hook-shape test**

Add this test in `describe('Plugin Tools', ...)`:

```ts
test('exposes custom tools through current opencode tool hook', () => {
  const plugin = createPlugin(testDir);

  expect(plugin.tool).toBeDefined();
  expect(plugin.tool.mdocs_init).toBeDefined();
  expect(plugin.tool.mdocs_status).toBeDefined();
  expect(plugin.tool.mdocs_search).toBeDefined();
  expect(plugin.tool.mdocs_dispatch).toBeDefined();
  expect(plugin.tool.mdocs_audit).toBeDefined();
  expect((plugin as any).tools).toBeUndefined();
});
```

- [ ] **Step 5: Add default export smoke test**

Add this import near the top:

```ts
import pluginDefault from '../index';
```

Add this test outside or inside an appropriate describe block:

```ts
test('default export is an opencode-compatible plugin function', async () => {
  expect(typeof pluginDefault).toBe('function');

  const hooks = await pluginDefault({ client: {}, project: {}, directory: testDir });

  expect(hooks).toBeDefined();
  expect(hooks.tool.mdocs_status).toBeDefined();
});
```

- [ ] **Step 6: Run focused tests and verify RED**

Run: `npm test -- src/__tests__/plugin.test.ts`

Expected: FAIL because `plugin.tool` is currently undefined and `cfg.agent` is not created.

---

### Task 2: Implement current opencode config and custom tool shape

**Files:**
- Modify: `src/plugin.ts`
- Test: `src/__tests__/plugin.test.ts`

- [ ] **Step 1: Add an agent markdown parser helper near the top of `src/plugin.ts`**

Add after imports:

```ts
function loadAgentPrompt(agentPath: string): string {
  const raw = fs.readFileSync(agentPath, 'utf8');
  return raw.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
}
```

- [ ] **Step 2: Replace `cfg.agents` registration with current `cfg.agent` object registration**

Inside `config`, replace the existing agent-registration block with:

```ts
const agentPath = path.resolve(__dirname, '../agents/mdocs-orchestrator.md');
if (fs.existsSync(agentPath)) {
  if (!cfg.agent) cfg.agent = {};
  if (!cfg.agent['mdocs-orchestrator']) {
    cfg.agent['mdocs-orchestrator'] = {
      description: 'Orchestrates work using the mdocs initiative/wiki workflow.',
      mode: 'primary',
      permission: {
        read: 'allow',
        glob: 'allow',
        grep: 'allow',
        list: 'allow',
        edit: 'allow',
        write: 'allow',
        bash: 'allow'
      },
      prompt: loadAgentPrompt(agentPath)
    };
  }
}
```

- [ ] **Step 3: Rename custom tool export key**

Change:

```ts
tools: {
```

to:

```ts
tool: {
```

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- src/__tests__/plugin.test.ts`

Expected: PASS.

---

### Task 3: Update package metadata and release notes

**Files:**
- Modify: `package.json`
- Modify: `CHANGELOG.md`
- Search: `README.md`

- [ ] **Step 1: Bump patch version**

Change `package.json` version from `1.0.0` to `1.0.1`.

- [ ] **Step 2: Add changelog entry**

Add a new top entry to `CHANGELOG.md`:

```md
## [1.0.1] - 2026-05-28

### Fixed
- Updated opencode plugin custom tools export from `tools` to `tool` so `mdocs_init`, `mdocs_status`, `mdocs_search`, `mdocs_dispatch`, and `mdocs_audit` appear in current opencode.
- Updated agent auto-registration from legacy `cfg.agents` array to current `cfg.agent['mdocs-orchestrator']` object shape.
- Added compatibility tests for current opencode plugin/config field names and default plugin export shape.
```

- [ ] **Step 3: Search README for stale field names**

Run: `rg "cfg\.agents|agents\]|tools:" README.md src docs mdocs`

Expected: any references to historical implementation are either updated or left only in old initiative history.

---

### Task 4: Full verification and initiative update

**Files:**
- Modify: `mdocs/initiatives/fix-v1-opencode-compatibility--2026-05-28.md`

- [ ] **Step 1: Run full tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run TypeScript build**

Run: `npm run build`

Expected: build completes with no TypeScript errors.

- [ ] **Step 3: Run package dry-run**

Run: `npm pack --dry-run`

Expected: package includes `dist`, `skills`, `agents`, `templates`, `README.md`, `CHANGELOG.md`, `LICENSE`, and `package.json`.

- [ ] **Step 4: Update initiative progress**

Append verification evidence and changed artifacts to `mdocs/initiatives/fix-v1-opencode-compatibility--2026-05-28.md`.

- [ ] **Step 5: Inspect git diff**

Run: `git diff -- src/plugin.ts src/__tests__/plugin.test.ts package.json CHANGELOG.md mdocs/initiatives/fix-v1-opencode-compatibility--2026-05-28.md docs/superpowers/plans/2026-05-28-fix-v1-opencode-compatibility.md`

Expected: diff contains only intended compatibility fix, tests, release metadata, and mdocs artifacts.
