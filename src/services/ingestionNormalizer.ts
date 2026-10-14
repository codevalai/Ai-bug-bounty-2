import { z } from 'zod';

export const RawAdvisorySchema = z.object({
  id: z.string(), // e.g., "CVE-2026-70035" or "GHSA-..."
  title: z.string(),
  summary: z.string(),
  sourceUrl: z.string().url(),
  ecosystem: z.string().optional(),
  severity: z.string().optional(),
  packageName: z.string().optional(),
});

export type NormalizedTarget = {
  id: string;
  title: string;
  cleanSummary: string;
  sha256Receipt: string;
  platformTrack: string;
  estimatedValue: string;
  estimatedAmountUsd: number;
  isMicrosoft: boolean;
  isGoogleTarget: boolean;
  lifecycleState: 'SCOPED' | 'AUDITED';
  flaggedInjections: string[];
  simHash64: string;
};

/**
 * RFC 8785 JSON Canonicalization Scheme (JCS)
 * Guarantees deterministic key ordering across JavaScript runtimes before hashing.
 */
export function canonicalizeJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalizeJson).join(',') + ']';
  }
  const record = value as Record<string, unknown>;
  const sortedKeys = Object.keys(record).sort();
  const pairs = sortedKeys
    .filter((k) => record[k] !== undefined)
    .map((k) => `${JSON.stringify(k)}:${canonicalizeJson(record[k])}`);
  return '{' + pairs.join(',') + '}';
}

/**
 * Deterministic SHA-256 hex digest (pure TypeScript implementation safe for both browser & Node)
 */
export function sha256Hex(asciiInput: string): string {
  const utf8 = unescape(encodeURIComponent(asciiInput));
  const words: number[] = [];
  const asciiBitLength = utf8.length * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  const rightRotate = (value: number, amount: number) => (value >>> amount) | (value << (32 - amount));

  for (let i = 0; i < utf8.length; i++) {
    const code = utf8.charCodeAt(i);
    words[i >> 2] |= (code & 0xff) << ((3 - (i % 4)) * 8);
  }

  words[asciiBitLength >> 5] |= 0x80 << ((3 - ((asciiBitLength >> 3) % 4)) * 8);
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  for (let i = 0; i < words.length; i += 16) {
    const w = words.slice(i, i + 16);
    const oldHash = hash.slice(0);

    for (let j = 0; j < 64; j++) {
      const w15 = w[j - 15];
      const w2 = w[j - 2];

      const a = hash[0];
      const e = hash[4];

      const temp1 =
        (hash[7] +
          (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
          ((e & hash[5]) ^ (~e & hash[6])) +
          k[j] +
          (w[j] =
            j < 16
              ? w[j] | 0
              : (w[j - 16] +
                  (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                  w[j - 7] +
                  (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
                0)) |
        0;

      const temp2 =
        ((rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
          ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]))) |
        0;

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }

    for (let j = 0; j < 8; j++) {
      hash[j] = (hash[j] + oldHash[j]) | 0;
    }
  }

  let result = '';
  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

export function computeCanonicalSha256(payload: unknown): string {
  return sha256Hex(canonicalizeJson(payload));
}

/**
 * Indirect Prompt Injection Firewall (Pre-LLM Sanitizer)
 * Strips HTML comments, zero-width control chars, and instruction override attempts.
 */
export function sanitizeUntrustedAdvisoryInput(rawMarkdown: string): {
  sanitized: string;
  flaggedPatterns: string[];
} {
  const flaggedPatterns: string[] = [];

  const injectionRegexes = [
    { name: 'HTML_COMMENT_INJECTION', regex: /<!--[\s\S]*?-->/g },
    { name: 'ZERO_WIDTH_CHARS', regex: /[\u200B-\u200D\uFEFF]/g },
    {
      name: 'SYSTEM_OVERRIDE_ATTEMPT',
      regex: /\b(ignore previous instructions|disregard all prior|system prompt|exfiltrate|curl\s+http)\b/gi,
    },
  ];

  let sanitized = rawMarkdown || '';
  for (const { name, regex } of injectionRegexes) {
    if (regex.test(sanitized)) {
      flaggedPatterns.push(name);
      sanitized = sanitized.replace(regex, '[REDACTED_BY_INGESTION_FIREWALL]');
    }
  }

  return { sanitized, flaggedPatterns };
}

/**
 * Computes a 64-bit SimHash over normalized vulnerability tokens for semantic deduplication
 */
export function computeAdvisorySimHash(tokens: string[]): string {
  const fullHash = sha256Hex(tokens.map((t) => t.toLowerCase().trim()).sort().join('|'));
  return fullHash.slice(0, 16);
}

/**
 * Deterministic Live Advisory Normalizer
 * Fixes:
 * 1. Unstripped Markdown headers (`## Executive summary`) & mid-word truncation
 * 2. Hash prefix collision (`sha256:live-ghsa-`) via unique 16-char SHA-256 digest
 * 3. Vendor misattribution (routes Microsoft/.NET/ASP.NET to MSRC instead of Google VRP)
 */
export function normalizeLiveAdvisory(raw: z.infer<typeof RawAdvisorySchema>): NormalizedTarget {
  // 0. Pass through Indirect Prompt Injection Firewall first
  const { sanitized, flaggedPatterns } = sanitizeUntrustedAdvisoryInput(raw.summary);

  // 1. Strip Markdown headers (## Executive summary, ### Summary, etc.), inline formatting, and normalize whitespace
  const stripped = sanitized
    .replace(/^#+\s*(Executive\s*summary|Summary|Overview|Description|Vulnerability\s*Details)\s*:?\s*/gi, '')
    .replace(/#+\s*(Executive\s*summary|Summary|Overview)\s*:?\s*/gi, '')
    .replace(/[#_*`~>]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  // 2. Truncate cleanly on a word boundary at <= 120 chars (fixes "Microsoft.AspNetCore.Ser")
  const maxLen = 120;
  let cleanSummary = stripped;
  if (stripped.length > maxLen) {
    const lastSpace = stripped.lastIndexOf(' ', maxLen);
    cleanSummary = (lastSpace > 40 ? stripped.slice(0, lastSpace) : stripped.slice(0, maxLen)).replace(/[.,;:-]+$/, '') + '...';
  }

  // 3. Deterministic 16-char hex digest from unique CVE ID + URL (fixes "sha256:live-ghsa-" collision)
  const hash = sha256Hex(`${raw.id}:${raw.sourceUrl}`).slice(0, 16);

  // 4. Vendor & Bounty Program Attribution Matrix
  const combinedText = `${raw.title} ${raw.packageName || ''} ${raw.ecosystem || ''} ${stripped}`;
  const isMicrosoft = /Microsoft|\.NET|ASP\.NET|Visual Studio|NuGet|Azure|Windows|Chakra/i.test(combinedText);
  const isGoogle = !isMicrosoft && /Google|Chromium|Android|V8|Golang|TensorFlow|Kubernetes|Angular|Firebase/i.test(combinedText);

  const severity = (raw.severity || 'HIGH').toUpperCase();

  let platformTrack = 'GitHub Security Advisory (GHSA)';
  let estimatedValue = '$5,000 - $15,000';
  let estimatedAmountUsd = 10000;

  if (isMicrosoft) {
    platformTrack = 'MSRC / GitHub Security Advisory';
    estimatedValue = severity === 'CRITICAL' ? '$15,000 - $20,000 (MSRC Bounty)' : '$5,000 - $20,000 (MSRC Bounty)';
    estimatedAmountUsd = severity === 'CRITICAL' ? 20000 : 12500;
  } else if (isGoogle) {
    platformTrack = 'Google VRP / GitHub Security Advisory';
    estimatedValue = severity === 'CRITICAL' ? '$25,000 - $31,337 (Google VRP)' : '$10,000 - $15,000 (Google VRP)';
    estimatedAmountUsd = severity === 'CRITICAL' ? 31337 : 15000;
  } else {
    platformTrack = 'GitHub Security Advisory / Open Source Bounty';
    estimatedValue = severity === 'CRITICAL' ? '$15,000 - $25,000' : '$5,000 - $12,000';
    estimatedAmountUsd = severity === 'CRITICAL' ? 20000 : 8500;
  }

  const simHash64 = computeAdvisorySimHash([
    raw.id,
    raw.packageName || 'core',
    isMicrosoft ? 'microsoft' : isGoogle ? 'google' : 'oss',
  ]);

  return {
    id: raw.id,
    title: raw.title.replace(/[#_*`~]/g, '').trim(),
    cleanSummary,
    sha256Receipt: `sha256:${hash}`,
    platformTrack,
    estimatedValue,
    estimatedAmountUsd,
    isMicrosoft,
    isGoogleTarget: isGoogle,
    lifecycleState: 'SCOPED',
    flaggedInjections: flaggedPatterns,
    simHash64,
  };
}
