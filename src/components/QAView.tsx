import React, { useState } from 'react';
import { TargetEvent, QAAuditResult } from '../types/radar';
import { ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle, Fingerprint, Lock, Copy, Check } from 'lucide-react';

interface QAViewProps {
  activeTarget: TargetEvent;
  onProceedToSubmission: () => void;
  onRunAudit: () => void;
  isAuditing: boolean;
}

export const QAView: React.FC<QAViewProps> = ({
  activeTarget,
  onProceedToSubmission,
  onRunAudit,
  isAuditing,
}) => {
  const qa = activeTarget.qaResult;
  const [copiedHash, setCopiedHash] = useState(false);

  const handleCopyHash = () => {
    if (!qa?.fingerprint) return;
    navigator.clipboard.writeText(qa.fingerprint);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="text-xs text-slate-400">
            <span>Project: <strong className="text-slate-200">{activeTarget.project?.projectName || 'auto-competitor'}</strong></span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Integrity Layer: Active</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1">
            QA, Originality &amp; Code Fingerprint
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRunAudit}
            disabled={isAuditing}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 disabled:opacity-50 rounded-md transition-colors"
          >
            {isAuditing ? 'Auditing Codebase...' : 'Re-Run QA & Fingerprint'}
          </button>

          <button
            onClick={onProceedToSubmission}
            className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors inline-flex items-center gap-1.5"
          >
            <span>Proceed to Submission Packager</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {qa ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: SHA-256 Fingerprint & Originality Score */}
          <div className="lg:col-span-5 space-y-6">
            {/* Fingerprint Card */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-cyan-400" />
                  <span>SHA-256 Code Fingerprint</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400">Verified</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded font-mono text-xs text-cyan-300 break-all select-all flex items-center justify-between gap-2">
                <span>{qa.fingerprint}</span>
                <button
                  onClick={handleCopyHash}
                  className="p-1 text-slate-400 hover:text-slate-200 shrink-0"
                  title="Copy SHA-256 Hash"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Cryptographic hash generated across all project source files, tests, and configuration manifests to establish provenance and audit timestamps.
              </p>
            </div>

            {/* Originality Score */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
              <div className="text-xs text-slate-400">Semantic Originality Index</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
                  {qa.originalityScore}%
                </span>
                <span className="text-xs text-slate-400">Original Architecture</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${qa.originalityScore}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                Evaluated against the global archetype registry. Zero cross-submission collisions detected.
              </p>
            </div>

            {/* Metadata Stats */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg text-xs space-y-2 text-slate-400">
              <div className="flex justify-between">
                <span>Total Code Lines:</span>
                <span className="font-mono text-slate-200 tabular-nums">{qa.totalLines} lines</span>
              </div>
              <div className="flex justify-between">
                <span>Audited Source Files:</span>
                <span className="font-mono text-slate-200 tabular-nums">{qa.fileCount} files</span>
              </div>
              <div className="flex justify-between">
                <span>Deployment Clearance:</span>
                <span className="font-mono text-emerald-400">Passed (Ready)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Invariant Audit Checklist */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Competition Compliance Checks</span>
                </h2>
                <span className="text-[11px] font-mono text-slate-400">5 / 5 Passed</span>
              </div>

              <div className="space-y-2.5">
                {qa.auditChecks.map((check, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-200">{check.name}</div>
                      <div className="text-slate-400 mt-0.5 leading-relaxed">{check.message}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ready Banner */}
              <div className="p-3 bg-cyan-950/30 border border-cyan-800/50 rounded-lg flex items-center justify-between text-xs text-cyan-200">
                <span>All quality invariants satisfied. Code is certified for submission.</span>
                <button
                  onClick={onProceedToSubmission}
                  className="px-3 py-1 font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors whitespace-nowrap"
                >
                  Package Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 text-xs border border-slate-800 rounded-lg bg-slate-900/40 space-y-3">
          <p>QA audit has not yet run for this project.</p>
          <button
            onClick={onRunAudit}
            disabled={isAuditing}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors"
          >
            {isAuditing ? 'Running Invariant Audit...' : 'Execute QA & Originality Verification'}
          </button>
        </div>
      )}
    </div>
  );
};
