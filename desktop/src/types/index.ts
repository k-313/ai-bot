export type PageId =
  | 'home'
  | 'chat'
  | 'agents'
  | 'tasks'
  | 'files'
  | 'code'
  | 'research'
  | 'college'
  | 'genbloc'
  | 'memory'
  | 'settings'
  | 'approvals';

export interface HealthStatus {
  status: string;
  version: string;
  timestamp: string;
  workspace_dir: string;
  output_dir: string;
  database: string;
  openai_configured: boolean;
  model: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  agent?: string;
  task_id?: string;
  output_files?: string[];
  created_at?: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: 'queued' | 'running' | 'waiting_approval' | 'completed' | 'failed' | 'cancelled';
  agent_name: string;
  progress: number;
  result?: string;
  error?: string;
  created_at: string;
  steps?: TaskStep[];
}

export interface TaskStep {
  id: string;
  step_number: number;
  title: string;
  status: string;
  output?: string;
  error?: string;
}

export interface ApprovalItem {
  id: string;
  task_id?: string;
  action: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  details?: any;
  created_at: string;
  resolved_at?: string;
}

export interface FileItem {
  name: string;
  relative_path: string;
  absolute_path: string;
  size_bytes: number;
  extension: string;
  modified_at: string;
}

export interface MemoryEntry {
  id: string;
  category: string;
  key: string;
  value: string;
  relevance: number;
  updated_at: string;
}

export interface SettingsData {
  app_name: string;
  version: string;
  openai_configured: boolean;
  openai_api_key_masked: string;
  openai_model: string;
  workspace_dir: string;
  output_dir: string;
  host: string;
  port: number;
  allowed_extensions: string[];
  approved_applications: string[];
}
