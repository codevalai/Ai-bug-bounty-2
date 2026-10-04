import React, { useState } from 'react';
import { TargetEvent, TargetCategory } from '../types/radar';
import { X, Sparkles, Globe, Link2, FileText } from 'lucide-react';

interface IngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTargetIngested: (target: TargetEvent) => void;
}

export const IngestModal: React.FC<IngestModalProps> = ({ isOpen, onClose, onTargetIngested }) => {
  const [sourceUrl, setSourceUrl] = useState('');
  const [titleHint, setTitleHint] = useState('');
  const [platform, setPlatform] = useState('Google AI Studio');
  const [category, setCategory] = useState<TargetCategory>('ai');
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/radar/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceUrl,
          titleHint,
          rawText,
        }),
      });

      const data = await res.json();
      const spec = data.spec;

      const newTarget: TargetEvent = {
        id: `custom-target-${Date.now()}`,
        title: spec?.title || titleHint || 'Custom AI Challenge',
        platform: spec?.platform || platform,
        sourceUrl: sourceUrl || 'https://bughunters.google.com',
        category: (spec?.category as TargetCategory) || category,
        theme: spec?.theme || rawText.slice(0, 120),
        prizePool: spec?.prizePool || '$50,000 USD',
        prizeAmountUsd: 50000,
        deadline: spec?.deadline || '2026-12-01',
        status: 'live',
        isGoogleTarget: (platform + titleHint).toLowerCase().includes('google'),
        stage: 'interpreted',
        spec: spec || undefined,
        rawText,
      };

      onTargetIngested(newTarget);
      onClose();
    } catch (err) {
      console.error('Ingest error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Ingest Custom Target or Raw Brief</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Challenge / Bounty URL (Optional)
            </label>
            <div className="relative">
              <Link2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://devpost.com/hackathons/... or https://bughunters.google.com/..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Challenge Title (or Hint)
              </label>
              <input
                type="text"
                value={titleHint}
                onChange={(e) => setTitleHint(e.target.value)}
                placeholder="e.g. Gemini Spark AI Bug Bounty 2026"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Platform Ecosystem
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Google AI Studio">Google AI Studio</option>
                <option value="Google Bug Hunters / VRP">Google Bug Hunters / VRP</option>
                <option value="Devpost">Devpost</option>
                <option value="Immunefi">Immunefi</option>
                <option value="ETHGlobal">ETHGlobal</option>
                <option value="HackerOne">HackerOne</option>
                <option value="Bugcrowd">Bugcrowd</option>
                <option value="Major League Hacking (MLH)">MLH</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Raw Announcement Text, Rules, or Scope
            </label>
            <textarea
              rows={5}
              required
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw announcement copy, judging criteria, or VRP scope rules here. Gemini will parse and structure the competition specification..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed font-mono text-[11px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-md transition-colors inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Interpreting with Gemini...' : 'Ingest & Interpret Target'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
