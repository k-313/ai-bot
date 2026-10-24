import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, ShieldCheck, Save, CheckCircle2 } from 'lucide-react';
import { SettingsData } from '../types';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [model, setModel] = useState<string>('gpt-4o');
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
      setModel(data.openai_model || 'gpt-4o');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await api.updateSettings({
        openai_api_key: apiKey ? apiKey : undefined,
        openai_model: model,
      });
      setSavedSuccess(true);
      loadSettings();
      setApiKey('');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto overflow-y-auto">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-jarvis-accent" />
          <span>Assistant Settings & Authority Registry</span>
        </h2>
        <p className="text-xs text-jarvis-muted mt-1">
          Configure model inference, security allowlists, and directory boundaries.
        </p>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-xl border border-jarvis-border bg-jarvis-card space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Key className="w-4 h-4 text-jarvis-accent" />
          <span>LLM Reasoning Engine Configuration</span>
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-jarvis-muted uppercase tracking-wider block mb-1">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                settings?.openai_configured
                  ? `Configured (${settings.openai_api_key_masked}) — enter new key to overwrite`
                  : 'Enter sk-... API key'
              }
              className="w-full bg-jarvis-dark border border-jarvis-border focus:border-blue-500 rounded-xl p-3 text-xs text-white placeholder-jarvis-muted focus:outline-none font-mono"
            />
            <p className="text-[10px] text-jarvis-muted mt-1">
              Stored securely on local backend. Never exposed to browser or bundled assets.
            </p>
          </div>

          <div>
            <label className="text-[11px] text-jarvis-muted uppercase tracking-wider block mb-1">
              Model Selection
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-jarvis-dark border border-jarvis-border rounded-xl p-3 text-xs text-white focus:outline-none"
            >
              <option value="gpt-4o">gpt-4o (Recommended: Fast & Intelligent)</option>
              <option value="gpt-4o-mini">gpt-4o-mini (Lightweight)</option>
              <option value="o1-preview">o1-preview (Deep Reasoning)</option>
              <option value="gpt-4-turbo">gpt-4-turbo</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Configuration updated successfully!</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </form>

      <div className="p-6 rounded-xl border border-jarvis-border bg-jarvis-card space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Security Guardrails & Approved Boundaries</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-jarvis-dark/80 border border-jarvis-border space-y-2">
            <span className="text-[10px] uppercase font-semibold text-jarvis-muted tracking-wider">
              Approved Workspace Root
            </span>
            <p className="font-mono text-cyan-400 truncate" title={settings?.workspace_dir}>
              {settings?.workspace_dir}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-jarvis-dark/80 border border-jarvis-border space-y-2">
            <span className="text-[10px] uppercase font-semibold text-jarvis-muted tracking-wider">
              Approved Output Root
            </span>
            <p className="font-mono text-cyan-400 truncate" title={settings?.output_dir}>
              {settings?.output_dir}
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-jarvis-border">
          <span className="text-[10px] uppercase font-semibold text-jarvis-muted tracking-wider block">
            Approved Windows Applications (Allowlist)
          </span>
          <div className="flex flex-wrap gap-2">
            {settings?.approved_applications.map((app) => (
              <span
                key={app}
                className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-jarvis-dark border border-jarvis-border text-white"
              >
                {app}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
