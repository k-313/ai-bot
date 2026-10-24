import React, { useState, useEffect } from 'react';
import { PageId, HealthStatus } from './types';
import { api } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { ChatPage } from './pages/ChatPage';
import { ApprovalPage } from './pages/ApprovalPage';
import { TaskManagerPage } from './pages/TaskManagerPage';
import { AgentsPage } from './pages/AgentsPage';
import { FilesPage } from './pages/FilesPage';
import { CodePage } from './pages/CodePage';
import { ResearchPage } from './pages/ResearchPage';
import { CollegePage } from './pages/CollegePage';
import { GenBlocPage } from './pages/GenBlocPage';
import { MemoryPage } from './pages/MemoryPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [isProcessing] = useState<boolean>(false);
  const [quickPrompt, setQuickPrompt] = useState<string>('');

  useEffect(() => {
    checkHealth();
    checkApprovals();
    const interval = setInterval(() => {
      checkHealth();
      checkApprovals();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const h = await api.getHealth();
      setHealth(h);
    } catch {
      setHealth(null);
    }
  };

  const checkApprovals = async () => {
    try {
      const list = await api.getApprovals();
      const pending = list.filter((a) => a.status === 'pending');
      setPendingApprovalsCount(pending.length);
    } catch {
      // ignore poll error
    }
  };

  const handleEmergencyStop = async () => {
    try {
      const res = await api.emergencyStop();
      alert(`Emergency Stop Triggered: ${res.tasks_cancelled} active/queued tasks were terminated immediately.`);
      checkApprovals();
    } catch (err: any) {
      alert(`Emergency Stop Error: ${err.message}`);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setQuickPrompt(prompt);
    setCurrentPage('chat');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} onQuickPrompt={handleQuickPrompt} />;
      case 'chat':
        return (
          <ChatPage
            initialPrompt={quickPrompt}
            onClearInitialPrompt={() => setQuickPrompt('')}
            onViewFile={() => setCurrentPage('files')}
          />
        );
      case 'approvals':
        return <ApprovalPage />;
      case 'tasks':
        return <TaskManagerPage />;
      case 'agents':
        return <AgentsPage onDirectPrompt={handleQuickPrompt} />;
      case 'files':
        return <FilesPage />;
      case 'code':
        return <CodePage />;
      case 'research':
        return <ResearchPage />;
      case 'college':
        return <CollegePage />;
      case 'genbloc':
        return <GenBlocPage />;
      case 'memory':
        return <MemoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} onQuickPrompt={handleQuickPrompt} />;
    }
  };

  const pageTitles: Record<PageId, string> = {
    home: 'Command Dashboard',
    chat: 'Neural AI Chat & Voice',
    approvals: 'Autonomous Approval Center',
    agents: 'Specialist Multi-Agent Swarm',
    tasks: 'Autonomous Task Manager',
    files: 'Files & Document Studio',
    code: 'Developer Code Assistant',
    research: 'Web & Academic Research',
    college: 'College Academic Hub',
    genbloc: 'GenBloc Business Suite',
    memory: 'Memory & Context Vault',
    settings: 'Assistant Configuration',
  };

  return (
    <div className="flex h-screen bg-jarvis-dark text-jarvis-text font-sans antialiased overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          pageTitle={pageTitles[currentPage]}
          isOnline={health !== null}
          model={health?.model || 'gpt-4o'}
          isProcessing={isProcessing}
          onEmergencyStop={handleEmergencyStop}
        />

        <main className="flex-1 overflow-hidden relative bg-jarvis-dark">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};
export default App;
