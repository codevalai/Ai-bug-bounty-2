import React, { useState } from 'react';
import { PolicyRuleConfig } from '../types/radar';
import { Shield, Sliders, CheckCircle2, AlertOctagon, Save } from 'lucide-react';

interface PolicyEngineViewProps {
  policy: PolicyRuleConfig;
  onUpdatePolicy: (policy: PolicyRuleConfig) => void;
}

export const PolicyEngineView: React.FC<PolicyEngineViewProps> = ({ policy, onUpdatePolicy }) => {
  const [currentPolicy, setCurrentPolicy] = useState<PolicyRuleConfig>(policy);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    onUpdatePolicy(currentPolicy);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
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
    const exists = currentPolicy.whitelistedPlatforms.includes(p);
    const updated = exists
      ? currentPolicy.whitelistedPlatforms.filter((x) => x !== p)
      : [...currentPolicy.whitelistedPlatforms, p];
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
                const isChecked = currentPolicy.whitelistedPlatforms.includes(plat);
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
