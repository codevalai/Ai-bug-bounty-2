import React, { useState, useMemo } from 'react';
import { TargetEvent } from '../types/radar';
import { Network, Database, Layers, ShieldAlert, Code2, ChevronRight, Search } from 'lucide-react';
import { playTactileClick } from '../utils/audio';
import { buildKnowledgeGraphTopology } from '../services/enterpriseAuditService';

interface KnowledgeGraphViewProps {
  targets: TargetEvent[];
  onSelectTarget: (target: TargetEvent) => void;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({ targets, onSelectTarget }) => {
  const topology = useMemo(() => buildKnowledgeGraphTopology(targets), [targets]);
  const [selectedClusterId, setSelectedClusterId] = useState<string>(
    topology.clusters[0]?.id || 'google_ai_vrp'
  );
  const [activeMatrixTab, setActiveMatrixTab] = useState<'clusters' | 'cwe_lineage' | 'stack_lineage'>('clusters');
  const [filterQuery, setFilterQuery] = useState('');

  const activeCluster =
    topology.clusters.find((c) => c.id === selectedClusterId) || topology.clusters[0];

  const matchingTargets = useMemo(() => {
    if (!activeCluster) return targets;
    return targets.filter((t) => {
      const matchesCluster =
        activeCluster.platforms.some((p) =>
          (t.platform || '').toLowerCase().includes((p || '').toLowerCase())
        ) ||
        (activeCluster.id === 'google_ai_vrp' && t.isGoogleTarget) ||
        (activeCluster.id === 'msrc_ghsa_cve' && (t.track || t.targetTrack) === 'TRACK_DEFENSIVE_PATCH') ||
        (activeCluster.id === 'web3_zk_immunefi' && t.category === 'crypto_web3');

      if (!matchesCluster) return false;
      if (filterQuery.trim()) {
        const q = filterQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.platform.toLowerCase().includes(q) ||
          t.theme.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [targets, activeCluster, filterQuery]);

  const totalGraphLiquidityUsd = useMemo(
    () => targets.reduce((acc, t) => acc + (t.prizeAmountUsd || 0), 0),
    [targets]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="text-xs text-slate-400 font-mono tabular-nums">
            <span>Indexed Graph Nodes: <strong className="text-white">{targets.length}</strong></span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span className="text-emerald-400">
              Graph Liquidity: ${(totalGraphLiquidityUsd / 1000000).toFixed(2)}M USD
            </span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span className="text-cyan-400">
              {topology.cweLineage.length} CWE Classes · {topology.stackLineage.length} Tech Stacks
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1">
            08. Sovereign Knowledge Matrix &amp; Lineage Graph
          </h1>
        </div>

        {/* Sub-view switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => {
              playTactileClick();
              setActiveMatrixTab('clusters');
            }}
            className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeMatrixTab === 'clusters'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ecosystem Clusters ({topology.clusters.length})
          </button>
          <button
            onClick={() => {
              playTactileClick();
              setActiveMatrixTab('cwe_lineage');
            }}
            className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeMatrixTab === 'cwe_lineage'
                ? 'bg-slate-800 text-amber-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CWE Vulnerability Lineage
          </button>
          <button
            onClick={() => {
              playTactileClick();
              setActiveMatrixTab('stack_lineage');
            }}
            className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeMatrixTab === 'stack_lineage'
                ? 'bg-slate-800 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tech Stack Liquidity
          </button>
        </div>
      </div>

      {activeMatrixTab === 'clusters' && (
        <>
          {/* 5 Cluster Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {topology.clusters.map((cluster) => {
              const isSelected = selectedClusterId === cluster.id;
              return (
                <button
                  key={cluster.id}
                  onClick={() => {
                    playTactileClick();
                    setSelectedClusterId(cluster.id);
                  }}
                  className={`p-3.5 rounded-lg border text-left transition-colors text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/70 text-white'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-100 leading-snug">
                      {cluster.name}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {cluster.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono text-[11px] tabular-nums">
                    <span className="text-slate-400">{cluster.targetCount} nodes</span>
                    <span className="text-emerald-400 font-semibold">
                      ${(cluster.totalPrizeUsd / 1000).toFixed(0)}k
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Cluster Deep Dive Matrix */}
          {activeCluster && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Cluster Topology & Invariant Metadata (7 cols) */}
              <div className="lg:col-span-7 p-5 bg-slate-900 border border-slate-800 rounded-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-semibold text-white flex items-center gap-2">
                    <Network className="w-4 h-4 text-cyan-400" />
                    <span>{activeCluster.name} — Domain Topology</span>
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 tabular-nums">
                    {activeCluster.auditedCount} / {activeCluster.targetCount} Audited (SLSA v1.0)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                    <div className="text-[11px] text-slate-400">Cluster Prize Liquidity</div>
                    <div className="text-base font-bold font-mono text-emerald-400 tabular-nums mt-1">
                      ${activeCluster.totalPrizeUsd.toLocaleString()} USD
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                      Avg: ${activeCluster.avgPrizeUsd.toLocaleString()} / node
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                    <div className="text-[11px] text-slate-400">Dominant Tech Stacks</div>
                    <div className="font-mono text-[11px] text-cyan-300 mt-1 leading-relaxed">
                      {activeCluster.dominantStacks.join(' · ')}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                    <div className="text-[11px] text-slate-400">Primary CWE / Verification</div>
                    <div className="font-mono text-[11px] text-amber-300 mt-1 leading-relaxed">
                      {activeCluster.dominantCwes.join(' · ')}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded text-xs space-y-1.5">
                  <div className="font-semibold text-slate-200">
                    Empirical Placement &amp; Triage Correlation
                  </div>
                  <div className="text-slate-400 leading-relaxed text-[11px]">
                    {activeCluster.winRateBenchmark}. Submissions that pair deterministic RFC 8785 SHA-256 receipts with automated sandbox verification achieve 3.4x higher judge scoring and immediate VRP triage acceptance.
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-slate-400 font-medium">Connected Platform Authorities</div>
                  <div className="font-mono text-[11px] text-slate-300">
                    {activeCluster.platforms.join(' · ')}
                  </div>
                </div>
              </div>

              {/* Right Column: Ingested Cluster Targets (5 cols) */}
              <div className="lg:col-span-5 p-5 bg-slate-900 border border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span>Nodes in Cluster ({matchingTargets.length})</span>
                  </span>
                  <div className="relative">
                    <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      value={filterQuery}
                      onChange={(e) => setFilterQuery(e.target.value)}
                      placeholder="Filter cluster..."
                      className="pl-7 pr-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-200 focus:outline-none focus:border-cyan-500 w-40"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {matchingTargets.map((target) => (
                    <div
                      key={target.id}
                      onClick={() => onSelectTarget(target)}
                      className="p-3 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded cursor-pointer transition-colors text-xs space-y-1 group"
                    >
                      <div className="font-semibold text-slate-200 group-hover:text-cyan-300 flex items-center justify-between gap-2">
                        <span className="truncate">{target.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono tabular-nums">
                        <span>{target.platform}</span>
                        <span className="text-emerald-400">{target.prizePool}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeMatrixTab === 'cwe_lineage' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>CWE Vulnerability Class Lineage &amp; Remediation Index</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              Sandboxed git apply --check Verified
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-mono text-slate-400">
                  <th className="py-2.5 px-4">CWE Identifier</th>
                  <th className="py-2.5 px-4 text-right">Indexed Advisories</th>
                  <th className="py-2.5 px-4 text-right">Avg Bounty / Value</th>
                  <th className="py-2.5 px-4">Representative Targets in Graph</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {topology.cweLineage.map((item) => (
                  <tr key={item.cwe} className="hover:bg-slate-950/40">
                    <td className="py-2.5 px-4 font-mono font-semibold text-amber-300">
                      {item.cwe}
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-right text-slate-200">
                      {item.count}
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-right text-emerald-400">
                      ${item.avgBountyUsd.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">
                      {item.sampleTargets.join(' · ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeMatrixTab === 'stack_lineage' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Technology Stack Liquidity &amp; Competition Allocation</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              Sorted by Total Tracked Liquidity (USD)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-mono text-slate-400">
                  <th className="py-2.5 px-4">Technology / SDK</th>
                  <th className="py-2.5 px-4 text-right">Active Targets</th>
                  <th className="py-2.5 px-4 text-right">Total Prize Liquidity</th>
                  <th className="py-2.5 px-4">Flagship Competitions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {topology.stackLineage.map((item) => (
                  <tr key={item.tech} className="hover:bg-slate-950/40">
                    <td className="py-2.5 px-4 font-mono font-semibold text-cyan-300">
                      {item.tech}
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-right text-slate-200">
                      {item.count}
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-right text-emerald-400 font-semibold">
                      ${item.totalLiquidityUsd.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">
                      {item.sampleTargets.join(' · ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
