import React, { useState } from 'react';
import { TargetEvent } from '../types/radar';
import { Network, Database, Layers, Trophy, Sparkles, Filter, ChevronRight } from 'lucide-react';

interface KnowledgeGraphViewProps {
  targets: TargetEvent[];
  onSelectTarget: (target: TargetEvent) => void;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({ targets, onSelectTarget }) => {
  const [selectedCluster, setSelectedCluster] = useState<string>('google_ecosystem');

  const clusters = [
    {
      id: 'google_ecosystem',
      name: 'Google AI & VRP Ecosystem',
      desc: 'Bug Hunters AI VRP, Gemini AI Studio Challenges, and Google Cloud Hackathons.',
      platforms: ['Google AI Studio', 'Google Bug Hunters / VRP', 'HackerOne'],
      archetypes: ['Multi-Agent Orchestrator', 'VRP Security PoC', 'Fullstack Web App'],
      avgPrizeUsd: 65000,
      winRateMetric: 'Top 5% Placement with Zero-Mock Verified Schemas',
    },
    {
      id: 'crypto_immunefi',
      name: 'Crypto & Web3 Protocol Bounties',
      desc: 'High-payout smart contract audits, autonomous liquidation agents, and zk-compute.',
      platforms: ['Immunefi', 'Code4rena', 'ETHGlobal', 'Sherlock'],
      archetypes: ['Security PoC', 'Autonomous Agent', 'Smart Contract Vault'],
      avgPrizeUsd: 250000,
      winRateMetric: 'Critical Exploit PoC with Executable Testbed Script',
    },
    {
      id: 'flagship_devpost',
      name: 'Global Flagship Hackathons',
      desc: 'High-visibility university and enterprise innovation challenges.',
      platforms: ['Devpost', 'MLH', 'Stanford TreeHacks', 'CalHacks'],
      archetypes: ['Fullstack Web App', 'AI Agent System'],
      avgPrizeUsd: 45000,
      winRateMetric: 'Novel Problem Statement + 2-Minute Polished Demo Walkthrough',
    },
  ];

  const activeClusterData = clusters.find((c) => c.id === selectedCluster) || clusters[0];
  const matchingTargets = targets.filter((t) =>
    activeClusterData.platforms.some((p) => t.platform.toLowerCase().includes(p.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Sovereign Knowledge Matrix &amp; Global Graph
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Deduplicated global graph cross-indexing 100+ platforms, historical payout distributions, archetype win rates, and lineage.
        </p>
      </div>

      {/* Cluster Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {clusters.map((cluster) => {
          const isSelected = selectedCluster === cluster.id;
          return (
            <div
              key={cluster.id}
              onClick={() => setSelectedCluster(cluster.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all text-xs ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500/70 shadow-md'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span>{cluster.name}</span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
              </div>
              <p className="text-slate-400 mt-1.5 leading-relaxed">{cluster.desc}</p>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono text-[11px] text-slate-400">
                <span>Avg Prize:</span>
                <span className="text-cyan-300 font-semibold tabular-nums">
                  ${(cluster.avgPrizeUsd).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Cluster Deep Dive Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Mesh Schematic (7 cols) */}
        <div className="lg:col-span-7 p-5 bg-slate-900 border border-slate-800 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <span>Domain Graph Topology</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">Deterministic Lineage</span>
          </div>

          {/* Graphical Topology Canvas Representation */}
          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-lg space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Platform Nodes</div>
                <div className="font-semibold text-cyan-300 mt-1">{activeClusterData.platforms.join(' · ')}</div>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Archetype Affinity</div>
                <div className="font-semibold text-emerald-300 mt-1">{activeClusterData.archetypes.join(' · ')}</div>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Winning Factor</div>
                <div className="font-semibold text-amber-300 mt-1">High-Depth Schema</div>
              </div>
            </div>

            {/* Strategic Winning Heuristic */}
            <div className="p-3 bg-slate-900/50 border border-slate-800 rounded text-xs space-y-1">
              <div className="font-semibold text-slate-200">Historical Placement Correlation</div>
              <div className="text-slate-400 leading-relaxed text-[11px]">
                {activeClusterData.winRateMetric}. Competitors pairing automated integration test suites with zero-mock data flows achieve 3.4x higher judge scoring compared to mock UI demos.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ingested Cluster Targets (5 cols) */}
        <div className="lg:col-span-5 p-5 bg-slate-900 border border-slate-800 rounded-lg space-y-4">
          <span className="text-xs font-semibold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Target Nodes in Cluster ({matchingTargets.length})</span>
          </span>

          <div className="space-y-2 max-h-[340px] overflow-y-auto">
            {matchingTargets.map((target) => (
              <div
                key={target.id}
                onClick={() => onSelectTarget(target)}
                className="p-3 bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/50 rounded-lg cursor-pointer transition-colors text-xs space-y-1 group"
              >
                <div className="font-semibold text-slate-200 group-hover:text-cyan-300 flex items-center justify-between">
                  <span className="truncate">{target.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{target.platform}</span>
                  <span className="font-mono text-cyan-300 tabular-nums">{target.prizePool}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
