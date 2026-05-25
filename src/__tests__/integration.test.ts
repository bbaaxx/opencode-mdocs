import * as path from 'path';
import * as fs from 'fs';
import { MdocsManager } from '../mdocs';
import { InitiativeManager } from '../initiative';
import { WikiManager } from '../wiki';
import { WorkflowEngine } from '../workflow';
import { Initiative } from '../types';

const testDir = path.join(__dirname, 'test-integration');

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

describe('Integration', () => {
  test('full workflow integration', () => {
    const mdocs = new MdocsManager(testDir);
    mdocs.init();

    const initiatives = new InitiativeManager(testDir);
    const init: Initiative = {
      id: 'integration-test',
      title: 'Integration Test',
      status: 'active',
      created: '2025-05-24',
      updated: '2025-05-24',
      owner: 'test',
      tags: ['test'],
      relatedWiki: [],
      objective: 'Test the full workflow',
      plan: ['Step 1', 'Step 2'],
      progressLog: [],
      artifacts: []
    };
    initiatives.create(init);

    const wiki = new WikiManager(testDir);
    wiki.create({
      id: 'test-entry',
      title: 'Test Entry',
      category: 'testing',
      created: '2025-05-24',
      updated: '2025-05-24',
      relatedInitiatives: ['integration-test'],
      tags: ['test'],
      content: 'Test wiki content'
    });

    const workflow = new WorkflowEngine(testDir);
    workflow.advance('UNDERSTAND');
    workflow.advance('DISCOVER');
    workflow.advance('CONTEXT');
    workflow.advance('PLAN');

    expect(workflow.getCurrentStep()).toBe('PLAN');
    expect(fs.existsSync(path.join(testDir, 'initiatives', 'integration-test--2025-05-24.md'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, 'wiki', 'testing', 'test-entry.md'))).toBe(true);
    
    // Verify indices were created
    expect(fs.existsSync(path.join(testDir, 'initiatives', 'INDEX.md'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, 'wiki', 'INDEX.md'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, 'wiki', 'testing', 'INDEX.md'))).toBe(true);
  });
});
