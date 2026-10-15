import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  TrendingUp,
  Target,
  Award,
  Zap,
  Sliders,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Layers,
  Flame,
  DollarSign,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  FileText,
  BarChart3,
  Percent,
  Play,
  Check,
  Info,
} from 'lucide-react';
import { TargetEvent, PolicyRuleConfig } from '../types/radar';
import { ProjectOutcome } from '../types/metaLearning';
import {
  StrategyEngineState,
  StrategyProfileType,
  StrategyWeights,
  TargetStrategyRecommendation,
  TargetPriorityTier,
} from '../types/strategy';
import {
  analyzeTargetsAndFormulateStrategy,
  getStoredStrategyState,
  syncStrategyWithServer,
  DEFAULT_STRATEGY_WEIGHTS,
} from '../services/strategyEngineService';

interface StrategyEngineViewProps {
  targets: TargetEvent[];
  outcomes: ProjectOutcome[];
  currentPolicy: PolicyRuleConfig;
  onUpdatePolicy: (newPolicy: PolicyRuleConfig) => void;
  onSelectTarget: (target: TargetEvent, tab?: 'studio' | 'pipeline') => void;
}

export const StrategyEngineView: React.FC<StrategyEngineViewProps> = ({
  targets,
  outcomes,
  currentPolicy,
  onUpdatePolicy,
  onSelectTarget,
}) => {
  const [activeProfile, setActiveProfile] = useState<StrategyProfileType>('balanced_yield');
  const [weights, setWeights] = useState<StrategyWeights>(DEFAULT_STRATEGY_WEIGHTS.balanced_yield);
  const [isCustomizingWeights, setIsCustomizingWeights] = useState(false);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'archetypes' | 'policy_diff' | 'forecast'>(
    'recommendations'
  );
  const [tierFilter, setTierFilter] = useState<'all' | TargetPriorityTier>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyPassingPolicy, setOnlyPassingPolicy] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  // Strategy State
  const [strategyState, setStrategyState] = useState<StrategyEngineState>(() => {
    const stored = getStoredStrategyState();
    if (stored) return stored;
    return analyzeTargetsAndFormulateStrategy(targets, outcomes, currentPolicy, {
      profile: 'balanced_yield',
      weights: DEFAULT_STRATEGY_WEIGHTS.balanced_yield,
    });
  });

  // Re-run analysis when profile or targets change
  const handleProfileChange = (profile: StrategyProfileType) => {
    setActiveProfile(profile);
    const newWeights = DEFAULT_STRATEGY_WEIGHTS[profile];
    setWeights(newWeights);
    setIsCustomizingWeights(false);
    const updated = analyzeTargetsAndFormulateStrategy(targets, outcomes, currentPolicy, {
      profile,
      weights: newWeights,
    });
    setStrategyState(updated);
  };

  const handleWeightChange = (key: keyof StrategyWeights, val: number) => {
    setIsCustomizingWeights(true);
    setActiveProfile('custom');
    const updatedWeights = { ...weights, [key]: val };
    setWeights(updatedWeights);
    const updated = analyzeTargetsAndFormulateStrategy(targets, outcomes, currentPolicy, {
      profile: 'custom',
      weights: updatedWeights,
    });
    setStrategyState(updated);
  };

  const handleRecalibrate = async () => {
    setIsAnalyzing(true);
    try {
      const updated = await syncStrategyWithServer(targets, outcomes, currentPolicy, activeProfile);
      setStrategyState(updated);
    } catch {
      const fallback = analyzeTargetsAndFormulateStrategy(targets, outcomes, currentPolicy, {
        profile: activeProfile,
        weights,
      });
      setStrategyState(fallback);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyPolicyRecommendation = () => {
    const recPolicy = strategyState.policyRecommendation.suggestedPolicy;
    onUpdatePolicy(recPolicy);
    setAppliedNotice(
      `Governance rules updated! Minimum prize set to $${recPolicy.minimumPrizeUsd.toLocaleString()} USD and ${recPolicy.whitelistedPlatforms.length} platforms whitelisted.`
    );
    // Refresh strategy state to reflect updated policy compliance
    setTimeout(() => {
      const refreshed = analyzeTargetsAndFormulateStrategy(targets, outcomes, recPolicy, {
        profile: activeProfile,
        weights,
      });
      setStrategyState(refreshed);
    }, 100);
    setTimeout(() => setAppliedNotice(null), 4500);
  };

  const handleApplySingleOverride = (rec: TargetStrategyRecommendation) => {
    const updatedPolicy: PolicyRuleConfig = {
      ...currentPolicy,
      whitelistedPlatforms: Array.from(new Set([...currentPolicy.whitelistedPlatforms, rec.platform])),
      minimumPrizeUsd: Math.min(currentPolicy.minimumPrizeUsd, rec.prizeAmountUsd),
    };
    onUpdatePolicy(updatedPolicy);
    setAppliedNotice(`Policy updated to authorize "${rec.targetTitle}"!`);
    setTimeout(() => {
      const refreshed = analyzeTargetsAndFormulateStrategy(targets, outcomes, updatedPolicy, {
        profile: activeProfile,
        weights,
      });
      setStrategyState(refreshed);
    }, 100);
    setTimeout(() => setAppliedNotice(null), 4000);
  };

  // Filter recommendations
  const filteredRecommendations = useMemo(() => {
    return strategyState.recommendations.filter((rec) => {
      if (tierFilter !== 'all' && rec.tier !== tierFilter) return false;
      if (onlyPassingPolicy && !rec.policyCompliance.passesPolicy) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = rec.targetTitle.toLowerCase().includes(q);
        const matchPlat = rec.platform.toLowerCase().includes(q);
        const matchArch = rec.recommendedArchetypeName.toLowerCase().includes(q);
        if (!matchTitle && !matchPlat && !matchArch) return false;
      }
      return true;
    });
  }, [strategyState.recommendations, tierFilter, onlyPassingPolicy, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Notification Toast */}
      {appliedNotice && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500/70 rounded-lg text-xs text-emerald-200 flex items-center justify-between shadow-lg shadow-emerald-950/40">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{appliedNotice}</span>
          </div>
          <button
            onClick={() => setAppliedNotice(null)}
            className="text-emerald-400 hover:text-white px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              06. Autonomous Strategy Engine &amp; Portfolio EV Optimizer
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Analyzes historical competition outcomes, liquidity distributions, and archetype win rates
              to recommend maximum-alpha targets and formulate mathematically optimal governance rules for the Policy Engine.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRecalibrate}
              disabled={isAnalyzing}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:text-white rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
              title="Re-run quantitative analysis across all targets"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Recalibrating...' : 'Recalibrate Engine'}</span>
            </button>
            <button
              onClick={handleApplyPolicyRecommendation}
              className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all flex items-center gap-1.5 shadow-sm shadow-cyan-900/30"
              title="Synchronize active Policy Engine rules with recommended optimal strategy"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Apply Strategy to Policy Engine</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="p-2.5 bg-slate-950/60 border border-slate-800/70 rounded-lg">
            <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              <span>Portfolio EV</span>
            </div>
            <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
              ${(strategyState.aggregateMetrics.totalPortfolioEvUsd / 1000).toFixed(1)}k USD
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Expected dollar yield</div>
          </div>

          <div className="p-2.5 bg-slate-950/60 border border-slate-800/70 rounded-lg">
            <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
              <Percent className="w-3 h-3 text-cyan-400" />
              <span>Avg Win Rate</span>
            </div>
            <div className="text-sm font-bold font-mono text-cyan-400 mt-1">
              {strategyState.aggregateMetrics.averageWinRatePercent}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Historical model track</div>
          </div>

          <div className="p-2.5 bg-slate-950/60 border border-slate-800/70 rounded-lg">
            <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Top Alpha Target</span>
            </div>
            <div className="text-sm font-bold font-mono text-amber-300 mt-1 truncate" title={strategyState.aggregateMetrics.topTargetTitle}>
              ${(strategyState.aggregateMetrics.topTargetEvUsd / 1000).toFixed(1)}k EV
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate">{strategyState.aggregateMetrics.topTargetTitle}</div>
          </div>

          <div className="p-2.5 bg-slate-950/60 border border-slate-800/70 rounded-lg">
            <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-purple-400" />
              <span>Policy Compliant</span>
            </div>
            <div className="text-sm font-bold font-mono text-purple-300 mt-1">
              {strategyState.aggregateMetrics.qualifiedTargetsCount} / {strategyState.recommendations.length}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {strategyState.aggregateMetrics.blockedByPolicyCount} blocked by rules
            </div>
          </div>

          <div className="p-2.5 bg-slate-950/60 border border-slate-800/70 rounded-lg">
            <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>Weekly Effort</span>
            </div>
            <div className="text-sm font-bold font-mono text-blue-300 mt-1">
              {strategyState.aggregateMetrics.recommendedWeeklyHours} hrs
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Top-4 sprint effort</div>
          </div>

          <div className="p-2.5 bg-slate-950/60 border border-slate-800/70 rounded-lg">
            <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>Hourly Yield</span>
            </div>
            <div className="text-sm font-bold font-mono text-emerald-300 mt-1">
              ~${Math.round(strategyState.aggregateMetrics.totalPortfolioEvUsd / (strategyState.aggregateMetrics.recommendedWeeklyHours * 4 || 1))}/hr
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Effective dev return</div>
          </div>
        </div>
      </div>

      {/* Strategy Profile Selection Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>Targeting &amp; Optimization Profile</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {isCustomizingWeights ? 'Custom Tuned Parameters' : `Active Mode: ${strategyState.policyRecommendation.profileTitle}`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 text-xs">
          <button
            onClick={() => handleProfileChange('balanced_yield')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              activeProfile === 'balanced_yield' && !isCustomizingWeights
                ? 'bg-cyan-950/50 border-cyan-500/70 text-cyan-200 shadow-sm'
                : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="font-semibold flex items-center gap-1">
              <span>Balanced High-Yield</span>
              <span className="text-[9px] px-1 bg-cyan-500/20 text-cyan-300 rounded font-normal">Rec</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Optimal risk-adjusted EV across AI &amp; VRP</div>
          </button>

          <button
            onClick={() => handleProfileChange('aggressive_alpha')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              activeProfile === 'aggressive_alpha' && !isCustomizingWeights
                ? 'bg-amber-950/50 border-amber-500/70 text-amber-200 shadow-sm'
                : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="font-semibold">Aggressive Alpha</div>
            <div className="text-[10px] text-slate-500 mt-1">Targets max prize pools ($25k+)</div>
          </button>

          <button
            onClick={() => handleProfileChange('vrp_sniper')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              activeProfile === 'vrp_sniper' && !isCustomizingWeights
                ? 'bg-emerald-950/50 border-emerald-500/70 text-emerald-200 shadow-sm'
                : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="font-semibold">VRP Bounty Sniper</div>
            <div className="text-[10px] text-slate-500 mt-1">Guaranteed bug bounty payouts (94% win)</div>
          </button>

          <button
            onClick={() => handleProfileChange('hackathon_sprint')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              activeProfile === 'hackathon_sprint' && !isCustomizingWeights
                ? 'bg-purple-950/50 border-purple-500/70 text-purple-200 shadow-sm'
                : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="font-semibold">Rapid Sprint</div>
            <div className="text-[10px] text-slate-500 mt-1">High-tempo hackathon capture (Devpost/MLH)</div>
          </button>

          <button
            onClick={() => setIsCustomizingWeights(!isCustomizingWeights)}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              isCustomizingWeights
                ? 'bg-slate-800 border-cyan-400 text-white'
                : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="font-semibold flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Weight Tuner</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Custom priority weight sliders</div>
          </button>
        </div>

        {/* Expandable Slider Tuning Drawer */}
        {isCustomizingWeights && (
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs animate-in fade-in duration-200">
            <div>
              <div className="flex justify-between text-[11px] text-slate-300 font-medium">
                <span>Prize Pool Weight</span>
                <span className="font-mono text-cyan-400">{weights.prizePoolWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                value={weights.prizePoolWeight}
                onChange={(e) => handleWeightChange('prizePoolWeight', Number(e.target.value))}
                className="w-full mt-1 accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-300 font-medium">
                <span>Archetype Fit Weight</span>
                <span className="font-mono text-cyan-400">{weights.archetypeFitWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                value={weights.archetypeFitWeight}
                onChange={(e) => handleWeightChange('archetypeFitWeight', Number(e.target.value))}
                className="w-full mt-1 accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-300 font-medium">
                <span>Win Probability Weight</span>
                <span className="font-mono text-cyan-400">{weights.winProbabilityWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                value={weights.winProbabilityWeight}
                onChange={(e) => handleWeightChange('winProbabilityWeight', Number(e.target.value))}
                className="w-full mt-1 accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-300 font-medium">
                <span>Urgency / Deadline Weight</span>
                <span className="font-mono text-cyan-400">{weights.urgencyWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={weights.urgencyWeight}
                onChange={(e) => handleWeightChange('urgencyWeight', Number(e.target.value))}
                className="w-full mt-1 accent-cyan-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-3 py-1.5 rounded-md transition-all font-medium flex items-center gap-1.5 ${
              activeTab === 'recommendations'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Recommendations ({filteredRecommendations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('archetypes')}
            className={`px-3 py-1.5 rounded-md transition-all font-medium flex items-center gap-1.5 ${
              activeTab === 'archetypes'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Archetype Strength Matrix ({strategyState.archetypePerformances.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('policy_diff')}
            className={`px-3 py-1.5 rounded-md transition-all font-medium flex items-center gap-1.5 ${
              activeTab === 'policy_diff'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Policy Engine Blueprint ({strategyState.policyRecommendation.ruleDiffs.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-3 py-1.5 rounded-md transition-all font-medium flex items-center gap-1.5 ${
              activeTab === 'forecast'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            <span>Yield &amp; ROI Simulator</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Target Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 border border-slate-800 rounded-lg text-xs">
            {/* Tier Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 text-[11px] font-medium mr-1">Tier:</span>
              <button
                onClick={() => setTierFilter('all')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  tierFilter === 'all'
                    ? 'bg-slate-800 text-white font-medium border border-slate-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                All Tiers
              </button>
              <button
                onClick={() => setTierFilter('tier1_alpha')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  tierFilter === 'tier1_alpha'
                    ? 'bg-amber-950/70 border border-amber-500/70 text-amber-200 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                Tier-1 Alpha
              </button>
              <button
                onClick={() => setTierFilter('tier2_yield')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  tierFilter === 'tier2_yield'
                    ? 'bg-cyan-950/70 border border-cyan-500/70 text-cyan-200 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                Tier-2 Yield
              </button>
              <button
                onClick={() => setTierFilter('tier3_bounty')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  tierFilter === 'tier3_bounty'
                    ? 'bg-emerald-950/70 border border-emerald-500/70 text-emerald-200 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                Tier-3 Bounty
              </button>
              <button
                onClick={() => setTierFilter('tier4_opportunistic')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  tierFilter === 'tier4_opportunistic'
                    ? 'bg-purple-950/70 border border-purple-500/70 text-purple-200 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                Tier-4 Opportunistic
              </button>
            </div>

            {/* Right: Policy compliant toggle & search */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={onlyPassingPolicy}
                  onChange={(e) => setOnlyPassingPolicy(e.target.checked)}
                  className="accent-cyan-400 rounded"
                />
                <span className="text-[11px]">Only Policy Compliant</span>
              </label>

              <input
                type="text"
                placeholder="Search targets or archetypes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70 w-48"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredRecommendations.map((rec, index) => {
              const fullTarget = targets.find((t) => t.id === rec.targetId);
              const isPassing = rec.policyCompliance.passesPolicy;

              return (
                <div
                  key={rec.targetId}
                  className={`p-4 bg-slate-900 border rounded-xl transition-all hover:border-slate-700 space-y-3.5 relative overflow-hidden ${
                    rec.tier === 'tier1_alpha'
                      ? 'border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/10'
                      : rec.tier === 'tier3_bounty'
                      ? 'border-emerald-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/10'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Top Row: Rank, Title, Tier Badge, EV */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono tabular-nums text-slate-400">
                        <span className="font-bold text-slate-200">
                          #{index + 1}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-semibold uppercase ${
                            rec.tier === 'tier1_alpha'
                              ? 'text-amber-300'
                              : rec.tier === 'tier3_bounty'
                              ? 'text-emerald-300'
                              : rec.tier === 'tier2_yield'
                              ? 'text-cyan-300'
                              : 'text-purple-300'
                          }`}
                        >
                          {rec.tierLabel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-300">
                          {rec.platform}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-400">
                          {rec.daysRemaining}d remaining
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white tracking-tight pt-0.5">
                        {rec.targetTitle}
                      </h3>
                    </div>

                    {/* Financial EV Box */}
                    <div className="text-left sm:text-right shrink-0 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 sm:w-44">
                      <div className="text-[10px] uppercase font-mono text-slate-400">Expected Value (EV)</div>
                      <div className="text-base font-bold font-mono text-emerald-400">
                        ${rec.expectedValueUsd.toLocaleString()} USD
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Prize: ${rec.prizeAmountUsd.toLocaleString()} · ~${rec.hourlyRoiUsd}/hr
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: Archetype Alignment, Win Rate & Rationale */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    {/* Archetype Recommendation (5 cols) */}
                    <div className="md:col-span-5 space-y-1.5 border-b md:border-b-0 md:border-r border-slate-800/80 pb-2 md:pb-0 md:pr-3">
                      <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-cyan-400" />
                        <span>Recommended Archetype</span>
                      </div>
                      <div className="font-semibold text-slate-200 flex items-center justify-between">
                        <span>{rec.recommendedArchetypeName}</span>
                        <span className="text-[11px] font-mono text-cyan-400 font-bold">
                          {rec.archetypeFitScore}% Fit
                        </span>
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <div className="flex-1">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Win Probability</span>
                            <span className="text-emerald-400 font-mono font-semibold">{rec.winProbabilityPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                            <div
                              className="bg-emerald-400 h-full rounded-full transition-all"
                              style={{ width: `${rec.winProbabilityPercent}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 rounded font-mono">
                          {rec.riskRewardProfile}
                        </span>
                      </div>
                    </div>

                    {/* Strategic Rationale & Tactical Directives (7 cols) */}
                    <div className="md:col-span-7 space-y-1.5">
                      <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Strategic Rationale &amp; Directives</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {rec.strategicRationale}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rec.tacticalDirectives.slice(0, 2).map((dir, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 bg-cyan-950/40 border border-cyan-800/50 text-cyan-300 rounded font-mono truncate max-w-xs"
                            title={dir}
                          >
                            ✓ {dir}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Policy Compliance Status & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      {isPassing ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Policy Compliant (Whitelisted &amp; &gt;= Min Prize)</span>
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-950/80 border border-rose-500/50 text-rose-300 rounded text-[11px]">
                            <AlertCircle className="w-3 h-3 text-rose-400" />
                            <span>{rec.policyCompliance.blockedReasons[0] || 'Blocked by Policy'}</span>
                          </span>
                          <button
                            onClick={() => handleApplySingleOverride(rec)}
                            className="text-[10px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-mono"
                          >
                            Authorize in Policy
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Launch & Explore Actions */}
                    <div className="flex items-center gap-2">
                      {fullTarget && (
                        <>
                          <button
                            onClick={() => onSelectTarget(fullTarget, 'studio')}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium"
                          >
                            <span>Open in Studio</span>
                            <ChevronRight className="w-3 h-3 text-cyan-400" />
                          </button>
                          <button
                            onClick={() => onSelectTarget(fullTarget, 'pipeline')}
                            className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 rounded-md transition-colors flex items-center gap-1.5 text-xs font-semibold"
                          >
                            <Play className="w-3 h-3 text-cyan-400" />
                            <span>Queue Pipeline</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Archetype Strength Matrix */}
      {activeTab === 'archetypes' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Historical Archetype Performance &amp; Advantage Benchmarks</span>
            </h2>
            <p className="text-xs text-slate-400">
              Aggregated historical win rates, rubric ratings, and total prize yield achieved by each architectural template across evaluated competitions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategyState.archetypePerformances.map((arch) => (
              <div
                key={arch.archetypeKey}
                className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-colors text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      Complexity: {arch.complexityRating}
                    </span>
                    <h3 className="text-sm font-bold text-white">{arch.archetypeName}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400">Historical Yield</span>
                    <div className="text-sm font-bold font-mono text-emerald-400">
                      ${arch.historicalPrizeYieldUsd.toLocaleString()} USD
                    </div>
                  </div>
                </div>

                {/* Score Meters */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400">Win Rate</div>
                    <div className="text-sm font-bold font-mono text-cyan-400 mt-0.5">
                      {arch.winRatePercent}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Avg Rubric Score</div>
                    <div className="text-sm font-bold font-mono text-amber-400 mt-0.5">
                      {arch.averageRubricScore} / 100
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">ROI Rating</div>
                    <div className="text-sm font-bold font-mono text-purple-400 mt-0.5">
                      {arch.roiRating} / 100
                    </div>
                  </div>
                </div>

                {/* Best Suited Categories & Platforms */}
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Optimal Arenas</div>
                  <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                    {arch.bestSuitedCategories.map((c) => (
                      <span key={c} className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-300 rounded">
                        #{c}
                      </span>
                    ))}
                    {arch.bestSuitedPlatforms.map((p) => (
                      <span key={p} className="px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/40 text-cyan-300 rounded">
                        @{p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Strengths & Deliverables */}
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Dominant Success Drivers</div>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {arch.dominantStrengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Policy Engine Blueprint & Rule Diffs */}
      {activeTab === 'policy_diff' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Strategy Engine Policy Blueprint: {strategyState.policyRecommendation.profileTitle}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {strategyState.policyRecommendation.description}
              </p>
            </div>
            <button
              onClick={handleApplyPolicyRecommendation}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all flex items-center gap-1.5 shrink-0 shadow-sm shadow-cyan-900/30"
            >
              <Check className="w-4 h-4" />
              <span>Apply Recommended Blueprint</span>
            </button>
          </div>

          {/* Rule Diffs Table */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Live Governance Rule Adjustments ({strategyState.policyRecommendation.ruleDiffs.length})
            </h3>

            {strategyState.policyRecommendation.ruleDiffs.length === 0 ? (
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg text-center text-xs text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <span>Active Policy Engine is currently 100% aligned with this strategy profile!</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {strategyState.policyRecommendation.ruleDiffs.map((diff) => (
                  <div
                    key={diff.ruleKey}
                    className="p-3 bg-slate-950 border border-slate-800/90 rounded-lg text-xs grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                  >
                    <div className="md:col-span-4">
                      <div className="font-semibold text-white">{diff.label}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{diff.reason}</div>
                    </div>
                    <div className="md:col-span-5 flex items-center gap-3 font-mono text-[11px]">
                      <div className="p-1.5 bg-slate-900 border border-slate-800 rounded text-slate-400">
                        Current: <span className="text-slate-200">{String(diff.currentValue)}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <div className="p-1.5 bg-cyan-950/60 border border-cyan-500/50 rounded text-cyan-300 font-bold">
                        Target: {String(diff.recommendedValue)}
                      </div>
                    </div>
                    <div className="md:col-span-3 text-right">
                      <span className="text-[10px] px-2 py-0.5 bg-slate-900 border border-slate-800 text-emerald-300 rounded font-mono">
                        {diff.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Whitelisted Platform Matrix */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5 text-xs">
            <h3 className="font-semibold text-white">Recommended Trusted Platforms</h3>
            <div className="flex flex-wrap gap-2">
              {strategyState.policyRecommendation.focusPlatforms.map((plat) => {
                const isCurrentlyActive = currentPolicy.whitelistedPlatforms.includes(plat);
                return (
                  <span
                    key={plat}
                    className={`px-3 py-1.5 rounded text-xs border font-mono flex items-center gap-1.5 ${
                      isCurrentlyActive
                        ? 'bg-slate-950 border-cyan-500/50 text-cyan-300'
                        : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                    }`}
                  >
                    {isCurrentlyActive ? <Check className="w-3 h-3 text-cyan-400" /> : <PlusCircle className="w-3 h-3 text-amber-400" />}
                    <span>{plat}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Yield & ROI Forecast Simulator */}
      {activeTab === 'forecast' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Yield &amp; Compute Allocation Simulator</span>
            </h2>
            <p className="text-xs text-slate-400">
              Projects monthly expected prize payouts based on current win probability curves and active rate limits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="text-slate-400 font-mono text-[11px] uppercase">Weekly Target Capture</div>
              <div className="text-2xl font-bold font-mono text-cyan-400">
                {strategyState.policyRecommendation.projectedWeeklyBuilds} builds / wk
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Allocates compute across Tier-1 Alpha and Tier-3 Bounty tracks while observing platform anti-abuse constraints.
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="text-slate-400 font-mono text-[11px] uppercase">Projected Weekly Dollar Yield</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                ${strategyState.policyRecommendation.projectedWeeklyYieldUsd.toLocaleString()} USD
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Expected weekly yield calculated at a projected {strategyState.policyRecommendation.projectedWinRatePercent}% win probability.
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="text-slate-400 font-mono text-[11px] uppercase">30-Day Cumulative Run Rate</div>
              <div className="text-2xl font-bold font-mono text-purple-400">
                ${(strategyState.policyRecommendation.projectedWeeklyYieldUsd * 4).toLocaleString()} USD
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Estimated 30-day run rate across all whitelisted competition ecosystems with active meta-learning prompt injection.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function PlusCircle(props: { className?: string }) {
  return (
    <svg
      className={props.className || 'w-3 h-3'}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path d="M12 8v8M8 12h8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
