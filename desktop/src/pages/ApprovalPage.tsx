import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check, X, AlertTriangle, Clock } from 'lucide-react';
import { ApprovalItem } from '../types';
import { api } from '../services/api';

export const ApprovalPage: React.FC = () => {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      const data = await api.getApprovals();
      setApprovals(data);
    } catch (err) {
      console.error('Failed to load approvals', err);
    }
  };

  const handleDecision = async (id: string, decision: 'approve' | 'reject') => {
    try {
      await api.respondApproval(id, decision);
      loadApprovals();
    } catch (err) {
      alert(`Approval action failed: ${err}`);
    }
  };

  const pendingList = approvals.filter((a) => a.status === 'pending');
  const pastList = approvals.filter((a) => a.status !== 'pending');

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto overflow-y-auto">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-amber-400" />
          <span>Autonomous Approval Center</span>
        </h2>
        <p className="text-xs text-jarvis-muted mt-1">
          JARVIS enforces strict human authority. Sensitive or Level 3/4 operations require your explicit verification before execution.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white tracking-wider uppercase flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Pending Authorizations ({pendingList.length})</span>
        </h3>

        {pendingList.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-jarvis-border text-center text-xs text-jarvis-muted">
            No sensitive actions currently awaiting authorization. All autonomous agents are within safe baseline bounds.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingList.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-xl border border-amber-500/40 bg-amber-950/10 space-y-4 shadow-glow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.risk_level} RISK
                      </span>
                      <span className="text-xs font-mono text-jarvis-muted">
                        ACTION: {item.action}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1.5">{item.description}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecision(item.id, 'reject')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-950/40 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-semibold transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleDecision(item.id, 'approve')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-glow-sm transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Authorize Action</span>
                    </button>
                  </div>
                </div>

                {item.details && (
                  <div className="p-3 rounded-lg bg-jarvis-dark/80 border border-jarvis-border text-[11px] font-mono text-jarvis-muted space-y-1">
                    <p className="text-jarvis-text font-semibold">Inspection Parameters:</p>
                    <pre className="overflow-x-auto">{JSON.stringify(item.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 pt-6 border-t border-jarvis-border">
        <h3 className="text-sm font-semibold text-white tracking-wider uppercase flex items-center gap-2">
          <Clock className="w-4 h-4 text-jarvis-accent" />
          <span>Authorization Audit Log</span>
        </h3>

        <div className="space-y-2">
          {pastList.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-lg border border-jarvis-border bg-jarvis-card/40 flex items-center justify-between text-xs"
            >
              <div>
                <span className="text-white font-medium">{item.description}</span>
                <p className="text-[10px] text-jarvis-muted">
                  Action: {item.action} • Resolved at: {item.resolved_at ? new Date(item.resolved_at).toLocaleString() : 'N/A'}
                </p>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                  item.status === 'approved'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/10 text-red-400 border border-red-500/30'
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
