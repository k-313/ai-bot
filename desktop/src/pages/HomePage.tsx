import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  Presentation,
  Clock,
  ArrowRight,
  ShieldCheck,
  FolderOpen,
  Code2,
  Bot,
  Activity,
} from 'lucide-react';
import { HealthStatus, TaskItem, PageId } from '../types';
import { api } from '../services/api';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  onQuickPrompt: (prompt: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onQuickPrompt }) => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [quickInput, setQuickInput] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [h, t] = await Promise.all([
        api.getHealth().catch(() => null),
        api.getTasks().catch(() => []),
      ]);
      setHealth(h);
      setTasks(t.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onQuickPrompt(quickInput);
    setQuickInput('');
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto overflow-y-auto">
      <div className="relative overflow-hidden rounded-2xl border border-jarvis-border bg-gradient-to-r from-jarvis-card via-blue-950/20 to-indigo-950/30 p-8 shadow-glow-sm">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>JARVIS SYSTEM READY • AUTONOMOUS PERSONAL OS</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, Developer.
          </h1>
          <p className="text-sm text-jarvis-muted leading-relaxed">
            I am standing by to assist with computer science studies, code debugging, professional PPTX/DOCX/PDF document creation, web research, and GenBloc business workflows.
          </p>

          <form onSubmit={handleQuickSubmit} className="pt-2 flex gap-2 max-w-2xl">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Tell JARVIS what to do (e.g. 'Create a presentation on neural networks')..."
              className="flex-1 bg-jarvis-dark/80 border border-jarvis-border focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-jarvis-muted focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-glow-sm transition-all flex items-center gap-2"
            >
              <span>Execute</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-jarvis-border bg-jarvis-card space-y-2">
          <div className="flex items-center justify-between text-xs text-jarvis-muted">
            <span>FastAPI Core</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-white">
            {health?.status === 'operational' ? 'Online' : 'Connecting...'}
          </p>
          <p className="text-[11px] text-jarvis-muted font-mono truncate">127.0.0.1:8000</p>
        </div>

        <div className="p-4 rounded-xl border border-jarvis-border bg-jarvis-card space-y-2">
          <div className="flex items-center justify-between text-xs text-jarvis-muted">
            <span>AI Reasoning Model</span>
            <Bot className="w-4 h-4 text-jarvis-accent" />
          </div>
          <p className="text-xl font-bold text-white truncate">
            {health?.model || 'gpt-4o'}
          </p>
          <p className="text-[11px] text-jarvis-muted">
            {health?.openai_configured ? 'API Key Configured' : 'Local Autonomous Engine'}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-jarvis-border bg-jarvis-card space-y-2">
          <div className="flex items-center justify-between text-xs text-jarvis-muted">
            <span>Approved Workspace</span>
            <FolderOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-bold text-white">Active Root</p>
          <p className="text-[11px] text-jarvis-muted font-mono truncate" title={health?.workspace_dir}>
            {health?.workspace_dir?.split('\\').pop() || 'workspace'}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-jarvis-border bg-jarvis-card space-y-2">
          <div className="flex items-center justify-between text-xs text-jarvis-muted">
            <span>Security Authority</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl font-bold text-white">Level 1-4 Guard</p>
          <p className="text-[11px] text-jarvis-muted">Human Approval Required</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">
          Specialist Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onQuickPrompt("Create a PowerPoint presentation on Distributed Operating Systems")}
            className="p-4 rounded-xl border border-jarvis-border bg-jarvis-card/60 hover:bg-jarvis-card hover:border-blue-500/50 transition-all text-left group space-y-2 shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <Presentation className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
              AI Presentation (PPTX)
            </h4>
            <p className="text-xs text-jarvis-muted">
              Auto-generate structured PowerPoint slides in the output directory.
            </p>
          </button>

          <button
            onClick={() => onQuickPrompt("Create a study revision schedule for Computer Science finals")}
            className="p-4 rounded-xl border border-jarvis-border bg-jarvis-card/60 hover:bg-jarvis-card hover:border-indigo-500/50 transition-all text-left group space-y-2 shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
              Study Schedule (PDF)
            </h4>
            <p className="text-xs text-jarvis-muted">
              Compile spaced-repetition revision schedules and chapter guides.
            </p>
          </button>

          <button
            onClick={() => onQuickPrompt("Draft GenBloc enterprise business proposal and roadmap")}
            className="p-4 rounded-xl border border-jarvis-border bg-jarvis-card/60 hover:bg-jarvis-card hover:border-purple-500/50 transition-all text-left group space-y-2 shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
              GenBloc Pitch (DOCX)
            </h4>
            <p className="text-xs text-jarvis-muted">
              Draft comprehensive business plans and marketing roadmaps in Word format.
            </p>
          </button>

          <button
            onClick={() => onQuickPrompt("Inspect workspace files and diagnose any coding bugs")}
            className="p-4 rounded-xl border border-jarvis-border bg-jarvis-card/60 hover:bg-jarvis-card hover:border-cyan-500/50 transition-all text-left group space-y-2 shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
              Code Assistant
            </h4>
            <p className="text-xs text-jarvis-muted">
              Audit approved repository, inspect errors, and run tests safely.
            </p>
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-jarvis-border bg-jarvis-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white tracking-wider uppercase flex items-center gap-2">
            <Clock className="w-4 h-4 text-jarvis-accent" />
            <span>Recent Autonomous Tasks</span>
          </h3>
          <button
            onClick={() => onNavigate('tasks')}
            className="text-xs text-jarvis-accent hover:underline flex items-center gap-1"
          >
            <span>View All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8 text-jarvis-muted text-xs">
            No background tasks executed yet. Send a prompt to activate an autonomous specialist!
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg bg-jarvis-dark/50 border border-jarvis-border"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      task.status === 'completed'
                        ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                        : task.status === 'running'
                        ? 'bg-blue-400 animate-ping'
                        : task.status === 'waiting_approval'
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                  />
                  <div>
                    <p className="text-xs font-semibold text-white">{task.title}</p>
                    <p className="text-[10px] text-jarvis-muted">
                      Agent: <span className="text-jarvis-text font-mono">{task.agent_name}</span> • Progress: {task.progress}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                      task.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : task.status === 'waiting_approval'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
