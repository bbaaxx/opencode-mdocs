import * as fs from 'fs';
import * as path from 'path';
import { Initiative } from './types';

export class InitiativeManager {
  private dir: string;

  constructor(baseDir: string) {
    this.dir = path.join(baseDir, 'initiatives');
    fs.mkdirSync(this.dir, { recursive: true });
  }

  private slugify(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  private formatFileName(initiative: Initiative): string {
    const slug = this.slugify(initiative.title);
    return `${slug}--${initiative.created}.md`;
  }

  private toFrontmatter(initiative: Initiative): string {
    // Note: YAML frontmatter uses snake_case
    const front = {
      id: initiative.id,
      title: initiative.title,
      status: initiative.status,
      created: initiative.created,
      updated: initiative.updated,
      owner: initiative.owner,
      tags: initiative.tags,
      related_wiki: initiative.relatedWiki,
    };
    return `---\n${Object.entries(front).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n')}\n---\n\n`;
  }

  create(initiative: Initiative): string {
    const fileName = this.formatFileName(initiative);
    const filePath = path.join(this.dir, fileName);
    const content = this.toFrontmatter(initiative) +
      `## Objective\n${initiative.objective}\n\n` +
      `## Plan\n${initiative.plan.map(p => `- ${p}`).join('\n')}\n\n` +
      `## Progress Log\n${initiative.progressLog.map(l => `- ${l}`).join('\n')}\n\n` +
      `## Artifacts\n${initiative.artifacts.map(a => `- ${a}`).join('\n')}`;

    fs.writeFileSync(filePath, content, 'utf8');
    this.updateIndex();
    return filePath;
  }

  read(fileName: string): Initiative | null {
    const filePath = path.join(this.dir, fileName);
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    return this.parseInitiative(content, fileName);
  }

  private parseInitiative(content: string, fileName: string): Initiative {
    const match = content.match(/---\n([\s\S]*?)\n---/);
    if (!match) throw new Error(`Invalid initiative format: ${fileName}`);
    
    // Parse YAML frontmatter (simplified - keys are snake_case)
    const front: Record<string, any> = {};
    for (const line of match[1].split('\n')) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        try {
          front[key.trim()] = JSON.parse(value);
        } catch {
          front[key.trim()] = value;
        }
      }
    }

    return {
      id: front.id || '',
      title: front.title || '',
      status: front.status || 'active',
      created: front.created || '',
      updated: front.updated || '',
      owner: front.owner || '',
      tags: front.tags || [],
      relatedWiki: front.related_wiki || [],
      objective: '',
      plan: [],
      progressLog: [],
      artifacts: []
    };
  }

  findRelated(queryTags: string[]): Initiative[] {
    const files = fs.readdirSync(this.dir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
    const initiatives = files.map(f => this.read(f)).filter(Boolean) as Initiative[];
    return initiatives.filter(i => i.tags.some(t => queryTags.includes(t)));
  }

  private updateIndex(): void {
    const files = fs.readdirSync(this.dir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
    const initiatives = files.map(f => this.read(f)).filter(Boolean) as Initiative[];
    const lines = initiatives.map(i => `- **${i.title}** (${i.status}) — ${i.created} — [${i.tags.join(', ')}]`);
    const index = `# Initiatives\n\n${lines.join('\n') || 'No initiatives yet.'}`;
    fs.writeFileSync(path.join(this.dir, 'INDEX.md'), index, 'utf8');
  }
}
