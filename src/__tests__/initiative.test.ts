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

  const files = fs.readdirSync(path.join(testDir, 'initiatives'));
  expect(files).toContain('test-initiative--2025-05-24.md');
});

test('find related initiatives by tag', () => {
  const manager = new InitiativeManager(testDir);
  const init1: Initiative = { id: 'init1', title: 'Auth', status: 'active', created: '2025-05-24', updated: '2025-05-24', owner: 'a', tags: ['auth', 'security'], relatedWiki: [], objective: 'Auth', plan: [], progressLog: [], artifacts: [] };
  const init2: Initiative = { id: 'init2', title: 'Login', status: 'active', created: '2025-05-24', updated: '2025-05-24', owner: 'a', tags: ['auth', 'ui'], relatedWiki: [], objective: 'Login', plan: [], progressLog: [], artifacts: [] };
  manager.create(init1);
  manager.create(init2);

  const related = manager.findRelated(['auth', 'security']);
  expect(related.length).toBeGreaterThan(0);
});
