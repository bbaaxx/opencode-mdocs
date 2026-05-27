import { Initiative, WikiEntry, WorkflowState } from '../types';

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
