import { TargetCategory, PolicyRuleConfig } from './radar';

export type PlacementTier =
  | '1st_place'
  | '2nd_place'
  | '3rd_place'
  | 'finalist'
  | 'honorable_mention'
  | 'bounty_payout_critical'
  | 'bounty_payout_high'
  | 'unplaced';

export interface RubricScores {
  technicalNovelty: number; // 0 - 100
  architectureClarity: number; // 0 - 100
  demoExecution: number; // 0 - 100
  documentationDepth: number; // 0 - 100
  securityHardening: number; // 0 - 100
  rubricAlignment: number; // 0 - 100
}

export interface ProjectOutcome {
  id: string;
  targetId: string;
  projectName: string;
  platform: string;
  category: TargetCategory;
  archetype: string;
  placement: PlacementTier;
  prizeWonUsd: number;
  overallScore: number;
  rubricScores: RubricScores;
  judgeFeedbackRaw: string;
  strengthsIdentified: string[];
  weaknessesIdentified: string[];
  recommendations: string[];
  timestamp: string;
}

export interface PromptRefinement {
  promptKey: 'generator' | 'interpreter' | 'packager' | 'qa';
  title: string;
  currentVersion: string;
  status: 'active' | 'candidate' | 'baseline';
  lastRefinedAt: string;
  rationale: string;
  injectedDirectives: string[];
  baselinePrompt: string;
  refinedPrompt: string;
  estimatedWinRateDelta: number; // e.g. +14.2%
}

export interface ArchetypeRefinement {
  archetypeKey: string;
  archetypeName: string;
  winRatePercent: number;
  totalSubmissions: number;
  topPlacements: number;
  totalPrizeWonUsd: number;
  judgeSentimentScore: number; // 0 - 100
  keyJudgePraises: string[];
  keyJudgeComplaints: string[];
  templateEnhancements: string[];
  mandatoryDeliverables: string[];
}

export interface PolicyRuleAdjustment {
  id: string;
  ruleKey: keyof PolicyRuleConfig;
  label: string;
  currentValue: any;
  suggestedValue: any;
  rationale: string;
  confidenceScore: number; // 0 - 100
  applied: boolean;
}

export interface LearningInsight {
  id: string;
  category: 'architecture' | 'documentation' | 'presentation' | 'security' | 'timing';
  title: string;
  insight: string;
  supportingOutcomesCount: number;
  winRateImpact: number; // e.g. +18.5%
  correlation: 'positive' | 'negative' | 'neutral';
}

export interface MetaLearningState {
  version: string;
  lastOptimizedAt: string;
  totalOutcomesAnalyzed: number;
  totalPrizeWonUsd: number;
  overallWinRatePercent: number;
  activePrompts: Record<string, PromptRefinement>;
  archetypes: Record<string, ArchetypeRefinement>;
  policyAdjustments: PolicyRuleAdjustment[];
  learningInsights: LearningInsight[];
  outcomes: ProjectOutcome[];
}
