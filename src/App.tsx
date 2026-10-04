import React, { useState, useEffect } from 'react';
import { TargetEvent, ChallengeSpec, PolicyRuleConfig, GeneratedProject, GitHubUser, GitHubRepo, GitHubPushResult } from './types/radar';
import { INITIAL_TARGETS, INITIAL_POLICY } from './data/mockFeed';
import { TopNav, NavTab } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { RadarFeedView } from './components/RadarFeedView';
import { ChallengeStudioView } from './components/ChallengeStudioView';
import { CodePipelineView } from './components/CodePipelineView';
import { QAView } from './components/QAView';
import { SubmissionPackagerView } from './components/SubmissionPackagerView';
import { KnowledgeGraphView } from './components/KnowledgeGraphView';
import { PolicyEngineView } from './components/PolicyEngineView';
import { IngestModal } from './components/IngestModal';
import { GitHubAuthModal } from './components/GitHubAuthModal';
import { Radio, X, Sparkles } from 'lucide-react';

export default function App() {
  const [targets, setTargets] = useState<TargetEvent[]>(INITIAL_TARGETS);
  const [activeTargetId, setActiveTargetId] = useState<string>('target-google-ai-sprint-02');
  const [activeTab, setActiveTab] = useState<NavTab>('radar');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showGoogleOnly, setShowGoogleOnly] = useState<boolean>(false);
  const [policy, setPolicy] = useState<PolicyRuleConfig>(INITIAL_POLICY);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState<boolean>(false);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [isPackaging, setIsPackaging] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHasApiKey(!!data.hasApiKey))
      .catch(() => setHasApiKey(false));

    // Restore GitHub token from localStorage if present
    const savedToken = localStorage.getItem('sentinel_github_token');
    if (savedToken) {
      setGithubToken(savedToken);
      fetch('/api/github/user', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          if (data.user) setGithubUser(data.user);
        })
        .catch(() => {
          localStorage.removeItem('sentinel_github_token');
          setGithubToken(null);
        });
    }
  }, []);

  const activeTarget = targets.find((t) => t.id === activeTargetId) || targets[0];

  const handleSelectTarget = (target: TargetEvent, nextTab?: NavTab) => {
    setActiveTargetId(target.id);
    if (nextTab) {
      setActiveTab(nextTab);
    }
  };

  const handleUpdateSpec = (spec: ChallengeSpec) => {
    setTargets((prev) =>
      prev.map((t) =>
        t.id === activeTarget.id
          ? { ...t, spec, stage: t.stage === 'detected' ? 'interpreted' : t.stage }
          : t
      )
    );
  };

  const handleGitHubConnectSuccess = (token: string, user: GitHubUser) => {
    setGithubToken(token);
    setGithubUser(user);
    localStorage.setItem('sentinel_github_token', token);
    setNotification({
      title: 'GitHub Authenticated',
      message: `Successfully connected as @${user.login}. One-click repository deployment is now active.`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleGitHubDisconnect = () => {
    setGithubToken(null);
    setGithubUser(null);
    localStorage.removeItem('sentinel_github_token');
    setNotification({
      title: 'GitHub Disconnected',
      message: 'GitHub credentials removed from local session.',
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRepoPushed = (repo: GitHubRepo, pushResult: GitHubPushResult) => {
    setTargets((prev) =>
      prev.map((t) =>
        t.id === activeTarget.id
          ? {
              ...t,
              githubRepo: repo,
              githubPushResult: pushResult,
              stage: 'deployed',
              submissionBundle: t.submissionBundle
                ? { ...t.submissionBundle, repoUrl: pushResult.repoUrl }
                : undefined,
            }
          : t
      )
    );

    setNotification({
      title: 'Repository Pushed to GitHub',
      message: `Created ${repo.full_name} and committed ${pushResult.filesCount} project files.`,
    });
    setTimeout(() => setNotification(null), 6000);
  };

  const handleProceedToPipeline = async (archetype: string, customDirectives: string) => {
    setIsGenerating(true);
    setActiveTab('pipeline');

    try {
      const res = await fetch('/api/radar/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spec: activeTarget.spec || {
            title: activeTarget.title,
            platform: activeTarget.platform,
            theme: activeTarget.theme,
            suggestedArchetype: archetype,
          },
          archetype,
          customDirectives,
        }),
      });

      const data = await res.json();
      const project: GeneratedProject = {
        ...data.project,
        archetype,
        generatedAt: new Date().toISOString(),
      };

      setTargets((prev) =>
        prev.map((t) =>
          t.id === activeTarget.id
            ? { ...t, project, stage: 'generated' }
            : t
        )
      );
    } catch (err) {
      console.error('Code generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunQA = async () => {
    if (!activeTarget.project?.files) return;
    setIsAuditing(true);
    setActiveTab('qa');

    try {
      const res = await fetch('/api/radar/qa-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: activeTarget.project.files,
          specTitle: activeTarget.title,
        }),
      });

      const data = await res.json();
      setTargets((prev) =>
        prev.map((t) =>
          t.id === activeTarget.id
            ? {
                ...t,
                qaResult: {
                  ...data,
                  auditedAt: new Date().toISOString(),
                },
                stage: 'qa_passed',
              }
            : t
        )
      );
    } catch (err) {
      console.error('QA audit error:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleGenerateBundle = async () => {
    if (!activeTarget.project) return;
    setIsPackaging(true);
    setActiveTab('submission');

    try {
      const res = await fetch('/api/radar/package-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spec: activeTarget.spec || {
            title: activeTarget.title,
            platform: activeTarget.platform,
            theme: activeTarget.theme,
            judgingCriteria: ['Innovation', 'Technical Depth', 'Polish'],
          },
          project: activeTarget.project,
        }),
      });

      const data = await res.json();
      setTargets((prev) =>
        prev.map((t) =>
          t.id === activeTarget.id
            ? {
                ...t,
                submissionBundle: {
                  ...data.bundle,
                  repoUrl: t.githubRepo?.html_url || t.submissionBundle?.repoUrl,
                },
                stage: 'packaged',
              }
            : t
        )
      );
    } catch (err) {
      console.error('Packaging error:', err);
    } finally {
      setIsPackaging(false);
    }
  };

  const handleSimulateDetection = () => {
    const newSimulated: TargetEvent = {
      id: `simulated-${Date.now()}`,
      title: 'Google Bug Hunters: Gemini Spark AI Security Bounty',
      platform: 'Google Bug Hunters / VRP',
      sourceUrl: 'https://bughunters.google.com/about/rules',
      category: 'vrp_security',
      theme: 'High-severity prompt leakage and model parameter inference vulnerabilities in Gemini Spark endpoints',
      prizePool: '$31,337 Max Payout',
      prizeAmountUsd: 31337,
      deadline: '2026-12-15',
      status: 'live',
      isGoogleTarget: true,
      stage: 'detected',
      spec: {
        title: 'Google Bug Hunters: Gemini Spark AI Security Bounty',
        platform: 'Google Bug Hunters / VRP',
        category: 'vrp_security',
        theme: 'Sub-second fuzzing of multi-modal system prompt isolation barriers in Gemini Spark microservices',
        prizePool: '$31,337 Max Payout',
        deadline: '2026-12-15',
        allowedTech: ['TypeScript', 'Python', 'Google GenAI SDK', 'Differential Fuzzers'],
        requiredDeliverables: ['Deterministic PoC Script', 'Root Cause Analysis', 'Remediation Guidelines'],
        judgingCriteria: ['Impact Severity', 'Reproducibility', 'Zero False Positives'],
        constraints: ['Strict adherence to Google VRP Scope', 'No production denial-of-service'],
        submissionFormat: {
          needsRepoUrl: true,
          needsDemoUrl: false,
          needsDescriptionText: true,
          needsVideo: true,
          needsPoc: true,
        },
        suggestedArchetype: 'security_vrp_poc',
        summary: 'Emergency high-bounty challenge targeting adversarial multi-modal injection flaws in Gemini Spark.',
        noveltyAngle: 'Automated differential state fuzzer that detects semantic prompt leakages in 2 turns.',
      },
    };

    setTargets((prev) => [newSimulated, ...prev]);
    setActiveTargetId(newSimulated.id);
    setActiveTab('studio');
    setNotification({
      title: 'New High-Priority Challenge Ingested',
      message: 'Gemini Spark AI Security Bounty detected on Google Bug Hunters VRP feed ($31,337).',
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleTargetIngested = (newTarget: TargetEvent) => {
    setTargets((prev) => [newTarget, ...prev]);
    setActiveTargetId(newTarget.id);
    setActiveTab('studio');
    setNotification({
      title: 'Target Successfully Ingested',
      message: `Spec parsed for "${newTarget.title}" via Gemini 3.8 Flash.`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  // Filter targets for display
  const displayedTargets = targets.filter((t) => {
    if (showGoogleOnly && !t.isGoogleTarget) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    return true;
  });

  const totalPrizePoolUsd = targets.reduce((sum, t) => sum + (t.prizeAmountUsd || 0), 0);
  const inPipelineCount = targets.filter((t) => t.stage !== 'detected').length;
  const completedPackagesCount = targets.filter((t) => t.stage === 'packaged').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenIngest={() => setIsIngestModalOpen(true)}
        onSimulateEvent={handleSimulateDetection}
        hasApiKey={hasApiKey}
        activeTargetTitle={activeTarget?.title}
        githubUser={githubUser}
        onOpenGitHubAuth={() => setIsGitHubModalOpen(true)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          showGoogleOnly={showGoogleOnly}
          setShowGoogleOnly={setShowGoogleOnly}
          totalTargetsCount={targets.length}
          totalPrizePoolUsd={totalPrizePoolUsd}
          inPipelineCount={inPipelineCount}
          completedPackagesCount={completedPackagesCount}
          hasApiKey={hasApiKey}
        />

        {/* Center Main Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950/80">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'radar' && (
              <RadarFeedView
                targets={displayedTargets}
                onSelectTarget={(t, tab) => handleSelectTarget(t, tab)}
                onOpenIngest={() => setIsIngestModalOpen(true)}
              />
            )}

            {activeTab === 'studio' && (
              <ChallengeStudioView
                activeTarget={activeTarget}
                onUpdateSpec={handleUpdateSpec}
                onProceedToPipeline={handleProceedToPipeline}
              />
            )}

            {activeTab === 'pipeline' && (
              <CodePipelineView
                activeTarget={activeTarget}
                onRunQA={handleRunQA}
                onRegenerate={() =>
                  handleProceedToPipeline(
                    activeTarget.project?.archetype || 'multi_agent_orchestrator',
                    'Re-synthesize with enhanced unit test coverage and clean TypeScript'
                  )
                }
                isGenerating={isGenerating}
                githubUser={githubUser}
                githubToken={githubToken}
                onOpenGitHubAuth={() => setIsGitHubModalOpen(true)}
                onRepoPushed={handleRepoPushed}
              />
            )}

            {activeTab === 'qa' && (
              <QAView
                activeTarget={activeTarget}
                onProceedToSubmission={() => setActiveTab('submission')}
                onRunAudit={handleRunQA}
                isAuditing={isAuditing}
              />
            )}

            {activeTab === 'submission' && (
              <SubmissionPackagerView
                activeTarget={activeTarget}
                onGenerateBundle={handleGenerateBundle}
                isPackaging={isPackaging}
              />
            )}

            {activeTab === 'graph' && (
              <KnowledgeGraphView
                targets={targets}
                onSelectTarget={(t) => handleSelectTarget(t, 'studio')}
              />
            )}

            {activeTab === 'policy' && (
              <PolicyEngineView
                policy={policy}
                onUpdatePolicy={(newPolicy) => setPolicy(newPolicy)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Real-time Notification Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 border border-cyan-500/50 rounded-lg shadow-xl text-xs flex items-start gap-3 max-w-md animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-white">{notification.title}</div>
            <div className="text-slate-400 mt-0.5">{notification.message}</div>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Ingest Modal */}
      <IngestModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onTargetIngested={handleTargetIngested}
      />

      {/* GitHub Authentication & Management Modal */}
      <GitHubAuthModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        githubUser={githubUser}
        onConnectSuccess={handleGitHubConnectSuccess}
        onDisconnect={handleGitHubDisconnect}
      />
    </div>
  );
}
