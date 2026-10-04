import React, { useState } from 'react';
import { TargetEvent } from '../types/radar';
import { Search, ExternalLink, ArrowRight, Zap, Filter, ArrowUpDown } from 'lucide-react';

interface RadarFeedViewProps {
  targets: TargetEvent[];
  onSelectTarget: (target: TargetEvent, nextTab?: 'studio' | 'pipeline' | 'submission') => void;
  onOpenIngest: () => void;
}

export const RadarFeedView: React.FC<RadarFeedViewProps> = ({
  targets,
  onSelectTarget,
  onOpenIngest,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'prize' | 'deadline' | 'default'>('default');

  const filteredTargets = targets
    .filter((t) => {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.platform.toLowerCase().includes(q) ||
        t.theme.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'prize') return b.prizeAmountUsd - a.prizeAmountUsd;
      if (sortBy === 'deadline') return a.deadline.localeCompare(b.deadline);
      return 0;
    });

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'packaged':
        return 'Submission Ready';
      case 'deployed':
        return 'Deployed';
      case 'qa_passed':
        return 'QA Passed';
      case 'generated':
        return 'Code Generated';
      case 'planned':
        return 'Plan Ready';
      case 'interpreted':
        return 'Spec Interpreted';
      default:
        return 'Detected';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Global Ingestion Mesh &amp; Target Radar
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Continuous surveillance of 100+ global bug bounty platforms, Google VRP feeds, and premier hackathon ecosystems.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search targets or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-md p-1">
            <button
              onClick={() => setSortBy('default')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                sortBy === 'default' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Default
            </button>
            <button
              onClick={() => setSortBy('prize')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                sortBy === 'prize' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Highest Prize
            </button>
            <button
              onClick={() => setSortBy('deadline')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                sortBy === 'deadline' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Deadline
            </button>
          </div>
        </div>
      </div>

      {/* Target Table Grid */}
      <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-medium">
                <th className="py-3 px-4">Challenge / Program</th>
                <th className="py-3 px-4">Platform &amp; Track</th>
                <th className="py-3 px-4 text-right">Prize Pool</th>
                <th className="py-3 px-4 text-right">Deadline</th>
                <th className="py-3 px-4 text-center">Pipeline State</th>
                <th className="py-3 px-4 text-right">Autonomous Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTargets.map((target) => (
                <tr
                  key={target.id}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => onSelectTarget(target, 'studio')}
                >
                  {/* Title & Theme */}
                  <td className="py-3.5 px-4 max-w-sm">
                    <div className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                      {target.isGoogleTarget && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" title="Google Target" />
                      )}
                      <span className="truncate">{target.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {target.theme}
                    </div>
                  </td>

                  {/* Platform & Metadata (Unboxed) */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="text-slate-200 font-medium">{target.platform}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      <span>{target.category.replace('_', ' ')}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span className={target.status === 'closing_soon' ? 'text-amber-400' : 'text-slate-400'}>
                        {target.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>

                  {/* Prize */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono tabular-nums font-semibold text-slate-200">
                    {target.prizePool}
                  </td>

                  {/* Deadline */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono tabular-nums text-slate-400">
                    {target.deadline}
                  </td>

                  {/* Stage */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="text-[11px] font-mono text-cyan-400">
                      {getStageLabel(target.stage)}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectTarget(target, 'studio')}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors inline-flex items-center gap-1"
                        title="Open in Challenge Studio"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>

                      <button
                        onClick={() => onSelectTarget(target, 'pipeline')}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors inline-flex items-center gap-1 font-semibold"
                        title="Launch Code Generator Pipeline"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Build</span>
                      </button>

                      <a
                        href={target.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                        title="View Official Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTargets.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs">
            No targets match your filter criteria. Try adjusting your search query or ingest a new URL.
          </div>
        )}
      </div>

      {/* Quick Summary Strip */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          <span className="font-semibold text-slate-200">Continuous Ingestion Mesh: </span>
          <span>Tracking 10 platform categories with automated RSS &amp; HTTP diff-monitoring.</span>
        </div>
        <button
          onClick={onOpenIngest}
          className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 whitespace-nowrap"
        >
          <span>Ingest Custom Target or Raw Brief</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
