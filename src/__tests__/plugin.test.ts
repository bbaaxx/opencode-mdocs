import * as path from 'path';
import * as fs from 'fs';
import pluginDefault from '../index';
import { createPlugin } from '../plugin';
import { InitiativeManager } from '../initiative';

const testDir = path.join(__dirname, 'test-plugin');

describe('Plugin Tools', () => {
  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  test('mdocs_dispatch returns assembled context for existing initiative', async () => {
    const plugin = createPlugin(testDir);
    // Initialize mdocs structure
    (plugin as any).tool.mdocs_init.execute();

    // Create an initiative
    const fs = require('fs');
    const initiativeDir = path.join(testDir, 'mdocs', 'initiatives');
    fs.mkdirSync(initiativeDir, { recursive: true });
    fs.writeFileSync(
      path.join(initiativeDir, 'test-initiative--2025-05-24.md'),
      `---
id: "test-initiative"
title: "Test Initiative"
status: "active"
created: "2025-05-24"
updated: "2025-05-24"
owner: "test"
tags: ["test"]
related_wiki: ["testing/test-entry"]
---

## Objective
Test the dispatch tool

## Plan
- [ ] Step 1
- [x] Step 2

## Progress Log
- Created

## Artifacts
`
    );

    // Create a wiki entry
    const wikiDir = path.join(testDir, 'mdocs', 'wiki', 'testing');
    fs.mkdirSync(wikiDir, { recursive: true });
    fs.writeFileSync(
      path.join(wikiDir, 'test-entry.md'),
      `---
id: "test-entry"
title: "Test Entry"
category: "testing"
created: "2025-05-24"
updated: "2025-05-24"
related_initiatives: ["test-initiative"]
tags: ["test"]
---

Wiki content for testing`
    );

    const result = await (plugin as any).tool.mdocs_dispatch.execute({ initiativeId: 'test-initiative' });

    expect(result.error).toBeUndefined();
    expect(result.initiativeId).toBe('test-initiative');
    expect(result.step).toBe('IDLE');
    expect(result.relatedWikiCount).toBe(1);
    expect(result.context).toContain('Test Initiative');
    expect(result.context).toContain('Test the dispatch tool');
    expect(result.context).toContain('Wiki content for testing');
    expect(result.context).toContain('Step 1');
    expect(result.context).toContain('Step 2');
  });

  test('mdocs_dispatch returns error for missing initiative', async () => {
    const plugin = createPlugin(testDir);
    (plugin as any).tool.mdocs_init.execute();

    const result = await (plugin as any).tool.mdocs_dispatch.execute({ initiativeId: 'non-existent' });

    expect(result.error).toBe('Initiative not found');
  });

  test('mdocs_dispatch includes related wiki entries in context', async () => {
    const plugin = createPlugin(testDir);
    (plugin as any).tool.mdocs_init.execute();

    const initiativeDir = path.join(testDir, 'mdocs', 'initiatives');
    fs.mkdirSync(initiativeDir, { recursive: true });
    fs.writeFileSync(
      path.join(initiativeDir, 'multi-wiki--2025-05-24.md'),
      `---
id: "multi-wiki"
title: "Multi Wiki"
status: "active"
created: "2025-05-24"
updated: "2025-05-24"
owner: "test"
tags: ["test"]
related_wiki: ["testing/entry-a", "testing/entry-b"]
---

## Objective
Multiple wiki entries

## Plan
- [ ] Step 1

## Progress Log

## Artifacts
`
    );

    const wikiDir = path.join(testDir, 'mdocs', 'wiki', 'testing');
    fs.mkdirSync(wikiDir, { recursive: true });
    fs.writeFileSync(
      path.join(wikiDir, 'entry-a.md'),
      `---
id: "entry-a"
title: "Entry A"
category: "testing"
created: "2025-05-24"
updated: "2025-05-24"
related_initiatives: ["multi-wiki"]
tags: []
---

Content A`
    );
    fs.writeFileSync(
      path.join(wikiDir, 'entry-b.md'),
      `---
id: "entry-b"
title: "Entry B"
category: "testing"
created: "2025-05-24"
updated: "2025-05-24"
related_initiatives: ["multi-wiki"]
tags: []
---

Content B`
    );

    const result = await (plugin as any).tool.mdocs_dispatch.execute({ initiativeId: 'multi-wiki' });

    expect(result.error).toBeUndefined();
    expect(result.relatedWikiCount).toBe(2);
    expect(result.context).toContain('Content A');
    expect(result.context).toContain('Content B');
  });

  test('mdocs_dispatch uses active initiative when no initiativeId provided', async () => {
    // Initialize mdocs structure first
    const pluginInit = createPlugin(testDir);
    (pluginInit as any).tool.mdocs_init.execute();

    const initiativeDir = path.join(testDir, 'mdocs', 'initiatives');
    fs.mkdirSync(initiativeDir, { recursive: true });
    fs.writeFileSync(
      path.join(initiativeDir, 'active-init--2025-05-24.md'),
      `---
id: "active-init"
title: "Active Initiative"
status: "active"
created: "2025-05-24"
updated: "2025-05-24"
owner: "test"
tags: ["test"]
related_wiki: []
---

## Objective
The active one

## Plan
- [ ] Step 1

## Progress Log

## Artifacts
`
    );

    // Set active initiative by writing workflow state directly BEFORE creating the plugin
    const workflowStatePath = path.join(testDir, 'mdocs', '.workflow-state.json');
    fs.writeFileSync(workflowStatePath, JSON.stringify({
      currentStep: 'PLAN',
      activeInitiative: 'active-init',
      stepHistory: [{ step: 'PLAN', timestamp: new Date().toISOString() }]
    }, null, 2), 'utf8');

    // Create a new plugin instance that will read the updated state
    const plugin = createPlugin(testDir);

    const result = await (plugin as any).tool.mdocs_dispatch.execute({});

    expect(result.error).toBeUndefined();
    expect(result.initiativeId).toBe('active-init');
    expect(result.context).toContain('The active one');
  });

  test('mdocs_dispatch returns error when no initiativeId and no active initiative', async () => {
    const plugin = createPlugin(testDir);
    (plugin as any).tool.mdocs_init.execute();

    const result = await (plugin as any).tool.mdocs_dispatch.execute({});

    expect(result.error).toBe('No initiativeId provided and no active initiative');
  });

  test('config-created initiative uses the id stem for its filename and index entry', () => {
    const plugin = createPlugin(testDir);
    const today = new Date().toISOString().split('T')[0];

    plugin.config({});

    const expectedFileName = `install-mdocs--${today}.md`;
    const initiativePath = path.join(testDir, 'mdocs', 'initiatives', expectedFileName);
    const indexPath = path.join(testDir, 'mdocs', 'initiatives', 'INDEX.md');
    expect(fs.existsSync(initiativePath)).toBe(true);
    expect(fs.readFileSync(indexPath, 'utf8')).toContain(expectedFileName);
  });

  test('mdocs_lookup resolves initiative id and title to the actual filename', async () => {
    const plugin = createPlugin(testDir);
    const today = new Date().toISOString().split('T')[0];
    plugin.config({});

    const byId = await (plugin as any).tool.mdocs_lookup.execute({ query: 'install-mdocs', field: 'id' });
    const byTitle = await (plugin as any).tool.mdocs_lookup.execute({ query: 'Install and Configure opencode-mdocs', field: 'title' });

    expect(byId.error).toBeUndefined();
    expect(byTitle.error).toBeUndefined();
    expect(byId.filename).toBe(`install-mdocs--${today}.md`);
    expect(byTitle.filename).toBe(`install-mdocs--${today}.md`);
  });

  test('mdocs_lookup supports slug, partial title, and metadata results', async () => {
    const plugin = createPlugin(testDir);
    (plugin as any).tool.mdocs_init.execute();
    const initiativeDir = path.join(testDir, 'mdocs', 'initiatives');
    fs.writeFileSync(
      path.join(initiativeDir, 'install-and-configure-opencode-mdocs--2026-05-27.md'),
      `---
id: "install-mdocs"
title: "Install and Configure opencode-mdocs"
status: "done"
created: "2026-05-27"
updated: "2026-05-27"
owner: "system"
tags: ["setup", "plugin"]
related_wiki: []
---

## Objective
Legacy filename

## Plan

## Progress Log

## Artifacts
`,
      'utf8'
    );

    const bySlug = await (plugin as any).tool.mdocs_lookup.execute({ query: 'install-and-configure-opencode-mdocs', field: 'slug' });
    const byPartialTitle = await (plugin as any).tool.mdocs_lookup.execute({ query: 'Configure opencode', field: 'title' });

    expect(bySlug).toEqual({
      type: 'initiative',
      filename: 'install-and-configure-opencode-mdocs--2026-05-27.md',
      id: 'install-mdocs',
      title: 'Install and Configure opencode-mdocs',
      status: 'done',
      tags: ['setup', 'plugin']
    });
    expect(byPartialTitle.filename).toBe('install-and-configure-opencode-mdocs--2026-05-27.md');
  });

  test('mdocs_lookup default lookup resolves omitted-field slug queries', async () => {
    const plugin = createPlugin(testDir);
    (plugin as any).tool.mdocs_init.execute();
    const initiativeDir = path.join(testDir, 'mdocs', 'initiatives');
    fs.writeFileSync(
      path.join(initiativeDir, 'install-and-configure-opencode-mdocs--2026-05-27.md'),
      `---
id: "install-mdocs"
title: "Install and Configure opencode-mdocs"
status: "done"
created: "2026-05-27"
updated: "2026-05-27"
owner: "system"
tags: ["setup", "plugin"]
related_wiki: []
---

## Objective
Legacy filename

## Plan

## Progress Log

## Artifacts
`,
      'utf8'
    );

    const result = await (plugin as any).tool.mdocs_lookup.execute({ query: 'install-and-configure-opencode-mdocs' });

    expect(result.filename).toBe('install-and-configure-opencode-mdocs--2026-05-27.md');
  });

  test('mdocs_lookup returns query with no-match error', async () => {
    const plugin = createPlugin(testDir);
    (plugin as any).tool.mdocs_init.execute();

    const result = await (plugin as any).tool.mdocs_lookup.execute({ query: 'missing-initiative' });

    expect(result).toEqual({ error: 'No initiatives found for query', query: 'missing-initiative' });
  });

  test('initiative index displays actual filename from disk for mismatched legacy files', () => {
    const plugin = createPlugin(testDir);
    (plugin as any).tool.mdocs_init.execute();
    const initiativeDir = path.join(testDir, 'mdocs', 'initiatives');
    fs.writeFileSync(
      path.join(initiativeDir, 'install-and-configure-opencode-mdocs--2026-05-27.md'),
      `---
id: "install-mdocs"
title: "Install and Configure opencode-mdocs"
status: "done"
created: "2026-05-27"
updated: "2026-05-27"
owner: "system"
tags: ["setup", "plugin"]
related_wiki: []
---

## Objective
Legacy filename

## Plan

## Progress Log

## Artifacts
`,
      'utf8'
    );

    const manager = new InitiativeManager(path.join(testDir, 'mdocs'));
    manager.create({
      id: 'new-id',
      title: 'New Initiative',
      status: 'active',
      created: '2026-05-29',
      updated: '2026-05-29',
      owner: 'test',
      tags: [],
      relatedWiki: [],
      objective: 'Trigger index update',
      plan: [],
      progressLog: [],
      artifacts: []
    });

    const index = fs.readFileSync(path.join(initiativeDir, 'INDEX.md'), 'utf8');
    expect(index).toContain('install-and-configure-opencode-mdocs--2026-05-27.md');
    expect(index).not.toContain('install-mdocs--2026-05-27.md');
  });

  test('mdocs initiative.create creates an active initiative with pending plan items', async () => {
    const plugin = createPlugin(testDir);
    (plugin as any).tool.mdocs_init.execute();
    const today = new Date().toISOString().split('T')[0];

    const result = await (plugin as any).tool.mdocs.execute({
      command: 'initiative.create',
      args: {
        title: 'Command Created Initiative',
        id: 'cmd-created',
        owner: 'agent',
        tags: ['cli'],
        relatedWiki: ['developer/commands'],
        objective: 'Create initiatives from a command',
        plan: ['Write tests', { description: 'Implement command', status: 'done' }]
      }
    });

    expect(result).toEqual({ success: true, filename: `cmd-created--${today}.md`, id: 'cmd-created' });

    const manager = new InitiativeManager(path.join(testDir, 'mdocs'));
    const initiative = manager.read(result.filename);
    expect(initiative).toMatchObject({
      id: 'cmd-created',
      title: 'Command Created Initiative',
      status: 'active',
      owner: 'agent',
      tags: ['cli'],
      relatedWiki: ['developer/commands'],
      objective: 'Create initiatives from a command'
    });
    expect(initiative?.created).toBe(today);
    expect(initiative?.updated).toBe(today);
    expect(initiative?.plan).toEqual([
      { description: 'Write tests', status: 'pending' },
      { description: 'Implement command', status: 'pending' }
    ]);
    expect(initiative?.progressLog[0]).toContain('Created initiative via mdocs command');
  });

  test('mdocs initiative.update resolves existing filename and appends progress note', async () => {
    const plugin = createPlugin(testDir);
    (plugin as any).tool.mdocs_init.execute();
    const manager = new InitiativeManager(path.join(testDir, 'mdocs'));
    const legacyPath = path.join(testDir, 'mdocs', 'initiatives', 'legacy-title--2026-05-27.md');
    fs.writeFileSync(
      legacyPath,
      `---
id: "stable-id"
title: "Stable Title"
status: "active"
created: "2026-05-27"
updated: "2026-05-27"
owner: "old-owner"
tags: ["old"]
related_wiki: []
---

## Objective
Existing file

## Plan

## Progress Log
- Existing note

## Artifacts
`,
      'utf8'
    );

    const result = await (plugin as any).tool.mdocs.execute({
      command: 'initiative.update',
      args: {
        id: 'stable-id',
        updates: {
          status: 'paused',
          tags: ['new'],
          priority: 'high',
          dueDate: '2026-06-01',
          dependsOn: ['dependency'],
          owner: 'new-owner'
        },
        progressNote: 'Paused while dependency finishes'
      }
    });

    expect(result).toEqual({ success: true, filename: 'stable-id--2026-05-27.md', id: 'stable-id' });
    expect(fs.existsSync(legacyPath)).toBe(false);

    const updated = manager.read('stable-id--2026-05-27.md');
    expect(updated).toMatchObject({
      id: 'stable-id',
      status: 'paused',
      tags: ['new'],
      priority: 'high',
      dueDate: '2026-06-01',
      dependsOn: ['dependency'],
      owner: 'new-owner'
    });
    expect(updated?.progressLog).toContain('Existing note');
    expect(updated?.progressLog).toContain('Paused while dependency finishes');
  });

  test('mdocs initiative.done resolves existing filename and marks initiative done', async () => {
    const plugin = createPlugin(testDir);
    (plugin as any).tool.mdocs_init.execute();
    const manager = new InitiativeManager(path.join(testDir, 'mdocs'));
    manager.create({
      id: 'finish-me',
      title: 'Finish Me',
      status: 'active',
      created: '2026-05-29',
      updated: '2026-05-29',
      owner: 'agent',
      tags: [],
      relatedWiki: [],
      objective: 'Complete this',
      plan: [],
      progressLog: [],
      artifacts: []
    });

    const result = await (plugin as any).tool.mdocs.execute({ command: 'initiative.done', args: { id: 'finish-me' } });

    expect(result).toEqual({ success: true, filename: 'finish-me--2026-05-29.md', id: 'finish-me' });
    const initiative = manager.read('finish-me--2026-05-29.md');
    expect(initiative?.status).toBe('done');
    expect(initiative?.progressLog.some(note => note.includes('Marked done via mdocs command'))).toBe(true);
  });

  test('mdocs wiki.create creates a wiki entry and indices', async () => {
    const plugin = createPlugin(testDir);
    (plugin as any).tool.mdocs_init.execute();
    const today = new Date().toISOString().split('T')[0];

    const result = await (plugin as any).tool.mdocs.execute({
      command: 'wiki.create',
      args: {
        category: 'developer',
        id: 'command-tool',
        title: 'Command Tool',
        content: 'Use the mdocs command tool.',
        relatedInitiatives: ['cmd-created'],
        tags: ['cli']
      }
    });

    expect(result).toEqual({ success: true, filename: 'developer/command-tool.md', id: 'command-tool' });
    const entry = fs.readFileSync(path.join(testDir, 'mdocs', 'wiki', 'developer', 'command-tool.md'), 'utf8');
    expect(entry).toContain('title: "Command Tool"');
    expect(entry).toContain(`created: "${today}"`);
    expect(entry).toContain('Use the mdocs command tool.');
    expect(fs.readFileSync(path.join(testDir, 'mdocs', 'wiki', 'developer', 'INDEX.md'), 'utf8')).toContain('Command Tool');
  });

  test('mdocs_validate tool and mdocs validate command return combined validation results', async () => {
    const plugin = createPlugin(testDir);
    (plugin as any).tool.mdocs_init.execute();
    const initiativeDir = path.join(testDir, 'mdocs', 'initiatives');
    fs.writeFileSync(path.join(initiativeDir, 'broken--2026-05-29.md'), `---
id: "broken"
title: "Broken"
status: "active"
created: "2026-05-29"
related_wiki: ["developer/missing"]
---

## Objective

## Plan

## Progress Log

## Artifacts
`, 'utf8');
    const wikiDir = path.join(testDir, 'mdocs', 'wiki', 'developer');
    fs.mkdirSync(wikiDir, { recursive: true });
    fs.writeFileSync(path.join(wikiDir, 'bad.md'), '---\nid: ""\ntitle: ""\ncategory: ""\n---\n', 'utf8');

    const toolResult = await (plugin as any).tool.mdocs_validate.execute();
    const commandResult = await (plugin as any).tool.mdocs.execute({ command: 'validate', args: {} });

    expect(toolResult.valid).toBe(false);
    expect(toolResult.initiatives.errors).toEqual(expect.arrayContaining([expect.stringContaining('broken--2026-05-29.md references missing wiki entry: developer/missing')]));
    expect(toolResult.wiki.errors).toEqual(expect.arrayContaining([expect.stringContaining('developer/bad.md missing id')]));
    expect(commandResult).toEqual(toolResult);
  });

  test('mdocs_status includes validation summary', async () => {
    const plugin = createPlugin(testDir);
    (plugin as any).tool.mdocs_init.execute();
    const initiativeDir = path.join(testDir, 'mdocs', 'initiatives');
    fs.writeFileSync(path.join(initiativeDir, 'missing-title.md'), `---
id: "missing-title"
title: ""
status: "active"
created: "2026-05-29"
related_wiki: []
---
`, 'utf8');

    const result = await (plugin as any).tool.mdocs_status.execute();

    expect(result.validation.valid).toBe(false);
    expect(result.validation.initiatives.errors).toEqual(expect.arrayContaining([expect.stringContaining('missing-title.md missing title')]));
  });

  test('mdocs_status returns validation when an initiative file is malformed', async () => {
    const plugin = createPlugin(testDir);
    (plugin as any).tool.mdocs_init.execute();
    const initiativeDir = path.join(testDir, 'mdocs', 'initiatives');
    fs.writeFileSync(path.join(initiativeDir, 'malformed.md'), 'not frontmatter', 'utf8');

    const result = await (plugin as any).tool.mdocs_status.execute();

    expect(result.error).toBeUndefined();
    expect(result.validation.valid).toBe(false);
    expect(result.validation.initiatives.errors).toEqual(expect.arrayContaining([
      expect.stringContaining('malformed.md invalid initiative format')
    ]));
  });

  test('mdocs returns helpful errors for invalid and unsupported commands', async () => {
    const plugin = createPlugin(testDir);
    (plugin as any).tool.mdocs_init.execute();

    await expect((plugin as any).tool.mdocs.execute({ command: 'initiative.create', args: {} })).resolves.toEqual({ error: 'initiative.create requires title' });
    await expect((plugin as any).tool.mdocs.execute({ command: 'initiative.update', args: {} })).resolves.toEqual({ error: 'initiative.update requires id' });
    await expect((plugin as any).tool.mdocs.execute({ command: 'initiative.done', args: { id: 'missing' } })).resolves.toEqual({ error: 'Initiative not found: missing' });
    await expect((plugin as any).tool.mdocs.execute({ command: 'wiki.create', args: { category: 'developer', id: 'missing-title' } })).resolves.toEqual({ error: 'wiki.create requires category, id, and title' });
    await expect((plugin as any).tool.mdocs.execute({ command: 'index.sync', args: {} })).resolves.toEqual({ error: 'index.sync not yet implemented' });

    const unknown = await (plugin as any).tool.mdocs.execute({ command: 'nope', args: {} });
    expect(unknown.error).toContain('Unsupported mdocs command: nope');
    expect(unknown.supportedCommands).toContain('initiative.create');
  });
});

describe('Config Hook', () => {
  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  test('auto-registers agent and skills on empty config', () => {
    const plugin = createPlugin(testDir);
    const cfg: any = {};
    plugin.config(cfg);

    expect(cfg.agent).toBeDefined();
    expect(cfg.agent['mdocs-orchestrator']).toEqual({
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
      prompt: expect.stringContaining('You are a workflow orchestrator using the mdocs system.')
    });
    expect(cfg.agent['mdocs-orchestrator'].prompt).not.toContain('---');
    expect(cfg.agent['mdocs-orchestrator'].prompt).not.toContain('description:');
    expect(cfg.agents).toBeUndefined();

    expect(cfg.skills).toBeDefined();
    expect(cfg.skills.paths).toBeDefined();
    expect(cfg.skills.paths.length).toBeGreaterThan(0);
  });

  test('does not duplicate agent if already registered', () => {
    const plugin = createPlugin(testDir);
    const cfg: any = {
      agent: {
        'mdocs-orchestrator': {
          description: 'Existing orchestrator',
          mode: 'primary',
          permission: {},
          prompt: 'Existing prompt'
        }
      }
    };
    plugin.config(cfg);

    expect(Object.keys(cfg.agent)).toEqual(['mdocs-orchestrator']);
    expect(cfg.agent['mdocs-orchestrator'].prompt).toBe('Existing prompt');
    expect(cfg.agents).toBeUndefined();
  });

  test('does not duplicate skills path if already present', () => {
    const plugin = createPlugin(testDir);
    const cfg: any = {
      skills: { paths: ['/path/to/opencode-mdocs/skills'] }
    };
    plugin.config(cfg);

    expect(cfg.skills.paths.length).toBe(1);
  });

  test('appends skills path to existing skills config', () => {
    const plugin = createPlugin(testDir);
    const cfg: any = {
      skills: { paths: ['/other/skills'] }
    };
    plugin.config(cfg);

    expect(cfg.skills.paths.length).toBe(2);
    expect(cfg.skills.paths.some((p: string) => p.includes('opencode-mdocs'))).toBe(true);
  });

  test('gracefully handles config mutation errors', () => {
    const plugin = createPlugin(testDir);
    const cfg: any = Object.create(null);
    cfg.skills = Object.create(null);
    // This should not throw
    expect(() => plugin.config(cfg)).not.toThrow();
  });

  test('exposes singular tool hook and no legacy tools hook', () => {
    const plugin = createPlugin(testDir) as any;

    expect(Object.keys(plugin.tool).sort()).toEqual([
      'mdocs',
      'mdocs_audit',
      'mdocs_dispatch',
      'mdocs_init',
      'mdocs_lookup',
      'mdocs_search',
      'mdocs_status',
      'mdocs_validate'
    ]);
    expect(plugin.tools).toBeUndefined();
  });

  test('default export returns plugin with current opencode tool hook', async () => {
    expect(typeof pluginDefault).toBe('function');

    const hooks = await pluginDefault({ client: {}, project: {}, directory: testDir });

    expect((hooks as any).tool.mdocs_status).toBeDefined();
  });
});
