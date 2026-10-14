import React, { useState, useEffect } from 'react';
import {
  Search,
  Zap,
  ShieldCheck,
  Package,
  Radio,
  Sliders,
  Network,
  Github,
  Volume2,
  VolumeX,
  X,
  ArrowRight,
  Terminal,
  Code2,
  Download,
  BrainCircuit,
  Award,
  Compass,
  Target,
} from 'lucide-react';
import { NavTab } from './TopNav';
import { playTactileClick } from '../utils/audio';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
  onTriggerAction: (actionId: string) => void;
  isAudioOn: boolean;
  onToggleAudio: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onTriggerAction,
  isAudioOn,
  onToggleAudio,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = [
    { id: 'tab-radar', label: 'Go to Global Ingestion Radar', category: 'Navigation', icon: Radio, action: () => onNavigate('radar') },
    { id: 'tab-studio', label: 'Go to Challenge Studio (Spec Interpreter)', category: 'Navigation', icon: Code2, action: () => onNavigate('studio') },
    { id: 'tab-pipeline', label: 'Go to Code Pipeline & IDE Studio', category: 'Navigation', icon: Terminal, action: () => onNavigate('pipeline') },
    { id: 'tab-qa', label: 'Go to QA & SHA-256 Fingerprint Verification', category: 'Navigation', icon: ShieldCheck, action: () => onNavigate('qa') },
    { id: 'tab-submission', label: 'Go to Submission Packager & Pitch Studio', category: 'Navigation', icon: Package, action: () => onNavigate('submission') },
    { id: 'tab-graph', label: 'Go to Sovereign Knowledge Matrix', category: 'Navigation', icon: Network, action: () => onNavigate('graph') },
    { id: 'tab-policy', label: 'Go to Policy & Governance Engine', category: 'Navigation', icon: Sliders, action: () => onNavigate('policy') },
    { id: 'tab-strategy', label: 'Go to Strategy Engine (Target Scoring & Optimal Build Strategies)', category: 'Navigation', icon: Compass, action: () => onNavigate('strategy') },
    { id: 'tab-meta', label: 'Go to Meta-Learning Feedback Service (Prompt & Archetype Auto-Refiner)', category: 'Navigation', icon: BrainCircuit, action: () => onNavigate('meta_learning') },

    { id: 'act-strategy-analyze', label: 'Analyze High-Value Targets & Recommend Optimal Build Strategies', category: 'Actions', icon: Target, action: () => onNavigate('strategy') },
    { id: 'act-meta-optimize', label: 'Run Meta-Learning Autonomous Optimization Cycle', category: 'Actions', icon: BrainCircuit, action: () => onNavigate('meta_learning') },
    { id: 'act-meta-record', label: 'Record New Project Outcome & Judge Feedback', category: 'Actions', icon: Award, action: () => onNavigate('meta_learning') },
    { id: 'act-simulate', label: 'Trigger Real-Time Live Radar Feed Scan', category: 'Actions', icon: Zap, action: () => onTriggerAction('simulate') },
    { id: 'act-ingest', label: 'Ingest Custom URL / Raw Challenge Brief', category: 'Actions', icon: Search, action: () => onTriggerAction('ingest') },
    { id: 'act-build', label: 'Synthesize Autonomous Codebase with Gemini 3.8', category: 'Actions', icon: Terminal, action: () => onTriggerAction('build') },
    { id: 'act-qa', label: 'Re-run QA Invariants & Code Fingerprint', category: 'Actions', icon: ShieldCheck, action: () => onTriggerAction('qa') },
    { id: 'act-zip', label: 'Download Complete Deployable ZIP Pack (.zip)', category: 'Actions', icon: Download, action: () => onTriggerAction('zip') },
    { id: 'act-github', label: 'Open GitHub OAuth & Deployment Modal', category: 'Actions', icon: Github, action: () => onTriggerAction('github') },
    { id: 'act-github-creds', label: 'Change GitHub Client ID & Client Secret', category: 'Actions', icon: Github, action: () => onTriggerAction('github') },
    { id: 'act-sound', label: isAudioOn ? 'Mute Procedural Sound FX' : 'Enable Procedural Sound FX', category: 'Preferences', icon: isAudioOn ? VolumeX : Volume2, action: onToggleAudio },
  ];

  const filtered = commands.filter((cmd) => {
    const q = (query || '').toLowerCase();
    const label = (cmd.label || '').toLowerCase();
    const category = (cmd.category || '').toLowerCase();
    return label.includes(q) || category.includes(q);
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          playTactileClick();
          filtered[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden text-xs text-slate-200">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-3 bg-slate-950/90">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search actions... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-xs"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 border border-slate-700 rounded text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-0.5">
          {filtered.length > 0 ? (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    playTactileClick();
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="font-medium text-slate-200">{cmd.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {cmd.category}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-slate-500 italic">
              No matching commands found.
            </div>
          )}
        </div>

        {/* Command Palette Footer */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/60 text-[10px] text-slate-500 flex items-center justify-between font-mono">
          <span>Navigate with ↑ ↓ and Press ENTER</span>
          <span>Sentinel Sovereign Console</span>
        </div>
      </div>
    </div>
  );
};
