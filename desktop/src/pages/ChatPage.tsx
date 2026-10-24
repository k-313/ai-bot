import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  Sparkles,
  FileText,
  PlusCircle,
} from 'lucide-react';
import { ChatMessage, Conversation } from '../types';
import { api } from '../services/api';
import { Waveform } from '../components/Waveform';

interface ChatPageProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  onViewFile?: (filepath: string) => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  initialPrompt,
  onClearInitialPrompt,
  onViewFile,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadConversations = async () => {
    try {
      const convs = await api.getConversations();
      setConversations(convs);
      if (convs.length > 0 && !activeConvId) {
        selectConversation(convs[0].id);
      } else if (convs.length === 0) {
        setMessages([
          {
            id: 'init-1',
            role: 'assistant',
            content: 'Greetings. I am JARVIS, your personal Windows AI assistant. How may I assist you today with coding, studies, document generation, or business planning?',
            agent: 'orchestrator',
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  const selectConversation = async (id: string) => {
    setActiveConvId(id);
    try {
      setLoading(true);
      const data = await api.getConversation(id);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load conversation details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setActiveConvId(null);
    setMessages([
      {
        id: 'new-1',
        role: 'assistant',
        content: 'New session initiated. What project or task shall we focus on?',
        agent: 'orchestrator',
      },
    ]);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = input.trim();
    if (!cleanText || loading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: cleanText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.sendMessage(cleanText, activeConvId || undefined);
      if (!activeConvId) {
        setActiveConvId(response.conversation_id);
        loadConversations();
      }

      const assistantMessage: ChatMessage = {
        id: response.message_id || `asst-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        agent: response.agent,
        task_id: response.task_id,
        output_files: response.output_files,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Command encountered an error: ${err.message || 'Unknown network error'}.`,
          agent: 'system',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser environment.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-64 border-r border-jarvis-border bg-jarvis-card/40 flex flex-col justify-between shrink-0">
        <div className="p-4 border-b border-jarvis-border flex items-center justify-between">
          <span className="text-xs font-semibold text-white tracking-wider uppercase">History</span>
          <button
            onClick={handleNewConversation}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-blue-400 text-xs font-medium transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all truncate block ${
                activeConvId === conv.id
                  ? 'bg-blue-600/20 text-white border border-blue-500/30'
                  : 'text-jarvis-muted hover:text-jarvis-text hover:bg-jarvis-border/30'
              }`}
            >
              <div className="font-medium truncate">{conv.title}</div>
              <div className="text-[10px] text-jarvis-muted opacity-60">
                {new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between h-full bg-jarvis-dark/40 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-4xl ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white shadow-glow-sm'
                    : 'bg-indigo-950 border border-indigo-500/40 text-indigo-400'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`rounded-2xl p-4 text-xs leading-relaxed max-w-2xl border ${
                  msg.role === 'user'
                    ? 'bg-blue-600/20 border-blue-500/40 text-white'
                    : 'bg-jarvis-card border-jarvis-border text-jarvis-text shadow-sm'
                }`}
              >
                {msg.role === 'assistant' && msg.agent && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-jarvis-border/60 text-[10px] text-jarvis-muted">
                    <Sparkles className="w-3 h-3 text-jarvis-cyan" />
                    <span className="font-mono text-jarvis-cyan uppercase">
                      {msg.agent.replace('_', ' ')}
                    </span>
                    {msg.task_id && (
                      <span className="text-[9px] bg-jarvis-dark px-1.5 py-0.5 rounded font-mono">
                        TASK: {msg.task_id.slice(0, 8)}
                      </span>
                    )}
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                {msg.output_files && msg.output_files.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-jarvis-border/80 space-y-1.5">
                    <p className="text-[10px] font-semibold text-jarvis-muted uppercase tracking-wider">
                      Generated Documents & Files
                    </p>
                    {msg.output_files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-jarvis-dark/80 border border-jarvis-border text-xs"
                      >
                        <div className="flex items-center gap-2 text-jarvis-cyan font-mono truncate">
                          <FileText className="w-4 h-4 shrink-0" />
                          <span className="truncate">{file.split('\\').pop() || file}</span>
                        </div>
                        {onViewFile && (
                          <button
                            onClick={() => onViewFile(file)}
                            className="text-[11px] text-blue-400 hover:text-blue-300 font-medium shrink-0 ml-2"
                          >
                            Preview
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="rounded-2xl p-4 bg-jarvis-card border border-jarvis-border text-xs flex items-center gap-3">
                <Waveform active={true} color="#3b82f6" />
                <span className="text-jarvis-muted">JARVIS is planning and orchestrating...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-jarvis-border bg-jarvis-card/60 backdrop-blur">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-3">
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                  : 'bg-jarvis-dark/80 border-jarvis-border text-jarvis-muted hover:text-white'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Push-to-Talk (Microphone)'}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask JARVIS to write code, build a PowerPoint, solve a bug, or plan studies..."
              className="flex-1 bg-jarvis-dark/90 border border-jarvis-border focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-jarvis-muted focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-glow-sm transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
