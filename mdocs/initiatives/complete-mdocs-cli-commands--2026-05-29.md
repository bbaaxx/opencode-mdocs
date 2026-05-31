---
id: complete-mdocs-cli-commands
title: Complete mdocs CLI Commands (delete, archive, index.sync)
status: done
priority: high
created: 2026-05-29
updated: 2026-05-31
owner: bbaaxx
tags: [enhancement, cli, commands, initiatives, delete, archive]
related_wiki: []
phase: done
handoff_summary: "Implemented initiative.delete, initiative.archive, index.sync, wiki.delete, wiki.list commands with TDD."
open_questions: []
blockers: []
next_action: "Complete. All commands implemented, tested, and verified."
---

## Objective

Complete the `mdocs` CLI tool with commands that were stubs or missing in the first implementation pass:

1. **`initiative.delete`** — Permanently remove an initiative file and update INDEX.
2. **`initiative.archive`** — Move a `done` initiative to an `mdocs/initiatives/archive/` subdirectory, remove from main INDEX, update archive INDEX.
3. **`index.sync`** — Force-regenerate all INDEX.md files: initiatives INDEX, wiki root INDEX, wiki category indices.

Also add **`wiki.delete`** and **`wiki.list`** commands for completeness.

## Context

- Agent feedback: "No way to delete/archive — No command to properly remove an initiative, just manual file deletion."
- Edge case testing confirmed: no delete command exists.
- `index.sync` was stubbed in the first implementation pass.

## Plan

- [ ] Implement `initiative.delete`
  - Args: `{ id: string }`
  - Find initiative by id (findById), derive filename via formatFileName, delete file, call updateIndex()
  - Return `{ success: true, id }` or `{ error: 'Initiative not found' }`
  - Add test

- [ ] Implement `initiative.archive`
  - Args: `{ id: string }`
  - Find initiative, verify status is `done`, move file to `mdocs/initiatives/archive/`, regenerate archive INDEX
  - Archive INDEX at `mdocs/initiatives/archive/INDEX.md` lists all archived initiatives
  - Return `{ success: true, id, archivedFilename }`
  - Add test

- [ ] Implement `index.sync`
  - Force-regenerate: initiatives INDEX, wiki root INDEX, wiki category indices
  - Call updateIndex() on InitiativeManager and WikiManager
  - Return `{ success: true, regenerated: ['initiatives/INDEX.md', 'wiki/INDEX.md', ...] }`
  - Add test

- [ ] Implement `wiki.delete`
  - Args: `{ category: string, id: string }`
  - Call wiki.delete(category, id), update indices
  - Return `{ success: true }`

- [ ] Implement `wiki.list`
  - Args: `{ category?: string }`
  - Return all wiki entries, optionally filtered by category
  - Return `{ entries: [{ category, id, title, tags }] }`

- [ ] Update SKILL.md for mdocs-workflow to mention CLI commands for delete/archive
- [ ] Run full tests after all commands

## Acceptance Criteria

- `mdocs` tool with `{ command: 'initiative.delete', args: { id: 'some-id' } }` removes the file and updates INDEX.
- `mdocs` tool with `{ command: 'initiative.archive', args: { id: 'some-id' } }` moves done initiative to archive/ and updates archive INDEX.
- `mdocs` tool with `{ command: 'index.sync' }` regenerates all INDEX files.
- `mdocs` tool with `{ command: 'wiki.delete', args: { category: 'x', id: 'y' } }` removes entry and updates indices.
- All existing tests pass; new tests for each command.

## Coder Handoff Implementation Plan

> **For coder agent:** Use TDD. Write the specified failing tests first, verify RED, then implement the smallest code that makes each task pass. Do not mark this initiative done until `npm test`, `npm run build`, `npm pack --dry-run`, and `mdocs_validate` pass.

### Current State Analysis

- `src/plugin.ts` exposes the `mdocs` command tool at `tool.mdocs.execute()`.
- Existing supported commands: `initiative.create`, `initiative.update`, `initiative.done`, `wiki.create`, `validate`, and stubbed `index.sync`.
- `src/initiative.ts` already has `delete(fileName)` and private `updateIndex()`, but no archive operation and no public forced index sync.
- `src/wiki.ts` already has `delete(category, id)` and private `updateIndices()`, but no public list operation and no public forced index sync.
- Existing command tests live in `src/__tests__/plugin.test.ts` around the `mdocs initiative.create`, `initiative.update`, `initiative.done`, `wiki.create`, validation, and unsupported-command tests.
- Existing workflow docs to update: `skills/mdocs-workflow/SKILL.md`.

### File Structure

- Modify `src/plugin.ts`
  - Add `initiative.delete`, `initiative.archive`, `wiki.delete`, `wiki.list` to `supportedMdocsCommands`.
  - Replace the `index.sync not yet implemented` branch with real index regeneration.
  - Add command handlers with explicit argument validation and structured return values.
- Modify `src/initiative.ts`
  - Add a public `syncIndex(): string` wrapper around existing `updateIndex()`.
  - Add `archive(fileName: string): { archivedFilename: string; archiveIndex: string }` or equivalent public method that moves a done initiative into `initiatives/archive/` and regenerates both main and archive indices.
  - Keep `archive/INDEX.md` excluded from normal initiative parsing.
- Modify `src/wiki.ts`
  - Add `list(category?: string): WikiEntry[]`.
  - Add a public `syncIndices(): string[]` wrapper around existing `updateIndices()`.
- Modify `src/__tests__/plugin.test.ts`
  - Add TDD tests for every new command and error path.
  - Update the unsupported-command test so `index.sync` no longer expects a stub error.
- Modify `skills/mdocs-workflow/SKILL.md`
  - Document delete/archive/list/index sync commands as maintenance tools.
- Update this initiative progress log with RED/GREEN evidence after implementation.

### Task 1: Add RED tests for command surface and validation

**Files:**
- Modify: `src/__tests__/plugin.test.ts`

- [ ] **Step 1: Update supported command error test for expanded command list**

In the existing `mdocs returns helpful errors for invalid and unsupported commands` test, remove the assertion that `index.sync` returns `not yet implemented`. Add assertions that an unknown command response lists all new commands:

```ts
const unknown = await (plugin as any).tool.mdocs.execute({ command: 'nope', args: {} });
expect(unknown.error).toContain('Unsupported mdocs command: nope');
expect(unknown.supportedCommands).toEqual(expect.arrayContaining([
  'initiative.create',
  'initiative.update',
  'initiative.done',
  'initiative.delete',
  'initiative.archive',
  'wiki.create',
  'wiki.delete',
  'wiki.list',
  'validate',
  'index.sync'
]));
```

- [ ] **Step 2: Add argument validation tests**

Add to the same test:

```ts
await expect((plugin as any).tool.mdocs.execute({ command: 'initiative.delete', args: {} }))
  .resolves.toEqual({ error: 'initiative.delete requires id' });
await expect((plugin as any).tool.mdocs.execute({ command: 'initiative.archive', args: {} }))
  .resolves.toEqual({ error: 'initiative.archive requires id' });
await expect((plugin as any).tool.mdocs.execute({ command: 'wiki.delete', args: { category: 'developer' } }))
  .resolves.toEqual({ error: 'wiki.delete requires category and id' });
```

- [ ] **Step 3: Run RED test**

Run: `npm test -- src/__tests__/plugin.test.ts -t "helpful errors"`

Expected: FAIL because `supportedMdocsCommands` does not include the new commands and the new command validation branches do not exist.

### Task 2: Implement `initiative.delete`

**Files:**
- Modify: `src/plugin.ts`
- Test: `src/__tests__/plugin.test.ts`

- [ ] **Step 1: Write RED delete behavior test**

Add this test near other `mdocs` command tests:

```ts
test('mdocs initiative.delete removes initiative file and updates index', async () => {
  const plugin = createPlugin(testDir);
  (plugin as any).tool.mdocs_init.execute();
  const manager = new InitiativeManager(path.join(testDir, 'mdocs'));
  manager.create({
    id: 'delete-me',
    title: 'Delete Me',
    status: 'active',
    created: '2026-05-29',
    updated: '2026-05-29',
    owner: 'agent',
    tags: ['cleanup'],
    relatedWiki: [],
    objective: 'Remove obsolete work.',
    plan: [],
    progressLog: [],
    artifacts: []
  });

  const result = await (plugin as any).tool.mdocs.execute({ command: 'initiative.delete', args: { id: 'delete-me' } });

  expect(result).toEqual({ success: true, id: 'delete-me', deletedFilename: 'delete-me--2026-05-29.md' });
  expect(fs.existsSync(path.join(testDir, 'mdocs', 'initiatives', 'delete-me--2026-05-29.md'))).toBe(false);
  const index = fs.readFileSync(path.join(testDir, 'mdocs', 'initiatives', 'INDEX.md'), 'utf8');
  expect(index).not.toContain('Delete Me');
});
```

- [ ] **Step 2: Add missing-id behavior to RED test set**

Also assert missing target:

```ts
await expect((plugin as any).tool.mdocs.execute({ command: 'initiative.delete', args: { id: 'missing' } }))
  .resolves.toEqual({ error: 'Initiative not found: missing' });
```

- [ ] **Step 3: Run RED test**

Run: `npm test -- src/__tests__/plugin.test.ts -t "initiative.delete"`

Expected: FAIL because `initiative.delete` is unsupported.

- [ ] **Step 4: Implement command**

In `src/plugin.ts`:

1. Add `'initiative.delete'` to `supportedMdocsCommands`.
2. Add this branch after `initiative.done`:

```ts
if (command === 'initiative.delete') {
  if (!args.id) return { error: 'initiative.delete requires id' };
  const fileName = findInitiativeFilename(args.id);
  if (!fileName) return { error: `Initiative not found: ${args.id}` };
  initiatives.delete(fileName);
  return { success: true, id: args.id, deletedFilename: fileName };
}
```

- [ ] **Step 5: Run GREEN test**

Run: `npm test -- src/__tests__/plugin.test.ts -t "initiative.delete"`

Expected: PASS.

### Task 3: Implement `wiki.delete` and `wiki.list`

**Files:**
- Modify: `src/wiki.ts`
- Modify: `src/plugin.ts`
- Test: `src/__tests__/plugin.test.ts`

- [ ] **Step 1: Write RED wiki delete test**

```ts
test('mdocs wiki.delete removes entry and updates indices', async () => {
  const plugin = createPlugin(testDir);
  (plugin as any).tool.mdocs_init.execute();

  await (plugin as any).tool.mdocs.execute({
    command: 'wiki.create',
    args: { category: 'developer', id: 'obsolete', title: 'Obsolete', content: 'Remove me.', tags: ['cleanup'] }
  });

  const result = await (plugin as any).tool.mdocs.execute({ command: 'wiki.delete', args: { category: 'developer', id: 'obsolete' } });

  expect(result).toEqual({ success: true, category: 'developer', id: 'obsolete', deletedFilename: 'developer/obsolete.md' });
  expect(fs.existsSync(path.join(testDir, 'mdocs', 'wiki', 'developer', 'obsolete.md'))).toBe(false);
  expect(fs.readFileSync(path.join(testDir, 'mdocs', 'wiki', 'developer', 'INDEX.md'), 'utf8')).not.toContain('Obsolete');
});
```

- [ ] **Step 2: Write RED wiki list test**

```ts
test('mdocs wiki.list returns all entries or filters by category', async () => {
  const plugin = createPlugin(testDir);
  (plugin as any).tool.mdocs_init.execute();
  await (plugin as any).tool.mdocs.execute({ command: 'wiki.create', args: { category: 'developer', id: 'commands', title: 'Commands', content: 'Command docs.', tags: ['cli'] } });
  await (plugin as any).tool.mdocs.execute({ command: 'wiki.create', args: { category: 'architecture', id: 'storage', title: 'Storage', content: 'Storage docs.', tags: ['architecture'] } });

  const all = await (plugin as any).tool.mdocs.execute({ command: 'wiki.list', args: {} });
  const developer = await (plugin as any).tool.mdocs.execute({ command: 'wiki.list', args: { category: 'developer' } });

  expect(all.entries).toEqual(expect.arrayContaining([
    expect.objectContaining({ category: 'developer', id: 'commands', title: 'Commands', tags: ['cli'] }),
    expect.objectContaining({ category: 'architecture', id: 'storage', title: 'Storage', tags: ['architecture'] })
  ]));
  expect(developer.entries).toEqual([
    expect.objectContaining({ category: 'developer', id: 'commands', title: 'Commands', tags: ['cli'] })
  ]);
});
```

- [ ] **Step 3: Run RED tests**

Run: `npm test -- src/__tests__/plugin.test.ts -t "wiki.(delete|list)"`

Expected: FAIL because the commands are unsupported.

- [ ] **Step 4: Add `WikiManager.list()`**

In `src/wiki.ts`, add a public method before `findRelated()`:

```ts
list(category?: string): WikiEntry[] {
  const categories = category
    ? [this.sanitizeName(category)]
    : fs.readdirSync(this.dir).filter(f => fs.statSync(path.join(this.dir, f)).isDirectory());

  const entries: WikiEntry[] = [];
  for (const cat of categories) {
    const catDir = path.join(this.dir, cat);
    if (!fs.existsSync(catDir)) continue;
    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
    for (const fileName of files) {
      try {
        const entry = this.read(cat, fileName.replace(/\.md$/, ''));
        if (entry) entries.push(entry);
      } catch {
        // Skip malformed entries; validate() reports them.
      }
    }
  }
  return entries.sort((a, b) => `${a.category}/${a.id}`.localeCompare(`${b.category}/${b.id}`));
}
```

- [ ] **Step 5: Add command branches**

In `src/plugin.ts`, add `'wiki.delete'` and `'wiki.list'` to `supportedMdocsCommands`. Add branches after `wiki.create`:

```ts
if (command === 'wiki.delete') {
  if (!args.category || !args.id) return { error: 'wiki.delete requires category and id' };
  if (!wiki.read(args.category, args.id)) return { error: `Wiki entry not found: ${args.category}/${args.id}` };
  wiki.delete(args.category, args.id);
  return { success: true, category: args.category, id: args.id, deletedFilename: `${args.category}/${args.id}.md` };
}

if (command === 'wiki.list') {
  const entries = wiki.list(args.category).map(entry => ({
    category: entry.category,
    id: entry.id,
    title: entry.title,
    tags: entry.tags
  }));
  return { entries };
}
```

- [ ] **Step 6: Run GREEN tests**

Run: `npm test -- src/__tests__/plugin.test.ts -t "wiki.(delete|list)"`

Expected: PASS.

### Task 4: Implement forced `index.sync`

**Files:**
- Modify: `src/initiative.ts`
- Modify: `src/wiki.ts`
- Modify: `src/plugin.ts`
- Test: `src/__tests__/plugin.test.ts`

- [ ] **Step 1: Write RED index sync test**

```ts
test('mdocs index.sync regenerates initiative and wiki indices', async () => {
  const plugin = createPlugin(testDir);
  (plugin as any).tool.mdocs_init.execute();
  const manager = new InitiativeManager(path.join(testDir, 'mdocs'));
  manager.create({
    id: 'sync-me',
    title: 'Sync Me',
    status: 'active',
    created: '2026-05-29',
    updated: '2026-05-29',
    owner: 'agent',
    tags: ['index'],
    relatedWiki: [],
    objective: 'Regenerate indices.',
    plan: [],
    progressLog: [],
    artifacts: []
  });
  await (plugin as any).tool.mdocs.execute({ command: 'wiki.create', args: { category: 'developer', id: 'index-doc', title: 'Index Doc', content: 'Index docs.' } });

  fs.writeFileSync(path.join(testDir, 'mdocs', 'initiatives', 'INDEX.md'), '# Initiatives\n\nStale', 'utf8');
  fs.writeFileSync(path.join(testDir, 'mdocs', 'wiki', 'INDEX.md'), '# Wiki\n\nStale', 'utf8');
  fs.writeFileSync(path.join(testDir, 'mdocs', 'wiki', 'developer', 'INDEX.md'), '# developer\n\nStale', 'utf8');

  const result = await (plugin as any).tool.mdocs.execute({ command: 'index.sync', args: {} });

  expect(result).toEqual({
    success: true,
    regenerated: expect.arrayContaining(['initiatives/INDEX.md', 'wiki/INDEX.md', 'wiki/developer/INDEX.md'])
  });
  expect(fs.readFileSync(path.join(testDir, 'mdocs', 'initiatives', 'INDEX.md'), 'utf8')).toContain('Sync Me');
  expect(fs.readFileSync(path.join(testDir, 'mdocs', 'wiki', 'INDEX.md'), 'utf8')).toContain('[developer](developer/INDEX.md)');
  expect(fs.readFileSync(path.join(testDir, 'mdocs', 'wiki', 'developer', 'INDEX.md'), 'utf8')).toContain('Index Doc');
});
```

- [ ] **Step 2: Run RED test**

Run: `npm test -- src/__tests__/plugin.test.ts -t "index.sync regenerates"`

Expected: FAIL because `index.sync` returns the stub error.

- [ ] **Step 3: Add public sync methods**

In `src/initiative.ts`, after `delete()` add:

```ts
syncIndex(): string {
  this.updateIndex();
  return path.join(this.dir, 'INDEX.md');
}
```

In `src/wiki.ts`, after `delete()` add:

```ts
syncIndices(): string[] {
  this.updateIndices();
  const paths = [path.join(this.dir, 'INDEX.md')];
  const categories = fs.readdirSync(this.dir).filter(f => fs.statSync(path.join(this.dir, f)).isDirectory());
  for (const category of categories) {
    paths.push(path.join(this.dir, category, 'INDEX.md'));
  }
  return paths;
}
```

- [ ] **Step 4: Implement command branch**

In `src/plugin.ts`, replace the `index.sync` stub with:

```ts
if (command === 'index.sync') {
  const regenerated = [
    path.relative(mdocsRoot, initiatives.syncIndex()),
    ...wiki.syncIndices().map(filePath => path.relative(mdocsRoot, filePath))
  ];
  return { success: true, regenerated };
}
```

- [ ] **Step 5: Run GREEN test**

Run: `npm test -- src/__tests__/plugin.test.ts -t "index.sync regenerates"`

Expected: PASS.

### Task 5: Implement `initiative.archive`

**Files:**
- Modify: `src/initiative.ts`
- Modify: `src/plugin.ts`
- Test: `src/__tests__/plugin.test.ts`

- [ ] **Step 1: Write RED archive success test**

```ts
test('mdocs initiative.archive moves done initiative to archive and updates indices', async () => {
  const plugin = createPlugin(testDir);
  (plugin as any).tool.mdocs_init.execute();
  const manager = new InitiativeManager(path.join(testDir, 'mdocs'));
  manager.create({
    id: 'archive-me',
    title: 'Archive Me',
    status: 'done',
    created: '2026-05-29',
    updated: '2026-05-29',
    owner: 'agent',
    tags: ['archive'],
    relatedWiki: [],
    objective: 'Archive completed work.',
    plan: [],
    progressLog: ['Completed'],
    artifacts: []
  });

  const result = await (plugin as any).tool.mdocs.execute({ command: 'initiative.archive', args: { id: 'archive-me' } });

  expect(result).toEqual({ success: true, id: 'archive-me', archivedFilename: 'archive-me--2026-05-29.md' });
  expect(fs.existsSync(path.join(testDir, 'mdocs', 'initiatives', 'archive-me--2026-05-29.md'))).toBe(false);
  expect(fs.existsSync(path.join(testDir, 'mdocs', 'initiatives', 'archive', 'archive-me--2026-05-29.md'))).toBe(true);
  expect(fs.readFileSync(path.join(testDir, 'mdocs', 'initiatives', 'INDEX.md'), 'utf8')).not.toContain('Archive Me');
  expect(fs.readFileSync(path.join(testDir, 'mdocs', 'initiatives', 'archive', 'INDEX.md'), 'utf8')).toContain('Archive Me');
});
```

- [ ] **Step 2: Write RED archive rejection tests**

```ts
test('mdocs initiative.archive rejects missing and active initiatives', async () => {
  const plugin = createPlugin(testDir);
  (plugin as any).tool.mdocs_init.execute();
  const manager = new InitiativeManager(path.join(testDir, 'mdocs'));
  manager.create({
    id: 'not-done',
    title: 'Not Done',
    status: 'active',
    created: '2026-05-29',
    updated: '2026-05-29',
    owner: 'agent',
    tags: [],
    relatedWiki: [],
    objective: 'Still active.',
    plan: [],
    progressLog: [],
    artifacts: []
  });

  await expect((plugin as any).tool.mdocs.execute({ command: 'initiative.archive', args: { id: 'missing' } }))
    .resolves.toEqual({ error: 'Initiative not found: missing' });
  await expect((plugin as any).tool.mdocs.execute({ command: 'initiative.archive', args: { id: 'not-done' } }))
    .resolves.toEqual({ error: 'Only done initiatives can be archived: not-done' });
});
```

- [ ] **Step 3: Run RED tests**

Run: `npm test -- src/__tests__/plugin.test.ts -t "initiative.archive"`

Expected: FAIL because `initiative.archive` is unsupported.

- [ ] **Step 4: Implement archive support in `InitiativeManager`**

In `src/initiative.ts`:

1. Change `initiativeFiles()` so it only returns top-level initiative files and never reads `archive/INDEX.md`. Current implementation already reads only `this.dir`, so keep that behavior.
2. Add private archive index writer near `updateIndex()`:

```ts
private updateArchiveIndex(): void {
  const archiveDir = path.join(this.dir, 'archive');
  fs.mkdirSync(archiveDir, { recursive: true });
  const files = fs.readdirSync(archiveDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
  const entries: { initiative: Initiative; fileName: string }[] = [];
  for (const f of files) {
    try {
      const content = fs.readFileSync(path.join(archiveDir, f), 'utf8');
      const init = this.parseInitiative(content, f);
      entries.push({ initiative: init, fileName: f });
    } catch {
      // Skip malformed archived files; validation can report separately later.
    }
  }
  const lines = entries.map(({ initiative: i, fileName }) => `- **${i.title}** (${i.status}) — ${fileName} — ${i.created} — [${i.tags.join(', ')}]`);
  fs.writeFileSync(path.join(archiveDir, 'INDEX.md'), `# Archived Initiatives\n\n${lines.join('\n') || 'No archived initiatives yet.'}`, 'utf8');
}
```

3. Add public archive method after `delete()`:

```ts
archive(fileName: string): { archivedFilename: string; archiveIndex: string } {
  const sanitized = this.sanitizeFileName(fileName);
  const sourcePath = path.join(this.dir, sanitized);
  if (!fs.existsSync(sourcePath)) throw new Error(`Initiative file not found: ${sanitized}`);
  const initiative = this.read(sanitized);
  if (!initiative) throw new Error(`Initiative file not found: ${sanitized}`);
  if (initiative.status !== 'done') throw new Error(`Only done initiatives can be archived: ${initiative.id}`);

  const archiveDir = path.join(this.dir, 'archive');
  fs.mkdirSync(archiveDir, { recursive: true });
  const targetPath = path.join(archiveDir, sanitized);
  if (fs.existsSync(targetPath)) throw new Error(`Archived initiative already exists: ${sanitized}`);

  fs.renameSync(sourcePath, targetPath);
  this.updateIndex();
  this.updateArchiveIndex();
  return { archivedFilename: sanitized, archiveIndex: path.join(archiveDir, 'INDEX.md') };
}
```

- [ ] **Step 5: Add plugin branch**

In `src/plugin.ts`, add `'initiative.archive'` to `supportedMdocsCommands`. Add branch after `initiative.delete`:

```ts
if (command === 'initiative.archive') {
  if (!args.id) return { error: 'initiative.archive requires id' };
  const fileName = findInitiativeFilename(args.id);
  if (!fileName) return { error: `Initiative not found: ${args.id}` };
  const initiative = initiatives.read(fileName);
  if (!initiative) return { error: `Initiative not found: ${args.id}` };
  if (initiative.status !== 'done') return { error: `Only done initiatives can be archived: ${args.id}` };
  const result = initiatives.archive(fileName);
  return { success: true, id: args.id, archivedFilename: result.archivedFilename };
}
```

- [ ] **Step 6: Run GREEN tests**

Run: `npm test -- src/__tests__/plugin.test.ts -t "initiative.archive"`

Expected: PASS.

### Task 6: Documentation, full verification, and initiative report

**Files:**
- Modify: `skills/mdocs-workflow/SKILL.md`
- Modify: `mdocs/initiatives/complete-mdocs-cli-commands--2026-05-29.md`
- Test: all existing tests

- [ ] **Step 1: Update workflow skill docs**

Add a short maintenance-tools note to `skills/mdocs-workflow/SKILL.md`:

```md
## Maintenance Commands

Use the `mdocs` command tool for safe filesystem-changing maintenance:
- `initiative.delete` removes an initiative and regenerates `initiatives/INDEX.md`.
- `initiative.archive` moves a done initiative to `initiatives/archive/` and regenerates active/archive indices.
- `wiki.delete` removes a wiki entry and regenerates wiki indices.
- `wiki.list` lists wiki entries, optionally filtered by category.
- `index.sync` force-regenerates initiative and wiki indices after direct file edits.
```

- [ ] **Step 2: Run focused tests**

Run: `npm test -- src/__tests__/plugin.test.ts`

Expected: PASS.

- [ ] **Step 3: Run full verification**

Run:

```bash
npm test
npm run build
npm pack --dry-run
node -e "const {createPlugin}=require('./dist/plugin'); const p=createPlugin(process.cwd()); Promise.resolve(p.tool.mdocs_validate.execute()).then(r=>{console.log(JSON.stringify({valid:r.valid, initiativeErrors:r.initiatives.errors.length, wikiErrors:r.wiki.errors.length, graphErrors:r.graph.errors.length},null,2)); if(!r.valid) process.exit(1);}).catch(e=>{console.error(e); process.exit(2);})"
```

Expected: all commands exit 0; `mdocs_validate` reports `valid: true`.

- [ ] **Step 4: Update initiative progress log**

Append a progress entry with exact RED/GREEN evidence, changed files, and verification outputs. Do not mark `status: done` until an independent review approves the diff.

- [ ] **Step 5: Request independent review**

Ask a reviewer agent to inspect the diff against this initiative. Required review prompt:

```text
Review the implementation for complete-mdocs-cli-commands. Verify initiative.delete, initiative.archive, index.sync, wiki.delete, and wiki.list behavior, tests, docs, and validation. Return PASS/FAIL for marking the initiative done, blocking issues, minor observations, and evidence inspected.
```

- [ ] **Step 6: Complete if review passes**

If review passes, set frontmatter `status: done`, `phase: done`, clear blockers, update `next_action`, and ensure a stable wiki learning exists or link this initiative to an existing stable wiki entry that captures the durable CLI maintenance semantics.

## Progress Log
- [2026-05-29] Created initiative from edge case testing: missing delete, archive, index.sync, wiki.delete, wiki.list commands.
- [2026-05-29] Will implement after INITIATIVE 2 (add-mdocs-cli-commands) is complete, building on its mdocs tool structure.
- [2026-05-29] Added detailed coder handoff plan after analyzing `src/plugin.ts`, `src/initiative.ts`, `src/wiki.ts`, existing plugin command tests, and prior CLI-command initiative. Plan sequences implementation through TDD tasks for `initiative.delete`, `wiki.delete`, `wiki.list`, `index.sync`, `initiative.archive`, docs, full verification, and independent review.
- [2026-05-31] TDD Implementation completed by coder subagent:
  - RED: All 7 new tests written first; verified failure for unsupported commands.
  - GREEN: Implemented `initiative.delete`, `initiative.archive`, `wiki.delete`, `wiki.list`, `index.sync` commands.
  - Files modified: `src/plugin.ts` (+48), `src/initiative.ts` (+41), `src/wiki.ts` (+31), `src/__tests__/plugin.test.ts` (+171).
  - Verification: `npm test` → 143 tests pass (11 suites); `npm run build` → clean; `npm pack --dry-run` → success; `mdocs_validate` → valid=true, 0 errors.
  - Independent review: PASS (no blocking issues). Defense-in-depth noted for archive status check in both plugin and initiative layers.
  - Updated `skills/mdocs-workflow/SKILL.md` with maintenance commands documentation.
- [2026-05-31] Added full tool catalog to `agents/mdocs-orchestrator.md` — closes agent discovery gap so fresh sessions know all commands without trial-and-error.

## Artifacts
- `mdocs/initiatives/complete-mdocs-cli-commands--2026-05-29.md` — this initiative
