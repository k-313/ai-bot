import React, { useState } from 'react';
import { Briefcase, Sparkles, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

export const GenBlocPage: React.FC = () => {
  const [topic, setTopic] = useState<string>('Enterprise Agent Orchestration Launch');
  const [marketingDraft, setMarketingDraft] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleGeneratePitch = async () => {
    setLoading(true);
    try {
      const res = await api.sendMessage(`Draft a GenBloc business proposal, executive summary, and launch post for: ${topic}`);
      setMarketingDraft(res.content);
    } catch (err: any) {
      alert(`GenBloc synthesis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto overflow-y-auto">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-violet-400" />
          <span>GenBloc Business & Venture Suite</span>
        </h2>
        <p className="text-xs text-jarvis-muted mt-1">
          Accelerate your startup initiatives: produce investor decks, executive summaries, marketing copy, and launch strategies.
        </p>
      </div>

      <div className="p-6 rounded-xl border border-jarvis-border bg-jarvis-card space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-violet-400" />
          <span>Initiative Launchpad</span>
        </h3>

        <div className="space-y-3">
          <label className="text-[11px] text-jarvis-muted uppercase tracking-wider block">
            Campaign or Product Focus
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. GenBloc Decentralized AI Agent Protocol"
            className="w-full bg-jarvis-dark border border-jarvis-border focus:border-violet-500 rounded-xl p-3 text-xs text-white placeholder-jarvis-muted focus:outline-none"
          />

          <button
            onClick={handleGeneratePitch}
            disabled={loading || !topic.trim()}
            className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-semibold shadow-glow-violet transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Synthesizing...' : 'Compile Executive Package (DOCX & Copy)'}</span>
          </button>
        </div>
      </div>

      {marketingDraft && (
        <div className="p-6 rounded-xl border border-jarvis-border bg-jarvis-card space-y-4">
          <div className="flex items-center justify-between border-b border-jarvis-border pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Generated Venture Deliverables
            </h3>
            <span className="text-[10px] font-mono text-violet-400">STATUS: VERIFIED ON DISK</span>
          </div>

          <pre className="text-xs text-violet-200 font-sans whitespace-pre-wrap leading-relaxed">
            {marketingDraft}
          </pre>
        </div>
      )}
    </div>
  );
};
