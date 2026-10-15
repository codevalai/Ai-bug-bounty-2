import crypto from 'crypto';
import { canonicalizeJson } from '../../src/services/ingestionNormalizer';

export interface MerkleInclusionProof {
  leafIndex: number;
  treeSize: number;
  leafHash: string;
  rootHash: string;
  auditPath: string[];
  rfc6962DomainSeparated: boolean;
}

/**
 * RFC 8785 JCS + RFC 6962 Certificate Transparency Merkle Tree Spine
 * Enforces 0x00 domain separation for leaves and 0x01 for internal nodes.
 */
export class Rfc6962MerkleLedger {
  private leaves: Buffer[] = [];

  constructor(initialPayloads: Array<Record<string, unknown> | string> = []) {
    for (const payload of initialPayloads) {
      this.appendLeaf(payload);
    }
  }

  public appendLeaf(payload: Record<string, unknown> | string): string {
    const canonicalString =
      typeof payload === 'string' ? payload : canonicalizeJson(payload);
    // RFC 6962 MTH({d(0)}) = SHA-256(0x00 || d(0))
    const leafBuf = crypto
      .createHash('sha256')
      .update(Buffer.from([0x00]))
      .update(Buffer.from(canonicalString, 'utf8'))
      .digest();
    this.leaves.push(leafBuf);
    return `0x${leafBuf.toString('hex')}`;
  }

  public getTreeSize(): number {
    return this.leaves.length;
  }

  private hashInternalNode(left: Buffer, right: Buffer): Buffer {
    // RFC 6962 internal node: SHA-256(0x01 || left || right)
    return crypto
      .createHash('sha256')
      .update(Buffer.from([0x01]))
      .update(left)
      .update(right)
      .digest();
  }

  public getRootHash(): string {
    if (this.leaves.length === 0) {
      const emptyRoot = crypto.createHash('sha256').update('').digest('hex');
      return `0x${emptyRoot}`;
    }
    let currentLayer = [...this.leaves];
    while (currentLayer.length > 1) {
      const nextLayer: Buffer[] = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          nextLayer.push(this.hashInternalNode(currentLayer[i], currentLayer[i + 1]));
        } else {
          nextLayer.push(currentLayer[i]);
        }
      }
      currentLayer = nextLayer;
    }
    return `0x${currentLayer[0].toString('hex')}`;
  }

  public generateInclusionProof(leafIndex: number): MerkleInclusionProof {
    if (this.leaves.length === 0) {
      return {
        leafIndex: 0,
        treeSize: 0,
        leafHash: `0x${'0'.repeat(64)}`,
        rootHash: this.getRootHash(),
        auditPath: [],
        rfc6962DomainSeparated: true,
      };
    }
    const clampedIdx = Math.max(0, Math.min(leafIndex, this.leaves.length - 1));
    const auditPath: string[] = [];
    let idx = clampedIdx;
    let currentLayer = [...this.leaves];

    while (currentLayer.length > 1) {
      const nextLayer: Buffer[] = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          if (i === idx || i + 1 === idx) {
            const sibling = i === idx ? currentLayer[i + 1] : currentLayer[i];
            auditPath.push(`0x${sibling.toString('hex')}`);
          }
          nextLayer.push(this.hashInternalNode(currentLayer[i], currentLayer[i + 1]));
        } else {
          nextLayer.push(currentLayer[i]);
        }
      }
      idx = Math.floor(idx / 2);
      currentLayer = nextLayer;
    }

    return {
      leafIndex: clampedIdx,
      treeSize: this.leaves.length,
      leafHash: `0x${this.leaves[clampedIdx].toString('hex')}`,
      rootHash: `0x${currentLayer[0].toString('hex')}`,
      auditPath,
      rfc6962DomainSeparated: true,
    };
  }
}
