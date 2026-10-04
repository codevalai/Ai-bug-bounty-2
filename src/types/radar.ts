export type TargetCategory = 'ai' | 'vrp_security' | 'crypto_web3' | 'flagship' | 'university' | 'enterprise';

export type PipelineStage = 'detected' | 'interpreted' | 'planned' | 'generated' | 'qa_passed' | 'deployed' | 'packaged';

export interface TargetEvent {
  id: string;
  title: string;
  platform: string;
  sourceUrl: string;
  category: TargetCategory;
  theme: string;
  prizePool: string;
  prizeAmountUsd: number;
  deadline: string;
  status: 'live' | 'upcoming' | 'closing_soon';
  isGoogleTarget?: boolean;
  rawText?: string;
  stage: PipelineStage;
  spec?: ChallengeSpec;
  project?: GeneratedProject;
  qaResult?: QAAuditResult;
  submissionBundle?: SubmissionBundle;
  githubRepo?: GitHubRepo;
  githubPushResult?: GitHubPushResult;
}

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  bio?: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  html_url: string;
  clone_url: string;
  default_branch: string;
  private: boolean;
}

export interface GitHubPushResult {
  success: boolean;
  commitSha: string;
  branch: string;
  filesCount: number;
  repoUrl: string;
  commitUrl: string;
  pushedAt: string;
}

export interface ChallengeSpec {
  title: string;
  platform: string;
  category: TargetCategory;
  theme: string;
  prizePool: string;
  deadline: string;
  allowedTech: string[];
  requiredDeliverables: string[];
  judgingCriteria: string[];
  constraints: string[];
  submissionFormat: {
    needsRepoUrl: boolean;
    needsDemoUrl: boolean;
    needsDescriptionText: boolean;
    needsVideo: boolean;
    needsPoc: boolean;
  };
  suggestedArchetype: 'ai_fullstack_app' | 'multi_agent_orchestrator' | 'security_vrp_poc' | 'data_pipeline';
  summary: string;
  noveltyAngle?: string;
}

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface GeneratedProject {
  projectName: string;
  archetype: string;
  description: string;
  architectureNotes: string;
  files: GeneratedFile[];
  generatedAt: string;
}

export interface QACheckItem {
  name: string;
  status: 'passed' | 'warning' | 'failed';
  message: string;
}

export interface QAAuditResult {
  fingerprint: string;
  originalityScore: number;
  totalLines: number;
  fileCount: number;
  auditChecks: QACheckItem[];
  qaStatus: 'passed' | 'warning' | 'failed';
  readyForDeployment: boolean;
  auditedAt: string;
}

export interface SubmissionBundle {
  shortPitch: string;
  fullDescription: string;
  videoScript: string;
  keyHighlights: string[];
  repoUrl?: string;
  demoUrl?: string;
}

export interface PolicyRuleConfig {
  autoGenerateWhitelistedOnly: boolean;
  whitelistedPlatforms: string[];
  minimumPrizeUsd: number;
  maxActiveRunsPerWeek: number;
  allowedCategories: TargetCategory[];
  enforceOriginalWorkFingerprint: boolean;
  autoApproveSafeArchetypes: boolean;
  requireHumanSubmissionSignoff: boolean;
  targetStacks: string[];
}
