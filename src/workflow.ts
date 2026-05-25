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

  canExecuteTool(toolName: string): boolean {
    const readTools = ['read', 'glob', 'grep', 'list'];
    const writeTools = ['edit', 'write'];
    const commitTools = ['bash'];

    if (readTools.includes(toolName)) return true;
    if (this.state.currentStep === 'IDLE') return true;
    if (writeTools.includes(toolName)) {
      return ['PLAN', 'EXECUTE', 'VERIFY', 'REPORT', 'COMPLETE'].includes(this.state.currentStep);
    }
    if (commitTools.includes(toolName)) {
      return this.state.currentStep === 'COMPLETE';
    }
    return true;
  }

  status(): WorkflowState {
    return this.state;
  }
}
