import React, { useState } from 'react';
import { TargetEvent, ChallengeSpec } from '../types/radar';
import { Sparkles, ArrowRight, ShieldAlert, CheckCircle, RefreshCw, Layers, FileCode2 } from 'lucide-react';

interface ChallengeStudioViewProps {
  activeTarget: TargetEvent;
  onUpdateSpec: (spec: ChallengeSpec) => void;
  onProceedToPipeline: (archetype: string, directives: string) => void;
}

export const ChallengeStudioView: React.FC<ChallengeStudioViewProps> = ({
  activeTarget,
  onUpdateSpec,
  onProceedToPipeline,
}) => {
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<string>(
    activeTarget.spec?.suggestedArchetype || 'multi_agent_orchestrator'
  );
  const [customDirectives, setCustomDirectives] = useState(
    'Production-grade TypeScript, robust tests, zero placeholder mocks, and sub-second Gemini 3.8 Flash execution.'
  );

  const archetypes = [
    {
      id: 'multi_agent_orchestrator',
      name: 'Autonomous Multi-Agent Toolkit',
      stack: 'TypeScript · Node.js · @google/genai · Express',
      desc: 'Orchestrates multi-turn planning, execution, and deterministic consensus loops with streaming telemetry.',
    },
    {
      id: 'ai_fullstack_app',
      name: 'AI Studio Full-Stack Web App',
      stack: 'React · Tailwind · Node.js · Gemini 3.8 Flash',
      desc: 'Complete responsive client and server with real-time multimodal intelligence workflows.',
    },
    {
      id: 'security_vrp_poc',
      name: 'VRP Security PoC & Report Engine',
      stack: 'TypeScript · Python · HTTP Testbed · Markdown Generator',
      desc: 'Differential boundary fuzzer, prompt injection exploit generator, and CVSS vulnerability writeup.',
    },
    {
      id: 'data_pipeline',
      name: 'High-Throughput Normalizer Pipeline',
      stack: 'Node.js · Streaming Workers · Schema Enforcement',
      desc: 'Real-time multi-source data synthesis with cryptographic verification and zero-latency caching.',
    },
  ];

  const handleRunInterpreter = async () => {
    setIsInterpreting(true);
    try {
      const res = await fetch('/api/radar/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: activeTarget.theme + '\n' + (activeTarget.rawText || ''),
          titleHint: activeTarget.title,
          sourceUrl: activeTarget.sourceUrl,
        }),
      });
      const data = await res.json();
      if (data.spec) {
        onUpdateSpec(data.spec);
        if (data.spec.suggestedArchetype) {
          setSelectedArchetype(data.spec.suggestedArchetype);
        }
      }
    } catch (err) {
      console.error('Interpreter error:', err);
    } finally {
      setIsInterpreting(false);
    }
  };

  const spec = activeTarget.spec;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="text-xs text-slate-400">
            <span>{activeTarget.platform}</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span className="text-cyan-400 font-mono tabular-nums">{activeTarget.prizePool}</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Deadline: {activeTarget.deadline}</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1">
            {activeTarget.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunInterpreter}
            disabled={isInterpreting}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-md transition-colors inline-flex items-center gap-1.5 border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isInterpreting ? 'animate-spin' : ''}`} />
            <span>{isInterpreting ? 'Interpreting...' : 'Re-Interpret with Gemini'}</span>
          </button>

          <button
            onClick={() => onProceedToPipeline(selectedArchetype, customDirectives)}
            className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors inline-flex items-center gap-1.5"
          >
            <span>Proceed to Code Generator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Spec on Left, Strategy/Archetype on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Structured Challenge Spec */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Interpreted Competition Specification</span>
              </h2>
              <span className="text-[11px] font-mono text-emerald-400">Schema Validated</span>
            </div>

            {spec ? (
              <div className="space-y-4 text-xs">
                {/* Summary & Theme */}
                <div>
                  <div className="text-slate-400 font-medium mb-1">Core Theme &amp; Objective</div>
                  <div className="text-slate-200 bg-slate-950/70 p-3 rounded border border-slate-800/80 leading-relaxed">
                    {spec.theme}
                  </div>
                </div>

                {/* Novelty Angle */}
                {spec.noveltyAngle && (
                  <div>
                    <div className="text-amber-400 font-medium mb-1">Strategic Novelty Recommendation</div>
                    <div className="text-slate-200 bg-amber-950/20 p-3 rounded border border-amber-900/40 leading-relaxed">
                      {spec.noveltyAngle}
                    </div>
                  </div>
                )}

                {/* Allowed Tech & Deliverables */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-400 font-medium mb-1.5">Approved Technologies</div>
                    <ul className="space-y-1 bg-slate-950/50 p-2.5 rounded border border-slate-800/80">
                      {spec.allowedTech.map((tech, i) => (
                        <li key={i} className="text-slate-300 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-cyan-400" />
                          <span className="truncate">{tech}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="text-slate-400 font-medium mb-1.5">Required Deliverables</div>
                    <ul className="space-y-1 bg-slate-950/50 p-2.5 rounded border border-slate-800/80">
                      {spec.requiredDeliverables.map((del, i) => (
                        <li key={i} className="text-slate-300 flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Judging Criteria */}
                <div>
                  <div className="text-slate-400 font-medium mb-1.5">Official Judging Criteria</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {spec.judgingCriteria.map((crit, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-slate-950/50 border border-slate-800/80 rounded text-slate-200 leading-snug"
                      >
                        <span className="font-mono text-cyan-400 mr-1.5">{i + 1}.</span>
                        <span>{crit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Constraints */}
                <div>
                  <div className="text-slate-400 font-medium mb-1.5">Strict Constraints &amp; Rules</div>
                  <div className="p-2.5 bg-slate-950/50 border border-slate-800/80 rounded space-y-1">
                    {spec.constraints.map((con, i) => (
                      <div key={i} className="text-slate-400 flex items-start gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{con}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs space-y-3">
                <p>This challenge has not yet been parsed by the Challenge Interpreter.</p>
                <button
                  onClick={handleRunInterpreter}
                  disabled={isInterpreting}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors"
                >
                  {isInterpreting ? 'Extracting Spec...' : 'Extract Spec with Gemini 3.8 Flash'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Archetype Selection & Strategy Directives */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Select Project Archetype</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Choose a pre-engineered architectural foundation aligned with this challenge track.
              </p>
            </div>

            <div className="space-y-2.5">
              {archetypes.map((arch) => {
                const isSelected = selectedArchetype === arch.id;
                return (
                  <div
                    key={arch.id}
                    onClick={() => setSelectedArchetype(arch.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500/70 shadow-sm'
                        : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-200">
                      <span>{arch.name}</span>
                      {isSelected && <span className="text-[11px] text-cyan-400 font-mono">SELECTED</span>}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">{arch.stack}</div>
                    <div className="text-slate-400 mt-1.5 leading-relaxed">{arch.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Custom Engineering Directives */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Custom Engineering Directives
              </label>
              <textarea
                value={customDirectives}
                onChange={(e) => setCustomDirectives(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                placeholder="Specific instructions for the code generator..."
              />
            </div>

            {/* Launch Button */}
            <button
              onClick={() => onProceedToPipeline(selectedArchetype, customDirectives)}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors flex items-center justify-center gap-2 shadow-sm shadow-cyan-900/20"
            >
              <FileCode2 className="w-4 h-4" />
              <span>Generate Full Production Codebase</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
