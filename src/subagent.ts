import { Initiative, WikiEntry, StepName } from './types';

export class SubagentAssembler {
  assemble(initiative: Initiative, wikiEntries: WikiEntry[], currentStep: StepName): string {
    const lines = [
      `# Initiative: ${initiative.title}`,
      `## Objective`,
      initiative.objective,
      ``,
      `## Plan`,
      ...initiative.plan.map(p => `- ${p}`),
      ``,
      `## Context`,
      ...wikiEntries.map(e => `### ${e.title}\n${e.content}`),
      ``,
      `## Current Step`,
      `You are executing the **${currentStep}** step.`,
      `Focus on the plan items and verify against the objective.`
    ];
    return lines.join('\n');
  }
}
