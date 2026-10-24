import React, { useState, useEffect } from 'react';
import { FolderKanban, FileText, Eye, RefreshCw, PlusCircle } from 'lucide-react';
import { FileItem } from '../types';
import { api } from '../services/api';

export const FilesPage: React.FC = () => {
  const [folder, setFolder] = useState<'workspace' | 'output'>('output');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [preview, setPreview] = useState<{ name: string; content: string } | null>(null);

  const [showGenModal, setShowGenModal] = useState<boolean>(false);
  const [docType, setDocType] = useState<string>('pdf');
  const [docTitle, setDocTitle] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);

  useEffect(() => {
    loadFiles();
  }, [folder]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await api.getFiles(folder);
      setFiles(data);
    } catch (err) {
      console.error('Failed to load files', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (path: string) => {
    try {
      const p = await api.getFilePreview(path);
      setPreview({ name: p.name, content: p.content });
    } catch (err: any) {
      alert(`Preview not available for this binary or large format: ${err.message}`);
    }
  };

  const handleGenerateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    try {
      setGenerating(true);
      await api.generateDocument({
        doc_type: docType,
        title: docTitle,
        subtitle: 'Created via JARVIS Document Studio',
      });
      setShowGenModal(false);
      setDocTitle('');
      setFolder('output');
      loadFiles();
    } catch (err: any) {
      alert(`Document generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-cyan-400" />
            <span>Files & Document Workspace</span>
          </h2>
          <p className="text-xs text-jarvis-muted mt-1">
            Browse and preview approved files in safe workspace and output directories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGenModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate Document</span>
          </button>

          <button
            onClick={loadFiles}
            className="p-2 rounded-xl bg-jarvis-card border border-jarvis-border text-jarvis-muted hover:text-white transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-jarvis-border pb-3">
        <button
          onClick={() => setFolder('output')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
            folder === 'output'
              ? 'bg-blue-600/20 border border-blue-500/40 text-blue-400'
              : 'text-jarvis-muted hover:text-white'
          }`}
        >
          Generated Outputs (output/)
        </button>
        <button
          onClick={() => setFolder('workspace')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
            folder === 'workspace'
              ? 'bg-blue-600/20 border border-blue-500/40 text-blue-400'
              : 'text-jarvis-muted hover:text-white'
          }`}
        >
          Code & Projects (workspace/)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-jarvis-muted rounded-xl border border-dashed border-jarvis-border">
            No files found in {folder}/. Create documents or add source files to begin.
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.absolute_path}
              className="p-4 rounded-xl border border-jarvis-border bg-jarvis-card flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-white truncate" title={file.name}>
                    {file.name}
                  </h4>
                  <p className="text-[10px] text-jarvis-muted font-mono">
                    {(file.size_bytes / 1024).toFixed(1)} KB • {file.extension.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-jarvis-border text-xs">
                <span className="text-[10px] text-jarvis-muted">
                  {new Date(file.modified_at).toLocaleDateString()}
                </span>

                <button
                  onClick={() => handlePreview(file.absolute_path)}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium text-[11px]"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-jarvis-card border border-jarvis-border rounded-2xl max-w-3xl w-full max-h-[80vh] flex flex-col shadow-glow-md">
            <div className="p-4 border-b border-jarvis-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono">{preview.name}</h3>
              <button
                onClick={() => setPreview(null)}
                className="text-xs text-jarvis-muted hover:text-white"
              >
                Close (ESC)
              </button>
            </div>
            <pre className="p-6 flex-1 overflow-auto text-xs font-mono text-jarvis-text whitespace-pre-wrap">
              {preview.content}
            </pre>
          </div>
        </div>
      )}

      {showGenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-jarvis-card border border-jarvis-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-glow-md">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Document Synthesis Studio
            </h3>

            <form onSubmit={handleGenerateDocument} className="space-y-4">
              <div>
                <label className="text-[11px] text-jarvis-muted uppercase tracking-wider block mb-1">
                  Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['pptx', 'docx', 'pdf'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDocType(type)}
                      className={`py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                        docType === type
                          ? 'bg-blue-600 text-white shadow-glow-sm'
                          : 'bg-jarvis-dark text-jarvis-muted hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-jarvis-muted uppercase tracking-wider block mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Operating Systems Final Exam Study Guide"
                  className="w-full bg-jarvis-dark border border-jarvis-border focus:border-blue-500 rounded-lg p-2.5 text-xs text-white placeholder-jarvis-muted focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="px-4 py-2 rounded-lg bg-jarvis-dark border border-jarvis-border text-xs text-jarvis-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow-sm"
                >
                  {generating ? 'Compiling...' : 'Generate File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
