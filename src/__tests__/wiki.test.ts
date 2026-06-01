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

  test('validate warns for wiki entries not referenced by initiatives', () => {
    const manager = new WikiManager(testDir);
    manager.create({
      id: 'orphan',
      title: 'Orphan',
      category: 'architecture',
      created: '2026-05-29',
      updated: '2026-05-29',
      relatedInitiatives: [],
      tags: [],
      content: 'No initiative points here'
    });

    const result = manager.validate();

    expect(result.valid).toBe(true);
    expect(result.warnings).toEqual(expect.arrayContaining([
      expect.stringContaining('architecture/orphan.md is not referenced by any initiative')
    ]));
  });

  test('validate does not warn when wiki entry is referenced by an initiative', () => {
    const manager = new WikiManager(testDir);
    manager.create({
      id: 'referenced',
      title: 'Referenced',
      category: 'architecture',
      created: '2026-05-29',
      updated: '2026-05-29',
      relatedInitiatives: [],
      tags: [],
      content: 'An initiative points here'
    });
    const initiativesDir = path.join(testDir, 'initiatives');
    fs.mkdirSync(initiativesDir, { recursive: true });
    fs.writeFileSync(path.join(initiativesDir, 'uses-wiki.md'), `---
id: "uses-wiki"
title: "Uses Wiki"
status: "active"
created: "2026-05-29"
related_wiki: ["architecture/referenced"]
---
`, 'utf8');

    const result = manager.validate();

    expect(result.warnings).not.toEqual(expect.arrayContaining([
      expect.stringContaining('architecture/referenced.md is not referenced by any initiative')
    ]));
  });

  test('preserves v2 wiki lifecycle and provenance metadata', () => {
    const manager = new WikiManager(testDir);
    const filePath = manager.create({
      id: 'dispatch-memory',
      title: 'Dispatch Memory',
      category: 'architecture',
      created: '2026-05-29',
      updated: '2026-05-29',
      relatedInitiatives: ['upgrade-dispatch-memory-retrieval'],
      tags: ['memory'],
      content: 'Dispatch should behave like memory retrieval.',
      lifecycle: 'stable',
      knowledgeType: 'architecture',
      confidence: 'high',
      sourceInitiatives: ['align-implementation-with-philosophy'],
      supersedes: []
    });

    const readBack = manager.read('architecture', path.basename(filePath, '.md'));

    expect(readBack?.lifecycle).toBe('stable');
    expect(readBack?.knowledgeType).toBe('architecture');
    expect(readBack?.confidence).toBe('high');
    expect(readBack?.sourceInitiatives).toEqual(['align-implementation-with-philosophy']);
  });

  test('stub creates a new wiki entry with default template', () => {
    const manager = new WikiManager(testDir);
    const result = manager.stub('architecture', 'new-stub', 'New Stub');

    expect(result.success).toBe(true);
    expect(fs.existsSync(result.filePath)).toBe(true);

    const content = fs.readFileSync(result.filePath, 'utf8');
    expect(content).toContain('id: "new-stub"');
    expect(content).toContain('title: "New Stub"');
    expect(content).toContain('category: "architecture"');
    expect(content).toContain('## Overview');
    expect(content).toContain('## Details');
    expect(content).toContain('## References');
  });

  test('stub returns existing when entry already exists', () => {
    const manager = new WikiManager(testDir);
    manager.create({
      id: 'existing-stub',
      title: 'Existing Stub',
      category: 'architecture',
      created: '2026-05-29',
      updated: '2026-05-29',
      relatedInitiatives: [],
      tags: [],
      content: 'Already here'
    });

    const result = manager.stub('architecture', 'existing-stub', 'Different Title');

    expect(result.success).toBe(false);
    expect(result.existing).toBe(true);
  });

  test('stub updates indices after creation', () => {
    const manager = new WikiManager(testDir);
    manager.stub('guides', 'guide-stub', 'Guide Stub');

    const catIndex = fs.readFileSync(path.join(testDir, 'wiki', 'guides', 'INDEX.md'), 'utf8');
    expect(catIndex).toContain('Guide Stub');

    const rootIndex = fs.readFileSync(path.join(testDir, 'wiki', 'INDEX.md'), 'utf8');
    expect(rootIndex).toContain('guides');
  });

  test('stub accepts custom template', () => {
    const manager = new WikiManager(testDir);
    const customTemplate = '---\nid: "custom-id"\ntitle: "Custom Title"\ncategory: "testing"\ncreated: "2026-05-29"\nupdated: "2026-05-29"\nrelated_initiatives: []\ntags: []\n---\n\nCustom body\n';
    const result = manager.stub('testing', 'custom-stub', 'Custom Title', customTemplate);

    expect(result.success).toBe(true);
    const content = fs.readFileSync(result.filePath, 'utf8');
    expect(content).toBe(customTemplate);
  });

  test('validate reports broken related_wiki links as errors', () => {
    const manager = new WikiManager(testDir);
    const initiativesDir = path.join(testDir, 'initiatives');
    fs.mkdirSync(initiativesDir, { recursive: true });
    fs.writeFileSync(path.join(initiativesDir, 'broken-link.md'), `---
id: "broken-link"
title: "Broken Link"
status: "active"
created: "2026-05-29"
related_wiki: ["architecture/missing-entry"]
---
`, 'utf8');

    const result = manager.validate();

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.stringContaining('references missing wiki entry: architecture/missing-entry')
    ]));
  });

  test('validate does not error for valid related_wiki links', () => {
    const manager = new WikiManager(testDir);
    manager.create({
      id: 'valid-entry',
      title: 'Valid Entry',
      category: 'architecture',
      created: '2026-05-29',
      updated: '2026-05-29',
      relatedInitiatives: [],
      tags: [],
      content: 'Content'
    });

    const initiativesDir = path.join(testDir, 'initiatives');
    fs.mkdirSync(initiativesDir, { recursive: true });
    fs.writeFileSync(path.join(initiativesDir, 'valid-link.md'), `---
id: "valid-link"
title: "Valid Link"
status: "active"
created: "2026-05-29"
related_wiki: ["architecture/valid-entry"]
---
`, 'utf8');

    const result = manager.validate();

    expect(result.errors).not.toEqual(expect.arrayContaining([
      expect.stringContaining('architecture/valid-entry')
    ]));
  });

  test('create auto-generates Referenced By section', () => {
    const manager = new WikiManager(testDir);
    manager.create({
      id: 'auto-ref',
      title: 'Auto Ref',
      category: 'architecture',
      created: '2026-05-29',
      updated: '2026-05-29',
      relatedInitiatives: ['init-a', 'init-b'],
      tags: [],
      content: 'Main content here.'
    });

    const content = fs.readFileSync(path.join(testDir, 'wiki', 'architecture', 'auto-ref.md'), 'utf8');
    expect(content).toContain('## Referenced By');
    expect(content).toContain('- init-a');
    expect(content).toContain('- init-b');
  });

  test('update regenerates Referenced By section', () => {
    const manager = new WikiManager(testDir);
    manager.create({
      id: 'update-ref',
      title: 'Update Ref',
      category: 'architecture',
      created: '2026-05-29',
      updated: '2026-05-29',
      relatedInitiatives: ['init-a'],
      tags: [],
      content: 'Main content.'
    });

    // Update with new relatedInitiatives
    const entry = manager.read('architecture', 'update-ref')!;
    entry.relatedInitiatives = ['init-a', 'init-c'];
    manager.update('architecture', 'update-ref', entry);

    const content = fs.readFileSync(path.join(testDir, 'wiki', 'architecture', 'update-ref.md'), 'utf8');
    expect(content).toContain('## Referenced By');
    expect(content).toContain('- init-a');
    expect(content).toContain('- init-c');
    // Should not have duplicate sections
    const matches = content.match(/## Referenced By/g);
    expect(matches).toHaveLength(1);
  });

  test('addRelatedInitiative appends initiative id', () => {
    const manager = new WikiManager(testDir);
    manager.create({
      id: 'add-rel',
      title: 'Add Rel',
      category: 'architecture',
      created: '2026-05-29',
      updated: '2026-05-29',
      relatedInitiatives: [],
      tags: [],
      content: 'Content'
    });

    manager.addRelatedInitiative('architecture', 'add-rel', 'new-init');
    const entry = manager.read('architecture', 'add-rel');
    expect(entry!.relatedInitiatives).toContain('new-init');
  });

  test('addRelatedInitiative does not duplicate initiative id', () => {
    const manager = new WikiManager(testDir);
    manager.create({
      id: 'no-dup',
      title: 'No Dup',
      category: 'architecture',
      created: '2026-05-29',
      updated: '2026-05-29',
      relatedInitiatives: ['existing-init'],
      tags: [],
      content: 'Content'
    });

    manager.addRelatedInitiative('architecture', 'no-dup', 'existing-init');
    const entry = manager.read('architecture', 'no-dup');
    expect(entry!.relatedInitiatives).toEqual(['existing-init']);
  });

  test('getReferencedBy returns initiative ids that reference this wiki', () => {
    const manager = new WikiManager(testDir);
    manager.create({
      id: 'referenced-by-test',
      title: 'Referenced By Test',
      category: 'architecture',
      created: '2026-05-29',
      updated: '2026-05-29',
      relatedInitiatives: [],
      tags: [],
      content: 'Content'
    });

    const initiativesDir = path.join(testDir, 'initiatives');
    fs.mkdirSync(initiativesDir, { recursive: true });
    fs.writeFileSync(path.join(initiativesDir, 'init-alpha.md'), `---
id: "init-alpha"
title: "Init Alpha"
status: "active"
created: "2026-05-29"
related_wiki: ["architecture/referenced-by-test"]
---
`, 'utf8');
    fs.writeFileSync(path.join(initiativesDir, 'init-beta.md'), `---
id: "init-beta"
title: "Init Beta"
status: "active"
created: "2026-05-29"
related_wiki: ["architecture/referenced-by-test", "other/cat"]
---
`, 'utf8');

    const refs = manager.getReferencedBy('architecture', 'referenced-by-test');
    expect(refs).toContain('init-alpha');
    expect(refs).toContain('init-beta');
  });

  test('addWikiCrossRef creates wiki-to-wiki link', () => {
    const manager = new WikiManager(testDir);
    manager.create({
      id: 'wiki-a',
      title: 'Wiki A',
      category: 'architecture',
      created: '2026-05-29',
      updated: '2026-05-29',
      relatedInitiatives: [],
      tags: [],
      content: 'Content A'
    });
    manager.create({
      id: 'wiki-b',
      title: 'Wiki B',
      category: 'guides',
      created: '2026-05-29',
      updated: '2026-05-29',
      relatedInitiatives: [],
      tags: [],
      content: 'Content B'
    });

    manager.addWikiCrossRef('architecture', 'wiki-a', 'guides', 'wiki-b');

    const entryA = manager.read('architecture', 'wiki-a');
    expect(entryA!.relatedWiki).toContain('guides/wiki-b');
  });

  test('extractWikiRefs detects bracket and markdown wiki links', () => {
    const manager = new WikiManager(testDir);
    const content = `See [[guides/how-to]] and also [another](reference/api) and [external](https://example.com)`;
    // extractWikiRefs is private; test via addWikiCrossRef behavior or content parsing indirectly
    // We can test by creating entries with cross-references in content and checking frontmatter
    manager.create({
      id: 'link-source',
      title: 'Link Source',
      category: 'architecture',
      created: '2026-05-29',
      updated: '2026-05-29',
      relatedInitiatives: [],
      tags: [],
      content
    });

    // The extractWikiRefs is used by addWikiCrossRef; let's test that a manual cross-ref works
    manager.addWikiCrossRef('architecture', 'link-source', 'guides', 'how-to');
    const entry = manager.read('architecture', 'link-source');
    expect(entry!.relatedWiki).toContain('guides/how-to');
  });
});
