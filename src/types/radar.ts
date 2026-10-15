import { z } from 'zod';

export type TargetCategory = 'ai' | 'vrp_security' | 'crypto_web3' | 'flagship' | 'university' | 'enterprise';

export type PipelineStage = 'detected' | 'interpreted' | 'planned' | 'generated' | 'qa_passed' | 'deployed' | 'packaged';

// Formal Enterprise Pipeline Lifecycle Finite State Machine (FSM)
export type LifecycleState =
  | 'DISCOVERED'
  | 'SCOPED'
  | 'GATED'
  | 'SYNTHESIS'
  | 'VERIFICATION'
  | 'REPAIR_LOOP'
  | 'AUDITED'
  | 'PACKAGED'
  | 'FAILED'
  | 'REJECTED';

export interface LifecycleTransitionRecord {
  fromState: LifecycleState;
  toState: LifecycleState;
  timestamp: string;
  reason?: string;
  token?: string;
  invariantsSatisfied: boolean;
}

// Ingestion Taxonomy Discriminated Union
export const TargetTypeSchema = z.enum([
  'COMPETITION_HACKATHON',
  'SECURITY_ADVISORY',
  'BOUNTY_PROGRAM',
]);

export type TargetType = z.infer<typeof TargetTypeSchema>;

export type TargetTrack = 'TRACK_HACKATHON' | 'TRACK_DEFENSIVE_PATCH' | 'TRACK_BOUNTY_DISCLOSURE';

export const BaseTargetSchema = z.object({
  id: z.string(), // canonical hash: sha256(source + ':' + platform_id)
  sourcePlatform: z.enum([
    'devpost',
    'ethglobal',
    'google_vrp',
    'github_advisory',
    'immunefi',
    'huntr',
    'kaggle',
    'hackerone',
  ]),
  externalId: z.string(),
  title: z.string(),
  discoveredAt: z.string(),
  rawUrl: z.string().url(),
  etag: z.string().optional(),
  lastModified: z.string().optional(),
});

export const HackathonTargetSchema = BaseTargetSchema.extend({
  type: z.literal('COMPETITION_HACKATHON'),
  prizePoolUsd: z.number().nonnegative(),
  submissionDeadline: z.string(),
  rubricCriteria: z.array(z.string()),
  deliverableRequirements: z.object({
    requiresLiveUrl: z.boolean(),
    requiresPublicRepo: z.boolean(),
    requiresVideoDemo: z.boolean(),
  }),
});

export const SecurityAdvisoryTargetSchema = BaseTargetSchema.extend({
  type: z.literal('SECURITY_ADVISORY'),
  cveId: z.string().optional(),
  ghsaId: z.string().optional(),
  affectedPackage: z.string(),
  affectedVersions: z.string(),
  patchedVersions: z.string().optional(),
  vulnerabilityClass: z.string(), // e.g., CWE-79, CWE-284, CWE-89
  upstreamRepository: z.string().url(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('HIGH'),
});

export const BountyProgramTargetSchema = BaseTargetSchema.extend({
  type: z.literal('BOUNTY_PROGRAM'),
  maxRewardUsd: z.number().nonnegative(),
  scopeInclusions: z.array(z.string()),
  scopeExclusions: z.array(z.string()),
  safeHarborTermsVerified: z.boolean(),
});

export const IngestionTargetSchema = z.discriminatedUnion('type', [
  HackathonTargetSchema,
  SecurityAdvisoryTargetSchema,
  BountyProgramTargetSchema,
]);

export type IngestionTarget = z.infer<typeof IngestionTargetSchema>;

export interface TelemetryPing {
  platform: string;
  endpoint: string;
  latencyMs: number;
  status: 'online' | 'degraded' | 'syncing';
  lastChecked: string;
  etag?: string;
  cacheHit?: boolean;
}

export interface CVSSAudit {
  baseScore: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  vectorString: string;
  impactMetrics: {
    attackVector: 'NETWORK' | 'ADJACENT' | 'LOCAL';
    attackComplexity: 'LOW' | 'HIGH';
    privilegesRequired: 'NONE' | 'LOW' | 'HIGH';
    confidentiality: 'HIGH' | 'LOW' | 'NONE';
    integrity: 'HIGH' | 'LOW' | 'NONE';
  };
}

export interface MerkleTreeNode {
  path: string;
  hash: string;
  sizeBytes: number;
  language: string;
}

// Empirical Benchmarking & Profiling Schema
export interface BenchmarkResult {
  coldStartMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  throughputRps: number;
  memoryUsageMb: number;
  errorRatePercent: number;
  iterations: number;
  measuredAt: string;
  status: 'passed' | 'warning' | 'failed';
}

// Canonical Defensive Patch Schema (patch.diff)
export interface DefensivePatchResult {
  cveId?: string;
  ghsaId?: string;
  affectedPackage: string;
  affectedFile: string;
  patchDiff: string;
  reproductionTestPath: string;
  reproductionTestContent: string;
  vulnerabilityClass: string;
  regressionVerified: boolean;
  invariantsPassed: boolean;
  appliedCleanly: boolean;
  timestamp: string;
}

// SLSA v0.2 Attestation & Cryptographic Provenance
export interface SLSAAttestation {
  _type: 'https://in-toto.io/Statement/v0.1';
  subject: { name: string; digest: { sha256: string } }[];
  predicateType: 'https://slsa.dev/provenance/v0.2';
  predicate: {
    builder: { id: string };
    buildType: string;
    invocation: { configSource: { uri: string } };
    metadata: {
      buildStartedOn?: string;
      buildFinishedOn: string;
      reproducible?: boolean;
    };
    materials?: { uri: string; digest: { sha256: string } }[];
  };
}

export interface MerkleProvenanceResult {
  merkleRoot: string;
  leaves: { path: string; sha256: string; sizeBytes?: number }[];
  timestamp: string;
  slsaAttestation: SLSAAttestation;
}

// Consensus Arbitration & Bounded Repair Loop Result
export interface ConsensusArbitrationResult {
  consensusPassed: boolean;
  confidenceScore: number;
  retryCount: number;
  maxRetries: number;
  stateHash: string;
  validatorFindings: {
    scopeInvariantsPassed: boolean;
    typeCorrectnessPassed: boolean;
    securityBoundsPassed: boolean;
    compilerDiagnostics: string[];
    negativeAssertionsPassed: boolean;
  };
  synthesizerDetails: {
    model: string;
    toolCallsCount: number;
    synthesizedTokens: number;
    temperature: number;
  };
  arbitrationNotes: string;
  repairedErrors?: string[];
  resolvedAt: string;
}

// Hardened Ephemeral Sandboxing Telemetry
export interface SandboxExecutionRecord {
  sandboxId: string;
  engine: 'gVisor runsc (v3.8)' | 'Firecracker MicroVM';
  rootFsMode: 'read-only';
  networkNamespace: '--net=none (isolated)';
  cpuAllocation: '2 vCPU';
  memoryCeilingMb: 2048;
  executionDurationMs: number;
  exitCode: number;
  merkleSealSha256: string;
  timestamp: string;
}

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
  allowedTech?: string[];

  // Enterprise additions
  targetType?: TargetType;
  track?: TargetTrack;
  targetTrack?: TargetTrack;
  canonicalHash?: string;
  etag?: string;
  lastModified?: string;
  ingestionData?: IngestionTarget;

  lifecycleState?: LifecycleState;
  lifecycleHistory?: LifecycleTransitionRecord[];
  repairCount?: number;

  winProbabilityScore?: number;
  cvss?: CVSSAudit;
  spec?: ChallengeSpec;
  project?: GeneratedProject;
  qaResult?: QAAuditResult;
  submissionBundle?: SubmissionBundle;
  githubRepo?: GitHubRepo;
  githubPushResult?: GitHubPushResult;

  benchmarkResult?: BenchmarkResult;
  defensivePatch?: DefensivePatchResult;
  merkleProvenance?: MerkleProvenanceResult;
  consensusArbitration?: ConsensusArbitrationResult;
  sandboxRecord?: SandboxExecutionRecord;
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

export interface GitCommitRecord {
  sha: string;
  message: string;
  branch: string;
  filesCount: number;
  timestamp: string;
  url: string;
}

export interface GitHubPushResult {
  success: boolean;
  commitSha: string;
  branch: string;
  filesCount: number;
  repoUrl: string;
  commitUrl: string;
  pushedAt: string;
  commitHistory?: GitCommitRecord[];
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
  suggestedArchetype: 'ai_fullstack_app' | 'multi_agent_orchestrator' | 'security_vrp_poc' | 'data_pipeline' | 'solidity_agent_vault';
  summary: string;
  noveltyAngle?: string;
  targetType?: TargetType;
  track?: TargetTrack;
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
  merkleTree?: MerkleTreeNode[];
}

export interface QACheckItem {
  name: string;
  status: 'passed' | 'warning' | 'failed';
  message: string;
}

export interface QAAuditResult {
  fingerprint: string;
  merkleRoot?: string;
  originalityScore: number;
  totalLines: number;
  fileCount: number;
  auditChecks: QACheckItem[];
  entropyHeatmap?: { label: string; entropy: number }[];
  qaStatus: 'passed' | 'warning' | 'failed';
  readyForDeployment: boolean;
  auditedAt: string;
  cvssAudit?: CVSSAudit;
  slsaAttestation?: SLSAAttestation;
}

export interface SubmissionBundle {
  shortPitch: string;
  fullDescription: string;
  videoScript: string;
  keyHighlights: string[];
  repoUrl?: string;
  demoUrl?: string;
  slideDeckOutline?: { slideNumber: number; title: string; bullets: string[] }[];
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
  allowedTracks?: TargetTrack[];
  enforceEtagConditionalPolling?: boolean;
  enforceSandboxIsolation?: boolean;
}
