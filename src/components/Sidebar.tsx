import React from 'react';
import { TargetCategory } from '../types/radar';
import { Shield, Sparkles, Trophy, Globe, Code, Landmark, Activity, CheckCircle2 } from 'lucide-react';

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
}) => {
  const categoryFilters = [
    { id: 'all', label: 'All Ingested Feeds', icon: Globe },
    { id: 'ai', label: 'AI & Multi-Modal', icon: Sparkles },
    { id: 'vrp_security', label: 'Bug Bounty / VRP', icon: Shield },
    { id: 'crypto_web3', label: 'Crypto & Web3 Bounties', icon: Code },
    { id: 'flagship', label: 'Global Flagship Hackathons', icon: Trophy },
    { id: 'university', label: 'University Competitions', icon: Landmark },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col justify-between p-4 text-slate-300">
      <div className="space-y-6">
        {/* Radar Telemetry Metrics */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Radar Telemetry
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
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
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
                      ? 'bg-slate-800 text-white'
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
