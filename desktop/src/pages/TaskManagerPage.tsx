import React, { useState, useEffect } from 'react';
import { ListTodo, RefreshCw, StopCircle } from 'lucide-react';
import { TaskItem } from '../types';
import { api } from '../services/api';

export const TaskManagerPage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  useEffect(() => {
    loadTasks();
  }, [selectedStatus]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks(selectedStatus === 'all' ? undefined : selectedStatus);
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.cancelTask(id);
      loadTasks();
    } catch (err) {
      alert(`Cancel failed: ${err}`);
    }
  };

  const handleInspect = async (id: string) => {
    try {
      const details = await api.getTaskDetails(id);
      setSelectedTask(details);
    } catch (err) {
      console.error(err);
    }
  };

  const statusOptions = ['all', 'running', 'waiting_approval', 'completed', 'failed', 'cancelled'];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-blue-400" />
            <span>Autonomous Task Manager</span>
          </h2>
          <p className="text-xs text-jarvis-muted mt-1">
            Real-time tracking of queued, running, approved, and completed agent jobs.
          </p>
        </div>

        <button
          onClick={loadTasks}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-jarvis-card border border-jarvis-border text-xs text-jarvis-muted hover:text-white transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      <div className="flex gap-2 border-b border-jarvis-border pb-3">
        {statusOptions.map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase transition-all ${
              selectedStatus === st
                ? 'bg-blue-600/20 border border-blue-500/40 text-blue-400'
                : 'text-jarvis-muted hover:text-white hover:bg-jarvis-card'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {tasks.length === 0 ? (
            <div className="p-12 text-center text-xs text-jarvis-muted rounded-xl border border-dashed border-jarvis-border">
              No tasks found under this filter.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleInspect(task.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedTask?.id === task.id
                    ? 'border-blue-500 bg-blue-950/20'
                    : 'border-jarvis-border bg-jarvis-card hover:border-jarvis-border/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white">{task.title}</span>
                    <div className="flex items-center gap-2 text-[10px] text-jarvis-muted">
                      <span>Agent: <strong className="text-jarvis-cyan">{task.agent_name}</strong></span>
                      <span>•</span>
                      <span>{new Date(task.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                        task.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : task.status === 'running'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : task.status === 'waiting_approval'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {task.status}
                    </span>

                    {task.status === 'running' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel(task.id);
                        }}
                        className="p-1 text-red-400 hover:text-red-300"
                        title="Cancel task"
                      >
                        <StopCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 w-full bg-jarvis-dark rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-1.5 transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="rounded-xl border border-jarvis-border bg-jarvis-card p-6 space-y-4 h-fit">
          <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
            Task Execution Inspector
          </h3>

          {selectedTask ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] text-jarvis-muted uppercase tracking-wider">Title</span>
                <p className="font-semibold text-white mt-0.5">{selectedTask.title}</p>
              </div>

              <div>
                <span className="text-[10px] text-jarvis-muted uppercase tracking-wider">Status & Agent</span>
                <p className="text-jarvis-text mt-0.5">
                  {selectedTask.status.toUpperCase()} by <span className="font-mono text-jarvis-cyan">{selectedTask.agent_name}</span>
                </p>
              </div>

              {selectedTask.error && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono">
                  {selectedTask.error}
                </div>
              )}

              {selectedTask.steps && selectedTask.steps.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-jarvis-border">
                  <span className="text-[10px] text-jarvis-muted uppercase tracking-wider">Subtask Steps</span>
                  <div className="space-y-2">
                    {selectedTask.steps.map((s) => (
                      <div key={s.id} className="p-2.5 rounded bg-jarvis-dark/80 border border-jarvis-border text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-white font-medium">
                          <span>{s.step_number}. {s.title}</span>
                          <span className="font-mono text-[10px] text-jarvis-muted uppercase">{s.status}</span>
                        </div>
                        {s.output && (
                          <pre className="text-[10px] text-jarvis-muted font-mono overflow-x-auto truncate">
                            {s.output}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-jarvis-muted">
              Select a task from the list to inspect execution details and substeps.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
