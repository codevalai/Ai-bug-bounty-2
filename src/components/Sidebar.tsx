import React from 'react';
import { TargetCategory } from '../types/radar';
import {
  Shield,
  Sparkles,
  Trophy,
  Globe,
  Code,
  Landmark,
  PanelLeftClose,
  PanelLeftOpen,
  Activity,
  Layers,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  showGoogleOnly: boolean;
  setShowGoogleOnly: (val: boolean) => void;
  totalTargetsCount: number;
  totalPrizePoolUsd: number;
  inPipelineCount: number;
  completedPackagesCount: number;
  hasApiKey: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedCategory,
  setSelectedCategory,
  showGoogleOnly,
  setShowGoogleOnly,
  totalTargetsCount,
  totalPrizePoolUsd,
  inPipelineCount,
  completedPackagesCount,
  hasApiKey,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const categoryFilters = [
    { id: 'all', label: 'All Ingested Feeds', icon: Globe, count: totalTargetsCount },
    { id: 'ai', label: 'AI & Multi-Modal', icon: Sparkles },
    { id: 'vrp_security', label: 'Bug Bounty / VRP', icon: Shield },
    { id: 'crypto_web3', label: 'Crypto & Web3', icon: Code },
    { id: 'flagship', label: 'Global Flagship', icon: Trophy },
    { id: 'university', label: 'University Competitions', icon: Landmark },
  ];

  if (isCollapsed) {
    return (
      <aside
        className="w-16 shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col justify-between py-3 px-2 text-slate-300 transition-all duration-200 select-none"
        aria-label="Sidebar collapsed"
      >
        <div className="space-y-4 flex flex-col items-center">
          {/* Expand Toggle Button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-md transition-colors"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          {/* Compact Telemetry Icon with Tooltip */}
          <div
            className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg text-center cursor-default group relative"
            title={`Total Tracked: $${(totalPrizePoolUsd / 1000000).toFixed(2)}M across ${totalTargetsCount} targets (${inPipelineCount} in pipeline)`}
          >
            <Activity className="w-4 h-4 text-cyan-400 mx-auto" />
            <span className="text-[10px] font-mono text-slate-300 block mt-0.5 font-bold">
              ${Math.round(totalPrizePoolUsd / 1000000)}M
            </span>
          </div>

          {/* Google Ecosystem Focus Mini Toggle */}
          <button
            onClick={() => setShowGoogleOnly(!showGoogleOnly)}
            className={`p-2 rounded-lg transition-all border relative flex items-center justify-center ${
              showGoogleOnly
                ? 'bg-cyan-950/70 border-cyan-500/70 text-cyan-300'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title={`Google AI & VRP Focus: ${showGoogleOnly ? 'ON' : 'OFF'}`}
            aria-label="Toggle Google AI focus"
          >
            <Zap className={`w-4 h-4 ${showGoogleOnly ? 'text-cyan-400' : 'text-slate-400'}`} />
            {showGoogleOnly && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute top-1 right-1 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
            )}
          </button>

          {/* Category Icons Rail */}
          <div className="w-full border-t border-slate-800/80 pt-3 flex flex-col items-center gap-1">
            {categoryFilters.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all relative ${
                    isActive
                      ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  title={cat.label}
                  aria-label={cat.label}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {isActive && (
                    <span className="w-1 h-3 rounded-full bg-cyan-400 absolute left-0 top-1/2 -translate-y-1/2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Footer Status */}
        <div className="flex flex-col items-center gap-2 pt-3 border-t border-slate-800/80 text-[10px]">
          <div
            className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
            title={hasApiKey ? 'Gemini 3.8 Flash API Active' : 'Autonomous Engine Active'}
          />
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="w-64 shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col justify-between p-4 text-slate-300 transition-all duration-200 select-none"
      aria-label="Sidebar expanded"
    >
      <div className="space-y-6">
        {/* Radar Telemetry Header & Collapse Button */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Radar Telemetry
            </span>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-900 rounded transition-colors"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg">
              <div className="text-xs text-slate-400">Total Tracked Bounties</div>
              <div className="text-xl font-bold text-white font-mono tabular-nums mt-0.5">
                ${(totalPrizePoolUsd / 1000000).toFixed(2)}M
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>{totalTargetsCount} targets active</span>
                <span className="text-cyan-400 font-mono tabular-nums">{inPipelineCount} in pipeline</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Filter: Google Ecosystem Focus */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Ecosystem Focus
          </div>
          <button
            onClick={() => setShowGoogleOnly(!showGoogleOnly)}
            className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center justify-between border ${
              showGoogleOnly
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200'
                : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
              <span>Google AI &amp; VRP Focus</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400 tabular-nums">
              {showGoogleOnly ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Category Navigation */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Feed Categories
          </div>
          <div className="space-y-0.5">
            {categoryFilters.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-slate-800 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pipeline Readiness */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Autonomous Pipeline
          </div>
          <div className="text-xs space-y-1.5 p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span>Interpreter Engine</span>
              <span className="text-emerald-400 font-mono text-[11px]">Ready</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Code Synthesizer</span>
              <span className="text-emerald-400 font-mono text-[11px]">Ready</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>QA &amp; SHA-256</span>
              <span className="text-emerald-400 font-mono text-[11px]">Enforced</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Meta-Learning</span>
              <span className="text-cyan-400 font-mono text-[11px]">Auto-Refining</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Strategy Engine</span>
              <span className="text-emerald-400 font-mono text-[11px]">Alpha Maximizer</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Packaged Bundles</span>
              <span className="text-cyan-400 font-mono text-[11px] tabular-nums">{completedPackagesCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between">
          <span>AI Model Engine</span>
          <span className="font-mono text-slate-400">gemini-3.8-flash</span>
        </div>
        <div className="flex items-center justify-between">
          <span>API Key Connection</span>
          <span className={`font-mono ${hasApiKey ? 'text-emerald-400' : 'text-amber-400'}`}>
            {hasApiKey ? 'Connected' : 'Autonomous Mode'}
          </span>
        </div>
      </div>
    </aside>
  );
};
