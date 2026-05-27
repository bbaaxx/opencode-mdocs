import * as fs from 'fs';
import * as path from 'path';
import { WorkflowState, StepName } from './types';

const STEPS: StepName[] = [
  'IDLE', 'UNDERSTAND', 'DISCOVER', 'CONTEXT', 'PLAN', 
  'EXECUTE', 'VERIFY', 'REPORT', 'COMPLETE'
];

export class WorkflowEngine {
  private statePath: string;
  private state: WorkflowState;

  constructor(baseDir: string) {
    this.statePath = path.join(baseDir, '.workflow-state.json');
    this.state = this.load();
  }

  private load(): WorkflowState {
    if (fs.existsSync(this.statePath)) {
      return JSON.parse(fs.readFileSync(this.statePath, 'utf8'));
    }
    return {
      currentStep: 'IDLE',
      activeInitiative: null,
      stepHistory: []
    };
  }

  private save(): void {
    const dir = path.dirname(this.statePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.statePath, JSON.stringify(this.state, null, 2), 'utf8');
  }

  getCurrentStep(): StepName {
    return this.state.currentStep;
  }

  advance(nextStep: StepName): void {
    const currentIndex = STEPS.indexOf(this.state.currentStep);
    const nextIndex = STEPS.indexOf(nextStep);
    
    if (nextIndex < currentIndex) {
      throw new Error(`Cannot go back from ${this.state.currentStep} to ${nextStep}`);
    }
    if (nextIndex > currentIndex + 1) {
      throw new Error(`Cannot skip from ${this.state.currentStep} to ${nextStep}`);
    }

    this.state.stepHistory.push({
      step: nextStep,
      timestamp: new Date().toISOString()
    });
    this.state.currentStep = nextStep;
    this.save();
  }

  private isMdocsOperation(toolName: string, toolArgs?: Record<string, any>): boolean {
    // Check if any path argument references the mdocs directory
    const args = toolArgs || {};
    
    // Direct file paths
    if (args.filePath && typeof args.filePath === 'string') {
      return args.filePath.includes('/mdocs/') || args.filePath.includes('\\mdocs\\');
    }
    
    // Path parameter for glob/grep
    if (args.path && typeof args.path === 'string') {
      return args.path.includes('/mdocs/') || args.path.includes('\\mdocs\\');
    }
    
    // Pattern that includes mdocs
    if (args.pattern && typeof args.pattern === 'string') {
      return args.pattern.includes('/mdocs/') || args.pattern.includes('\\mdocs\\') || args.pattern.includes('mdocs');
    }
    
    // Bash commands operating on mdocs
    if (toolName === 'bash') {
      const command = args.command || args.args?.command || '';
      return command.includes('/mdocs/') || command.includes('\\mdocs\\');
    }
    
    return false;
  }

  canExecuteTool(toolName: string, toolArgs?: Record<string, any>): boolean {
    const readTools = ['read', 'glob', 'grep', 'list'];
    const writeTools = ['edit', 'write'];

    // Allow unrestricted access to mdocs knowledge files regardless of workflow step
    if (this.isMdocsOperation(toolName, toolArgs)) {
      return true;
    }

    if (readTools.includes(toolName)) return true;
    if (this.state.currentStep === 'IDLE') return true;
    if (writeTools.includes(toolName)) {
      return ['PLAN', 'EXECUTE', 'VERIFY', 'REPORT', 'COMPLETE'].includes(this.state.currentStep);
    }
    if (toolName === 'bash') {
      // Non-destructive bash commands (ls, cat, echo, pwd, grep, etc.) are always allowed
      const command = toolArgs?.command || toolArgs?.args?.command || '';
      const nonDestructive = /^(ls|cat|echo|pwd|cd|which|type|head|tail|wc|sort|uniq|grep|find|date|whoami|hostname|env|printenv|id|uname|df|du|ps|top|uptime|clear|history|man|help)\b/i;
      if (nonDestructive.test(command)) return true;
      // Destructive commands (rm, mv, cp -f, git commit, etc.) require COMPLETE
      return this.state.currentStep === 'COMPLETE';
    }
    return true;
  }

  status(): WorkflowState {
    return this.state;
  }
}
