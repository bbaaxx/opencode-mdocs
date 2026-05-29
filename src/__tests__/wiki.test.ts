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

  test('read returns correct WikiEntry', () => {
    const manager = new WikiManager(testDir);
    const entry = {
      id: 'read-test',
      title: 'Read Test',
      category: 'architecture',
      created: '2025-05-24',
      updated: '2025-05-24',
      relatedInitiatives: ['init1', 'init2'],
      tags: ['test', 'read'],
      content: 'Read test content'
    };

    manager.create(entry);
    const read = manager.read('architecture', 'read-test');

    expect(read).not.toBeNull();
    expect(read!.id).toBe('read-test');
    expect(read!.title).toBe('Read Test');
    expect(read!.category).toBe('architecture');
    expect(read!.relatedInitiatives).toEqual(['init1', 'init2']);
    expect(read!.tags).toEqual(['test', 'read']);
    expect(read!.content).toBe('Read test content');
  });

  test('read returns null for missing entry', () => {
    const manager = new WikiManager(testDir);
    const read = manager.read('nonexistent', 'missing');
    expect(read).toBeNull();
  });

  test('update rewrites file and updates timestamp', () => {
    const manager = new WikiManager(testDir);
    const entry = {
      id: 'update-test',
      title: 'Update Test',
      category: 'architecture',
      created: '2025-05-24',
      updated: '2025-05-24',
      relatedInitiatives: [],
      tags: ['old'],
      content: 'Old content'
    };

    manager.create(entry);
    const updated = {
      ...entry,
      title: 'Updated Title',
      tags: ['new'],
      content: 'New content'
    };

    manager.update('architecture', 'update-test', updated);
    const read = manager.read('architecture', 'update-test');

    expect(read).not.toBeNull();
    expect(read!.title).toBe('Updated Title');
    expect(read!.tags).toEqual(['new']);
    expect(read!.content).toBe('New content');
    expect(read!.updated).not.toBe('2025-05-24'); // Timestamp should be updated
  });

  test('update throws for missing entry', () => {
    const manager = new WikiManager(testDir);
    expect(() => manager.update('nonexistent', 'missing', {
      id: 'missing',
      title: 'Missing',
      category: 'nonexistent',
      created: '2025-05-24',
      updated: '2025-05-24',
      relatedInitiatives: [],
      tags: [],
      content: ''
    })).toThrow('Wiki entry not found');
  });

  test('delete removes file', () => {
    const manager = new WikiManager(testDir);
    const entry = {
      id: 'delete-test',
      title: 'Delete Test',
      category: 'architecture',
      created: '2025-05-24',
      updated: '2025-05-24',
      relatedInitiatives: [],
      tags: [],
      content: 'Delete me'
    };

    manager.create(entry);
    expect(fs.existsSync(path.join(testDir, 'wiki', 'architecture', 'delete-test.md'))).toBe(true);

    manager.delete('architecture', 'delete-test');
    expect(fs.existsSync(path.join(testDir, 'wiki', 'architecture', 'delete-test.md'))).toBe(false);
  });

  test('findRelated matches by tag', () => {
    const manager = new WikiManager(testDir);
    manager.create({
      id: 'plugin-doc',
      title: 'Plugin Doc',
      category: 'architecture',
      created: '2025-05-24',
      updated: '2025-05-24',
      relatedInitiatives: [],
      tags: ['plugin', 'architecture'],
      content: 'Plugin content'
    });
    manager.create({
      id: 'api-doc',
      title: 'API Doc',
      category: 'reference',
      created: '2025-05-24',
      updated: '2025-05-24',
      relatedInitiatives: [],
      tags: ['api', 'reference'],
      content: 'API content'
    });
    manager.create({
      id: 'another-plugin',
      title: 'Another Plugin',
      category: 'guides',
      created: '2025-05-24',
      updated: '2025-05-24',
      relatedInitiatives: [],
      tags: ['plugin', 'guide'],
      content: 'Guide content'
    });

    const results = manager.findRelated(['plugin']);
    expect(results).toHaveLength(2);
    expect(results.map(r => r.id)).toContain('plugin-doc');
    expect(results.map(r => r.id)).toContain('another-plugin');
  });

  test('findRelated returns empty array for no matches', () => {
    const manager = new WikiManager(testDir);
    manager.create({
      id: 'only-doc',
      title: 'Only Doc',
      category: 'architecture',
      created: '2025-05-24',
      updated: '2025-05-24',
      relatedInitiatives: [],
      tags: ['unique'],
      content: 'Unique content'
    });

    const results = manager.findRelated(['nonexistent']);
    expect(results).toEqual([]);
  });

  test('validate reports wiki entries missing required frontmatter', () => {
    const manager = new WikiManager(testDir);
    const categoryDir = path.join(testDir, 'wiki', 'architecture');
    fs.mkdirSync(categoryDir, { recursive: true });
    fs.writeFileSync(path.join(categoryDir, 'missing-fields.md'), `---
id: ""
title: ""
category: ""
created: "2026-05-29"
updated: "2026-05-29"
related_initiatives: []
tags: []
---

Content`, 'utf8');

    const result = manager.validate();

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.stringContaining('architecture/missing-fields.md missing id'),
      expect.stringContaining('architecture/missing-fields.md missing title'),
      expect.stringContaining('architecture/missing-fields.md missing category')
    ]));
  });
});
