import { TargetCategory, PolicyRuleConfig, TargetEvent } from './radar';
import { ProjectOutcome } from './metaLearning';

export type StrategyProfileType =
  | 'balanced_yield'
  | 'aggressive_alpha'
  | 'vrp_sniper'
  | 'hackathon_sprint'
  | 'custom';

export type TargetPriorityTier =
  | 'tier1_alpha'
  | 'tier2_yield'
  | 'tier3_bounty'
  | 'tier4_opportunistic';

export interface StrategyWeights {
  prizePoolWeight: number;      // 0 - 100
  archetypeFitWeight: number;   // 0 - 100
  winProbabilityWeight: number; // 0 - 100
  urgencyWeight: number;        // 0 - 100
}

export interface TargetStrategyRecommendation {
  targetId: string;
  targetTitle: string;
  platform: string;
  category: TargetCategory;
  prizePool: string;
  prizeAmountUsd: number;
  deadline: string;
  daysRemaining: number;
  tier: TargetPriorityTier;
  tierLabel: string;
  compositeScore: number;       // 0 - 100
  expectedValueUsd: number;     // Expected dollar yield
  winProbabilityPercent: number;// 0 - 100
  recommendedArchetype: string;
  recommendedArchetypeName: string;
  archetypeFitScore: number;    // 0 - 100
  riskRewardProfile: 'Low Risk / High Yield' | 'High Alpha / Moderate Risk' | 'Max Bounty / Elite Complexity' | 'Moderate Yield / Standard Risk';
  policyCompliance: {
    passesPolicy: boolean;
    blockedReasons: string[];
    suggestedOverride?: string;
  };
  strategicRationale: string;
  tacticalDirectives: string[];
  keySuccessDrivers: string[];
  estimatedEffortHours: number;
  hourlyRoiUsd: number;
}

export interface ArchetypePerformanceRecord {
  archetypeKey: string;
  archetypeName: string;
  winRatePercent: number;
  historicalPrizeYieldUsd: number;
  avgPrizePerWinUsd: number;
  totalEvaluatedTargets: number;
  topPlacementsCount: number;
  bestSuitedCategories: TargetCategory[];
  bestSuitedPlatforms: string[];
  averageRubricScore: number;
  dominantStrengths: string[];
  keyWeaknesses: string[];
  recommendedScaffoldEnhancements: string[];
  complexityRating: 'Low' | 'Medium' | 'High' | 'Extreme';
  roiRating: number; // 0 - 100
}

export interface PolicyRuleDiff {
  ruleKey: keyof PolicyRuleConfig;
  label: string;
  currentValue: any;
  recommendedValue: any;
  reason: string;
  impact: string;
}

export interface PolicyRecommendation {
  profile: StrategyProfileType;
  profileTitle: string;
  description: string;
  suggestedPolicy: PolicyRuleConfig;
  ruleDiffs: PolicyRuleDiff[];
  projectedWeeklyYieldUsd: number;
  projectedWinRatePercent: number;
  projectedWeeklyBuilds: number;
  focusPlatforms: string[];
  focusArchetypes: string[];
}

export interface StrategyEngineState {
  version: string;
  activeProfile: StrategyProfileType;
  weights: StrategyWeights;
  recommendations: TargetStrategyRecommendation[];
  archetypePerformances: ArchetypePerformanceRecord[];
  policyRecommendation: PolicyRecommendation;
  aggregateMetrics: {
    totalPortfolioEvUsd: number;
    averageWinRatePercent: number;
    topTargetTitle: string;
    topTargetEvUsd: number;
    qualifiedTargetsCount: number;
    blockedByPolicyCount: number;
    recommendedWeeklyHours: number;
  };
  lastAnalyzedAt: string;
}

export interface StrategySimulationOptions {
  profile?: StrategyProfileType;
  weights?: StrategyWeights;
  customMinPrize?: number;
  customMaxBuilds?: number;
}
