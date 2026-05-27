export type Status = 'active' | 'paused' | 'done';

export type StepName = 
  | 'IDLE' 
  | 'UNDERSTAND' 
  | 'DISCOVER' 
  | 'CONTEXT' 
  | 'PLAN' 
  | 'EXECUTE' 
  | 'VERIFY' 
  | 'REPORT' 
  | 'COMPLETE';

export type PlanItemStatus = 'pending' | 'in-progress' | 'done';

export interface PlanItem {
  description: string;
  status: PlanItemStatus;
  startedAt?: string;
  completedAt?: string;
}

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface Initiative {
  id: string;
  title: string;
  status: Status;
  priority?: Priority;
  created: string;
  updated: string;
  owner: string;
  tags: string[];
  relatedWiki: string[];
  objective: string;
  plan: PlanItem[];
  progressLog: string[];
  artifacts: string[];
  dueDate?: string;
  dependsOn?: string[];
}

export interface WikiEntry {
  id: string;
  title: string;
  category: string;
  created: string;
  updated: string;
  relatedInitiatives: string[];
  tags: string[];
  content: string;
}

export interface WorkflowState {
  currentStep: StepName;
  activeInitiative: string | null;
  stepHistory: { step: StepName; timestamp: string }[];
}

export interface LintIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
}

export interface LintResult {
  file: string;
  type: 'initiative' | 'wiki';
  score: number;
  issues: LintIssue[];
  passed: boolean;
}

export interface SearchResult {
  type: 'initiative' | 'wiki';
  id: string;
  title: string;
  score: number;
}

export interface SearchOptions {
  tags?: string[];
  status?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditEvent {
  timestamp: string;
  type: 'tool' | 'workflow' | 'initiative' | 'wiki';
  initiativeId?: string;
  step?: StepName;
  details: Record<string, any>;
}
