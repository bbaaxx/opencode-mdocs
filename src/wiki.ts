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
