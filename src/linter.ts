import * as fs from 'fs';
import * as path from 'path';
import { LintResult, LintIssue } from './types';

export class MdocsLinter {
  private baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  lintFile(filePath: string): LintResult {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.baseDir, filePath);
    
    if (filePath.includes('/initiatives/') || filePath.includes('\\initiatives\\')) {
      return this.lintInitiative(content, relativePath);
    }
    if (filePath.includes('/wiki/') || filePath.includes('\\wiki\\')) {
      return this.lintWiki(content, relativePath);
    }

    return {
      file: relativePath,
      type: 'initiative',
      score: 0,
      issues: [{ severity: 'error', message: 'File is not in initiatives/ or wiki/ directory' }],
      passed: false
    };
  }

  lintAll(): LintResult[] {
    const results: LintResult[] = [];
    const initiativesDir = path.join(this.baseDir, 'initiatives');
    const wikiDir = path.join(this.baseDir, 'wiki');

    if (fs.existsSync(initiativesDir)) {
      const files = fs.readdirSync(initiativesDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
      for (const f of files) {
        results.push(this.lintFile(path.join(initiativesDir, f)));
      }
    }

    if (fs.existsSync(wikiDir)) {
      const categories = fs.readdirSync(wikiDir).filter(f => {
        const stat = fs.statSync(path.join(wikiDir, f));
        return stat.isDirectory();
      });
      for (const category of categories) {
        const catDir = path.join(wikiDir, category);
        const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
        for (const f of files) {
          results.push(this.lintFile(path.join(catDir, f)));
        }
      }
    }

    return results;
  }

  private lintInitiative(content: string, filePath: string): LintResult {
    const issues: LintIssue[] = [];
    let score = 5;

    // Parse frontmatter
    const frontmatterMatch = content.match(/---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      issues.push({ severity: 'error', message: 'Missing YAML frontmatter' });
      score = 0;
      return { file: filePath, type: 'initiative', score, issues, passed: false };
    }

    const frontmatter = frontmatterMatch[1];
    const requiredFields = ['id', 'title', 'status', 'created', 'updated', 'tags'];
    for (const field of requiredFields) {
      if (!frontmatter.includes(`${field}:`)) {
        issues.push({ severity: 'error', message: `Missing required frontmatter field: ${field}` });
        score -= 1;
      }
    }

    // Parse body
    const body = content.replace(/---\n[\s\S]*?\n---/, '').trim();

    // Check Objective
    const objectiveMatch = body.match(/## Objective\n([\s\S]*?)(?=\n## |$)/);
    const objective = objectiveMatch ? objectiveMatch[1].trim() : '';
    if (!objective || objective.length < 10) {
      issues.push({ severity: 'error', message: 'Objective missing or too short (min 10 words)' });
      score -= 1;
    }

    // Check Plan items are concrete
    const planMatch = body.match(/## Plan\n([\s\S]*?)(?=\n## |$)/);
    const planSection = planMatch ? planMatch[1].trim() : '';
    const planItems = planSection.split('\n').filter(line => line.trim().startsWith('- '));
    if (planItems.length === 0) {
      issues.push({ severity: 'error', message: 'Plan section is empty' });
      score -= 1;
    } else {
      for (const item of planItems) {
        const text = item.replace(/^- \[[ x/]\] /, '').replace(/^- /, '').trim();
        const vaguePrefixes = ['research how', 'investigate', 'look into', 'explore', 'learn about', 'find out', 'check if'];
        if (vaguePrefixes.some(prefix => text.toLowerCase().startsWith(prefix))) {
          issues.push({ severity: 'warning', message: `Vague plan item detected: "${text}"` });
          score -= 0.5;
        }
      }
    }

    // Check for file paths or Context section
    const hasContextSection = /## Context/.test(body);
    const hasFilePaths = /\b(src\/[\w/]+\.(ts|js|md)|templates\/|agents\/|skills\/)/.test(body);
    const hasPlanPaths = planItems.some(item => /\b(src\/[\w/]+|templates\/|agents\/|skills\/)/.test(item));
    if (!hasContextSection && !hasFilePaths && !hasPlanPaths) {
      issues.push({ severity: 'error', message: 'No file paths or Context section found — fresh agent won\'t know where to edit' });
      score -= 2;
    }

    // Check Acceptance Criteria
    const hasAcceptanceCriteria = /## Acceptance Criteria|done when|acceptance/i.test(body);
    if (!hasAcceptanceCriteria) {
      issues.push({ severity: 'warning', message: 'Missing Acceptance Criteria section or "Done when" statements' });
      score -= 0.5;
    }

    // Check Progress Log exists
    const hasProgressLog = /## Progress Log/.test(body);
    if (!hasProgressLog) {
      issues.push({ severity: 'warning', message: 'Missing Progress Log section' });
      score -= 0.5;
    }

    // Normalize score to 0-5
    score = Math.max(0, Math.min(5, score));
    const passed = score >= 4;

    return { file: filePath, type: 'initiative', score, issues, passed };
  }

  private lintWiki(content: string, filePath: string): LintResult {
    const issues: LintIssue[] = [];
    let score = 5;

    // Parse frontmatter
    const frontmatterMatch = content.match(/---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      issues.push({ severity: 'error', message: 'Missing YAML frontmatter' });
      score = 0;
      return { file: filePath, type: 'wiki', score, issues, passed: false };
    }

    const frontmatter = frontmatterMatch[1];
    const requiredFields = ['id', 'title', 'category', 'created', 'updated', 'tags'];
    for (const field of requiredFields) {
      if (!frontmatter.includes(`${field}:`)) {
        issues.push({ severity: 'error', message: `Missing required frontmatter field: ${field}` });
        score -= 1;
      }
    }

    // Parse body
    const body = content.replace(/---\n[\s\S]*?\n---/, '').trim();

    // Check content length
    const wordCount = body.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 50) {
      issues.push({ severity: 'warning', message: `Content is short (${wordCount} words, min recommended 50)` });
      score -= 1;
    }

    // Check category matches directory
    const categoryMatch = frontmatter.match(/category:\s*"?([^"\n]+)"?/);
    if (categoryMatch) {
      const category = categoryMatch[1].trim();
      const expectedDir = path.dirname(filePath).split(path.sep).pop();
      if (category !== expectedDir) {
        issues.push({ severity: 'warning', message: `Category "${category}" does not match directory "${expectedDir}"` });
        score -= 0.5;
      }
    }

    // Check related initiatives
    if (!frontmatter.includes('related_initiatives:')) {
      issues.push({ severity: 'info', message: 'No related_initiatives linked (ok for standalone docs)' });
    }

    score = Math.max(0, Math.min(5, score));
    const passed = score >= 4;

    return { file: filePath, type: 'wiki', score, issues, passed };
  }
}
