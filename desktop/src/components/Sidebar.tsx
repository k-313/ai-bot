import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  ListTodo,
  FolderKanban,
  Code2,
  Globe2,
  GraduationCap,
  Briefcase,
  Brain,
  Settings,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PageId } from '../types';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  pendingApprovalsCount: number;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  pendingApprovalsCount,
}) => {
  const navItems: NavItem[] = [
    { id: 'home', label: 'Home Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'approvals', label: 'Approval Center', icon: ShieldCheck, badge: pendingApprovalsCount },
    { id: 'agents', label: 'Agent Workspace', icon: Bot },
    { id: 'tasks', label: 'Task Manager', icon: ListTodo },
    { id: 'files', label: 'Files Workspace', icon: FolderKanban },
    { id: 'code', label: 'Code Assistant', icon: Code2 },
    { id: 'research', label: 'Research Engine', icon: Globe2 },
    { id: 'college', label: 'College Hub', icon: GraduationCap },
    { id: 'genbloc', label: 'GenBloc Suite', icon: Briefcase },
    { id: 'memory', label: 'Memory Vault', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-jarvis-border bg-jarvis-card flex flex-col justify-between shrink-0 h-screen select-none">
      <div>
        <div className="h-16 flex items-center px-6 border-b border-jarvis-border gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-glow-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wider text-white">JARVIS</h1>
            <p className="text-[10px] text-jarvis-muted tracking-widest uppercase">Personal OS v0.1</p>
          </div>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-glow-sm'
                    : 'text-jarvis-muted hover:text-jarvis-text hover:bg-jarvis-border/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-jarvis-muted'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-jarvis-border">
        <div className="flex items-center gap-3 p-2 bg-jarvis-dark/50 rounded-lg border border-jarvis-border">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-glow-sm">
            CS
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-jarvis-text truncate">CS Student & Dev</p>
            <p className="text-[10px] text-jarvis-muted truncate">User Authority: Master</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
