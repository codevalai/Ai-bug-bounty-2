import React from 'react';
import { Plus, Radio, Cpu, ShieldCheck, Github } from 'lucide-react';
import { GitHubUser } from '../types/radar';

export type NavTab = 'radar' | 'studio' | 'pipeline' | 'qa' | 'submission' | 'policy' | 'graph';

interface TopNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenIngest: () => void;
  onSimulateEvent: () => void;
  hasApiKey: boolean;
  activeTargetTitle?: string;
  githubUser?: GitHubUser | null;
  onOpenGitHubAuth: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenIngest,
  onSimulateEvent,
  hasApiKey,
  activeTargetTitle,
  githubUser,
  onOpenGitHubAuth,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Zone 1: Single Brand element */}
      <div className="flex items-center gap-3">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('radar');
          }}
          className="text-base font-bold tracking-tight text-white flex items-center gap-2 hover:text-cyan-400 transition-colors"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span>AI Bounty Radar</span>
        </a>
        {activeTargetTitle && (
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 border-l border-slate-800 pl-3">
            <span className="text-slate-500">Active:</span>
            <span className="text-slate-200 font-medium truncate max-w-xs">{activeTargetTitle}</span>
          </div>
        )}
      </div>

      {/* Zone 2: 4-6 Clean text navigation links */}
      <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-300">
        <button
          onClick={() => setActiveTab('radar')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'radar' ? 'bg-slate-800 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          Global Radar
        </button>
        <button
          onClick={() => setActiveTab('studio')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'studio' ? 'bg-slate-800 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          Challenge Studio
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'pipeline' ? 'bg-slate-800 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          Code Pipeline
        </button>
        <button
          onClick={() => setActiveTab('qa')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'qa' ? 'bg-slate-800 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          QA &amp; Fingerprint
        </button>
        <button
          onClick={() => setActiveTab('submission')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'submission' ? 'bg-slate-800 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          Submission Packager
        </button>
        <button
          onClick={() => setActiveTab('graph')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'graph' ? 'bg-slate-800 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          Knowledge Matrix
        </button>
        <button
          onClick={() => setActiveTab('policy')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'policy' ? 'bg-slate-800 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          Policy Engine
        </button>
      </nav>

      {/* Zone 3: 1-2 Primary actions */}
      <div className="flex items-center gap-2">
        {githubUser ? (
          <button
            onClick={onOpenGitHubAuth}
            className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-900 border border-emerald-500/40 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
            title="GitHub Account Connected"
          >
            <img
              src={githubUser.avatar_url}
              alt={githubUser.login}
              className="w-4 h-4 rounded-full border border-slate-700"
            />
            <span className="font-mono text-cyan-300">@{githubUser.login}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </button>
        ) : (
          <button
            onClick={onOpenGitHubAuth}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
          >
            <Github className="w-3.5 h-3.5 text-slate-400" />
            <span>Connect GitHub</span>
          </button>
        )}

        <button
          onClick={onSimulateEvent}
          title="Simulate incoming real-time challenge detection"
          className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded-md hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
        >
          <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Simulate Detection</span>
        </button>

        <button
          onClick={onOpenIngest}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-md hover:bg-cyan-300 transition-colors whitespace-nowrap shadow-sm shadow-cyan-900/30"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ingest Target</span>
        </button>
      </div>
    </header>
  );
};

