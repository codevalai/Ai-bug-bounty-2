import React, { useState } from 'react';
import { PolicyRuleConfig } from '../types/radar';
import { Shield, Sliders, CheckCircle2, AlertOctagon, Save, Compass, Sparkles, ArrowRight, Zap } from 'lucide-react';

interface PolicyEngineViewProps {
  policy: PolicyRuleConfig;
  onUpdatePolicy: (policy: PolicyRuleConfig) => void;
  onNavigateToStrategy?: () => void;
}

export const PolicyEngineView: React.FC<PolicyEngineViewProps> = ({
  policy,
  onUpdatePolicy,
  onNavigateToStrategy,
}) => {
  const [currentPolicy, setCurrentPolicy] = useState<PolicyRuleConfig>(policy);
  const [savedNotice, setSavedNotice] = useState(false);
  const [strategyAppliedNotice, setStrategyAppliedNotice] = useState<string | null>(null);

  const handleSave = () => {
    onUpdatePolicy(currentPolicy);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const applyStrategyPreset = (minPrize: number, maxBuilds: number, platforms: string[], label: string) => {
    const updated: PolicyRuleConfig = {
      ...currentPolicy,
      minimumPrizeUsd: minPrize,
      maxActiveRunsPerWeek: maxBuilds,
      whitelistedPlatforms: Array.from(new Set([...currentPolicy.whitelistedPlatforms, ...platforms])),
    };
    setCurrentPolicy(updated);
    onUpdatePolicy(updated);
    setStrategyAppliedNotice(`Applied "${label}" strategy profile to Policy Engine!`);
    setTimeout(() => setStrategyAppliedNotice(null), 3500);
  };

  const allAvailablePlatforms = [
    'Google AI Studio',
    'Google Bug Hunters / VRP',
    'Devpost',
    'ETHGlobal',
    'HackerOne',
    'Bugcrowd',
    'Immunefi',
    'MLH',
    'HackerEarth',
    'Stanford TreeHacks',
  ];

  const togglePlatform = (p: string) => {
    const list = currentPolicy.whitelistedPlatforms || [];
    const exists = list.includes(p);
    const updated = exists
      ? list.filter((x) => x !== p)
      : [...list, p];
    setCurrentPolicy({ ...currentPolicy, whitelistedPlatforms: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Policy &amp; Governance Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enforces strict safety boundaries, rate limits, platform whitelists, and originality invariants.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors inline-flex items-center gap-1.5 shadow-sm shadow-cyan-900/30"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{savedNotice ? 'Rules Updated!' : 'Save Governance Rules'}</span>
        </button>
      </div>

      {/* Strategy Engine Guidance Banner */}
      {strategyAppliedNotice && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-lg text-xs text-emerald-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{strategyAppliedNotice}</span>
          </div>
        </div>
      )}

      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 border border-cyan-500/30 rounded-xl space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-md">
              <Compass className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">Strategy Engine Policy Directives</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800/60 rounded">
                  Portfolio Optimized
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Data-driven build strategy profiles calibrated from competition prize liquidity and archetype win rates.
              </p>
            </div>
          </div>

          {onNavigateToStrategy && (
            <button
              onClick={onNavigateToStrategy}
              className="px-3 py-1 text-xs text-cyan-300 hover:text-white bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-md transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <span>Explore Strategy Engine</span>
              <ArrowRight className="w-3 h-3 text-cyan-400" />
            </button>
          )}
        </div>

        {/* 1-Click Strategy Presets Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-[11px]">Balanced High-Yield</span>
                <span className="text-[10px] text-cyan-400 font-mono font-bold">$15k+ Min</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                Prioritizes Google AI Studio &amp; VRP security with 90%+ win rate. 14 builds/wk.
              </p>
            </div>
            <button
              onClick={() =>
                applyStrategyPreset(
                  15000,
                  14,
                  ['Google AI Studio', 'Google Bug Hunters / VRP', 'Devpost', 'ETHGlobal', 'HackerOne', 'Immunefi'],
                  'Balanced High-Yield'
                )
              }
              className="mt-2 w-full py-1 text-[11px] font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors"
            >
              Apply Preset
            </button>
          </div>

          <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-[11px]">Aggressive Alpha</span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">$25k+ Min</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                Filters for maximum flagship payouts &amp; critical bounties. 18 builds/wk.
              </p>
            </div>
            <button
              onClick={() =>
                applyStrategyPreset(
                  25000,
                  18,
                  ['Google Bug Hunters / VRP', 'Google AI Studio', 'ETHGlobal', 'Immunefi', 'HackerOne'],
                  'Aggressive Alpha'
                )
              }
              className="mt-2 w-full py-1 text-[11px] font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
            >
              Apply Preset
            </button>
          </div>

          <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-[11px]">VRP Bounty Sniper</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">$20k+ Min</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                Hyper-focused on security bounties with 94% validated cash payouts. 12 builds/wk.
              </p>
            </div>
            <button
              onClick={() =>
                applyStrategyPreset(
                  20000,
                  12,
                  ['Google Bug Hunters / VRP', 'HackerOne', 'Immunefi', 'Bugcrowd'],
                  'VRP Bounty Sniper'
                )
              }
              className="mt-2 w-full py-1 text-[11px] font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors"
            >
              Apply Preset
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* Left Column: Automation & Safety Rules (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Whitelist Platform Rule */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Trusted Platform Whitelist</span>
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                {currentPolicy.whitelistedPlatforms.length} Active
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Auto-generation will only trigger for challenges hosted on approved platforms.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {allAvailablePlatforms.map((plat) => {
                const isChecked = (currentPolicy.whitelistedPlatforms || []).includes(plat);
                return (
                  <button
                    key={plat}
                    onClick={() => togglePlatform(plat)}
                    className={`px-3 py-1.5 rounded text-xs transition-colors border ${
                      isChecked
                        ? 'bg-slate-800 border-cyan-500/70 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {plat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minimum Prize Pool Filter */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Minimum Prize Pool Gate</span>
              </span>
              <span className="font-mono text-cyan-300 font-semibold tabular-nums">
                ${currentPolicy.minimumPrizeUsd.toLocaleString()} USD
              </span>
            </div>
            <p className="text-slate-400">
              Ignore or mark as manual review any competition offering less than the configured prize threshold.
            </p>
            <input
              type="range"
              min="0"
              max="50000"
              step="5000"
              value={currentPolicy.minimumPrizeUsd}
              onChange={(e) =>
                setCurrentPolicy({ ...currentPolicy, minimumPrizeUsd: Number(e.target.value) })
              }
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Rate Limits */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Max Active Builds per Week</span>
              <span className="font-mono text-cyan-300 font-semibold tabular-nums">
                {currentPolicy.maxActiveRunsPerWeek} builds
              </span>
            </div>
            <p className="text-slate-400">
              Guarantees responsible compute usage and prevents runaway automation loops across platforms.
            </p>
            <input
              type="range"
              min="2"
              max="25"
              step="1"
              value={currentPolicy.maxActiveRunsPerWeek}
              onChange={(e) =>
                setCurrentPolicy({ ...currentPolicy, maxActiveRunsPerWeek: Number(e.target.value) })
              }
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Right Column: Invariants & Safety Protocols (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-4">
            <span className="font-semibold text-slate-200 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              <span>Mandatory Safety Invariants</span>
            </span>

            {/* Toggle 1: Originality Fingerprint */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-medium text-slate-200">Enforce SHA-256 Code Fingerprinting</span>
                <input
                  type="checkbox"
                  checked={currentPolicy.enforceOriginalWorkFingerprint}
                  onChange={(e) =>
                    setCurrentPolicy({ ...currentPolicy, enforceOriginalWorkFingerprint: e.target.checked })
                  }
                  className="accent-cyan-400"
                />
              </label>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Prevents reuse of duplicate modules across distinct competitions to satisfy originality rules.
              </p>
            </div>

            {/* Toggle 2: Human Signoff */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-medium text-slate-200">Human Submission Signoff Required</span>
                <input
                  type="checkbox"
                  checked={currentPolicy.requireHumanSubmissionSignoff}
                  onChange={(e) =>
                    setCurrentPolicy({ ...currentPolicy, requireHumanSubmissionSignoff: e.target.checked })
                  }
                  className="accent-cyan-400"
                />
              </label>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Requires manual operator confirmation before any portal submission or code publication is executed.
              </p>
            </div>

            {/* Approved Stacks */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
              <div className="font-medium text-slate-200">Permitted Tech Stacks</div>
              <div className="text-slate-400 text-[11px] font-mono">
                {currentPolicy.targetStacks.join(' · ')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
