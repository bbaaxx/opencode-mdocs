import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
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
      'initiative.delete',
      'initiative.archive',
      'wiki.create',
      'wiki.delete',
      'wiki.list',
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
      const allLintResults = new MdocsLinter(mdocsRoot).lintAll();
      // Separate file-quality lint from graph-level lint
      const fileResults = allLintResults.filter(r => r.file !== 'GRAPH');
      const graphResults = allLintResults.filter(r => r.file === 'GRAPH');
      const fileErrors = fileResults.flatMap(r => r.issues.filter(i => i.severity === 'error').map(i => `${r.file}: ${i.message}`));
      const graphErrors = graphResults.flatMap(r => r.issues.filter(i => i.severity === 'error').map(i => `${r.file}: ${i.message}`));
      const graphWarnings = graphResults.flatMap(r => r.issues.filter(i => i.severity !== 'error').map(i => `${r.file}: ${i.message}`));
      return {
        initiatives: initiativeValidation,
        wiki: wikiValidation,
        graph: { valid: graphErrors.length === 0, errors: graphErrors, warnings: graphWarnings, results: graphResults },
        valid: initiativeValidation.valid && wikiValidation.valid && graphErrors.length === 0
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
        const fileName = findInitiativeFilename(activeInitiativeId);
        if (fileName) {
          const initiative = initiatives.read(fileName);
          if (initiative) {
            initiative.progressLog.push(`[${new Date().toISOString()}] ${toolName} executed at step ${step}`);
            initiative.updated = new Date().toISOString().split('T')[0];
            initiatives.update(fileName, initiative);
          }
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
          const fileName = findInitiativeFilename(activeInitiativeId);
          if (fileName) {
            const initiative = initiatives.read(fileName);
            if (initiative) {
              initiative.progressLog.push(`[${new Date().toISOString()}] Event: ${eventType}`);
              initiative.updated = new Date().toISOString().split('T')[0];
              initiatives.update(fileName, initiative);
            }
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
        args: {
          command: z.string().describe('Command name, e.g. initiative.create, initiative.update, validate, index.sync'),
          args: z.record(z.string(), z.any()).optional().describe('Command-specific arguments')
        },
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
                artifacts: [],
                phase: args.phase || undefined,
                handoffSummary: args.handoffSummary || undefined,
                openQuestions: Array.isArray(args.openQuestions) ? args.openQuestions : undefined,
                blockers: Array.isArray(args.blockers) ? args.blockers : undefined,
                nextAction: args.nextAction || undefined,
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
              for (const field of ['status', 'tags', 'priority', 'dueDate', 'dependsOn', 'owner', 'phase', 'handoffSummary', 'nextAction']) {
                if (updates[field] !== undefined) {
                  (initiative as any)[field] = updates[field];
                }
              }
              if (updates.openQuestions !== undefined) initiative.openQuestions = Array.isArray(updates.openQuestions) ? updates.openQuestions : undefined;
              if (updates.blockers !== undefined) initiative.blockers = Array.isArray(updates.blockers) ? updates.blockers : undefined;
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
                tags: Array.isArray(args.tags) ? args.tags : [],
                lifecycle: args.lifecycle || undefined,
                knowledgeType: args.knowledgeType || undefined,
                confidence: args.confidence || undefined,
                sourceInitiatives: Array.isArray(args.sourceInitiatives) ? args.sourceInitiatives : undefined,
                supersedes: Array.isArray(args.supersedes) ? args.supersedes : undefined,
              });
              return { success: true, filename: path.join(path.basename(path.dirname(filePath)), path.basename(filePath)), id: args.id };
            }

            if (command === 'initiative.delete') {
              if (!args.id) return { error: 'initiative.delete requires id' };
              const fileName = findInitiativeFilename(args.id);
              if (!fileName) return { error: `Initiative not found: ${args.id}` };
              initiatives.delete(fileName);
              return { success: true, id: args.id, deletedFilename: fileName };
            }

            if (command === 'initiative.archive') {
              if (!args.id) return { error: 'initiative.archive requires id' };
              const fileName = findInitiativeFilename(args.id);
              if (!fileName) return { error: `Initiative not found: ${args.id}` };
              const initiative = initiatives.read(fileName);
              if (!initiative) return { error: `Initiative not found: ${args.id}` };
              if (initiative.status !== 'done') return { error: `Only done initiatives can be archived: ${args.id}` };
              const result = initiatives.archive(fileName);
              return { success: true, id: args.id, archivedFilename: result.archivedFilename };
            }

            if (command === 'wiki.delete') {
              if (!args.category || !args.id) return { error: 'wiki.delete requires category and id' };
              if (!wiki.read(args.category, args.id)) return { error: `Wiki entry not found: ${args.category}/${args.id}` };
              wiki.delete(args.category, args.id);
              return { success: true, category: args.category, id: args.id, deletedFilename: `${args.category}/${args.id}.md` };
            }

            if (command === 'wiki.list') {
              const entries = wiki.list(args.category).map(entry => ({
                category: entry.category,
                id: entry.id,
                title: entry.title,
                tags: entry.tags
              }));
              return { entries };
            }

            if (command === 'validate') return validationResult();
            if (command === 'index.sync') {
              const regenerated = [
                path.relative(mdocsRoot, initiatives.syncIndex()),
                ...wiki.syncIndices().map(filePath => path.relative(mdocsRoot, filePath))
              ];
              return { success: true, regenerated };
            }

            return { error: `Unsupported mdocs command: ${command}`, supportedCommands: supportedMdocsCommands };
          } catch (err: any) {
            return { error: err.message || String(err) };
          }
        }
      },
      mdocs_init: {
        description: "Initialize /mdocs folder structure",
        args: {},
        execute: async () => {
          try {
            mdocs.init();
            return { success: true };
          } catch (err: any) {
            return { error: err.message || String(err) };
          }
        }
      },
      mdocs_status: {
        description: "Show current workflow state and active initiatives",
        args: {},
        execute: async () => {
          try {
            const state = workflow.status();
            const initiativesDir = path.join(mdocsRoot, 'initiatives');
            const allInitiatives = fs.existsSync(initiativesDir)
              ? fs.readdirSync(initiativesDir)
                  .filter(f => f.endsWith('.md') && f !== 'INDEX.md')
                  .map(f => { try { return initiatives.read(f); } catch { return null; } })
                  .filter((i): i is NonNullable<typeof i> => i !== null && i !== undefined)
              : [];
            const activeInitiatives = allInitiatives.filter(i => i.status === 'active');
            const blocked = initiatives.findBlocked();
            const overdue = initiatives.findOverdue();

            // Last activity from audit log
            const recentAudit = audit.query({ limit: 1 });
            const lastActivity = recentAudit.length > 0 ? recentAudit[0].timestamp : null;

            // Add resume info for the active initiative
            let resume: any = undefined;
            if (state.activeInitiative) {
              const activeInit = allInitiatives.find(i => i.id === state.activeInitiative);
              if (activeInit) {
                const currentPlanItem = activeInit.plan.find(p => p.status === 'in-progress') || activeInit.plan.find(p => p.status !== 'done');
                const lastUpdated = activeInit.updated;
                const daysSinceUpdate = lastUpdated ? Math.floor((Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24)) : null;
                const staleWarning = daysSinceUpdate !== null && daysSinceUpdate > 3;

                resume = {
                  initiative: { id: activeInit.id, title: activeInit.title, status: activeInit.status },
                  currentStep: state.currentStep || 'IDLE',
                  nextAction: activeInit.nextAction || activeInit.plan.find(p => p.status !== 'done')?.description || '',
                  currentPlanItem: currentPlanItem ? { description: currentPlanItem.description, status: currentPlanItem.status } : null,
                  blockers: activeInit.blockers || [],
                  latestProgress: activeInit.progressLog.at(-1) || '',
                  lastUpdated,
                  staleWarning
                };
              }
            }

            return {
              workflow: {
                currentStep: state.currentStep || 'IDLE',
                activeInitiative: state.activeInitiative || '',
                stepHistory: state.stepHistory || []
              },
              initiatives: activeInitiatives.map(i => ({
                id: i.id || '',
                title: i.title || '',
                status: i.status || 'active',
                created: i.created || '',
                nextAction: i.nextAction || i.plan.find(p => p.status !== 'done')?.description || '',
                blockers: i.blockers || []
              })),
              blocked: blocked.map(i => ({
                id: i.id || '',
                title: i.title || '',
                dependsOn: i.dependsOn || []
              })),
              overdue: overdue.map(i => ({
                id: i.id || '',
                title: i.title || '',
                dueDate: i.dueDate || ''
              })),
              lastActivity,
              resume,
              validation: validationResult()
            };
          } catch (err: any) {
            return { error: err.message || String(err), workflow: { currentStep: 'IDLE', activeInitiative: '', stepHistory: [] }, initiatives: [], blocked: [], overdue: [] };
          }
        }
      },
      mdocs_validate: {
        description: "Validate mdocs initiative and wiki integrity",
        args: {},
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
        args: {
          query: z.string().describe('Search query'),
          filters: z.object({
            tags: z.array(z.string()).optional(),
            status: z.string().optional(),
            category: z.string().optional(),
            dateFrom: z.string().optional(),
            dateTo: z.string().optional()
          }).optional().describe('Optional search filters')
        },
        execute: async (args: { query: string; filters?: { tags?: string[]; status?: string; category?: string; dateFrom?: string; dateTo?: string } }) => {
          try {
            const results = search.query(args?.query || '', args?.filters || {});
            return {
              results: results.map(r => ({
                type: r.type || '',
                id: r.id || '',
                title: r.title || '',
                score: r.score || 0
              }))
            };
          } catch (err: any) {
            return { error: err.message || String(err), results: [] };
          }
        }
      },
      mdocs_lookup: {
        description: "Resolve an initiative by id, title, slug, or filename",
        args: {
          query: z.string().describe('Initiative id, title, slug, or filename to resolve'),
          field: z.enum(['id', 'title', 'slug']).optional().describe('Optional field to constrain lookup')
        },
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
        args: {
          initiativeId: z.string().optional().describe('Initiative id to assemble context for; defaults to active initiative')
        },
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

          // Retrieve search-ranked memory
          const searchQuery = `${initiative.title} ${initiative.objective} ${initiative.tags.join(' ')}`;
          const retrievedMemory = search.query(searchQuery).slice(0, 5);

          // Retrieve recent audit events for this initiative
          const recentEvents = audit.query({ initiativeId: initiative.id, limit: 5 });

          const currentStep = workflow.getCurrentStep();
          const context = assembler.assemble(initiative, wikiEntries, currentStep, { retrievedMemory, recentEvents });

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
        args: {
          initiativeId: z.string().optional().describe('Optional initiative id to filter audit events'),
          limit: z.number().optional().describe('Maximum number of audit events to return')
        },
        execute: async (args: { initiativeId?: string; limit?: number }) => {
          const events = audit.query({
            initiativeId: args.initiativeId,
            limit: args.limit
          });
          return { events };
        }
      },
      mdocs_resume: {
        description: "Resume active or specified initiative with next action and validation",
        args: {
          initiativeId: z.string().optional().describe('Initiative id to resume; defaults to active initiative')
        },
        execute: async (args: { initiativeId?: string }) => {
          try {
            const initiativeId = args?.initiativeId || workflow.status().activeInitiative;
            if (!initiativeId) {
              // No active initiative — return resumable initiatives with recommendations
              const initiativesDir = path.join(mdocsRoot, 'initiatives');
              const allInitiatives = fs.existsSync(initiativesDir)
                ? fs.readdirSync(initiativesDir)
                    .filter(f => f.endsWith('.md') && f !== 'INDEX.md')
                    .map(f => { try { return { init: initiatives.read(f), file: f }; } catch { return null; } })
                    .filter((i): i is NonNullable<typeof i> => i !== null && i.init !== null)
                : [];
              const resumable = allInitiatives
                .filter(({ init }) => init !== null && init.status === 'active')
                .map(({ init }) => {
                  const nextAction = init!.nextAction || init!.plan.find(p => p.status !== 'done')?.description || '';
                  const daysSinceUpdate = Math.floor((Date.now() - new Date(init!.updated).getTime()) / (1000 * 60 * 60 * 24));
                  return {
                    id: init!.id,
                    title: init!.title,
                    nextAction,
                    blockers: init!.blockers || [],
                    lastUpdated: init!.updated,
                    recommendation: daysSinceUpdate > 3 ? 'stale — consider updating progress' : (init!.blockers?.length ? 'blocked — resolve blockers first' : 'ready to resume')
                  };
                });
              return { resumable, recommendation: resumable.length > 0 ? 'Specify initiativeId to resume one of the above' : 'No active initiatives to resume' };
            }
            const fileName = findInitiativeFilename(initiativeId);
            if (!fileName) return { error: `Initiative not found: ${initiativeId}` };
            const initiative = initiatives.read(fileName);
            if (!initiative) return { error: `Initiative not found: ${initiativeId}` };
            workflow.setActiveInitiative(initiative.id);
            return {
              initiative: { id: initiative.id, title: initiative.title, status: initiative.status },
              currentStep: workflow.status().currentStep,
              nextAction: initiative.nextAction || initiative.plan.find(p => p.status !== 'done')?.description || '',
              blockers: initiative.blockers || [],
              latestProgress: initiative.progressLog.at(-1) || '',
              validation: validationResult()
            };
          } catch (err: any) {
            return { error: err.message || String(err) };
          }
        }
      }
    }
  };
}
