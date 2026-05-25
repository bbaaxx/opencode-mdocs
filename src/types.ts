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

export interface Initiative {
  id: string;
  title: string;
  status: Status;
  created: string;
  updated: string;
  owner: string;
  tags: string[];
  relatedWiki: string[];
  objective: string;
  plan: string[];
  progressLog: string[];
  artifacts: string[];
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
