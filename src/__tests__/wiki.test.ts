import { WikiManager } from '../wiki';
import * as fs from 'fs';
import * as path from 'path';

const testDir = path.join(__dirname, 'test-wiki');

beforeEach(() => {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
  fs.mkdirSync(testDir, { recursive: true });
});

afterEach(() => {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
});

describe('WikiManager', () => {
  test('create wiki entry in category', () => {
    const manager = new WikiManager(testDir);
    const entry = {
      id: 'wiki-test',
      title: 'Wiki Test',
      category: 'architecture',
      created: '2025-05-24',
      updated: '2025-05-24',
      relatedInitiatives: ['init1'],
      tags: ['test'],
      content: 'Test wiki content'
    };

    manager.create(entry);

    const categoryDir = path.join(testDir, 'wiki', 'architecture');
    expect(fs.existsSync(categoryDir)).toBe(true);
    expect(fs.existsSync(path.join(categoryDir, 'wiki-test.md'))).toBe(true);
  });

  test('creates index files', () => {
    const manager = new WikiManager(testDir);
    manager.create({
      id: 'entry-1',
      title: 'Entry One',
      category: 'architecture',
      created: '2025-05-24',
      updated: '2025-05-24',
      relatedInitiatives: [],
      tags: [],
      content: 'Content one'
    });

    const rootIndex = fs.readFileSync(path.join(testDir, 'wiki', 'INDEX.md'), 'utf8');
    expect(rootIndex).toContain('architecture');

    const catIndex = fs.readFileSync(path.join(testDir, 'wiki', 'architecture', 'INDEX.md'), 'utf8');
    expect(catIndex).toContain('Entry One');
  });

  test('create sanitizes path traversal in category and id', () => {
    const manager = new WikiManager(testDir);
    
    // These should throw because path traversal is rejected
    expect(() => manager.create({
      id: '../../../etc/passwd',
      title: 'Bad Entry',
      category: '../..',
      created: '2025-05-24',
      updated: '2025-05-24',
      relatedInitiatives: [],
      tags: [],
      content: 'Should be rejected'
    })).toThrow('Invalid name');
    
    // Verify no file was created outside wiki
    const escapedPath = path.join(testDir, '..', 'passwd.md');
    expect(fs.existsSync(escapedPath)).toBe(false);
  });
});
