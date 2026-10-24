import React, { useState } from 'react';
import { GraduationCap, Calendar, BookOpen, Clock, Plus } from 'lucide-react';
import { api } from '../services/api';

export const CollegePage: React.FC = () => {
  const [subjects, setSubjects] = useState<string[]>([
    'Distributed Systems',
    'Database Optimization',
    'Compiler Design',
    'Computer Networks',
  ]);
  const [newSubject, setNewSubject] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [planSummary, setPlanSummary] = useState<string>('');

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    setSubjects([...subjects, newSubject.trim()]);
    setNewSubject('');
  };

  const handleGenerateStudyPlan = async (subject: string) => {
    setGenerating(true);
    try {
      const res = await api.sendMessage(`Create a detailed revision study plan and PDF for ${subject}`);
      setPlanSummary(res.content);
    } catch (err: any) {
      alert(`Study plan generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto overflow-y-auto">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-pink-400" />
          <span>College Academic Hub</span>
        </h2>
        <p className="text-xs text-jarvis-muted mt-1">
          Manage computer science subjects, generate spaced-repetition schedules, and compile revision guides.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl border border-jarvis-border bg-jarvis-card space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-pink-400" />
            <span>Enrolled Subjects</span>
          </h3>

          <form onSubmit={handleAddSubject} className="flex gap-2">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Add course..."
              className="flex-1 bg-jarvis-dark border border-jarvis-border focus:border-pink-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder-jarvis-muted focus:outline-none"
            />
            <button
              type="submit"
              className="p-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-2">
            {subjects.map((sub, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-jarvis-dark/60 border border-jarvis-border flex items-center justify-between"
              >
                <span className="text-xs font-medium text-white">{sub}</span>
                <button
                  onClick={() => handleGenerateStudyPlan(sub)}
                  disabled={generating}
                  className="px-2.5 py-1 rounded bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-[10px] text-pink-300 font-semibold transition-all"
                >
                  Generate Plan
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 p-5 rounded-xl border border-jarvis-border bg-jarvis-card space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-pink-400" />
            <span>Active Revision Roadmap</span>
          </h3>

          {planSummary ? (
            <div className="p-4 rounded-lg bg-jarvis-dark border border-jarvis-border text-xs text-pink-200 whitespace-pre-wrap leading-relaxed font-sans">
              {planSummary}
            </div>
          ) : (
            <div className="p-16 text-center text-xs text-jarvis-muted border border-dashed border-jarvis-border rounded-lg space-y-2">
              <Clock className="w-6 h-6 text-jarvis-muted mx-auto opacity-50" />
              <p>Click "Generate Plan" on any subject to compile a spaced-repetition revision guide.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
