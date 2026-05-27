import * as fs from 'fs';
import * as path from 'path';
import { WikiEntry } from './types';

export class WikiManager {
  private dir: string;

  constructor(baseDir: string) {
    this.dir = path.join(baseDir, 'wiki');
    fs.mkdirSync(this.dir, { recursive: true });
  }

  private toFrontmatter(entry: WikiEntry): string {
    const front = {
      id: entry.id,
      title: entry.title,
      category: entry.category,
      created: entry.created,
      updated: entry.updated,
      related_initiatives: entry.relatedInitiatives,
      tags: entry.tags,
    };
    return `---\n${Object.entries(front).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n')}\n---\n\n`;
  }

  private sanitizeName(name: string): string {
    const base = path.basename(name);
    if (!base || base === '.' || base === '..') {
      throw new Error(`Invalid name: ${name}`);
    }
    return base;
  }

  create(entry: WikiEntry): string {
    const category = this.sanitizeName(entry.category);
    const id = this.sanitizeName(entry.id);
    const categoryDir = path.join(this.dir, category);
    fs.mkdirSync(categoryDir, { recursive: true });
    const filePath = path.join(categoryDir, `${id}.md`);
    const content = this.toFrontmatter(entry) + entry.content;
    fs.writeFileSync(filePath, content, 'utf8');
    this.updateIndices();
    return filePath;
  }

  read(category: string, id: string): WikiEntry | null {
    const cat = this.sanitizeName(category);
    const entryId = this.sanitizeName(id);
    const filePath = path.join(this.dir, cat, `${entryId}.md`);
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    return this.parseWikiEntry(content);
  }

  private parseWikiEntry(content: string): WikiEntry {
    const match = content.match(/---\n([\s\S]*?)\n---/);
    if (!match) throw new Error('Invalid wiki entry format');

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

    const body = content.replace(/---\n[\s\S]*?\n---/, '').trim();

    return {
      id: front.id || '',
      title: front.title || '',
      category: front.category || '',
      created: front.created || '',
      updated: front.updated || '',
      relatedInitiatives: Array.isArray(front.related_initiatives) ? front.related_initiatives : [],
      tags: Array.isArray(front.tags) ? front.tags : [],
      content: body
    };
  }

  update(category: string, id: string, entry: WikiEntry): string {
    const cat = this.sanitizeName(category);
    const entryId = this.sanitizeName(id);
    const filePath = path.join(this.dir, cat, `${entryId}.md`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Wiki entry not found: ${cat}/${entryId}`);
    }

    entry.updated = new Date().toISOString().split('T')[0];
    const content = this.toFrontmatter(entry) + entry.content;
    fs.writeFileSync(filePath, content, 'utf8');
    this.updateIndices();
    return filePath;
  }

  delete(category: string, id: string): void {
    const cat = this.sanitizeName(category);
    const entryId = this.sanitizeName(id);
    const filePath = path.join(this.dir, cat, `${entryId}.md`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      this.updateIndices();
    }
  }

  findRelated(queryTags: string[]): WikiEntry[] {
    const categories = fs.readdirSync(this.dir)
      .filter(f => fs.statSync(path.join(this.dir, f)).isDirectory());

    const results: WikiEntry[] = [];
    for (const category of categories) {
      const catDir = path.join(this.dir, category);
      const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
      for (const f of files) {
        try {
          const content = fs.readFileSync(path.join(catDir, f), 'utf8');
          const entry = this.parseWikiEntry(content);
          if (entry.tags.some(t => queryTags.includes(t))) {
            results.push(entry);
          }
        } catch {
          // Skip malformed files
        }
      }
    }
    return results;
  }

  private updateIndices(): void {
    const categories = fs.readdirSync(this.dir)
      .filter(f => fs.statSync(path.join(this.dir, f)).isDirectory());

    // Per-category indices
    for (const category of categories) {
      const catDir = path.join(this.dir, category);
      const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
      const lines = files.map(f => {
        const content = fs.readFileSync(path.join(catDir, f), 'utf8');
        const frontmatterMatch = content.match(/---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
          const titleMatch = frontmatterMatch[1].match(/title: "([^"]+)"/);
          if (titleMatch) return `- ${titleMatch[1]}`;
          // Try without quotes
          const unquotedMatch = frontmatterMatch[1].match(/title: (.+)/);
          if (unquotedMatch) return `- ${unquotedMatch[1].trim()}`;
        }
        return `- ${f.replace('.md', '')}`;
      });
      const index = `# ${category}\n\n${lines.join('\n') || 'No entries yet.'}`;
      fs.writeFileSync(path.join(catDir, 'INDEX.md'), index, 'utf8');
    }

    // Root wiki index
    const catLines = categories.map(c => `- [${c}](${c}/INDEX.md)`);
    const rootIndex = `# Wiki\n\n## Categories\n\n${catLines.join('\n')}`;
    fs.writeFileSync(path.join(this.dir, 'INDEX.md'), rootIndex, 'utf8');
  }
}
