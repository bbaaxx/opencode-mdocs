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
  related_wiki: string[];
  objective: string;
  plan: string[];
  progress_log: string[];
  artifacts: string[];
}

export interface WikiEntry {
  id: string;
  title: string;
  category: string;
  created: string;
  updated: string;
  related_initiatives: string[];
  tags: string[];
  content: string;
}

export interface WorkflowState {
  current_step: StepName;
  active_initiative: string | null;
  step_history: { step: StepName; timestamp: string }[];
}
