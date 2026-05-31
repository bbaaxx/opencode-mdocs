import * as fs from 'fs';
import * as path from 'path';
import { WikiEntry, parseFrontmatter } from './types';

export class WikiManager {
  private dir: string;

  constructor(baseDir: string) {
    this.dir = path.join(baseDir, 'wiki');
    fs.mkdirSync(this.dir, { recursive: true });
  }

  private toFrontmatter(entry: WikiEntry): string {
    const front: Record<string, any> = {
      id: entry.id,
      title: entry.title,
      category: entry.category,
      created: entry.created,
      updated: entry.updated,
      related_initiatives: entry.relatedInitiatives,
      tags: entry.tags,
    };
    if (entry.lifecycle) front.lifecycle = entry.lifecycle;
    if (entry.knowledgeType) front.knowledge_type = entry.knowledgeType;
    if (entry.confidence) front.confidence = entry.confidence;
    if (entry.sourceInitiatives && entry.sourceInitiatives.length > 0) front.source_initiatives = entry.sourceInitiatives;
    if (entry.supersedes && entry.supersedes.length > 0) front.supersedes = entry.supersedes;
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
    const front = parseFrontmatter(content);
    if (!Object.keys(front).length) throw new Error('Invalid wiki entry format');

    const body = content.replace(/---\n[\s\S]*?\n---/, '').trim();

    return {
      id: front.id || '',
      title: front.title || '',
      category: front.category || '',
      created: front.created || '',
      updated: front.updated || '',
      relatedInitiatives: Array.isArray(front.related_initiatives) ? front.related_initiatives : [],
      tags: Array.isArray(front.tags) ? front.tags : [],
      content: body,
      lifecycle: front.lifecycle || undefined,
      knowledgeType: front.knowledge_type || undefined,
      confidence: front.confidence || undefined,
      sourceInitiatives: Array.isArray(front.source_initiatives) ? front.source_initiatives : undefined,
      supersedes: Array.isArray(front.supersedes) ? front.supersedes : undefined
    };
  }

  private parseRelatedWiki(content: string): string[] {
    const match = content.match(/---\n([\s\S]*?)\n---/);
    if (!match) return [];
    for (const line of match[1].split('\n')) {
      const [key, ...valueParts] = line.split(':');
      if (key?.trim() !== 'related_wiki' || valueParts.length === 0) continue;
      const value = valueParts.join(':').trim();
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  private referencedWikiRefs(): Set<string> {
    const refs = new Set<string>();
    const initiativesDir = path.join(path.dirname(this.dir), 'initiatives');
    if (!fs.existsSync(initiativesDir)) return refs;
    const files = fs.readdirSync(initiativesDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
    for (const fileName of files) {
      try {
        const content = fs.readFileSync(path.join(initiativesDir, fileName), 'utf8');
        for (const ref of this.parseRelatedWiki(content)) refs.add(ref);
      } catch {
        // Ignore unreadable initiative files; initiative validation reports them.
      }
    }
    return refs;
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

  list(category?: string): WikiEntry[] {
    const categories = category
      ? [this.sanitizeName(category)]
      : fs.readdirSync(this.dir).filter(f => fs.statSync(path.join(this.dir, f)).isDirectory());

    const entries: WikiEntry[] = [];
    for (const cat of categories) {
      const catDir = path.join(this.dir, cat);
      if (!fs.existsSync(catDir)) continue;
      const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
      for (const fileName of files) {
        try {
          const entry = this.read(cat, fileName.replace(/\.md$/, ''));
          if (entry) entries.push(entry);
        } catch {
        }
      }
    }
    return entries.sort((a, b) => `${a.category}/${a.id}`.localeCompare(`${b.category}/${b.id}`));
  }

  syncIndices(): string[] {
    this.updateIndices();
    const paths = [path.join(this.dir, 'INDEX.md')];
    const categories = fs.readdirSync(this.dir).filter(f => fs.statSync(path.join(this.dir, f)).isDirectory());
    for (const category of categories) {
      paths.push(path.join(this.dir, category, 'INDEX.md'));
    }
    return paths;
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

  validate(): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const referencedWiki = this.referencedWikiRefs();
    const categories = fs.readdirSync(this.dir)
      .filter(f => fs.statSync(path.join(this.dir, f)).isDirectory());

    for (const category of categories) {
      const catDir = path.join(this.dir, category);
      const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
      for (const fileName of files) {
        const relativeName = `${category}/${fileName}`;
        try {
          const entry = this.parseWikiEntry(fs.readFileSync(path.join(catDir, fileName), 'utf8'));
          if (!entry.id) errors.push(`${relativeName} missing id`);
          if (!entry.title) errors.push(`${relativeName} missing title`);
          if (!entry.category) errors.push(`${relativeName} missing category`);
          if (entry.id && entry.category && !referencedWiki.has(`${entry.category}/${entry.id}`)) {
            warnings.push(`${relativeName} is not referenced by any initiative`);
          }
        } catch (err: any) {
          errors.push(`${relativeName} invalid wiki entry format: ${err.message || String(err)}`);
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings };
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
