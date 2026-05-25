import { InitiativeManager } from '../initiative';
import * as fs from 'fs';
import * as path from 'path';
import { Initiative } from '../types';

const testDir = path.join(__dirname, 'test-initiatives');

beforeEach(() => {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
  fs.mkdirSync(testDir, { recursive: true });
});

describe('InitiativeManager', () => {
  test('create initiative file with correct format', () => {
    const manager = new InitiativeManager(testDir);
    const initiative: Initiative = {
      id: 'test-init',
      title: 'Test Initiative',
      status: 'active',
      created: '2025-05-24',
      updated: '2025-05-24',
      owner: 'test-owner',
      tags: ['test'],
      relatedWiki: [],
      objective: 'Test objective',
      plan: ['Step 1'],
      progressLog: [],
      artifacts: []
    };

    manager.create(initiative);

    const files = fs.readdirSync(testDir);
    expect(files).toContain('initiatives');
    const initiativeFiles = fs.readdirSync(path.join(testDir, 'initiatives'));
    expect(initiativeFiles).toContain('test-initiative--2025-05-24.md');
  });

  test('read initiative parses frontmatter and sections', () => {
    const manager = new InitiativeManager(testDir);
    const initiative: Initiative = {
      id: 'test-init',
      title: 'Test Initiative',
      status: 'active',
      created: '2025-05-24',
      updated: '2025-05-24',
      owner: 'test-owner',
      tags: ['test'],
      relatedWiki: ['wiki/test'],
      objective: 'Test objective',
      plan: ['Step 1', 'Step 2'],
      progressLog: ['Started'],
      artifacts: ['wiki/test']
    };

    manager.create(initiative);
    const read = manager.read('test-initiative--2025-05-24.md');
    
    expect(read).not.toBeNull();
    expect(read!.id).toBe('test-init');
    expect(read!.title).toBe('Test Initiative');
    expect(read!.relatedWiki).toEqual(['wiki/test']);
    expect(read!.objective).toBe('Test objective');
    expect(read!.plan).toEqual(['Step 1', 'Step 2']);
    expect(read!.progressLog).toEqual(['Started']);
  });

  test('find related initiatives by tag', () => {
    const manager = new InitiativeManager(testDir);
    const init1: Initiative = { id: 'init1', title: 'Auth System', status: 'active', created: '2025-05-24', updated: '2025-05-24', owner: 'a', tags: ['auth', 'security'], relatedWiki: [], objective: 'Auth', plan: [], progressLog: [], artifacts: [] };
    const init2: Initiative = { id: 'init2', title: 'Login Page', status: 'active', created: '2025-05-24', updated: '2025-05-24', owner: 'a', tags: ['auth', 'ui'], relatedWiki: [], objective: 'Login', plan: [], progressLog: [], artifacts: [] };
    const init3: Initiative = { id: 'init3', title: 'Dashboard', status: 'active', created: '2025-05-24', updated: '2025-05-24', owner: 'a', tags: ['ui'], relatedWiki: [], objective: 'Dash', plan: [], progressLog: [], artifacts: [] };
    
    manager.create(init1);
    manager.create(init2);
    manager.create(init3);

    const related = manager.findRelated(['auth', 'security']);
    expect(related.length).toBe(2);
    expect(related.map(i => i.id)).toContain('init1');
    expect(related.map(i => i.id)).toContain('init2');
  });

  test('update initiative rewrites file', () => {
    const manager = new InitiativeManager(testDir);
    const initiative: Initiative = {
      id: 'test-init',
      title: 'Test Initiative',
      status: 'active',
      created: '2025-05-24',
      updated: '2025-05-24',
      owner: 'test-owner',
      tags: ['test'],
      relatedWiki: [],
      objective: 'Original',
      plan: ['Step 1'],
      progressLog: [],
      artifacts: []
    };

    manager.create(initiative);
    
    const updated = { ...initiative, objective: 'Updated' };
    manager.update('test-initiative--2025-05-24.md', updated);
    
    const read = manager.read('test-initiative--2025-05-24.md');
    expect(read!.objective).toBe('Updated');
  });

  test('delete initiative removes file and updates index', () => {
    const manager = new InitiativeManager(testDir);
    const initiative: Initiative = {
      id: 'test-init',
      title: 'Test Initiative',
      status: 'active',
      created: '2025-05-24',
      updated: '2025-05-24',
      owner: 'test-owner',
      tags: ['test'],
      relatedWiki: [],
      objective: 'Test',
      plan: [],
      progressLog: [],
      artifacts: []
    };

    manager.create(initiative);
    manager.delete('test-initiative--2025-05-24.md');
    
    const files = fs.readdirSync(path.join(testDir, 'initiatives'));
    expect(files).not.toContain('test-initiative--2025-05-24.md');
  });

  test('index is generated', () => {
    const manager = new InitiativeManager(testDir);
    const initiative: Initiative = {
      id: 'test-init',
      title: 'Test Initiative',
      status: 'active',
      created: '2025-05-24',
      updated: '2025-05-24',
      owner: 'test-owner',
      tags: ['test'],
      relatedWiki: [],
      objective: 'Test',
      plan: [],
      progressLog: [],
      artifacts: []
    };

    manager.create(initiative);
    
    const indexContent = fs.readFileSync(path.join(testDir, 'initiatives', 'INDEX.md'), 'utf8');
    expect(indexContent).toContain('Test Initiative');
    expect(indexContent).toContain('active');
  });
});
