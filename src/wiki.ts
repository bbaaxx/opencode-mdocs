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

  create(entry: WikiEntry): string {
    const categoryDir = path.join(this.dir, entry.category);
    fs.mkdirSync(categoryDir, { recursive: true });
    const filePath = path.join(categoryDir, `${entry.id}.md`);
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
        const match = content.match(/title: "([^"]+)"/);
        return `- ${match ? match[1] : f.replace('.md', '')}`;
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
