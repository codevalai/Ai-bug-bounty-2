import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Cpu,
  Database,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Terminal,
  Binary,
  X,
} from 'lucide-react';
import {
  verifyDsseBundleInBrowser,
  DsseVerificationResult,
} from '../utils/webCryptoVerifier';
import { playTactileClick } from '../utils/audio';

export interface ProofVerifierModalProps {
  dsseBundle: any;
  targetId?: string;
  targetTitle?: string;
  cweClass?: string;
  onClose?: () => void;
}

export function ProofVerifierModal({
  dsseBundle,
  targetId = 'CVE-2026-4192',
  targetTitle = 'Vikunja Open-Source Task Manager',
  cweClass = 'CWE-120',
  onClose,
}: ProofVerifierModalProps) {
  const [verificationResult, setVerificationResult] =
    useState<DsseVerificationResult | null>(null);
  const [pccResult, setPccResult] = useState<any>(null);
  const [attestationResult, setAttestationResult] = useState<any>(null);
  const [anchorResult, setAnchorResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [allocInput, setAllocInput] = useState<number>(4096);
  const [maxArenaInput, setMaxArenaInput] = useState<number>(65536);
  const [cpuVendor, setCpuVendor] = useState<'AWS_NITRO' | 'AMD_SEV_SNP' | 'INTEL_TDX'>('AWS_NITRO');

  const handleVerifyAll = async () => {
    playTactileClick();
    setLoading(true);
    try {
      // 1. Browser-native WebCrypto DSSEv1 verification
      const dsseRes = await verifyDsseBundleInBrowser(dsseBundle);
      setVerificationResult(dsseRes);

      // 2. Proof-Carrying Code (PCC) SMT-LIB2 Theorem Prover Gate
      const pccReq = await fetch('/api/radar/formal/pcc-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cveId: targetId,
          allocationSizeVarName: 'patch_buffer_alloc_bytes',
          maxBufferBytes: maxArenaInput,
          requestedAllocationBytes: allocInput,
          cweClass,
        }),
      });
      if (pccReq.ok) {
        setPccResult(await pccReq.json());
      }

      // 3. Hardware Enclave Remote Attestation (AWS Nitro / AMD SEV-SNP / Intel TDX)
      const attestReq = await fetch('/api/radar/security/hardware-attest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId,
          cpuVendor,
        }),
      });
      if (attestReq.ok) {
        setAttestationResult(await attestReq.json());
      }

      // 4. Automated EVM Relayer Daemon (SovereignMerkleOracle.sol on Base Sepolia)
      const anchorReq = await fetch('/api/radar/relayer/anchor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId,
          slsaBatchCid: `ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/${targetId.toLowerCase()}.intoto.json`,
        }),
      });
      if (anchorReq.ok) {
        setAnchorResult(await anchorReq.json());
      }
    } catch (err: any) {
      setVerificationResult({
        verified: false,
        payloadSha256Hex: '',
        paeDigestHex: '',
        keyId: '',
        algorithm: '',
        verificationLatencyMs: 0,
        error: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white text-sm font-sans">
              WebCrypto SLSA v1.0 DSSE, PCC SMT-LIB2 & On-Chain Settlement Verifier
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            Target: <span className="text-cyan-400 font-mono">{targetId}</span> ({targetTitle}) — Closed-Loop Mathematical & Hardware Attestation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleVerifyAll}
            disabled={loading}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-sans font-semibold text-xs rounded transition-colors cursor-pointer whitespace-nowrap"
          >
            {loading ? 'Executing 4-Stage Proof Pipeline...' : 'Verify Cryptographic & On-Chain Proofs'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
              title="Close Verifier"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Parameter Controls for PCC Solver & Hardware Enclave */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950 p-3 rounded border border-slate-800 font-sans">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            PCC Requested Allocation (Bytes)
          </label>
          <input
            type="number"
            value={allocInput}
            onChange={(e) => setAllocInput(Number(e.target.value) || 0)}
            className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            RFC-003 Max Arena Bound (Bytes)
          </label>
          <input
            type="number"
            value={maxArenaInput}
            onChange={(e) => setMaxArenaInput(Number(e.target.value) || 65536)}
            className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Confidential Enclave Root of Trust
          </label>
          <select
            value={cpuVendor}
            onChange={(e) =>
              setCpuVendor(e.target.value as 'AWS_NITRO' | 'AMD_SEV_SNP' | 'INTEL_TDX')
            }
            className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="AWS_NITRO">AWS Nitro Enclaves (SHA-384 PCR0)</option>
            <option value="AMD_SEV_SNP">AMD EPYC SEV-SNP (VCEK Root)</option>
            <option value="INTEL_TDX">Intel Trust Domain Extensions (TDX)</option>
          </select>
        </div>
      </div>

      {verificationResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* 1. WebCrypto DSSEv1 Verification Card */}
          <div
            className={`p-3 rounded border ${
              verificationResult.verified
                ? 'bg-emerald-950/20 border-emerald-500/40'
                : 'bg-rose-950/20 border-rose-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                {verificationResult.verified
                  ? '✓ STAGE 1: SIGNATURE VALID (DSSEv1 / WebCrypto)'
                  : '✗ STAGE 1: SIGNATURE VERIFICATION FAILED'}
              </span>
              <span className="text-[10px] text-slate-400 tabular-nums">
                {verificationResult.verificationLatencyMs}ms
              </span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-300">
              <div>
                <span className="text-slate-500">Algorithm: </span>
                <span className="text-white">{verificationResult.algorithm}</span>
              </div>
              <div>
                <span className="text-slate-500">Signer KeyID: </span>
                <span className="text-cyan-400">{verificationResult.keyId}</span>
              </div>
              <div className="truncate">
                <span className="text-slate-500">Payload SHA-256: </span>
                <span className="text-emerald-300">{verificationResult.payloadSha256Hex}</span>
              </div>
              <div className="truncate">
                <span className="text-slate-500">DSSE PAE Digest: </span>
                <span className="text-slate-300">{verificationResult.paeDigestHex}</span>
              </div>
            </div>
          </div>

          {/* 2. Proof-Carrying Code (PCC) SMT-LIB2 Solver Card */}
          {pccResult && (
            <div
              className={`p-3 rounded border ${
                pccResult.pccProofValid
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-rose-950/20 border-rose-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`font-bold flex items-center gap-1.5 ${
                    pccResult.pccProofValid ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  <Binary className="w-3.5 h-3.5" />
                  {pccResult.pccProofValid
                    ? `✓ STAGE 2: PCC SMT-LIB2 PROVED (${pccResult.solverStatus.toUpperCase()})`
                    : `✗ STAGE 2: BOUNDS VIOLATION (${pccResult.solverStatus.toUpperCase()})`}
                </span>
                <span className="text-[10px] text-slate-400 tabular-nums">
                  {pccResult.z3SolverLatencyMs}ms
                </span>
              </div>
              <div className="text-[11px] text-slate-300 mb-1.5">
                <span className="text-slate-500">Invariant: </span>
                <span className="text-cyan-400">{pccResult.formalInvariantVerified}</span>
              </div>
              <pre className="p-2 bg-slate-950 border border-slate-800 rounded text-[10px] text-slate-300 overflow-x-auto max-h-28">
                {pccResult.smtLib2ProofScript}
              </pre>
            </div>
          )}

          {/* 3. Hardware Remote Attestation (AWS Nitro / AMD SEV-SNP) */}
          {attestationResult && (
            <div className="p-3 rounded border bg-slate-950 border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  ✓ STAGE 3: ENCLAVE ATTESTATION ({attestationResult.cpuVendor})
                </span>
                <span className="text-[10px] text-emerald-400">
                  {attestationResult.signatureValid ? 'PCR0 + HMAC VALID' : 'INVALID'}
                </span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <div>
                  <span className="text-slate-500">Enclave ID: </span>
                  <span className="text-white">{attestationResult.enclaveId}</span>
                </div>
                <div className="truncate">
                  <span className="text-slate-500">SPIFFE SVID: </span>
                  <span className="text-cyan-300">{attestationResult.spiffeSvidUri}</span>
                </div>
                <div className="truncate">
                  <span className="text-slate-500">PCR0 (SHA-384): </span>
                  <span className="text-slate-300">{attestationResult.pcr0Hash}</span>
                </div>
                <div className="truncate">
                  <span className="text-slate-500">PCR1 (SHA-384): </span>
                  <span className="text-slate-400">{attestationResult.pcr1Hash}</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Automated EVM Relayer Daemon (Base Sepolia Settlement) */}
          {anchorResult && (
            <div className="p-3 rounded border bg-slate-950 border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  ✓ STAGE 4: ON-CHAIN MERKLE EPOCH #{anchorResult.epochHeight}
                </span>
                <span className="text-[10px] text-slate-400 tabular-nums">
                  Block #{anchorResult.blockNumber}
                </span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <div>
                  <span className="text-slate-500">Network: </span>
                  <span className="text-white">{anchorResult.networkName}</span>
                </div>
                <div className="truncate">
                  <span className="text-slate-500">Oracle Contract: </span>
                  <span className="text-cyan-400">{anchorResult.contractAddress}</span>
                </div>
                <div className="truncate">
                  <span className="text-slate-500">RFC 6962 Root: </span>
                  <span className="text-emerald-400">{anchorResult.merkleRoot}</span>
                </div>
                <div className="truncate">
                  <span className="text-slate-500">Settlement TxHash: </span>
                  <span className="text-amber-300">{anchorResult.txHash}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
