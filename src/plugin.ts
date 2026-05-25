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
      if (!workflow.canExecuteTool(toolName)) {
        throw new Error(`Workflow gate: ${toolName} blocked at step ${workflow.getCurrentStep()}`);
      }
    },

    // Progress tracking
    "tool.execute.after": async (input: any, output: any) => {
      const step = workflow.getCurrentStep();
      if (step !== 'IDLE') {
        // Log to initiative (simplified — in full version, write to active initiative file)
      }
    },

    // Event logging
    "event": (input: any) => {
      // Log significant events
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
          return {
            workflow: workflow.status(),
            initiatives: [] // Would scan initiatives dir
          };
        }
      }
    }
  };
}
