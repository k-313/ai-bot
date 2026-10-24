import {
  HealthStatus,
  Conversation,
  TaskItem,
  ApprovalItem,
  FileItem,
  MemoryEntry,
  SettingsData,
} from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorBody.detail || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getHealth: (): Promise<HealthStatus> =>
    fetch(`${API_BASE}/health`).then((res) => handleResponse<HealthStatus>(res)),

  sendMessage: (message: string, conversationId?: string, context?: any): Promise<any> =>
    fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversation_id: conversationId, context }),
    }).then((res) => handleResponse<any>(res)),

  getConversations: (): Promise<Conversation[]> =>
    fetch(`${API_BASE}/chat/conversations`).then((res) => handleResponse<Conversation[]>(res)),

  getConversation: (id: string): Promise<any> =>
    fetch(`${API_BASE}/chat/conversations/${id}`).then((res) => handleResponse<any>(res)),

  getTasks: (status?: string): Promise<TaskItem[]> => {
    const url = status ? `${API_BASE}/tasks?status=${status}` : `${API_BASE}/tasks`;
    return fetch(url).then((res) => handleResponse<TaskItem[]>(res));
  },

  getTaskDetails: (id: string): Promise<TaskItem> =>
    fetch(`${API_BASE}/tasks/${id}`).then((res) => handleResponse<TaskItem>(res)),

  cancelTask: (id: string): Promise<any> =>
    fetch(`${API_BASE}/tasks/${id}/cancel`, { method: 'POST' }).then((res) => handleResponse<any>(res)),

  emergencyStop: (): Promise<any> =>
    fetch(`${API_BASE}/tasks/emergency-stop`, { method: 'POST' }).then((res) => handleResponse<any>(res)),

  getApprovals: (): Promise<ApprovalItem[]> =>
    fetch(`${API_BASE}/approvals`).then((res) => handleResponse<ApprovalItem[]>(res)),

  respondApproval: (id: string, decision: 'approve' | 'reject'): Promise<any> =>
    fetch(`${API_BASE}/approvals/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approval_id: id, decision }),
    }).then((res) => handleResponse<any>(res)),

  generateDocument: (docData: {
    doc_type: string;
    title: string;
    subtitle?: string;
    filename?: string;
    sections?: any[];
    slides?: any[];
  }): Promise<any> =>
    fetch(`${API_BASE}/documents/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docData),
    }).then((res) => handleResponse<any>(res)),

  getDocuments: (): Promise<any[]> =>
    fetch(`${API_BASE}/documents`).then((res) => handleResponse<any[]>(res)),

  getFiles: (folder: 'workspace' | 'output' = 'workspace'): Promise<FileItem[]> =>
    fetch(`${API_BASE}/files?folder=${folder}`).then((res) => handleResponse<FileItem[]>(res)),

  getFilePreview: (path: string): Promise<{ name: string; path: string; size_bytes: number; content: string }> =>
    fetch(`${API_BASE}/files/preview?path=${encodeURIComponent(path)}`).then((res) =>
      handleResponse<{ name: string; path: string; size_bytes: number; content: string }>(res)
    ),

  getMemories: (category?: string): Promise<MemoryEntry[]> => {
    const url = category ? `${API_BASE}/memory?category=${category}` : `${API_BASE}/memory`;
    return fetch(url).then((res) => handleResponse<MemoryEntry[]>(res));
  },

  createMemory: (data: { category: string; key: string; value: string; relevance?: number }): Promise<MemoryEntry> =>
    fetch(`${API_BASE}/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => handleResponse<MemoryEntry>(res)),

  deleteMemory: (id: string): Promise<any> =>
    fetch(`${API_BASE}/memory/${id}`, { method: 'DELETE' }).then((res) => handleResponse<any>(res)),

  searchMemory: (query: string): Promise<MemoryEntry[]> =>
    fetch(`${API_BASE}/memory/search?q=${encodeURIComponent(query)}`).then((res) =>
      handleResponse<MemoryEntry[]>(res)
    ),

  getSettings: (): Promise<SettingsData> =>
    fetch(`${API_BASE}/settings`).then((res) => handleResponse<SettingsData>(res)),

  updateSettings: (data: { openai_api_key?: string; openai_model?: string }): Promise<any> =>
    fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => handleResponse<any>(res)),

  getPermissions: (): Promise<any> =>
    fetch(`${API_BASE}/settings/permissions`).then((res) => handleResponse<any>(res)),
};
