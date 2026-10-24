import React, { useState } from 'react';
import { Globe2, Search, Bookmark, FileText } from 'lucide-react';
import { api } from '../services/api';

export const ResearchPage: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await api.sendMessage(`Research this topic with verified citations: ${query}`);
      setResults(res);
    } catch (err: any) {
      alert(`Research query failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto overflow-y-auto">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Globe2 className="w-6 h-6 text-emerald-400" />
          <span>Autonomous Web & Academic Research</span>
        </h2>
        <p className="text-xs text-jarvis-muted mt-1">
          Perform structured fact-finding, compare authoritative sources, and compile verified citations.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-jarvis-muted absolute left-4 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter research topic, specification, or paper (e.g. 'Raft vs Paxos consensus mechanisms')..."
            className="w-full pl-11 pr-4 py-3 bg-jarvis-card border border-jarvis-border focus:border-emerald-500 rounded-xl text-xs text-white placeholder-jarvis-muted focus:outline-none transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-glow-sm disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <span>{loading ? 'Synthesizing...' : 'Search & Cite'}</span>
        </button>
      </form>

      {results && (
        <div className="p-6 rounded-xl border border-jarvis-border bg-jarvis-card space-y-4">
          <div className="flex items-center justify-between border-b border-jarvis-border pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-emerald-400" />
              <span>Synthesized Research Findings</span>
            </h3>
            <span className="text-[10px] font-mono text-jarvis-muted">
              AGENT: {results.agent?.toUpperCase()}
            </span>
          </div>

          <div className="text-xs text-jarvis-text leading-relaxed whitespace-pre-wrap font-sans">
            {results.content}
          </div>

          {results.output_files && results.output_files.length > 0 && (
            <div className="mt-4 pt-3 border-t border-jarvis-border">
              <span className="text-[10px] text-jarvis-muted uppercase tracking-wider block mb-2">
                Compiled Reports:
              </span>
              {results.output_files.map((f: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                  <FileText className="w-4 h-4" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
