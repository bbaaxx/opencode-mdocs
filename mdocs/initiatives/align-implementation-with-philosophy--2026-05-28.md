---
id: align-implementation-with-philosophy
title: Align Implementation with Philosophy
status: done
priority: high
created: 2026-05-28
updated: 2026-05-29
owner: bbaaxx
tags: [roadmap, philosophy, architecture, ux, memory]
related_wiki: ["philosophy/core-principles","philosophy/origin-narrative","architecture/plugin-design-spec","architecture/implementation-plan","architecture/philosophy-implementation-gap-analysis","roadmap/philosophy-alignment-roadmap"]
phase: done
blockers: []
next_action: ""
---

## Objective
Analyze the gap between the current opencode-mdocs implementation and the project's newly articulated philosophy, then produce a roadmap that improves both the product/UX behavior and technical architecture so the implementation better embodies shared durable memory for a distributed single agent.

## Context
- The implementation was created before the philosophy was explicitly written.
- The current system already reflects parts of the original ideas: initiatives, wiki, workflow gates, subagent context assembly, search, audit log, and linter.
- The philosophy clarifies a stronger vision: multiple agent instances are facets of one distributed entity, with durable shared memory split between practical collaboration and stable agent-managed knowledge.
- Product/UX behavior and technical architecture must be analyzed together because they are correlated.

## Plan
- [x] Establish the baseline
  - [x] Read README Philosophy section
  - [x] Read philosophy wiki entries
  - [x] Inspect current implementation structure and original architecture docs
  - [x] Summarize current capabilities by philosophical principle
- [x] Identify gaps and opportunities
  - [x] Product/UX behavior: how agents and humans experience shared memory, handoffs, discovery, and continuity
  - [x] Technical architecture: persistence, indexing, context assembly, workflow enforcement, APIs, and extensibility
  - [x] Knowledge model: boundary between initiatives and wiki, ownership, lifecycle, and cross-linking
  - [x] Agent autonomy: where agents can manage memory freely versus where human collaboration constrains structure
- [x] Prioritize improvements
  - [x] Classify items by impact, effort, dependency, and philosophical alignment
  - [x] Separate near-term fixes from larger architectural bets
  - [x] Identify roadmap phases
- [x] Produce roadmap artifacts
  - [x] Wiki entry capturing philosophy-to-implementation gap analysis
  - [x] Wiki entry or initiative update with phased roadmap
  - [x] Update this initiative with accepted roadmap and next implementation initiatives

## Acceptance Criteria
- The gap analysis explicitly maps current implementation capabilities to each core philosophy principle.
- The roadmap covers both product/UX and technical architecture, treating them as interdependent.
- Improvement opportunities are prioritized and grouped into actionable phases.
- Follow-up implementation initiatives can be created from the roadmap without rediscovering context.

## Verification Remediation Plan
- [x] Update `templates/initiative.md` and `templates/wiki-entry.md` so newly scaffolded artifacts include v2 memory metadata fields.
- [x] Mark Phase 1 durable wiki learnings as stable by adding lifecycle/provenance metadata to `mdocs/wiki/architecture/philosophy-implementation-gap-analysis.md` and `mdocs/wiki/roadmap/philosophy-alignment-roadmap.md`.
- [x] Fix malformed frontmatter in `mdocs/initiatives/add-resume-status-cockpit--2026-05-28.md` so `updated` and `owner` are separate keys.
- [x] Check off completed plan items in the four Phase 1 sub-initiatives while preserving their progress logs and artifacts.
- [x] Rerun `npm test`, `npm run build`, `npm pack --dry-run`, and plugin `mdocs_validate`.
- [x] Request independent review again before marking this initiative done.

## Implementation Plan

# Align Implementation with Philosophy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Phase 1 philosophical coherence so a fresh agent can resume work from durable shared memory, receive richer dispatch context, and trust initiative/wiki links without rediscovering project state.

**Architecture:** Implement Phase 1 as four incremental slices that match the roadmap initiatives already created: v2 metadata, dispatch memory retrieval, resume/status cockpit, and graph linting. Keep markdown files as canonical storage; extend existing managers and tools rather than adding a database. New behavior should be exposed through existing plugin custom tools (`mdocs_status`, `mdocs_dispatch`, `mdocs_validate`, `mdocs`) plus small focused helpers in `src/`.

**Tech Stack:** TypeScript, Node.js `fs/path`, Jest, existing `InitiativeManager`, `WikiManager`, `SearchEngine`, `AuditLog`, `WorkflowEngine`, and opencode plugin tool hooks.

---

### File Structure

- Modify `src/types.ts`: add optional v2 metadata fields to `Initiative`, `WikiEntry`, `WorkflowState`, and new summary result interfaces.
- Modify `src/initiative.ts`: parse/write v2 initiative frontmatter and body sections while preserving backward compatibility.
- Modify `src/wiki.ts`: parse/write v2 wiki lifecycle/provenance metadata while preserving existing wiki files.
- Modify `src/subagent.ts`: expand context assembly into structured memory retrieval output.
- Modify `src/search.ts`: support snippet-bearing, weighted memory search results used by dispatch and status.
- Modify `src/audit.ts`: add bounded summaries for recent initiative activity.
- Modify `src/workflow.ts`: support safe workflow resume/set-active/advance state helpers used by cockpit commands.
- Modify `src/plugin.ts`: expose `mdocs_resume`, enrich `mdocs_status`, enrich `mdocs_dispatch`, and add graph validation output to `mdocs_validate`.
- Modify tests: `src/__tests__/initiative.test.ts`, `src/__tests__/wiki.test.ts`, `src/__tests__/subagent.test.ts`, `src/__tests__/search.test.ts`, `src/__tests__/workflow.test.ts`, `src/__tests__/plugin.test.ts`, `src/__tests__/linter.test.ts`.
- Update docs/skills: `skills/mdocs-workflow/SKILL.md`, `skills/mdocs-initiative/SKILL.md`, and roadmap/wiki entries under `mdocs/wiki/` after behavior lands.

### Task 1: Add v2 initiative/wiki memory metadata

**Files:**
- Modify: `src/types.ts`
- Modify: `src/initiative.ts`
- Modify: `src/wiki.ts`
- Test: `src/__tests__/initiative.test.ts`
- Test: `src/__tests__/wiki.test.ts`
- Initiative context: `mdocs/initiatives/define-v2-memory-metadata--2026-05-28.md`

- [ ] **Step 1: Write failing initiative metadata parse/write test**

Add this test to `src/__tests__/initiative.test.ts`:

```ts
test('preserves v2 initiative memory metadata and sections', () => {
  const manager = new InitiativeManager(testDir);
  const filePath = manager.create({
    id: 'memory-metadata',
    title: 'Memory Metadata',
    status: 'active',
    priority: 'high',
    created: '2026-05-29',
    updated: '2026-05-29',
    owner: 'agent',
    tags: ['memory'],
    relatedWiki: [],
    objective: 'Capture durable state for agent resume.',
    plan: [{ description: 'Add metadata', status: 'pending' }],
    progressLog: ['Created'],
    artifacts: [],
    phase: 'implementation',
    handoffSummary: 'Metadata fields are ready for the next agent.',
    openQuestions: ['Should lifecycle states be enforced?'],
    blockers: ['Need graph validation'],
    nextAction: 'Implement dispatch retrieval.'
  });

  const readBack = manager.read(path.basename(filePath));

  expect(readBack?.phase).toBe('implementation');
  expect(readBack?.handoffSummary).toContain('ready for the next agent');
  expect(readBack?.openQuestions).toEqual(['Should lifecycle states be enforced?']);
  expect(readBack?.blockers).toEqual(['Need graph validation']);
  expect(readBack?.nextAction).toBe('Implement dispatch retrieval.');
});
```

- [ ] **Step 2: Run initiative metadata test and verify RED**

Run: `npm test -- src/__tests__/initiative.test.ts -t "preserves v2 initiative memory metadata"`

Expected: FAIL because `Initiative` does not define v2 fields and `InitiativeManager` does not write/read them.

- [ ] **Step 3: Add optional initiative metadata types**

Modify `src/types.ts` `Initiative`:

```ts
  phase?: 'discovery' | 'planning' | 'implementation' | 'verification' | 'done';
  handoffSummary?: string;
  openQuestions?: string[];
  blockers?: string[];
  nextAction?: string;
```

- [ ] **Step 4: Write/read initiative metadata**

Modify `src/initiative.ts`:

```ts
    if (initiative.phase) front.phase = initiative.phase;
    if (initiative.handoffSummary) front.handoff_summary = initiative.handoffSummary;
    if (initiative.openQuestions && initiative.openQuestions.length > 0) front.open_questions = initiative.openQuestions;
    if (initiative.blockers && initiative.blockers.length > 0) front.blockers = initiative.blockers;
    if (initiative.nextAction) front.next_action = initiative.nextAction;
```

and return parsed fields:

```ts
      phase: front.phase || undefined,
      handoffSummary: front.handoff_summary || undefined,
      openQuestions: Array.isArray(front.open_questions) ? front.open_questions : undefined,
      blockers: Array.isArray(front.blockers) ? front.blockers : undefined,
      nextAction: front.next_action || undefined
```

- [ ] **Step 5: Write failing wiki metadata parse/write test**

Add this test to `src/__tests__/wiki.test.ts`:

```ts
test('preserves v2 wiki lifecycle and provenance metadata', () => {
  const manager = new WikiManager(testDir);
  const filePath = manager.create({
    id: 'dispatch-memory',
    title: 'Dispatch Memory',
    category: 'architecture',
    created: '2026-05-29',
    updated: '2026-05-29',
    relatedInitiatives: ['upgrade-dispatch-memory-retrieval'],
    tags: ['memory'],
    content: 'Dispatch should behave like memory retrieval.',
    lifecycle: 'stable',
    knowledgeType: 'architecture',
    confidence: 'high',
    sourceInitiatives: ['align-implementation-with-philosophy'],
    supersedes: []
  });

  const readBack = manager.read('architecture', path.basename(filePath, '.md'));

  expect(readBack?.lifecycle).toBe('stable');
  expect(readBack?.knowledgeType).toBe('architecture');
  expect(readBack?.confidence).toBe('high');
  expect(readBack?.sourceInitiatives).toEqual(['align-implementation-with-philosophy']);
});
```

- [ ] **Step 6: Run wiki metadata test and verify RED**

Run: `npm test -- src/__tests__/wiki.test.ts -t "preserves v2 wiki lifecycle"`

Expected: FAIL because `WikiEntry` does not define v2 fields and `WikiManager` does not write/read them.

- [ ] **Step 7: Add optional wiki metadata types and parsing**

Modify `src/types.ts` `WikiEntry`:

```ts
  lifecycle?: 'draft' | 'stable' | 'superseded' | 'needs-review';
  knowledgeType?: 'architecture' | 'decision' | 'how-to' | 'reference' | 'roadmap' | 'note';
  confidence?: 'low' | 'medium' | 'high';
  sourceInitiatives?: string[];
  supersedes?: string[];
```

Modify `src/wiki.ts` frontmatter and parse return to preserve these fields using snake_case keys: `lifecycle`, `knowledge_type`, `confidence`, `source_initiatives`, `supersedes`.

- [ ] **Step 8: Verify Task 1 GREEN and commit**

Run:

```bash
npm test -- src/__tests__/initiative.test.ts src/__tests__/wiki.test.ts
npm test
npm run build
git add src/types.ts src/initiative.ts src/wiki.ts src/__tests__/initiative.test.ts src/__tests__/wiki.test.ts mdocs/initiatives/define-v2-memory-metadata--2026-05-28.md
git commit -m "feat: add mdocs memory metadata"
```

Expected: focused tests pass, full test suite passes, TypeScript build passes, and the metadata initiative progress log records RED/GREEN evidence.

### Task 2: Upgrade dispatch into memory retrieval assembly

**Files:**
- Modify: `src/types.ts`
- Modify: `src/search.ts`
- Modify: `src/audit.ts`
- Modify: `src/subagent.ts`
- Modify: `src/plugin.ts`
- Test: `src/__tests__/search.test.ts`
- Test: `src/__tests__/subagent.test.ts`
- Test: `src/__tests__/plugin.test.ts`
- Initiative context: `mdocs/initiatives/upgrade-dispatch-memory-retrieval--2026-05-28.md`

- [ ] **Step 1: Write failing search snippet test**

Add to `src/__tests__/search.test.ts`:

```ts
test('query includes snippets and matched field for memory retrieval', () => {
  const wiki = new WikiManager(testDir);
  wiki.create({
    id: 'durable-memory',
    title: 'Durable Memory',
    category: 'architecture',
    created: '2026-05-29',
    updated: '2026-05-29',
    relatedInitiatives: [],
    tags: ['memory'],
    content: 'Durable memory retrieval should include snippets for fresh agents.'
  });
  const search = new SearchEngine(testDir);
  const results = search.query('durable memory');

  expect(results[0]).toEqual(expect.objectContaining({
    id: expect.any(String),
    title: expect.any(String),
    score: expect.any(Number),
    snippet: expect.any(String),
    matchedFields: expect.arrayContaining([expect.any(String)])
  }));
});
```

- [ ] **Step 2: Run search snippet test and verify RED**

Run: `npm test -- src/__tests__/search.test.ts -t "query includes snippets"`

Expected: FAIL because `SearchResult` has no `snippet` or `matchedFields`.

- [ ] **Step 3: Extend `SearchResult` and search indexing**

Modify `src/types.ts`:

```ts
export interface SearchResult {
  type: 'initiative' | 'wiki';
  id: string;
  title: string;
  score: number;
  snippet?: string;
  matchedFields?: string[];
}
```

Modify `src/search.ts` to keep the best matching field and snippet per document. Snippet can be the first 180 characters of the highest-scoring matched field with whitespace collapsed.

- [ ] **Step 4: Write failing subagent enriched context test**

Add to `src/__tests__/subagent.test.ts`:

```ts
test('assemble includes progress, artifacts, handoff, blockers, and retrieved memory', () => {
  const assembler = new SubagentAssembler();
  const initiative: Initiative = {
    id: 'dispatch', title: 'Dispatch', status: 'active', priority: 'high',
    created: '2026-05-29', updated: '2026-05-29', owner: 'agent',
    tags: ['memory'], relatedWiki: [], objective: 'Improve dispatch memory.',
    plan: [{ description: 'Add retrieval', status: 'pending' }],
    progressLog: ['Baseline captured'], artifacts: ['src/subagent.ts'],
    handoffSummary: 'Dispatch needs richer continuity.',
    blockers: ['Search lacks snippets'],
    nextAction: 'Add search-ranked context.'
  };
  const wiki: WikiEntry[] = [];
  const context = assembler.assemble(initiative, wiki, 'EXECUTE', {
    retrievedMemory: [{ type: 'wiki', id: 'architecture/memory', title: 'Memory', score: 4, snippet: 'Durable memory context', matchedFields: ['content'] }],
    recentEvents: [{ timestamp: '2026-05-29T00:00:00.000Z', type: 'tool', step: 'PLAN', details: { toolName: 'read' } }]
  });

  expect(context).toContain('## Handoff Summary');
  expect(context).toContain('Dispatch needs richer continuity.');
  expect(context).toContain('## Blockers');
  expect(context).toContain('Search lacks snippets');
  expect(context).toContain('## Retrieved Memory');
  expect(context).toContain('Durable memory context');
  expect(context).toContain('## Recent Activity');
  expect(context).toContain('read');
});
```

- [ ] **Step 5: Run subagent enriched context test and verify RED**

Run: `npm test -- src/__tests__/subagent.test.ts -t "assemble includes progress"`

Expected: FAIL because `SubagentAssembler.assemble()` only accepts three arguments and omits memory sections.

- [ ] **Step 6: Add assembly options and richer sections**

Modify `src/subagent.ts` signature:

```ts
  assemble(
    initiative: Initiative,
    wikiEntries: WikiEntry[],
    currentStep: StepName,
    options: { retrievedMemory?: SearchResult[]; recentEvents?: AuditEvent[] } = {}
  ): string
```

Add sections in this order after `## Plan`: `## Handoff Summary`, `## Next Action`, `## Blockers`, `## Progress Log`, `## Artifacts`, `## Retrieved Memory`, `## Related Wiki`, `## Recent Activity`, then `## Current Step`.

- [ ] **Step 7: Write failing `mdocs_dispatch` retrieval integration test**

Add to `src/__tests__/plugin.test.ts`:

```ts
test('mdocs_dispatch includes search-ranked memory and recent audit events', async () => {
  const plugin = createPlugin(testDir);
  await (plugin as any).tool.mdocs_init.execute();
  const initDir = path.join(testDir, 'mdocs', 'initiatives');
  fs.writeFileSync(path.join(initDir, 'dispatch--2026-05-29.md'), `---
id: "dispatch"
title: "Dispatch Memory"
status: "active"
created: "2026-05-29"
updated: "2026-05-29"
owner: "agent"
tags: ["memory"]
related_wiki: []
---

## Objective
Improve durable memory retrieval.

## Plan
- [ ] Add retrieval

## Progress Log
- Baseline captured

## Artifacts
- src/subagent.ts
`, 'utf8');
  const wikiDir = path.join(testDir, 'mdocs', 'wiki', 'architecture');
  fs.mkdirSync(wikiDir, { recursive: true });
  fs.writeFileSync(path.join(wikiDir, 'durable-memory.md'), `---
id: "durable-memory"
title: "Durable Memory"
category: "architecture"
created: "2026-05-29"
updated: "2026-05-29"
related_initiatives: ["dispatch"]
tags: ["memory"]
---

Durable memory retrieval should include snippets for fresh agents.
`, 'utf8');
  await (plugin as any)['tool.execute.after']({ name: 'read', args: { filePath: 'src/subagent.ts' } }, {});

  const result = await (plugin as any).tool.mdocs_dispatch.execute({ initiativeId: 'dispatch' });

  expect(result.context).toContain('## Retrieved Memory');
  expect(result.context).toContain('Durable Memory');
  expect(result.context).toContain('## Recent Activity');
});
```

- [ ] **Step 8: Run dispatch integration test and verify RED**

Run: `npm test -- src/__tests__/plugin.test.ts -t "mdocs_dispatch includes search-ranked memory"`

Expected: FAIL because plugin dispatch does not query search or audit summaries.

- [ ] **Step 9: Enrich `mdocs_dispatch`**

Modify `src/plugin.ts` dispatch to:

```ts
const retrievedMemory = search.query(`${initiative.title} ${initiative.objective} ${initiative.tags.join(' ')}`).slice(0, 5);
const recentEvents = audit.query({ initiativeId: initiative.id, limit: 5 });
const context = assembler.assemble(initiative, wikiEntries, currentStep, { retrievedMemory, recentEvents });
```

Keep dispatch retrieval unfiltered by status so wiki entries can appear alongside initiatives. Preserve the existing `SearchEngine.query(..., { status })` behavior for callers that explicitly request status filtering.

- [ ] **Step 10: Verify Task 2 GREEN and commit**

Run:

```bash
npm test -- src/__tests__/search.test.ts src/__tests__/subagent.test.ts src/__tests__/plugin.test.ts
npm test
npm run build
git add src/types.ts src/search.ts src/audit.ts src/subagent.ts src/plugin.ts src/__tests__/search.test.ts src/__tests__/subagent.test.ts src/__tests__/plugin.test.ts mdocs/initiatives/upgrade-dispatch-memory-retrieval--2026-05-28.md
git commit -m "feat: enrich dispatch memory retrieval"
```

Expected: focused tests pass, full test suite passes, TypeScript build passes, and the dispatch initiative progress log records RED/GREEN evidence.

### Task 3: Add resume/status cockpit

**Files:**
- Modify: `src/types.ts`
- Modify: `src/workflow.ts`
- Modify: `src/plugin.ts`
- Test: `src/__tests__/workflow.test.ts`
- Test: `src/__tests__/plugin.test.ts`
- Initiative context: `mdocs/initiatives/add-resume-status-cockpit--2026-05-28.md`

- [ ] **Step 1: Write failing workflow control test**

Add to `src/__tests__/workflow.test.ts`:

```ts
test('can set active initiative and reset workflow for resume', () => {
  const workflow = new WorkflowEngine(testDir);

  workflow.setActiveInitiative('dispatch');
  workflow.resumeAt('CONTEXT');

  expect(workflow.status().activeInitiative).toBe('dispatch');
  expect(workflow.status().currentStep).toBe('CONTEXT');
  expect(workflow.status().stepHistory.at(-1)?.step).toBe('CONTEXT');
});
```

- [ ] **Step 2: Run workflow control test and verify RED**

Run: `npm test -- src/__tests__/workflow.test.ts -t "set active initiative"`

Expected: FAIL because `WorkflowEngine` has no `setActiveInitiative()` or `resumeAt()`.

- [ ] **Step 3: Add workflow control methods**

Modify `src/workflow.ts`:

```ts
  setActiveInitiative(initiativeId: string | null): void {
    this.state.activeInitiative = initiativeId;
    this.save();
  }

  resumeAt(step: StepName): void {
    this.state.currentStep = step;
    this.state.stepHistory.push({ step, timestamp: new Date().toISOString() });
    this.save();
  }
```

- [ ] **Step 4: Write failing `mdocs_resume` test**

Add to `src/__tests__/plugin.test.ts`:

```ts
test('mdocs_resume returns next action, blockers, latest progress, and validation', async () => {
  const plugin = createPlugin(testDir);
  await (plugin as any).tool.mdocs_init.execute();
  const initDir = path.join(testDir, 'mdocs', 'initiatives');
  fs.writeFileSync(path.join(initDir, 'resume--2026-05-29.md'), `---
id: "resume"
title: "Resume Cockpit"
status: "active"
created: "2026-05-29"
updated: "2026-05-29"
owner: "agent"
tags: ["resume"]
related_wiki: []
next_action: "Continue with dispatch retrieval."
blockers: ["Need metadata"]
---

## Objective
Help fresh agents resume.

## Plan
- [ ] Add cockpit

## Progress Log
- Baseline captured
- Metadata added

## Artifacts
`, 'utf8');

  const result = await (plugin as any).tool.mdocs_resume.execute({ initiativeId: 'resume' });

  expect(result.initiative.id).toBe('resume');
  expect(result.nextAction).toBe('Continue with dispatch retrieval.');
  expect(result.blockers).toEqual(['Need metadata']);
  expect(result.latestProgress).toBe('Metadata added');
  expect(result.validation).toBeDefined();
});
```

- [ ] **Step 5: Run resume test and verify RED**

Run: `npm test -- src/__tests__/plugin.test.ts -t "mdocs_resume returns next action"`

Expected: FAIL because `mdocs_resume` is not exposed.

- [ ] **Step 6: Implement `mdocs_resume` and enrich `mdocs_status`**

Modify `src/plugin.ts` custom tools:

```ts
      mdocs_resume: {
        description: "Resume active or specified initiative with next action and validation",
        execute: async (args: { initiativeId?: string }) => {
          const initiativeId = args?.initiativeId || workflow.status().activeInitiative;
          if (!initiativeId) return { error: 'No initiativeId provided and no active initiative' };
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
        }
      }
```

Also add `resume` to `mdocs_status` response with the same fields for the active initiative.

- [ ] **Step 7: Verify Task 3 GREEN and commit**

Run:

```bash
npm test -- src/__tests__/workflow.test.ts src/__tests__/plugin.test.ts
npm test
npm run build
git add src/types.ts src/workflow.ts src/plugin.ts src/__tests__/workflow.test.ts src/__tests__/plugin.test.ts mdocs/initiatives/add-resume-status-cockpit--2026-05-28.md
git commit -m "feat: add mdocs resume cockpit"
```

Expected: focused tests pass, full test suite passes, TypeScript build passes, and the resume initiative progress log records RED/GREEN evidence.

### Task 4: Add cross-link graph linter and completion gates

**Files:**
- Modify: `src/types.ts`
- Modify: `src/linter.ts`
- Modify: `src/plugin.ts`
- Test: `src/__tests__/linter.test.ts`
- Test: `src/__tests__/plugin.test.ts`
- Initiative context: `mdocs/initiatives/add-cross-link-graph-linter--2026-05-28.md`

- [ ] **Step 1: Write failing linter graph test**

Add to `src/__tests__/linter.test.ts`:

```ts
test('lintAll reports broken wiki backlinks and missing completion memory', () => {
  const initiativesDir = path.join(testDir, 'initiatives');
  const wikiDir = path.join(testDir, 'wiki', 'architecture');
  fs.mkdirSync(initiativesDir, { recursive: true });
  fs.mkdirSync(wikiDir, { recursive: true });
  fs.writeFileSync(path.join(initiativesDir, 'done--2026-05-29.md'), `---
id: "done"
title: "Done Initiative"
status: "done"
created: "2026-05-29"
updated: "2026-05-29"
tags: ["memory"]
related_wiki: ["architecture/decision"]
---

## Objective
Capture durable memory after completion.

## Plan
- [x] Finish work

## Progress Log
- Done

## Artifacts
`, 'utf8');
  fs.writeFileSync(path.join(wikiDir, 'decision.md'), `---
id: "decision"
title: "Decision"
category: "architecture"
created: "2026-05-29"
updated: "2026-05-29"
related_initiatives: []
tags: ["memory"]
---

This decision should link back to the initiative.
`, 'utf8');

  const linter = new MdocsLinter(testDir);
  const messages = linter.lintAll().flatMap(r => r.issues.map(i => i.message));

  expect(messages).toEqual(expect.arrayContaining([
    expect.stringContaining('Wiki architecture/decision missing backlink to initiative done'),
    expect.stringContaining('Done initiative done has no stable wiki learning')
  ]));
});
```

- [ ] **Step 2: Run graph linter test and verify RED**

Run: `npm test -- src/__tests__/linter.test.ts -t "broken wiki backlinks"`

Expected: FAIL because `MdocsLinter` only lints individual files and does not check graph relationships.

- [ ] **Step 3: Add graph lint pass**

Modify `src/linter.ts` `lintAll()` to append graph-level issues after file linting:

```ts
    results.push(...this.lintGraph());
```

Add private helpers that read initiative `related_wiki`, wiki `related_initiatives`, and flag:

- initiative `related_wiki` points to missing wiki file;
- wiki `related_initiatives` points to missing initiative id;
- initiative references wiki but wiki lacks backlink;
- done initiative has no related wiki entry whose frontmatter includes `lifecycle: "stable"` or `lifecycle: stable`.

Represent graph issues as `LintResult` objects with `file: 'GRAPH'`, `type: 'initiative'`, `score: 0`, `passed: false`.

- [ ] **Step 4: Write failing `mdocs_validate` graph output test**

Add to `src/__tests__/plugin.test.ts`:

```ts
test('mdocs_validate includes graph lint results', async () => {
  const plugin = createPlugin(testDir);
  await (plugin as any).tool.mdocs_init.execute();

  const result = await (plugin as any).tool.mdocs_validate.execute();

  expect(result.graph).toBeDefined();
  expect(result.graph.results).toEqual(expect.any(Array));
});
```

- [ ] **Step 5: Run graph validation test and verify RED**

Run: `npm test -- src/__tests__/plugin.test.ts -t "mdocs_validate includes graph"`

Expected: FAIL because `mdocs_validate` returns only initiative/wiki validation.

- [ ] **Step 6: Add graph validation to plugin**

Modify `validationResult()` in `src/plugin.ts`:

```ts
      const graphResults = new MdocsLinter(mdocsRoot).lintAll();
      const graphErrors = graphResults.flatMap(r => r.issues.filter(i => i.severity === 'error').map(i => `${r.file}: ${i.message}`));
      const graphWarnings = graphResults.flatMap(r => r.issues.filter(i => i.severity !== 'error').map(i => `${r.file}: ${i.message}`));
```

Return:

```ts
        graph: { valid: graphErrors.length === 0, errors: graphErrors, warnings: graphWarnings, results: graphResults },
        valid: initiativeValidation.valid && wikiValidation.valid && graphErrors.length === 0
```

- [ ] **Step 7: Verify Task 4 GREEN and commit**

Run:

```bash
npm test -- src/__tests__/linter.test.ts src/__tests__/plugin.test.ts
npm test
npm run build
git add src/types.ts src/linter.ts src/plugin.ts src/__tests__/linter.test.ts src/__tests__/plugin.test.ts mdocs/initiatives/add-cross-link-graph-linter--2026-05-28.md
git commit -m "feat: lint mdocs memory graph"
```

Expected: focused tests pass, full test suite passes, TypeScript build passes, and the graph-linter initiative progress log records RED/GREEN evidence.

### Task 5: Update skills and durable roadmap documentation

**Files:**
- Modify: `skills/mdocs-workflow/SKILL.md`
- Modify: `skills/mdocs-initiative/SKILL.md`
- Modify: `mdocs/wiki/architecture/philosophy-implementation-gap-analysis.md`
- Modify: `mdocs/wiki/roadmap/philosophy-alignment-roadmap.md`
- Modify: `mdocs/initiatives/align-implementation-with-philosophy--2026-05-28.md`
- Test: `npm test`

- [ ] **Step 1: Update workflow skill with resume and validation rules**

In `skills/mdocs-workflow/SKILL.md`, update the workflow overview so CONTEXT starts with `mdocs_resume` or `mdocs_status`, EXECUTE uses enriched `mdocs_dispatch`, VERIFY runs `mdocs_validate`, and REPORT captures stable learnings in wiki entries for done initiatives.

- [ ] **Step 2: Update initiative skill with v2 fields**

In `skills/mdocs-initiative/SKILL.md`, add the optional frontmatter keys `phase`, `handoff_summary`, `open_questions`, `blockers`, and `next_action`; document that done initiatives should link at least one stable wiki learning when the work produced durable knowledge.

- [ ] **Step 3: Update roadmap wiki with implemented Phase 1 evidence**

In `mdocs/wiki/roadmap/philosophy-alignment-roadmap.md`, append a `## Phase 1 Implementation Notes` section listing the exact commits from Tasks 1-4 and the verification command outputs.

- [ ] **Step 4: Update gap analysis wiki with closed gaps**

In `mdocs/wiki/architecture/philosophy-implementation-gap-analysis.md`, append a `## Phase 1 Gap Closure` section mapping: resume cockpit closes resume UX gap, enriched dispatch closes thin context gap, v2 metadata closes memory semantics gap, graph linter closes weak cross-link validation gap.

- [ ] **Step 5: Mark implementation initiatives complete**

For each Phase 1 initiative file, set `status: done`, check completed plan items, add progress log evidence, and keep deferred Phase 2 items in the roadmap rather than in the completed initiative.

- [ ] **Step 6: Verify docs-only task and commit**

Run:

```bash
npm test
npm run build
git add skills/mdocs-workflow/SKILL.md skills/mdocs-initiative/SKILL.md mdocs/wiki/architecture/philosophy-implementation-gap-analysis.md mdocs/wiki/roadmap/philosophy-alignment-roadmap.md mdocs/initiatives/align-implementation-with-philosophy--2026-05-28.md mdocs/initiatives/define-v2-memory-metadata--2026-05-28.md mdocs/initiatives/upgrade-dispatch-memory-retrieval--2026-05-28.md mdocs/initiatives/add-resume-status-cockpit--2026-05-28.md mdocs/initiatives/add-cross-link-graph-linter--2026-05-28.md
git commit -m "docs: capture phase one memory alignment"
```

Expected: tests and build pass, skill docs describe new workflow behavior, and roadmap/gap-analysis wiki entries preserve the durable knowledge created by implementation.

### Final Verification

- [ ] Run `npm test` and confirm all Jest suites pass.
- [ ] Run `npm run build` and confirm TypeScript compiles.
- [ ] Run `npm pack --dry-run` and confirm package includes `dist`, `skills`, `agents`, `templates`, `README.md`, `CHANGELOG.md`, `LICENSE`, `package.json`, and current mdocs artifacts intended for release.
- [ ] Run `git status --short` and confirm only intended release/initiative files remain changed.
- [ ] Run `git log --oneline -10` and confirm the Phase 1 commits are present in order.
- [ ] Request final code review for the branch against `main`.
- [ ] If review approves, mark `align-implementation-with-philosophy` as `done` and create a PR.

### Plan Self-Review

- Spec coverage: the plan maps directly to the four Phase 1 roadmap initiatives and the high-leverage gaps: resume UX, dispatch retrieval, memory semantics, and graph integrity.
- Placeholder scan: no task contains undefined placeholders; every task has explicit files, test commands, expected RED/GREEN outcomes, and commit messages.
- Type consistency: new fields are optional so existing markdown remains backward compatible; `SearchResult`, `Initiative`, and `WikiEntry` extensions are used consistently by search, dispatch, status, and validation.

## Progress Log
- [2026-05-28] Created initiative after reviewing philosophy docs and confirming roadmap should cover both product/UX behavior and technical architecture.
- [2026-05-28] Analyzed product/UX, technical architecture, and knowledge-model gaps in parallel.
- [2026-05-28] Selected dual-track roadmap approach: experience/product behavior plus memory architecture.
- [2026-05-28] Created design spec, gap analysis wiki entry, and phased roadmap wiki entry.
- [2026-05-28] Converted Phase 1 roadmap into four implementation initiatives: dispatch retrieval, resume/status cockpit, v2 memory metadata, and cross-link graph linter.
- [2026-05-29] Added a detailed implementation plan directly to this initiative file. The plan sequences Phase 1 as v2 metadata, dispatch memory retrieval, resume/status cockpit, cross-link graph linting, and documentation capture with TDD verification at each step.
- [2026-05-29] **Phase 1 implementation complete.** All 5 tasks executed with TDD (RED/GREEN evidence for each), 9 new tests added (113 → 122), TypeScript build passes, npm pack succeeds. Commits: feat: add mdocs memory metadata, feat: enrich dispatch memory retrieval, feat: add mdocs resume cockpit, feat: lint mdocs memory graph, docs: capture phase one memory alignment. All four Phase 1 sub-initiatives marked done.
- [2026-05-29] Verification reopened initiative as active. Fresh evidence: `npm test` passed 11 suites / 137 tests, `npm run build` passed, `npm pack --dry-run` succeeded, and plugin `mdocs_validate` returned `valid: true` with warnings. Independent review found blocking completion issues in durable artifacts: templates missing v2 metadata, stable wiki lifecycle metadata missing for Phase 1 learnings, malformed `add-resume-status-cockpit` frontmatter, and unchecked Phase 1 sub-initiative plans despite `status: done`.
- [2026-05-29] Remediated verification blockers: templates now include v2 metadata, Phase 1 wiki learnings are marked `lifecycle: stable`, malformed resume-cockpit frontmatter is fixed, and the four Phase 1 sub-initiative plans are checked off. Verification evidence: `npm test` passed 11 suites / 137 tests, `npm run build` passed, `npm pack --dry-run` succeeded, and plugin `mdocs_validate` returned `valid: true` with no errors and no Phase 1 stable-learning warnings.
- [2026-05-29] Independent remediation review passed with no blocking issues. Marked initiative done after confirming the review checklist, stable wiki metadata, corrected frontmatter, and checked Phase 1 sub-initiative plans.

## Artifacts
- `mdocs/initiatives/align-implementation-with-philosophy--2026-05-28.md` — this initiative
- `docs/superpowers/specs/2026-05-28-philosophy-alignment-roadmap-design.md` — approved roadmap design
- `mdocs/wiki/architecture/philosophy-implementation-gap-analysis.md` — philosophy-to-implementation gap analysis
- `mdocs/wiki/roadmap/philosophy-alignment-roadmap.md` — phased dual-track roadmap
- `mdocs/initiatives/upgrade-dispatch-memory-retrieval--2026-05-28.md` — Phase 1 implementation initiative
- `mdocs/initiatives/add-resume-status-cockpit--2026-05-28.md` — Phase 1 implementation initiative
- `mdocs/initiatives/define-v2-memory-metadata--2026-05-28.md` — Phase 1 implementation initiative
- `mdocs/initiatives/add-cross-link-graph-linter--2026-05-28.md` — Phase 1 implementation initiative
