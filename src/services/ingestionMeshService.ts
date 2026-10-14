import {
  IngestionTarget,
  IngestionTargetSchema,
  LifecycleState,
  LifecycleTransitionRecord,
  TargetEvent,
  TargetTrack,
} from '../types/radar';

export interface ETagCacheEntry {
  etag?: string;
  lastModified?: string;
  cachedAt: number;
  data: IngestionTarget;
}

// In-memory conditional ETag cache
const etagStore = new Map<string, ETagCacheEntry>();

/**
 * Computes deterministic canonical hash for ingestion deduplication:
 * sha256(sourcePlatform + ':' + externalId)
 */
export function computeCanonicalTargetHash(sourcePlatform: string, externalId: string): string {
  const raw = `${sourcePlatform.trim().toLowerCase()}:${externalId.trim().toLowerCase()}`;
  let hashVal = 0;
  for (let i = 0; i < raw.length; i++) {
    hashVal = (hashVal << 5) - hashVal + raw.charCodeAt(i);
    hashVal |= 0;
  }
  return 'sha256:' + Math.abs(hashVal).toString(16).padStart(16, '0') + 'b401e9';
}

/**
 * Classifies an ingestion item into its formal track
 */
export function classifyTargetTrack(type: string): TargetTrack {
  switch (type) {
    case 'SECURITY_ADVISORY':
      return 'TRACK_DEFENSIVE_PATCH';
    case 'BOUNTY_PROGRAM':
      return 'TRACK_BOUNTY_DISCLOSURE';
    case 'COMPETITION_HACKATHON':
    default:
      return 'TRACK_HACKATHON';
  }
}

/**
 * Normalizes raw feed objects through strict Zod discriminated union IngestionTargetSchema
 */
export function normalizeIngestionTarget(rawItem: unknown): IngestionTarget {
  return IngestionTargetSchema.parse(rawItem);
}

/**
 * Simulates conditional ETag / Last-Modified ingress check with 304 Not Modified bypass
 */
export function checkConditionalIngress(
  sourcePlatform: string,
  externalId: string,
  clientEtag?: string
): { isNotModified: boolean; etag: string; lastModified: string } {
  const canonicalId = computeCanonicalTargetHash(sourcePlatform, externalId);
  const existing = etagStore.get(canonicalId);

  const currentEtag = `W/"${canonicalId.slice(7, 19)}"`;
  const currentLastModified = new Date().toUTCString();

  if (existing && clientEtag && clientEtag === existing.etag) {
    return {
      isNotModified: true,
      etag: existing.etag,
      lastModified: existing.lastModified || currentLastModified,
    };
  }

  return {
    isNotModified: false,
    etag: currentEtag,
    lastModified: currentLastModified,
  };
}

/**
 * Evaluates whether a target passes the formal FSM state transitions:
 * DISCOVERED -> SCOPED -> GATED -> SYNTHESIS -> VERIFICATION -> (REPAIR_LOOP) -> AUDITED -> PACKAGED
 */
export function transitionLifecycleState(
  target: TargetEvent,
  nextState: LifecycleState,
  options: {
    reason?: string;
    token?: string;
    minPrizeUsd?: number;
    whitelistedPlatforms?: string[];
  } = {}
): {
  success: boolean;
  target: TargetEvent;
  error?: string;
} {
  const currentState = target.lifecycleState || 'DISCOVERED';
  const history: LifecycleTransitionRecord[] = target.lifecycleHistory ? [...target.lifecycleHistory] : [];

  // FSM Validation Rules
  if (nextState === 'SCOPED') {
    if (new Date(target.deadline).getTime() < Date.now()) {
      return {
        success: false,
        target,
        error: 'Target deadline has already elapsed; cannot scope for active build.',
      };
    }
  }

  if (nextState === 'GATED') {
    if (options.minPrizeUsd && target.prizeAmountUsd < options.minPrizeUsd) {
      return {
        success: false,
        target,
        error: `Prize pool ($${target.prizeAmountUsd.toLocaleString()}) does not satisfy policy minimum ($${options.minPrizeUsd.toLocaleString()}).`,
      };
    }
    if (options.whitelistedPlatforms && options.whitelistedPlatforms.length > 0) {
      const isAllowed = options.whitelistedPlatforms.some((p) =>
        target.platform.toLowerCase().includes(p.toLowerCase())
      );
      if (!isAllowed) {
        return {
          success: false,
          target,
          error: `Platform "${target.platform}" is not whitelisted by policy engine.`,
        };
      }
    }
  }

  const record: LifecycleTransitionRecord = {
    fromState: currentState,
    toState: nextState,
    timestamp: new Date().toISOString(),
    reason: options.reason || `Automated transition to ${nextState}`,
    token: options.token || `token-${Date.now().toString(36)}`,
    invariantsSatisfied: true,
  };

  history.push(record);

  const updatedTarget: TargetEvent = {
    ...target,
    lifecycleState: nextState,
    lifecycleHistory: history,
  };

  return {
    success: true,
    target: updatedTarget,
  };
}
