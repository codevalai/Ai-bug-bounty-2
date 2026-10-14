import { computeCanonicalSha256, sha256Hex } from './ingestionNormalizer';

export interface SlsaProvenanceInput {
  targetId: string;           // e.g., "CVE-2026-4192"
  sourceRepoUri: string;      // e.g., "https://github.com/go-vikunja/vikunja"
  vulnerableCommitSha: string;
  patchDiffContent: string;
  pocScriptContent: string;
  repairIterationsUsed: number; // k in {1, 2, 3}
  zodSchemaHash: string;
  invocationId: string;
  startedAt: string;
  finishedAt: string;
  previousReceiptDigest?: string;
}

export interface SlsaV1Statement {
  _type: 'https://in-toto.io/Statement/v1';
  subject: {
    name: string;
    digest: { sha256: string };
  }[];
  predicateType: 'https://slsa.dev/provenance/v1';
  predicate: {
    buildDefinition: {
      buildType: string;
      externalParameters: {
        targetId: string;
        sourceRepository: string;
        maxRepairIterations: number;
        actualRepairIterations: number;
        zodSchemaDigest: string;
        previousReceiptDigest: string;
      };
      internalParameters: {
        synthesizerModel: string;
        redTeamBreakerModel: string;
        validatorGate: string;
        canonicalizationStandard: string;
      };
      resolvedDependencies: {
        uri: string;
        digest: { gitCommit: string };
      }[];
    };
    runDetails: {
      builder: {
        id: string;
      };
      metadata: {
        invocationId: string;
        startedOn: string;
        finishedOn: string;
      };
    };
  };
}

export function generateSlsaV1Provenance(input: SlsaProvenanceInput): {
  statement: SlsaV1Statement;
  statementJson: string;
  receiptDigest: string;
  fullSha256: string;
} {
  const patchSha256 = sha256Hex(input.patchDiffContent);
  const pocSha256 = sha256Hex(input.pocScriptContent);

  const statement: SlsaV1Statement = {
    _type: 'https://in-toto.io/Statement/v1',
    subject: [
      {
        name: `${input.targetId}.remediation.patch.diff`,
        digest: { sha256: patchSha256 },
      },
      {
        name: `${input.targetId}.verification.poc.sh`,
        digest: { sha256: pocSha256 },
      },
    ],
    predicateType: 'https://slsa.dev/provenance/v1',
    predicate: {
      buildDefinition: {
        buildType: 'https://radar.autonomous.engine/MultiAgentConsensus/v1',
        externalParameters: {
          targetId: input.targetId,
          sourceRepository: input.sourceRepoUri,
          maxRepairIterations: 3,
          actualRepairIterations: input.repairIterationsUsed,
          zodSchemaDigest: input.zodSchemaHash,
          previousReceiptDigest: input.previousReceiptDigest || 'sha256:0000000000000000',
        },
        internalParameters: {
          synthesizerModel: 'gemini-3.8-flash',
          redTeamBreakerModel: 'gemini-3.8-flash-adversarial',
          validatorGate: 'git-apply-check+zod-strict+ast-invariants',
          canonicalizationStandard: 'RFC-8785-JCS',
        },
        resolvedDependencies: [
          {
            uri: input.sourceRepoUri,
            digest: { gitCommit: input.vulnerableCommitSha },
          },
        ],
      },
      runDetails: {
        builder: {
          id: 'https://radar.autonomous.engine/builders/deterministic-arbiter-v1',
        },
        metadata: {
          invocationId: input.invocationId,
          startedOn: input.startedAt,
          finishedOn: input.finishedAt,
        },
      },
    },
  };

  const statementJson = JSON.stringify(statement, null, 2);
  const fullSha256 = computeCanonicalSha256(statement);
  const receiptDigest = `sha256:${fullSha256.slice(0, 16)}`;

  return {
    statement,
    statementJson,
    receiptDigest,
    fullSha256,
  };
}
