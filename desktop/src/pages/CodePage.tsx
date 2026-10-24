import React, { useState } from 'react';
import { Code2, Play, Bug, FileCode } from 'lucide-react';
import { api } from '../services/api';

export const CodePage: React.FC = () => {
  const [errorInput, setErrorInput] = useState<string>('');
  const [codeOutput, setCodeOutput] = useState<string>('');
  const [running, setRunning] = useState<boolean>(false);

  const handleDiagnose = async () => {
    if (!errorInput.trim()) return;
    setRunning(true);
    try {
      const res = await api.sendMessage(`Diagnose this code error and provide a fix:\n\n${errorInput}`);
      setCodeOutput(res.content);
    } catch (err: any) {
      alert(`Diagnosis failed: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleRunTests = async () => {
    setRunning(true);
    try {
      const res = await api.sendMessage('Run approved tests in the workspace');
      setCodeOutput(res.content);
    } catch (err: any) {
      alert(`Test execution failed: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Code2 className="w-6 h-6 text-cyan-400" />
            <span>Developer Code Assistant & Debugger</span>
          </h2>
          <p className="text-xs text-jarvis-muted mt-1">
            Analyze codebases, diagnose stack traces, refactor functions, and run verified test suites.
          </p>
        </div>

        <button
          onClick={handleRunTests}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold shadow-glow-cyan transition-all"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Execute Project Tests</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-jarvis-border bg-jarvis-card space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bug className="w-4 h-4 text-amber-400" />
              <span>Error Diagnosis & Stack Trace Input</span>
            </h3>
            <textarea
              value={errorInput}
              onChange={(e) => setErrorInput(e.target.value)}
              placeholder="Paste terminal error, Python traceback, TypeScript compiler failure, or function code to debug..."
              rows={8}
              className="w-full bg-jarvis-dark border border-jarvis-border focus:border-cyan-500 rounded-lg p-3 text-xs text-white placeholder-jarvis-muted focus:outline-none font-mono"
            />
            <button
              onClick={handleDiagnose}
              disabled={running || !errorInput.trim()}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-glow-sm transition-all"
            >
              {running ? 'Analyzing Code...' : 'Diagnose & Generate Solution'}
            </button>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-jarvis-border bg-jarvis-card space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Synthesis & Test Audit Console</span>
            </h3>

            {codeOutput ? (
              <pre className="p-4 rounded-lg bg-jarvis-dark border border-jarvis-border text-xs font-mono text-cyan-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                {codeOutput}
              </pre>
            ) : (
              <div className="p-16 text-center text-xs text-jarvis-muted border border-dashed border-jarvis-border rounded-lg">
                Solution and test runner logs will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
