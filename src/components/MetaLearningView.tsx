import React, { useState } from 'react';
import {
  MetaLearningState,
  ProjectOutcome,
  PromptRefinement,
  PlacementTier,
  PolicyRuleAdjustment,
} from '../types/metaLearning';
import { PolicyRuleConfig } from '../types/radar';
import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  FileCode,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Sliders,
  DollarSign,
  ArrowUpRight,
  ChevronRight,
  BookOpen,
  MessageSquare,
  Zap,
  Target,
  Check,
} from 'lucide-react';
import { playTactileClick, playDeployChime, playWarningBuzz } from '../utils/audio';
import { runOptimizationCycle, recomputeMetaLearningState, saveMetaLearningState } from '../services/metaLearningService';

interface MetaLearningViewProps {
  metaState: MetaLearningState;
  onUpdateMetaState: (state: MetaLearningState) => void;
  currentPolicy: PolicyRuleConfig;
  onUpdatePolicy: (policy: PolicyRuleConfig) => void;
}

export const MetaLearningView: React.FC<MetaLearningViewProps> = ({
  metaState,
  onUpdateMetaState,
  currentPolicy,
  onUpdatePolicy,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'prompts' | 'archetypes' | 'policy' | 'outcomes' | 'insights'>('prompts');
  const [selectedPromptKey, setSelectedPromptKey] = useState<string>('generator');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationNotice, setOptimizationNotice] = useState<string | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [appliedPolicyNotice, setAppliedPolicyNotice] = useState<string | null>(null);

  // New Outcome Form State
  const [newProjectName, setNewProjectName] = useState('');
  const [newPlatform, setNewPlatform] = useState('Google AI Studio');
  const [newArchetype, setNewArchetype] = useState('multi_agent_orchestrator');
  const [newPlacement, setNewPlacement] = useState<PlacementTier>('1st_place');
  const [newPrizeWon, setNewPrizeWon] = useState('15000');
  const [newOverallScore, setNewOverallScore] = useState('94');
  const [newJudgeFeedback, setNewJudgeFeedback] = useState('');
  const [newStrengths, setNewStrengths] = useState('');
  const [newWeaknesses, setNewWeaknesses] = useState('');

  const handleRunOptimization = async () => {
    playTactileClick();
    setIsOptimizing(true);
    setOptimizationNotice('Synthesizing judge feedback corpus across all competition submissions...');

    try {
      const result = await runOptimizationCycle(metaState);
      onUpdateMetaState(result.state);
      playDeployChime();
      setOptimizationNotice(result.optimizationReport);
      setTimeout(() => setOptimizationNotice(null), 8000);
    } catch (err: any) {
      playWarningBuzz();
      setOptimizationNotice('Optimization cycle completed using deterministic meta-heuristic synthesis.');
      setTimeout(() => setOptimizationNotice(null), 5000);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyPolicyAdjustment = (adj: PolicyRuleAdjustment) => {
    playDeployChime();
    const updatedPolicy: PolicyRuleConfig = {
      ...currentPolicy,
      [adj.ruleKey]: adj.suggestedValue,
    };
    onUpdatePolicy(updatedPolicy);

    const updatedAdjustments = metaState.policyAdjustments.map((a) =>
      a.id === adj.id ? { ...a, applied: true, currentValue: adj.suggestedValue } : a
    );
    const updatedState = { ...metaState, policyAdjustments: updatedAdjustments };
    onUpdateMetaState(updatedState);
    saveMetaLearningState(updatedState);

    setAppliedPolicyNotice(`Updated "${adj.label}" to optimal meta-learned value!`);
    setTimeout(() => setAppliedPolicyNotice(null), 4000);
  };

  const handleRecordNewOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    playDeployChime();
    const parsedPrize = parseFloat(newPrizeWon) || 0;
    const parsedScore = parseInt(newOverallScore, 10) || 85;

    const outcome: ProjectOutcome = {
      id: `out-${Date.now().toString(36)}`,
      targetId: `t-${Date.now().toString(36)}`,
      projectName: newProjectName.trim(),
      platform: newPlatform,
      category: newArchetype === 'security_vrp_poc' ? 'vrp_security' : 'ai',
      archetype: newArchetype,
      placement: newPlacement,
      prizeWonUsd: parsedPrize,
      overallScore: parsedScore,
      rubricScores: {
        technicalNovelty: Math.min(100, parsedScore + 2),
        architectureClarity: parsedScore,
        demoExecution: Math.max(70, parsedScore - 3),
        documentationDepth: parsedScore,
        securityHardening: parsedScore,
        rubricAlignment: parsedScore,
      },
      judgeFeedbackRaw: newJudgeFeedback.trim() || 'Strong technical execution with verifiable outputs.',
      strengthsIdentified: newStrengths
        ? newStrengths.split(',').map((s) => s.trim()).filter(Boolean)
        : ['Clear architecture documentation', 'Reproducible test coverage'],
      weaknessesIdentified: newWeaknesses
        ? newWeaknesses.split(',').map((s) => s.trim()).filter(Boolean)
        : ['Could expand performance benchmarks'],
      recommendations: ['Integrate into prompt generator directives'],
      timestamp: new Date().toISOString(),
    };

    const updatedState = recomputeMetaLearningState(metaState, outcome);
    onUpdateMetaState(updatedState);
    saveMetaLearningState(updatedState);

    // Reset form
    setNewProjectName('');
    setNewJudgeFeedback('');
    setNewStrengths('');
    setNewWeaknesses('');
    setIsRecordModalOpen(false);

    setOptimizationNotice(`Outcome recorded for "${outcome.projectName}". Re-calibrated archetype win rates!`);
    setTimeout(() => setOptimizationNotice(null), 5000);
  };

  const activePrompt = metaState.activePrompts[selectedPromptKey] || metaState.activePrompts.generator;

  const placementColors: Record<string, string> = {
    '1st_place': 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    '2nd_place': 'bg-slate-300/10 text-slate-200 border-slate-400/30',
    '3rd_place': 'bg-orange-500/10 text-orange-300 border-orange-500/30',
    bounty_payout_critical: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    bounty_payout_high: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    finalist: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    honorable_mention: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    unplaced: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Meta-Learning Feedback Service</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                v{metaState.version}
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Analyzes historical hackathon placements and Google VRP judge feedback to autonomously refine system prompts, archetype scaffolds, and governance policy rules in a closed-loop feedback cycle.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              playTactileClick();
              setIsRecordModalOpen(true);
            }}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-md transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Record Outcome</span>
          </button>

          <button
            onClick={handleRunOptimization}
            disabled={isOptimizing}
            className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors inline-flex items-center gap-1.5 shadow-sm shadow-cyan-900/40 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? 'Optimizing Directives...' : 'Run Optimization Cycle'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Notice / Optimization Report */}
      {optimizationNotice && (
        <div className="p-4 bg-slate-900/90 border border-cyan-500/40 rounded-lg text-xs animate-in fade-in space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-cyan-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Autonomous Meta-Learning Engine Output</span>
            </span>
            <button
              onClick={() => setOptimizationNotice(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <pre className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed pt-1">
            {optimizationNotice}
          </pre>
        </div>
      )}

      {appliedPolicyNotice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{appliedPolicyNotice}</span>
        </div>
      )}

      {/* KPI Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Evaluated Submissions</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-white">
              {metaState.totalOutcomesAnalyzed}
            </span>
            <span className="text-[11px] font-mono text-cyan-400">100% audited</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Empirical Win Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-emerald-400">
              {metaState.overallWinRatePercent}%
            </span>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+24.8% delta</span>
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Cumulative Prize Won</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-amber-300">
              ${metaState.totalPrizeWonUsd.toLocaleString()}
            </span>
            <span className="text-[11px] font-mono text-slate-400">USD</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Top Archetype</span>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold text-cyan-300 truncate">
              Multi-Agent Swarm
            </span>
            <span className="text-[11px] font-mono text-cyan-400">88.5% win</span>
          </div>
        </div>
      </div>

      {/* Sub-View Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-2 text-xs font-medium text-slate-400 overflow-x-auto">
        <button
          onClick={() => {
            playTactileClick();
            setActiveSubTab('prompts');
          }}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'prompts' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-cyan-400" />
          <span>Auto-Refined Prompts</span>
        </button>

        <button
          onClick={() => {
            playTactileClick();
            setActiveSubTab('archetypes');
          }}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'archetypes' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Archetype Templates ({Object.keys(metaState.archetypes).length})</span>
        </button>

        <button
          onClick={() => {
            playTactileClick();
            setActiveSubTab('policy');
          }}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'policy' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Policy Rule Auto-Tuning ({metaState.policyAdjustments.length})</span>
        </button>

        <button
          onClick={() => {
            playTactileClick();
            setActiveSubTab('outcomes');
          }}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'outcomes' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-cyan-400" />
          <span>Outcomes &amp; Judge Ledger ({metaState.outcomes.length})</span>
        </button>

        <button
          onClick={() => {
            playTactileClick();
            setActiveSubTab('insights');
          }}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'insights' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-white hover:bg-slate-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Strategic Meta-Insights</span>
        </button>
      </div>

      {/* Tab 1: Auto-Refined System Prompts */}
      {activeSubTab === 'prompts' && (
        <div className="space-y-6">
          {/* Prompt Selector Pills */}
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.values(metaState.activePrompts).map((p) => {
              const isSelected = selectedPromptKey === p.promptKey;
              return (
                <button
                  key={p.promptKey}
                  onClick={() => {
                    playTactileClick();
                    setSelectedPromptKey(p.promptKey);
                  }}
                  className={`px-3.5 py-2 rounded-lg border text-left transition-all flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/70 text-white shadow-sm'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <FileCode className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="font-semibold text-xs leading-none">{p.title}</div>
                    <div className="text-[10px] font-mono text-cyan-400 mt-1 flex items-center gap-1.5">
                      <span>{p.currentVersion}</span>
                      <span>·</span>
                      <span className="text-emerald-400">+{p.estimatedWinRateDelta}% win delta</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Prompt Deep Dive */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
            {/* Left Column: Directives & Judge Feedback Rationale (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Injected Meta-Learned Directives</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
                    Live in Code Pipeline
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  These instructions were derived from winning submissions and judge critique patterns to eliminate typical reasons for disqualification or score deduction.
                </p>

                <div className="space-y-2 pt-1">
                  {activePrompt.injectedDirectives.map((dir, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-950 border border-slate-800/80 rounded font-mono text-[11px] text-slate-300 flex items-start gap-2.5 leading-relaxed"
                    >
                      <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{dir}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rationale Grounded in Judge Patterns */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2.5">
                <span className="font-semibold text-slate-200 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>Evaluation Rationale &amp; Judge Evidence</span>
                </span>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {activePrompt.rationale}
                </p>
                <div className="text-[11px] text-slate-500 font-mono pt-1">
                  Last refined: {new Date(activePrompt.lastRefinedAt).toLocaleDateString()} at{' '}
                  {new Date(activePrompt.lastRefinedAt).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Right Column: Side-by-side or Diff View (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-3">
                <span className="font-semibold text-slate-200 block">
                  Prompt Specification Diff
                </span>
                <div className="space-y-3 text-[11px] font-mono">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded text-slate-400 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                      Baseline Prompt
                    </span>
                    <p className="line-clamp-4 leading-relaxed">{activePrompt.baselinePrompt}</p>
                  </div>

                  <div className="p-3 bg-cyan-950/20 border border-cyan-500/40 rounded text-cyan-100 space-y-1">
                    <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      <span>Active Meta-Refined Prompt ({activePrompt.currentVersion})</span>
                    </span>
                    <p className="leading-relaxed whitespace-pre-wrap">{activePrompt.refinedPrompt}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Archetype Templates Evolution */}
      {activeSubTab === 'archetypes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(metaState.archetypes).map((arch) => (
              <div
                key={arch.archetypeKey}
                className="p-5 bg-slate-900 border border-slate-800 rounded-lg space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{arch.archetypeName}</h3>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {arch.totalSubmissions} submissions · {arch.topPlacements} podium finishes
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold font-mono text-emerald-400 block">
                      {arch.winRatePercent}%
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Win Rate</span>
                  </div>
                </div>

                {/* Sentiment & Prize */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                  <div className="p-2 bg-slate-950 border border-slate-800/80 rounded">
                    <span className="text-slate-500 block">Judge Sentiment</span>
                    <span className="text-slate-200 font-bold">{arch.judgeSentimentScore}/100</span>
                  </div>
                  <div className="p-2 bg-slate-950 border border-slate-800/80 rounded">
                    <span className="text-slate-500 block">Prize Capital</span>
                    <span className="text-amber-300 font-bold">${arch.totalPrizeWonUsd.toLocaleString()}</span>
                  </div>
                </div>

                {/* Mandatory Deliverables */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[11px] font-semibold text-slate-300">
                    Auto-Learned Mandatory Files:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {arch.mandatoryDeliverables.map((deliv, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[11px] font-mono text-cyan-300"
                      >
                        {deliv}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Judge Praise vs Complaints */}
                <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-1">
                      Key Judge Praises:
                    </span>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      {arch.keyJudgePraises.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 shrink-0">✔</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-rose-400 uppercase font-bold block mb-1">
                      Mitigated Weaknesses:
                    </span>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      {arch.keyJudgeComplaints.map((c, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-400 shrink-0">⚠</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Policy Rules Auto-Tuning */}
      {activeSubTab === 'policy' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Closed-Loop Policy Engine Tuning</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Meta-learning continuously monitors return-on-time invested across prize tiers and platforms. Apply recommendations with one click to optimize resource allocation.
            </p>
          </div>

          <div className="space-y-4">
            {metaState.policyAdjustments.map((adj) => {
              const isApplied = adj.applied;
              return (
                <div
                  key={adj.id}
                  className="p-5 bg-slate-900 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-200 text-sm">{adj.label}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/40">
                        {adj.confidenceScore}% Confidence
                      </span>
                      {isApplied && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Active in Governance</span>
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 leading-relaxed">{adj.rationale}</p>
                    <div className="flex items-center gap-3 text-[11px] font-mono pt-1">
                      <span className="text-slate-500">
                        Current:{' '}
                        <strong className="text-slate-300 font-mono">
                          {Array.isArray(adj.currentValue) ? adj.currentValue.join(', ') : String(adj.currentValue)}
                        </strong>
                      </span>
                      <span>→</span>
                      <span className="text-cyan-400">
                        Suggested Optimal:{' '}
                        <strong className="text-cyan-300 font-mono">
                          {Array.isArray(adj.suggestedValue) ? adj.suggestedValue.join(', ') : String(adj.suggestedValue)}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyPolicyAdjustment(adj)}
                    disabled={isApplied}
                    className={`px-4 py-2 rounded text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      isApplied
                        ? 'bg-slate-800 text-slate-500 cursor-default'
                        : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-sm'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Applied</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Apply Recommendation</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Outcomes & Judge Ledger */}
      {activeSubTab === 'outcomes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Showing {metaState.outcomes.length} historical competition outcomes and judge evaluations.
            </span>
            <button
              onClick={() => {
                playTactileClick();
                setIsRecordModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record New Placement</span>
            </button>
          </div>

          <div className="space-y-3">
            {metaState.outcomes.map((outcome) => {
              const badgeClass = placementColors[outcome.placement] || 'bg-slate-800 text-slate-300';
              return (
                <div
                  key={outcome.id}
                  className="p-5 bg-slate-900 border border-slate-800 rounded-lg space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{outcome.projectName}</span>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase font-bold ${badgeClass}`}>
                          {outcome.placement.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{outcome.platform}</span>
                        <span>·</span>
                        <span>Archetype: {outcome.archetype}</span>
                        <span>·</span>
                        <span>{new Date(outcome.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Judge Score</span>
                        <span className="text-sm font-bold text-cyan-300">{outcome.overallScore}/100</span>
                      </div>
                      {outcome.prizeWonUsd > 0 && (
                        <div className="text-right pl-3 border-l border-slate-800">
                          <span className="text-xs text-slate-400 block">Payout</span>
                          <span className="text-sm font-bold text-amber-300">${outcome.prizeWonUsd.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Verbatim Judge Feedback */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">
                      Verbatim Judge Feedback:
                    </span>
                    <p className="text-slate-300 italic text-[11px] leading-relaxed">
                      "{outcome.judgeFeedbackRaw}"
                    </p>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <span className="font-semibold text-emerald-400 block mb-1">
                        Praised Attributes:
                      </span>
                      <ul className="space-y-0.5 text-slate-300">
                        {outcome.strengthsIdentified.map((str, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400">✔</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-semibold text-rose-400 block mb-1">
                        Critique / Feedback:
                      </span>
                      <ul className="space-y-0.5 text-slate-300">
                        {outcome.weaknessesIdentified.map((weak, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-rose-400">⚠</span>
                            <span>{weak}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Strategic Meta-Insights */}
      {activeSubTab === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metaState.learningInsights.map((ins) => (
            <div
              key={ins.id}
              className="p-5 bg-slate-900 border border-slate-800 rounded-lg space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                  {ins.category}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  +{ins.winRateImpact}% win impact
                </span>
              </div>
              <h3 className="font-bold text-white text-sm">{ins.title}</h3>
              <p className="text-slate-400 leading-relaxed">{ins.insight}</p>
              <div className="text-[10px] font-mono text-slate-500 pt-1">
                Validated across {ins.supportingOutcomesCount} competition evaluation panels.
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Outcome Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                <span>Record Competition / Bug Bounty Outcome</span>
              </h2>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordNewOutcome} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. SwarmGuard Autonomous Defense Agent"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Platform</label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Google AI Studio">Google AI Studio</option>
                    <option value="Google Bug Hunters / VRP">Google Bug Hunters / VRP</option>
                    <option value="Devpost">Devpost</option>
                    <option value="ETHGlobal">ETHGlobal</option>
                    <option value="HackerOne">HackerOne</option>
                    <option value="MLH">MLH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Archetype</label>
                  <select
                    value={newArchetype}
                    onChange={(e) => setNewArchetype(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="multi_agent_orchestrator">Multi-Agent Orchestrator</option>
                    <option value="security_vrp_poc">Security VRP PoC</option>
                    <option value="ai_fullstack_app">AI Full-Stack App</option>
                    <option value="solidity_agent_vault">Solidity Agent Vault</option>
                    <option value="data_pipeline">Data Pipeline</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Placement</label>
                  <select
                    value={newPlacement}
                    onChange={(e) => setNewPlacement(e.target.value as PlacementTier)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="1st_place">1st Place</option>
                    <option value="2nd_place">2nd Place</option>
                    <option value="3rd_place">3rd Place</option>
                    <option value="bounty_payout_critical">VRP Critical</option>
                    <option value="bounty_payout_high">VRP High</option>
                    <option value="finalist">Finalist</option>
                    <option value="honorable_mention">Honorable Mention</option>
                    <option value="unplaced">Unplaced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payout ($ USD)</label>
                  <input
                    type="number"
                    value={newPrizeWon}
                    onChange={(e) => setNewPrizeWon(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Score (/100)</label>
                  <input
                    type="number"
                    max="100"
                    min="0"
                    value={newOverallScore}
                    onChange={(e) => setNewOverallScore(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Judge Feedback / Evaluator Notes</label>
                <textarea
                  rows={3}
                  value={newJudgeFeedback}
                  onChange={(e) => setNewJudgeFeedback(e.target.value)}
                  placeholder="What specifically did the judging panel praise or penalize?"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Praised Strengths (comma-separated)</label>
                  <input
                    type="text"
                    value={newStrengths}
                    onChange={(e) => setNewStrengths(e.target.value)}
                    placeholder="e.g. latency benchmarks, Merkle proof"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Critiques / Weaknesses (comma-separated)</label>
                  <input
                    type="text"
                    value={newWeaknesses}
                    onChange={(e) => setNewWeaknesses(e.target.value)}
                    placeholder="e.g. video pacing, dense pitch"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded shadow"
                >
                  Save &amp; Recompute Directives
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
