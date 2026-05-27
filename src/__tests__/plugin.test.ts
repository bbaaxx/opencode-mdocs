import * as path from 'path';
import * as fs from 'fs';
import { createPlugin } from '../plugin';

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
    plugin.tools.mdocs_init.execute();

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

    const result = await plugin.tools.mdocs_dispatch.execute({ initiativeId: 'test-initiative' });

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
    plugin.tools.mdocs_init.execute();

    const result = await plugin.tools.mdocs_dispatch.execute({ initiativeId: 'non-existent' });

    expect(result.error).toBe('Initiative not found');
  });

  test('mdocs_dispatch includes related wiki entries in context', async () => {
    const plugin = createPlugin(testDir);
    plugin.tools.mdocs_init.execute();

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

    const result = await plugin.tools.mdocs_dispatch.execute({ initiativeId: 'multi-wiki' });

    expect(result.error).toBeUndefined();
    expect(result.relatedWikiCount).toBe(2);
    expect(result.context).toContain('Content A');
    expect(result.context).toContain('Content B');
  });

  test('mdocs_dispatch uses active initiative when no initiativeId provided', async () => {
    // Initialize mdocs structure first
    const pluginInit = createPlugin(testDir);
    pluginInit.tools.mdocs_init.execute();

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

    const result = await plugin.tools.mdocs_dispatch.execute({});

    expect(result.error).toBeUndefined();
    expect(result.initiativeId).toBe('active-init');
    expect(result.context).toContain('The active one');
  });

  test('mdocs_dispatch returns error when no initiativeId and no active initiative', async () => {
    const plugin = createPlugin(testDir);
    plugin.tools.mdocs_init.execute();

    const result = await plugin.tools.mdocs_dispatch.execute({});

    expect(result.error).toBe('No initiativeId provided and no active initiative');
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

    expect(cfg.agents).toBeDefined();
    expect(cfg.agents.length).toBeGreaterThan(0);
    expect(cfg.agents.some((a: any) => a.name === 'mdocs-orchestrator')).toBe(true);

    expect(cfg.skills).toBeDefined();
    expect(cfg.skills.paths).toBeDefined();
    expect(cfg.skills.paths.length).toBeGreaterThan(0);
  });

  test('does not duplicate agent if already registered', () => {
    const plugin = createPlugin(testDir);
    const cfg: any = {
      agents: [{ name: 'mdocs-orchestrator', path: '/some/path' }]
    };
    plugin.config(cfg);

    expect(cfg.agents.length).toBe(1);
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
});
