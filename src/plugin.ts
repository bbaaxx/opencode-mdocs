import * as fs from 'fs';
import * as path from 'path';
import { MdocsManager } from './mdocs';
import { InitiativeManager } from './initiative';
import { WikiManager } from './wiki';
import { WorkflowEngine } from './workflow';
import { SubagentAssembler } from './subagent';
import { MdocsLinter } from './linter';
import { SearchEngine } from './search';
import { AuditLog } from './audit';

function loadAgentPrompt(agentPath: string) {
  const content = fs.readFileSync(agentPath, 'utf8');
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim();
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function createPlugin(baseDir: string) {
  const mdocsRoot = path.join(baseDir, 'mdocs');
  const mdocs = new MdocsManager(mdocsRoot);
  const initiatives = new InitiativeManager(mdocsRoot);
  const wiki = new WikiManager(mdocsRoot);
    const workflow = new WorkflowEngine(mdocsRoot);
    const assembler = new SubagentAssembler();
    const search = new SearchEngine(mdocsRoot);
    const audit = new AuditLog(mdocsRoot);

    const today = () => new Date().toISOString().split('T')[0];
    const supportedMdocsCommands = [
      'initiative.create',
      'initiative.update',
      'initiative.done',
      'wiki.create',
      'validate',
      'index.sync'
    ];

    const findInitiativeFilename = (id: string): string | null => {
      const initiativesDir = path.join(mdocsRoot, 'initiatives');
      if (!fs.existsSync(initiativesDir)) return null;
      const files = fs.readdirSync(initiativesDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
      for (const fileName of files) {
        const initiative = initiatives.read(fileName);
        if (initiative?.id === id) return fileName;
      }
      return null;
    };

    const validationResult = () => {
      const initiativeValidation = initiatives.validate();
      const wikiValidation = wiki.validate();
      return {
        initiatives: initiativeValidation,
        wiki: wikiValidation,
        valid: initiativeValidation.valid && wikiValidation.valid
      };
    };

    return {
    // Config hook: initialize mdocs and auto-register agent/skills
    config: (cfg: any) => {
      try {
        // Auto-register mdocs-orchestrator agent
        const agentPath = path.resolve(__dirname, '../agents/mdocs-orchestrator.md');
        if (fs.existsSync(agentPath)) {
          if (!cfg.agent) cfg.agent = {};
          if (!cfg.agent['mdocs-orchestrator']) {
            cfg.agent['mdocs-orchestrator'] = {
              description: 'Orchestrates work using the mdocs initiative/wiki workflow.',
              mode: 'primary',
              permission: {
                read: 'allow',
                glob: 'allow',
                grep: 'allow',
                list: 'allow',
                edit: 'allow',
                write: 'allow',
                bash: 'allow'
              },
              prompt: loadAgentPrompt(agentPath)
            };
          }
        }

        // Auto-register skills directory
        const skillsPath = path.resolve(__dirname, '../skills');
        if (fs.existsSync(skillsPath)) {
          if (!cfg.skills) cfg.skills = {};
          if (!cfg.skills.paths) cfg.skills.paths = [];
          if (!Array.isArray(cfg.skills.paths)) cfg.skills.paths = [cfg.skills.paths];
          const alreadyAdded = cfg.skills.paths.some((p: string) => p.includes('opencode-mdocs/skills') || p.includes('opencode-mdocs\\skills'));
          if (!alreadyAdded) {
            cfg.skills.paths.push(skillsPath);
          }
        }
      } catch (e) {
        // Graceful degradation: don't fail if config mutation fails
        console.error('[mdocs] Config registration skipped:', e);
      }

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

    // Progress tracking: log tool calls to active initiative and audit log
    "tool.execute.after": async (input: any, output: any) => {
      const step = workflow.getCurrentStep();
      const activeInitiativeId = workflow.status().activeInitiative;
      const toolName = input.name || input.tool;

      // Audit log every tool execution (comprehensive trail)
      audit.append({
        timestamp: new Date().toISOString(),
        type: 'tool',
        initiativeId: activeInitiativeId || undefined,
        step,
        details: { toolName, args: input.args || input.parameters || {} }
      });

      if (step !== 'IDLE' && activeInitiativeId) {
        const fileName = `${activeInitiativeId}.md`;
        const initiative = initiatives.read(fileName);
        if (initiative) {
          initiative.progressLog.push(`[${new Date().toISOString()}] ${toolName} executed at step ${step}`);
          initiative.updated = new Date().toISOString().split('T')[0];
          initiatives.update(fileName, initiative);
        }
      }
    },

    // Event logging: record significant workflow events
    "event": (input: any) => {
      const significantEvents = ['workflow.advance', 'initiative.create', 'wiki.create'];
      const eventType = input.type;
      const activeInitiativeId = workflow.status().activeInitiative;

      // Audit log significant events
      audit.append({
        timestamp: new Date().toISOString(),
        type: eventType.startsWith('workflow') ? 'workflow' : eventType.startsWith('initiative') ? 'initiative' : eventType.startsWith('wiki') ? 'wiki' : 'workflow',
        initiativeId: activeInitiativeId || undefined,
        step: workflow.getCurrentStep(),
        details: { eventType }
      });

      if (significantEvents.includes(eventType)) {
        if (activeInitiativeId) {
          const fileName = `${activeInitiativeId}.md`;
          const initiative = initiatives.read(fileName);
          if (initiative) {
            initiative.progressLog.push(`[${new Date().toISOString()}] Event: ${eventType}`);
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
      mdocs: {
        description: "Run mdocs initiative/wiki commands",
        execute: async (input: { command: string; args: any }) => {
          try {
            const command = input?.command;
            const args = input?.args || {};
            const date = today();

            if (command === 'initiative.create') {
              if (!args.title) return { error: 'initiative.create requires title' };
              const id = args.id || slugify(args.title);
              const filePath = initiatives.create({
                id,
                title: args.title,
                status: 'active',
                created: date,
                updated: date,
                owner: args.owner || '',
                tags: Array.isArray(args.tags) ? args.tags : [],
                relatedWiki: Array.isArray(args.relatedWiki) ? args.relatedWiki : [],
                objective: args.objective || '',
                plan: Array.isArray(args.plan)
                  ? args.plan.map((item: any) => ({
                      description: typeof item === 'string' ? item : item?.description || '',
                      status: 'pending' as const
                    })).filter((item: any) => item.description)
                  : [],
                progressLog: [`[${new Date().toISOString()}] Created initiative via mdocs command`],
                artifacts: []
              });
              return { success: true, filename: path.basename(filePath), id };
            }

            if (command === 'initiative.update') {
              if (!args.id) return { error: 'initiative.update requires id' };
              const fileName = findInitiativeFilename(args.id);
              if (!fileName) return { error: `Initiative not found: ${args.id}` };
              const initiative = initiatives.read(fileName);
              if (!initiative) return { error: `Initiative not found: ${args.id}` };
              const updates = args.updates || args;
              for (const field of ['status', 'tags', 'priority', 'dueDate', 'dependsOn', 'owner']) {
                if (updates[field] !== undefined) {
                  (initiative as any)[field] = updates[field];
                }
              }
              initiative.updated = date;
              if (args.progressNote) initiative.progressLog.push(args.progressNote);
              const filePath = initiatives.update(fileName, initiative);
              return { success: true, filename: path.basename(filePath), id: initiative.id };
            }

            if (command === 'initiative.done') {
              if (!args.id) return { error: 'initiative.done requires id' };
              const fileName = findInitiativeFilename(args.id);
              if (!fileName) return { error: `Initiative not found: ${args.id}` };
              const initiative = initiatives.read(fileName);
              if (!initiative) return { error: `Initiative not found: ${args.id}` };
              initiative.status = 'done';
              initiative.updated = date;
              initiative.progressLog.push(`[${new Date().toISOString()}] Marked done via mdocs command`);
              const filePath = initiatives.update(fileName, initiative);
              return { success: true, filename: path.basename(filePath), id: initiative.id };
            }

            if (command === 'wiki.create') {
              if (!args.category || !args.id || !args.title) return { error: 'wiki.create requires category, id, and title' };
              const filePath = wiki.create({
                category: args.category,
                id: args.id,
                title: args.title,
                created: date,
                updated: date,
                content: args.content || '',
                relatedInitiatives: Array.isArray(args.relatedInitiatives) ? args.relatedInitiatives : [],
                tags: Array.isArray(args.tags) ? args.tags : []
              });
              return { success: true, filename: path.join(path.basename(path.dirname(filePath)), path.basename(filePath)), id: args.id };
            }

            if (command === 'validate') return validationResult();
            if (command === 'index.sync') return { error: 'index.sync not yet implemented' };

            return { error: `Unsupported mdocs command: ${command}`, supportedCommands: supportedMdocsCommands };
          } catch (err: any) {
            return { error: err.message || String(err) };
          }
        }
      },
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
            })),
            validation: validationResult()
          };
        }
      },
      mdocs_validate: {
        description: "Validate mdocs initiative and wiki integrity",
        execute: async () => {
          try {
            return validationResult();
          } catch (err: any) {
            return { error: err.message || String(err) };
          }
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
      mdocs_lookup: {
        description: "Resolve an initiative by id, title, slug, or filename",
        execute: async (args: { query: string; field?: 'id' | 'title' | 'slug' }) => {
          try {
            const query = args?.query || '';
            const normalizedQuery = query.toLowerCase();
            const querySlug = slugify(query);
            const initiativesDir = path.join(mdocsRoot, 'initiatives');
            const files = fs.existsSync(initiativesDir)
              ? fs.readdirSync(initiativesDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md')
              : [];

            for (const fileName of files) {
              const initiative = initiatives.read(fileName);
              if (!initiative) continue;

              const fileStem = fileName.replace(/\.md$/, '');
              const fileSlug = slugify(fileStem.replace(/--\d{4}-\d{2}-\d{2}$/, ''));
              const idSlug = slugify(initiative.id || '');
              const titleSlug = slugify(initiative.title || '');
              const title = initiative.title || '';
              const candidates: Record<string, boolean> = {
                id: initiative.id === query || idSlug === querySlug,
                title: title.toLowerCase().includes(normalizedQuery) || titleSlug === querySlug,
                slug: idSlug === querySlug || titleSlug === querySlug || fileName === query || fileStem === query || fileSlug === querySlug
              };

              const matched = args?.field
                ? candidates[args.field]
                : candidates.id || candidates.title || candidates.slug;

              if (matched) {
                return {
                  type: 'initiative',
                  id: initiative.id,
                  title: initiative.title,
                  status: initiative.status,
                  tags: initiative.tags,
                  filename: fileName
                };
              }
            }

            return { error: 'No initiatives found for query', query };
          } catch (err: any) {
            return { error: err.message || String(err) };
          }
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
      },
      mdocs_audit: {
        description: "Query the audit log for events",
        execute: async (args: { initiativeId?: string; limit?: number }) => {
          const events = audit.query({
            initiativeId: args.initiativeId,
            limit: args.limit
          });
          return { events };
        }
      }
    }
  };
}
