import React from 'react';
import { Github, PanelLeft, Search, Volume2, VolumeX, Plus } from 'lucide-react';
import { GitHubUser } from '../types/radar';
import { playTactileClick } from '../utils/audio';

export type NavTab =
  | 'radar'
  | 'studio'
  | 'pipeline'
  | 'qa'
  | 'submission'
  | 'policy'
  | 'strategy'
  | 'graph'
  | 'meta_learning';

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

  // Primary 5 links for the strict 3-zone <header> Top Bar Contract
  const primaryHeaderLinks: { id: NavTab; label: string }[] = [
    { id: 'radar', label: 'Global Radar' },
    { id: 'studio', label: 'Challenge Studio' },
    { id: 'pipeline', label: 'Code Pipeline' },
    { id: 'qa', label: 'QA & Provenance' },
    { id: 'submission', label: 'Packager' },
  ];

  // Full 9-module enterprise workspace suite in the secondary workspace toolbar
  const allModules: { id: NavTab; label: string }[] = [
    { id: 'radar', label: '01. Global Radar' },
    { id: 'studio', label: '02. Challenge Studio' },
    { id: 'pipeline', label: '03. Code Pipeline' },
    { id: 'qa', label: '04. QA & Provenance' },
    { id: 'submission', label: '05. Submission Packager' },
    { id: 'strategy', label: '06. Strategy Engine' },
    { id: 'policy', label: '07. Policy Engine' },
    { id: 'graph', label: '08. Knowledge Matrix' },
    { id: 'meta_learning', label: '09. Meta-Learning' },
  ];

  return (
    <div className="sticky top-0 z-40 select-none bg-slate-950">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="h-14 border-b border-slate-800 bg-slate-950 px-6 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#radar"
          onClick={(e) => {
            e.preventDefault();
            handleTabClick('radar');
          }}
          className="text-base font-bold tracking-tight text-white hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
        >
          AI Bounty Radar
        </a>

        {/* Zone 2: 5 Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          {primaryHeaderLinks.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'border-cyan-400 text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action Button */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => {
              playTactileClick();
              onOpenIngest();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-md hover:bg-cyan-300 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest Target</span>
          </button>
        </div>
      </header>

      {/* Secondary Enterprise Workspace Toolbar (All 9 Modules + Context & Utilities) */}
      <div className="h-10 border-b border-slate-800/90 bg-slate-900/70 px-4 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          {onToggleSidebar && (
            <button
              onClick={() => {
                playTactileClick();
                onToggleSidebar();
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors shrink-0 mr-1"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <PanelLeft className={`w-3.5 h-3.5 transition-transform ${isSidebarCollapsed ? 'rotate-180 text-cyan-400' : ''}`} />
            </button>
          )}

          {allModules.map((mod) => {
            const isActive = activeTab === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => handleTabClick(mod.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {mod.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {activeTargetTitle && (
            <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-400 pr-2 border-r border-slate-800">
              <span>Active Target:</span>
              <span className="text-slate-200 font-medium truncate max-w-[200px]">{activeTargetTitle}</span>
            </div>
          )}

          {onOpenCommandPalette && (
            <button
              onClick={() => {
                playTactileClick();
                onOpenCommandPalette();
              }}
              className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] text-slate-300 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:text-white rounded transition-colors whitespace-nowrap shrink-0"
              title="Command Palette (Cmd+K)"
            >
              <Search className="w-3 h-3 text-cyan-400" />
              <span>Command</span>
              <kbd className="text-[10px] font-mono text-slate-500">⌘K</kbd>
            </button>
          )}

          <button
            onClick={() => {
              playTactileClick();
              onOpenGitHubAuth();
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:text-white rounded transition-colors whitespace-nowrap shrink-0"
            title={githubUser ? `Connected as @${githubUser.login}` : 'Connect GitHub Repository'}
          >
            <Github className="w-3 h-3 text-slate-400" />
            <span>{githubUser ? `@${githubUser.login}` : 'GitHub OAuth'}</span>
          </button>

          {onToggleAudio && (
            <button
              onClick={onToggleAudio}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors shrink-0"
              title={isAudioOn ? 'Mute Audio Feedback' : 'Enable Audio Feedback'}
              aria-label={isAudioOn ? 'Mute Audio Feedback' : 'Enable Audio Feedback'}
            >
              {isAudioOn ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-600" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
