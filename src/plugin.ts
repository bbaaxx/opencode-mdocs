import * as fs from 'fs';
import * as path from 'path';
import { MdocsManager } from './mdocs';
import { InitiativeManager } from './initiative';
import { WikiManager } from './wiki';
import { WorkflowEngine } from './workflow';
import { SubagentAssembler } from './subagent';
import { MdocsLinter } from './linter';
import { SearchEngine } from './search';

export function createPlugin(baseDir: string) {
  const mdocsRoot = path.join(baseDir, 'mdocs');
  const mdocs = new MdocsManager(mdocsRoot);
  const initiatives = new InitiativeManager(mdocsRoot);
  const wiki = new WikiManager(mdocsRoot);
    const workflow = new WorkflowEngine(mdocsRoot);
    const assembler = new SubagentAssembler();
    const search = new SearchEngine(mdocsRoot);

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
          plan: [
            { description: 'Install npm package', status: 'pending' },
            { description: 'Configure opencode.json', status: 'pending' },
            { description: 'Verify workflow', status: 'pending' }
          ],
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
    tools: {
      mdocs_init: {
        description: "Initialize /mdocs folder structure",
        execute: async () => {
          mdocs.init();
          return { success: true };
        }
      },
      mdocs_status: {
        description: "Show current workflow state and active initiatives",
        execute: async () => {
          const state = workflow.status();
          const initiativesDir = path.join(mdocsRoot, 'initiatives');
          const allInitiatives = fs.existsSync(initiativesDir)
            ? fs.readdirSync(initiativesDir)
                .filter(f => f.endsWith('.md') && f !== 'INDEX.md')
                .map(f => initiatives.read(f))
                .filter(Boolean)
            : [];
          const activeInitiatives = allInitiatives.filter(i => i!.status === 'active');
          const blocked = initiatives.findBlocked();
          const overdue = initiatives.findOverdue();
          return {
            workflow: state,
            initiatives: activeInitiatives.map(i => ({
              id: i!.id,
              title: i!.title,
              status: i!.status,
              created: i!.created
            })),
            blocked: blocked.map(i => ({
              id: i.id,
              title: i.title,
              dependsOn: i.dependsOn || []
            })),
            overdue: overdue.map(i => ({
              id: i.id,
              title: i.title,
              dueDate: i.dueDate
            }))
          };
        }
      },
      mdocs_search: {
        description: "Search across initiatives and wiki by keyword",
        execute: async (args: { query: string; filters?: { tags?: string[]; status?: string; category?: string; dateFrom?: string; dateTo?: string } }) => {
          const results = search.query(args.query, args.filters || {});
          return {
            results: results.map(r => ({
              type: r.type,
              id: r.id,
              title: r.title,
              score: r.score
            }))
          };
        }
      },
      mdocs_dispatch: {
        description: "Assemble subagent context from an initiative and its related wiki entries",
        execute: async (args: { initiativeId?: string }) => {
          const initiativeId = args.initiativeId || workflow.status().activeInitiative;
          if (!initiativeId) {
            return { error: 'No initiativeId provided and no active initiative' };
          }

          const initiative = initiatives.findById(initiativeId);
          if (!initiative) {
            return { error: 'Initiative not found' };
          }

          const wikiEntries: any[] = [];
          for (const wikiRef of initiative.relatedWiki) {
            const [category, id] = wikiRef.split('/');
            if (category && id) {
              const entry = wiki.read(category, id);
              if (entry) {
                wikiEntries.push(entry);
              }
            }
          }

          const currentStep = workflow.getCurrentStep();
          const context = assembler.assemble(initiative, wikiEntries, currentStep);

          return {
            context,
            initiativeId: initiative.id,
            step: currentStep,
            relatedWikiCount: wikiEntries.length
          };
        }
      }
    }
  };
}
