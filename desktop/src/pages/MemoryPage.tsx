import React, { useState, useEffect } from 'react';
import { Brain, Trash2, Search, Plus } from 'lucide-react';
import { MemoryEntry } from '../types';
import { api } from '../services/api';

export const MemoryPage: React.FC = () => {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [cat, setCat] = useState<string>('general');
  const [memKey, setMemKey] = useState<string>('');
  const [memVal, setMemVal] = useState<string>('');

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      const data = await api.getMemories();
      setMemories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadMemories();
      return;
    }
    try {
      const results = await api.searchMemory(searchQuery);
      setMemories(results);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteMemory(id);
      loadMemories();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memKey.trim() || !memVal.trim()) return;

    try {
      await api.createMemory({
        category: cat,
        key: memKey.trim(),
        value: memVal.trim(),
      });
      setShowAddModal(false);
      setMemKey('');
      setMemVal('');
      loadMemories();
    } catch (err: any) {
      alert(`Create memory failed: ${err.message}`);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-400" />
            <span>Memory & Persistent Context Vault</span>
          </h2>
          <p className="text-xs text-jarvis-muted mt-1">
            Inspect, search, and manage user preferences and project knowledge. Secrets are automatically redacted.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Memory</span>
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-jarvis-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories by keyword, project, or concept..."
            className="w-full pl-10 pr-4 py-2.5 bg-jarvis-card border border-jarvis-border focus:border-indigo-500 rounded-xl text-xs text-white placeholder-jarvis-muted focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-jarvis-dark border border-jarvis-border rounded-xl text-xs text-jarvis-text hover:text-white"
        >
          Search
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {memories.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-jarvis-muted rounded-xl border border-dashed border-jarvis-border">
            No memories stored yet. Record custom preferences or instruct JARVIS to remember key project context.
          </div>
        ) : (
          memories.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl border border-jarvis-border bg-jarvis-card flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    {m.category}
                  </span>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-jarvis-muted hover:text-red-400 transition-colors p-1"
                    title="Delete memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-xs font-bold text-white font-mono">{m.key}</h4>
                <p className="text-xs text-jarvis-muted whitespace-pre-wrap">{m.value}</p>
              </div>

              <div className="text-[10px] text-jarvis-muted opacity-60 pt-2 border-t border-jarvis-border">
                Updated: {new Date(m.updated_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-jarvis-card border border-jarvis-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-glow-md">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Store Persistent Memory
            </h3>

            <form onSubmit={handleAddMemory} className="space-y-3">
              <div>
                <label className="text-[11px] text-jarvis-muted uppercase tracking-wider block mb-1">
                  Category
                </label>
                <select
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                  className="w-full bg-jarvis-dark border border-jarvis-border rounded-lg p-2 text-xs text-white focus:outline-none"
                >
                  <option value="preferences">User Preferences</option>
                  <option value="project">Project Architecture</option>
                  <option value="study">College & Study</option>
                  <option value="business">GenBloc Business</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-jarvis-muted uppercase tracking-wider block mb-1">
                  Memory Key / Identifier
                </label>
                <input
                  type="text"
                  value={memKey}
                  onChange={(e) => setMemKey(e.target.value)}
                  placeholder="e.g. coding_style_preference"
                  className="w-full bg-jarvis-dark border border-jarvis-border rounded-lg p-2.5 text-xs text-white focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-jarvis-muted uppercase tracking-wider block mb-1">
                  Knowledge / Value
                </label>
                <textarea
                  value={memVal}
                  onChange={(e) => setMemVal(e.target.value)}
                  placeholder="e.g. Prefer TypeScript strict mode and Tailwind CSS for React components."
                  rows={3}
                  className="w-full bg-jarvis-dark border border-jarvis-border rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-jarvis-dark border border-jarvis-border text-xs text-jarvis-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-sm"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
