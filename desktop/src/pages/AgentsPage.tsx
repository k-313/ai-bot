import React from 'react';
import {
  Bot,
  Code2,
  FileText,
  Globe2,
  Monitor,
  GraduationCap,
  Briefcase,
  Brain,
  Zap,
} from 'lucide-react';

interface AgentsPageProps {
  onDirectPrompt: (prompt: string) => void;
}

export const AgentsPage: React.FC<AgentsPageProps> = ({ onDirectPrompt }) => {
  const agents = [
    {
      id: 'orchestrator',
      name: 'Central Orchestrator',
      icon: Zap,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      description: 'Understands intent, breaks requests into subtask trees, verifies permission boundaries, coordinates specialist agents.',
      tools: ['plan_subtasks', 'verify_completion', 'route_agent', 'request_approval'],
      example: 'Plan and execute a multi-step project for my college thesis',
    },
    {
      id: 'document_agent',
      name: 'Document Generator',
      icon: FileText,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      description: 'Generates verified PPTX presentations, editable Word documents (.docx), and ReportLab PDFs with custom styling.',
      tools: ['generate_pptx', 'generate_docx', 'generate_pdf', 'create_output_folder'],
      example: 'Create a PowerPoint presentation on Operating Systems concurrency',
    },
    {
      id: 'coding_agent',
      name: 'Code Assistant & Debugger',
      icon: Code2,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      description: 'Audits source code in approved directories, diagnoses errors, refactors modules, and runs approved test suites.',
      tools: ['list_approved_files', 'read_approved_text_file', 'write_approved_file', 'run_approved_test'],
      example: 'Inspect workspace files and fix python syntax errors',
    },
    {
      id: 'research_agent',
      name: 'Web Research Engine',
      icon: Globe2,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'Synthesizes online facts, compares documentation, checks recency, and outputs verified citations.',
      tools: ['search_web', 'compile_citations', 'verify_sources'],
      example: 'Research latest transformer architectures and cite top papers',
    },
    {
      id: 'desktop_agent',
      name: 'Desktop Automation Agent',
      icon: Monitor,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      description: 'Controls approved Windows applications (Notepad, Calculator, Explorer) with strict allowlists and UI verification.',
      tools: ['open_approved_application', 'verify_ui_state'],
      example: 'Launch notepad app for taking notes',
    },
    {
      id: 'study_agent',
      name: 'College Study Planner',
      icon: GraduationCap,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
      description: 'Organizes syllabus, generates spaced repetition revision schedules, and creates CS flashcards and exam guides.',
      tools: ['generate_pdf', 'create_study_roadmap', 'track_deadlines'],
      example: 'Create a 4-week revision schedule for Database Systems',
    },
    {
      id: 'genbloc_agent',
      name: 'GenBloc Business Suite',
      icon: Briefcase,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
      description: 'Drafts marketing copy, investor pitch decks, business roadmaps, and social media content for GenBloc.',
      tools: ['generate_docx', 'draft_marketing_copy', 'plan_campaign'],
      example: 'Draft GenBloc service proposal and enterprise pricing model',
    },
    {
      id: 'memory_service',
      name: 'Memory & Context Vault',
      icon: Brain,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      description: 'Persists user preferences, project summaries, and knowledge entries across sessions with secret redaction.',
      tools: ['store_memory', 'retrieve_context', 'search_memory'],
      example: 'Remember that I prefer dark theme and Python 3.12 syntax',
    },
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-400" />
          <span>Specialist Multi-Agent Swarm</span>
        </h2>
        <p className="text-xs text-jarvis-muted mt-1">
          Every agent operates under the central Orchestrator with explicit permission validation and bounded execution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((ag) => {
          const Icon = ag.icon;
          return (
            <div
              key={ag.id}
              className="p-6 rounded-xl border border-jarvis-border bg-jarvis-card flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-all shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${ag.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{ag.name}</h3>
                    <span className="text-[10px] font-mono text-jarvis-cyan">ID: {ag.id}</span>
                  </div>
                </div>

                <p className="text-xs text-jarvis-muted leading-relaxed">
                  {ag.description}
                </p>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] uppercase font-semibold text-jarvis-muted tracking-wider">
                    Permitted Tools:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ag.tools.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-jarvis-dark border border-jarvis-border text-jarvis-text"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDirectPrompt(ag.example)}
                className="w-full py-2 px-3 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold transition-all text-center"
              >
                Trigger Specialist Action &rarr;
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
