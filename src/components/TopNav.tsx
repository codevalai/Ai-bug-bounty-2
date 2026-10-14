import React from 'react';
import { Plus, Radio, Cpu, ShieldCheck, Github, PanelLeft, Search, Volume2, VolumeX, Download, BrainCircuit, Compass } from 'lucide-react';
import { GitHubUser } from '../types/radar';
import { playTactileClick } from '../utils/audio';

export type NavTab = 'radar' | 'studio' | 'pipeline' | 'qa' | 'submission' | 'policy' | 'strategy' | 'graph' | 'meta_learning';

interface TopNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenIngest: () => void;
  onSimulateEvent?: () => void;
  onLiveRadarScan?: () => void;
  onDownloadZip?: () => void;
  hasApiKey: boolean;
  activeTargetTitle?: string;
  githubUser?: GitHubUser | null;
  onOpenGitHubAuth: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenCommandPalette?: () => void;
  isAudioOn?: boolean;
  onToggleAudio?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenIngest,
  onSimulateEvent,
  onLiveRadarScan,
  onDownloadZip,
  hasApiKey,
  activeTargetTitle,
  githubUser,
  onOpenGitHubAuth,
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenCommandPalette,
  isAudioOn = true,
  onToggleAudio,
}) => {
  const handleTabClick = (tab: NavTab) => {
    playTactileClick();
    setActiveTab(tab);
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Zone 1: Single Brand element + Sidebar Toggle */}
      <div className="flex items-center gap-2.5">
        {onToggleSidebar && (
          <button
            onClick={() => {
              playTactileClick();
              onToggleSidebar();
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-md transition-colors"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeft className={`w-4 h-4 transition-transform ${isSidebarCollapsed ? 'rotate-180 text-cyan-400' : ''}`} />
          </button>
        )}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleTabClick('radar');
          }}
          className="text-base font-bold tracking-tight text-white flex items-center gap-2 hover:text-cyan-400 transition-colors"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span>AI Bounty Radar</span>
        </a>
        {activeTargetTitle && (
          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400 border-l border-slate-800 pl-3">
            <span className="text-slate-500">Active:</span>
            <span className="text-slate-200 font-medium truncate max-w-xs">{activeTargetTitle}</span>
          </div>
        )}
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-300">
        <button
          onClick={() => handleTabClick('radar')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'radar' ? 'bg-slate-800 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          Global Radar
        </button>
        <button
          onClick={() => handleTabClick('studio')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'studio' ? 'bg-slate-800 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          Challenge Studio
        </button>
        <button
          onClick={() => handleTabClick('pipeline')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'pipeline' ? 'bg-slate-800 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          Code Pipeline
        </button>
        <button
          onClick={() => handleTabClick('qa')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'qa' ? 'bg-slate-800 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          QA &amp; Fingerprint
        </button>
        <button
          onClick={() => handleTabClick('submission')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'submission' ? 'bg-slate-800 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          Submission Packager
        </button>
        <button
          onClick={() => handleTabClick('graph')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'graph' ? 'bg-slate-800 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          Knowledge Matrix
        </button>
        <button
          onClick={() => handleTabClick('policy')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'policy' ? 'bg-slate-800 text-white' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          Policy Engine
        </button>
        <button
          onClick={() => handleTabClick('strategy')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'strategy' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>Strategy Engine</span>
        </button>
        <button
          onClick={() => handleTabClick('meta_learning')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'meta_learning' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
          <span>Meta-Learning</span>
        </button>
      </nav>

      {/* Zone 3: Actions + Command Palette + Audio Toggle */}
      <div className="flex items-center gap-2">
        {onOpenCommandPalette && (
          <button
            onClick={() => {
              playTactileClick();
              onOpenCommandPalette();
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 bg-slate-900 border border-slate-800 hover:text-white hover:border-slate-700 rounded-md transition-colors"
            title="Command Palette (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <kbd className="text-[10px] font-mono text-slate-500">⌘K</kbd>
          </button>
        )}

        {onToggleAudio && (
          <button
            onClick={onToggleAudio}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-md transition-colors"
            title={isAudioOn ? 'Mute Procedural Sound FX' : 'Enable Procedural Sound FX'}
          >
            {isAudioOn ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-600" />}
          </button>
        )}

        {githubUser ? (
          <button
            onClick={() => {
              playTactileClick();
              onOpenGitHubAuth();
            }}
            className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-900 border border-emerald-500/40 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
            title="GitHub Account Connected"
          >
            <img
              src={githubUser.avatar_url}
              alt={githubUser.login}
              className="w-4 h-4 rounded-full border border-slate-700"
            />
            <span className="font-mono text-cyan-300">@{githubUser.login}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          </button>
        ) : (
          <button
            onClick={() => {
              playTactileClick();
              onOpenGitHubAuth();
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
          >
            <Github className="w-3.5 h-3.5 text-slate-400" />
            <span>Connect GitHub</span>
          </button>
        )}

        {onDownloadZip && (
          <button
            onClick={() => {
              playTactileClick();
              onDownloadZip();
            }}
            title="Download full deployable ZIP pack (source, docker, tests, submission)"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors whitespace-nowrap shadow-sm shadow-emerald-900/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ZIP Pack</span>
          </button>
        )}

        <button
          onClick={() => {
            playTactileClick();
            if (onLiveRadarScan) onLiveRadarScan();
            else if (onSimulateEvent) onSimulateEvent();
          }}
          title="Scan live real-time vulnerability advisories & hackathons"
          className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-slate-900 border border-cyan-800/60 rounded-md hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Live Radar Scan</span>
        </button>

        <button
          onClick={() => {
            playTactileClick();
            onOpenIngest();
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-md hover:bg-cyan-300 transition-colors whitespace-nowrap shadow-sm shadow-cyan-900/30"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ingest Target</span>
        </button>
      </div>
    </header>
  );
};


