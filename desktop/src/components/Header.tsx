import React from 'react';
import { ShieldAlert, Sparkles, Activity } from 'lucide-react';
import { Waveform } from './Waveform';

interface HeaderProps {
  pageTitle: string;
  isOnline: boolean;
  model: string;
  isProcessing: boolean;
  onEmergencyStop: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  isOnline,
  model,
  isProcessing,
  onEmergencyStop,
}) => {
  return (
    <header className="h-16 border-b border-jarvis-border bg-jarvis-card/80 backdrop-blur px-6 flex items-center justify-between z-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-glow-sm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-wider text-jarvis-text uppercase">
            {pageTitle}
          </h2>
          <div className="flex items-center gap-2 text-xs text-jarvis-muted">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'
              }`}
            />
            <span>{isOnline ? 'Core Online' : 'Core Offline'}</span>
            <span>•</span>
            <span className="text-jarvis-accent font-mono">{model}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-jarvis-dark/60 border border-jarvis-border rounded-full">
          <Activity className="w-3.5 h-3.5 text-jarvis-cyan" />
          <Waveform active={isProcessing} color="#06b6d4" />
          <span className="text-[11px] font-mono text-jarvis-cyan">
            {isProcessing ? 'SYNTHESIZING' : 'STANDBY'}
          </span>
        </div>

        <button
          onClick={onEmergencyStop}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/50 text-red-300 text-xs font-semibold shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
          title="Emergency Stop: Halt all running tasks immediately"
        >
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>EMERGENCY STOP</span>
        </button>
      </div>
    </header>
  );
};
