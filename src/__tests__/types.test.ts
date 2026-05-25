import { Initiative, WikiEntry, WorkflowState } from '../types';

const initiative: Initiative = {
  id: 'test-init',
  title: 'Test Initiative',
  status: 'active',
  created: '2025-05-24',
  updated: '2025-05-24',
  owner: 'test-owner',
  tags: ['test'],
  related_wiki: ['wiki/test'],
  objective: 'Test objective',
  plan: ['Step 1'],
  progress_log: [],
  artifacts: []
};

const wikiEntry: WikiEntry = {
  id: 'wiki-test',
  title: 'Wiki Test',
  category: 'test',
  created: '2025-05-24',
  updated: '2025-05-24',
  related_initiatives: ['test-init'],
  tags: ['test'],
  content: 'Test content'
};

const workflowState: WorkflowState = {
  current_step: 'IDLE',
  active_initiative: null,
  step_history: []
};
