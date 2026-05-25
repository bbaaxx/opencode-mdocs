import * as fs from 'fs';
import * as path from 'path';
import { MdocsManager } from './mdocs';
import { InitiativeManager } from './initiative';
import { WikiManager } from './wiki';
import { WorkflowEngine } from './workflow';
import { SubagentAssembler } from './subagent';

export function createPlugin(baseDir: string) {
  const mdocs = new MdocsManager(baseDir);
  const initiatives = new InitiativeManager(baseDir);
  const wiki = new WikiManager(baseDir);
  const workflow = new WorkflowEngine(baseDir);
  const assembler = new SubagentAssembler();

  return {
    // Config hook: initialize mdocs if not exists
    config: (cfg: any) => {
      if (!mdocs.exists()) {
        mdocs.init();
        // Create first initiative tracking the plugin itself
        initiatives.create({
          id: 'install-mdocs',
          title: 'Install and Configure opencode-mdocs',
          status: 'active',
          created: new Date().toISOString().split('T')[0],
          updated: new Date().toISOString().split('T')[0],
          owner: 'system',
          tags: ['setup', 'plugin'],
          relatedWiki: [],
          objective: 'Install and configure the opencode-mdocs plugin',
          plan: ['Install npm package', 'Configure opencode.json', 'Verify workflow'],
          progressLog: ['Plugin installed'],
          artifacts: []
        });
      }
    },

    // Tool gate enforcement
    "tool.execute.before": async (input: any, output: any) => {
      const toolName = input.name || input.tool;
      const toolArgs = input.args || input.parameters || {};
      if (!workflow.canExecuteTool(toolName, toolArgs)) {
        throw new Error(`Workflow gate: ${toolName} blocked at step ${workflow.getCurrentStep()}`);
      }
    },

    // Progress tracking: log tool calls to active initiative
    "tool.execute.after": async (input: any, output: any) => {
      const step = workflow.getCurrentStep();
      const activeInitiativeId = workflow.status().activeInitiative;
      if (step !== 'IDLE' && activeInitiativeId) {
        const fileName = `${activeInitiativeId}.md`;
        const initiative = initiatives.read(fileName);
        if (initiative) {
          const toolName = input.name || input.tool;
          initiative.progressLog.push(`[${new Date().toISOString()}] ${toolName} executed at step ${step}`);
          initiative.updated = new Date().toISOString().split('T')[0];
          initiatives.update(fileName, initiative);
        }
      }
    },

    // Event logging: record significant workflow events
    "event": (input: any) => {
      const significantEvents = ['workflow.advance', 'initiative.create', 'wiki.create'];
      if (significantEvents.includes(input.type)) {
        const activeInitiativeId = workflow.status().activeInitiative;
        if (activeInitiativeId) {
          const fileName = `${activeInitiativeId}.md`;
          const initiative = initiatives.read(fileName);
          if (initiative) {
            initiative.progressLog.push(`[${new Date().toISOString()}] Event: ${input.type}`);
            initiative.updated = new Date().toISOString().split('T')[0];
            initiatives.update(fileName, initiative);
          }
        }
      }
    },

    // Permission integration: auto-allow tools aligned with current workflow step
    "permission.ask": async (input: any) => {
      const toolName = input.tool || input.name;
      const toolArgs = input.args || input.parameters || {};
      if (workflow.canExecuteTool(toolName, toolArgs)) {
        return { action: 'allow' };
      }
      return { action: 'ask' };
    },

    // Custom tools
    tool: {
      mdocs_init: {
        description: "Initialize /mdocs folder structure",
        handler: async () => {
          mdocs.init();
          return { success: true };
        }
      },
      mdocs_status: {
        description: "Show current workflow state and active initiatives",
        handler: async () => {
          const state = workflow.status();
          const allInitiatives = fs.readdirSync(path.join(baseDir, 'initiatives'))
            .filter(f => f.endsWith('.md') && f !== 'INDEX.md')
            .map(f => initiatives.read(f))
            .filter(Boolean);
          const activeInitiatives = allInitiatives.filter(i => i!.status === 'active');
          return {
            workflow: state,
            initiatives: activeInitiatives.map(i => ({
              id: i!.id,
              title: i!.title,
              status: i!.status,
              created: i!.created
            }))
          };
        }
      }
    }
  };
}
