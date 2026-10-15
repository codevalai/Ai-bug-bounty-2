import React from 'react';
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
        className="w-16 shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col justify-between py-4 px-2 text-slate-300 transition-all duration-150 select-none"
        aria-label="Sidebar collapsed"
      >
        <div className="space-y-4 flex flex-col items-center">
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

          <div
            className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center cursor-default"
            title={`Total Tracked: $${(totalPrizePoolUsd / 1000000).toFixed(2)}M across ${totalTargetsCount} targets (${inPipelineCount} in pipeline)`}
          >
            <Activity className="w-4 h-4 text-cyan-400 mx-auto" />
            <span className="text-[10px] font-mono tabular-nums text-slate-300 block mt-0.5 font-semibold">
              ${Math.round(totalPrizePoolUsd / 1000000)}M
            </span>
          </div>

          <button
            onClick={() => setShowGoogleOnly(!showGoogleOnly)}
            className={`p-2 rounded-lg transition-colors border flex items-center justify-center ${
              showGoogleOnly
                ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title={`Google AI & VRP Focus: ${showGoogleOnly ? 'Active' : 'Off'}`}
            aria-label="Toggle Google AI focus"
          >
            <Zap className={`w-4 h-4 ${showGoogleOnly ? 'text-cyan-400' : 'text-slate-400'}`} />
          </button>

          <div className="w-full border-t border-slate-800 pt-3 flex flex-col items-center gap-1">
            {categoryFilters.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  title={cat.label}
                  aria-label={cat.label}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500">
          <span>SLSA</span>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="w-64 shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col justify-between p-4 text-slate-300 transition-all duration-150 select-none"
      aria-label="Sidebar expanded"
    >
      <div className="space-y-6">
        {/* Portfolio Liquidity Summary */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">
              Portfolio Overview
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

          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
            <div>
              <div className="text-xs text-slate-400">Tracked Prize Liquidity</div>
              <div className="text-xl font-bold text-white font-mono tabular-nums mt-0.5">
                ${(totalPrizePoolUsd / 1000000).toFixed(2)}M
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono tabular-nums">
              <span>{totalTargetsCount} Indexed</span>
              <span>·</span>
              <span className="text-cyan-400">{inPipelineCount} Active</span>
              <span>·</span>
              <span className="text-emerald-400">{completedPackagesCount} Audited</span>
            </div>
          </div>
        </div>

        {/* Ecosystem Focus Toggle */}
        <div>
          <div className="text-xs font-semibold text-slate-300 mb-2">
            Ecosystem Filter
          </div>
          <button
            onClick={() => setShowGoogleOnly(!showGoogleOnly)}
            className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-between border ${
              showGoogleOnly
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2 whitespace-nowrap">
              <Zap className={`w-3.5 h-3.5 ${showGoogleOnly ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>Google AI &amp; VRP Focus</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400 tabular-nums">
              {showGoogleOnly ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Category Navigation */}
        <div>
          <div className="text-xs font-semibold text-slate-300 mb-2">
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate">{cat.label}</span>
                  </span>
                  {cat.count !== undefined && (
                    <span className="font-mono text-[11px] text-slate-500 tabular-nums">{cat.count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subsystem Verification Summary */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="text-xs font-semibold text-slate-300">
            Verification Guarantees
          </div>
          <div className="text-xs space-y-1.5 text-slate-400">
            <div className="flex items-center justify-between">
              <span>Consensus Loop</span>
              <span className="font-mono text-[11px] text-slate-300 tabular-nums">k ≤ 3 Bounded</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Receipt Canonicalizer</span>
              <span className="font-mono text-[11px] text-slate-300">RFC 8785 JCS</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Provenance Spec</span>
              <span className="font-mono text-[11px] text-emerald-400">SLSA v1.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Information */}
      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between">
          <span>Synthesis Model</span>
          <span className="font-mono text-slate-400">gemini-3.8-flash</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Runtime Mode</span>
          <span className="font-mono text-slate-300">
            {hasApiKey ? 'Server API Active' : 'Deterministic Engine'}
          </span>
        </div>
      </div>
    </aside>
  );
};
