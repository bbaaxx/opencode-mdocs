import { SubagentAssembler } from '../subagent';
import { Initiative, WikiEntry } from '../types';

describe('SubagentAssembler', () => {
  test('assemble context from initiative and wiki', () => {
    const assembler = new SubagentAssembler();
    const initiative: Initiative = {
      id: 'test', title: 'Test', status: 'active',
      created: '2025-05-24', updated: '2025-05-24', owner: 'a',
      tags: [], relatedWiki: [], objective: 'Build auth',
      plan: [{ description: 'Step 1', status: 'pending' }, { description: 'Step 2', status: 'pending' }], progressLog: [], artifacts: []
    };
    const wiki: WikiEntry[] = [{
      id: 'decision', title: 'Decision', category: 'decisions',
      created: '2025-05-24', updated: '2025-05-24',
      relatedInitiatives: ['test'], tags: [], content: 'Use JWT'
    }];

    const context = assembler.assemble(initiative, wiki, 'EXECUTE');
    expect(context).toContain('Build auth');
    expect(context).toContain('Use JWT');
    expect(context).toContain('EXECUTE');
    expect(context).toContain('Step 1');
    expect(context).toContain('Step 2');
  });

  test('handles empty wiki entries', () => {
    const assembler = new SubagentAssembler();
    const initiative: Initiative = {
      id: 'test', title: 'Test', status: 'active',
      created: '2025-05-24', updated: '2025-05-24', owner: 'a',
      tags: [], relatedWiki: [], objective: 'Build auth',
      plan: [{ description: 'Step 1', status: 'pending' }], progressLog: [], artifacts: []
    };

    const context = assembler.assemble(initiative, [], 'PLAN');
    expect(context).toContain('Build auth');
    expect(context).toContain('PLAN');
  });
});
