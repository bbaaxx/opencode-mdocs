import * as fs from 'fs';
import * as path from 'path';
import { Initiative } from './types';

function parseSection(content: string, sectionName: string): string {
  const escaped = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = content.match(new RegExp(`## ${escaped}\\n([\\s\\S]*?)(?=\\n## |$)`));
  return match ? match[1].trim() : '';
}

function parseListSection(content: string, sectionName: string): string[] {
  const section = parseSection(content, sectionName);
  return section.split('\n').filter(line => line.trim().startsWith('- ')).map(line => line.replace(/^- /, '').trim());
}

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

  private sanitizeFileName(fileName: string): string {
    const base = path.basename(fileName);
    if (!base || base === '.' || base === '..') {
      return 'invalid.md'; // Return a safe fallback that won't match real files
    }
    return base;
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

    if (fs.existsSync(filePath)) {
      throw new Error(`Initiative file already exists: ${fileName}`);
    }

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
    const sanitized = this.sanitizeFileName(fileName);
    const filePath = path.join(this.dir, sanitized);
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

    // Extract markdown body after frontmatter
    const body = content.replace(/---\n[\s\S]*?\n---/, '').trim();

    return {
      id: front.id || '',
      title: front.title || '',
      status: front.status || 'active',
      created: front.created || '',
      updated: front.updated || '',
      owner: front.owner || '',
      tags: Array.isArray(front.tags) ? front.tags : [],
      relatedWiki: Array.isArray(front.related_wiki) ? front.related_wiki : [],
      // Parse markdown sections
      objective: parseSection(body, 'Objective'),
      plan: parseListSection(body, 'Plan'),
      progressLog: parseListSection(body, 'Progress Log'),
      artifacts: parseListSection(body, 'Artifacts')
    };
  }

  update(fileName: string, initiative: Initiative): string {
    const sanitized = this.sanitizeFileName(fileName);
    // Delete old file if name changed
    const oldPath = path.join(this.dir, sanitized);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
    return this.create(initiative);
  }

  delete(fileName: string): void {
    const sanitized = this.sanitizeFileName(fileName);
    const filePath = path.join(this.dir, sanitized);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      this.updateIndex();
    }
  }

  findRelated(queryTags: string[]): Initiative[] {
    const files = fs.readdirSync(this.dir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
    const initiatives: Initiative[] = [];
    for (const f of files) {
      try {
        const init = this.read(f);
        if (init) initiatives.push(init);
      } catch {
        // Skip malformed files
      }
    }
    return initiatives.filter(i => i.tags.some(t => queryTags.includes(t)));
  }

  private updateIndex(): void {
    const files = fs.readdirSync(this.dir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
    const initiatives: Initiative[] = [];
    for (const f of files) {
      try {
        const init = this.read(f);
        if (init) initiatives.push(init);
      } catch {
        // Skip malformed files
      }
    }
    const lines = initiatives.map(i => `- **${i.title}** (${i.status}) — ${i.created} — [${i.tags.join(', ')}]`);
    const index = `# Initiatives\n\n${lines.join('\n') || 'No initiatives yet.'}`;
    fs.writeFileSync(path.join(this.dir, 'INDEX.md'), index, 'utf8');
  }
}
