import { Initiative, WikiEntry, WorkflowState, parseYamlValue, parseFrontmatter } from '../types';

describe('Types', () => {
  test('Initiative type accepts valid data', () => {
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
      plan: [{ description: 'Step 1', status: 'pending' }],
      progressLog: [],
      artifacts: []
    };
    expect(initiative.id).toBe('test-init');
    expect(initiative.status).toBe('active');
  });

  test('WikiEntry type accepts valid data', () => {
    const wikiEntry: WikiEntry = {
      id: 'wiki-test',
      title: 'Wiki Test',
      category: 'test',
      created: '2025-05-24',
      updated: '2025-05-24',
      relatedInitiatives: ['test-init'],
      tags: ['test'],
      content: 'Test content'
    };
    expect(wikiEntry.category).toBe('test');
  });

  test('WorkflowState type accepts valid data', () => {
    const workflowState: WorkflowState = {
      currentStep: 'IDLE',
      activeInitiative: null,
      stepHistory: []
    };
    expect(workflowState.currentStep).toBe('IDLE');
  });
});

describe('parseYamlValue', () => {
  test('parses JSON-style arrays', () => {
    const result = parseYamlValue('["a","b","c"]');
    expect(result).toEqual(['a', 'b', 'c']);
  });

  test('parses YAML inline arrays with unquoted strings', () => {
    const result = parseYamlValue('[roadmap, philosophy, architecture]');
    expect(result).toEqual(['roadmap', 'philosophy', 'architecture']);
  });

  test('parses YAML inline arrays with path-like values', () => {
    const result = parseYamlValue('[philosophy/core-principles, architecture/design]');
    expect(result).toEqual(['philosophy/core-principles', 'architecture/design']);
  });

  test('parses empty YAML array', () => {
    expect(parseYamlValue('[]')).toEqual([]);
  });

  test('parses plain string', () => {
    expect(parseYamlValue('hello world')).toBe('hello world');
  });

  test('parses number', () => {
    expect(parseYamlValue('42')).toBe(42);
  });

  test('parses boolean', () => {
    expect(parseYamlValue('true')).toBe(true);
    expect(parseYamlValue('false')).toBe(false);
  });

  test('parses double-quoted string', () => {
    expect(parseYamlValue('"hello world"')).toBe('hello world');
  });

  test('parses single-quoted string', () => {
    expect(parseYamlValue("'hello world'")).toBe('hello world');
  });

  test('parses empty string', () => {
    expect(parseYamlValue('')).toBe('');
  });

  test('parses YAML inline arrays with spaces after comma', () => {
    const result = parseYamlValue('[a,  b,  c  ]');
    expect(result).toEqual(['a', 'b', 'c']);
  });

  test('handles value with colons (like URLs)', () => {
    // JSON.parse fails on this, falls through to string
    const result = parseYamlValue('https://example.com');
    expect(result).toBe('https://example.com');
  });
});

describe('parseFrontmatter', () => {
  test('parses mixed JSON and YAML arrays', () => {
    const content = `---
id: test
title: Test Initiative
tags: [roadmap, philosophy]
related_wiki: ["a/b", "c/d"]
status: active
---
Body here`;
    const front = parseFrontmatter(content);
    expect(front.id).toBe('test');
    expect(front.title).toBe('Test Initiative');
    expect(front.tags).toEqual(['roadmap', 'philosophy']);
    expect(front.related_wiki).toEqual(['a/b', 'c/d']);
    expect(front.status).toBe('active');
  });

  test('returns empty object for content without frontmatter', () => {
    expect(parseFrontmatter('no frontmatter here')).toEqual({});
  });

  test('handles CRLF line endings', () => {
    const content = "---\r\nid: test\r\ntags: [a, b]\r\n---\r\nBody";
    const front = parseFrontmatter(content);
    expect(front.id).toBe('test');
    expect(front.tags).toEqual(['a', 'b']);
  });
});
