import React, { useState, useEffect } from 'react';
import { TargetEvent, ChallengeSpec, PolicyRuleConfig, GeneratedProject, GeneratedFile, GitHubUser, GitHubRepo, GitHubPushResult } from './types/radar';
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
import { StrategyEngineView } from './components/StrategyEngineView';
import { MetaLearningView } from './components/MetaLearningView';
import { IngestModal } from './components/IngestModal';
import { GitHubAuthModal } from './components/GitHubAuthModal';
import { CommandPalette } from './components/CommandPalette';
import { isAudioEnabled, toggleAudio, playTactileClick, playDeployChime } from './utils/audio';
import { downloadDeployableZip } from './utils/zipPackager';
import { safeFetchJson, generateClientProject, generateClientQA, generateClientSubmissionBundle } from './utils/fallbackGenerators';
import { MetaLearningState } from './types/metaLearning';
import { loadMetaLearningState, syncMetaLearningWithServer, saveMetaLearningState } from './services/metaLearningService';
import { generateExtendedRegistryBatch } from './services/globalCatalogService';
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
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(() => isAudioEnabled());
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [isPackaging, setIsPackaging] = useState<boolean>(false);
  const [isSyncingLive, setIsSyncingLive] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sentinel_sidebar_collapsed') === 'true';
  });
  const [metaLearningState, setMetaLearningState] = useState<MetaLearningState>(loadMetaLearningState);
  const [extendedBatchIndex, setExtendedBatchIndex] = useState<number>(0);
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);

  const handleToggleAudio = () => {
    const updated = toggleAudio();
    setIsAudioOn(updated);
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sentinel_sidebar_collapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHasApiKey(!!data.hasApiKey))
      .catch(() => setHasApiKey(false));

    // Automatically trigger initial live radar sync to ingest real-time security advisories
    handleLiveRadarScan();

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

    // Sync meta-learning model with server
    syncMetaLearningWithServer(metaLearningState).then((remote) => {
      if (remote) setMetaLearningState(remote);
    });

    // Global keyboard shortcuts: Cmd+K / Ctrl+K for Command Palette
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const handleUpdateFiles = (files: GeneratedFile[]) => {
    setTargets((prev) =>
      prev.map((t) =>
        t.id === activeTarget.id && t.project
          ? {
              ...t,
              project: { ...t.project, files },
            }
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
      const currentSpec = activeTarget.spec || {
        title: activeTarget.title,
        platform: activeTarget.platform,
        theme: activeTarget.theme,
        suggestedArchetype: archetype,
      };

      // Combine user customDirectives with live auto-refined meta-learning directives
      const metaDirectives = metaLearningState.activePrompts?.generator?.injectedDirectives?.join('\n') || '';
      const combinedDirectives = customDirectives
        ? `${customDirectives}\n\nMETA-LEARNED DIRECTIVES:\n${metaDirectives}`
        : metaDirectives;

      const res = await safeFetchJson<{ project: GeneratedProject }>('/api/radar/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spec: currentSpec,
          archetype,
          customDirectives: combinedDirectives,
        }),
      });

      let project: GeneratedProject;
      if (res.ok && res.data?.project && Array.isArray(res.data.project.files) && res.data.project.files.length > 0) {
        project = {
          ...res.data.project,
          archetype,
          generatedAt: new Date().toISOString(),
        };
      } else {
        // Fallback to deterministic client generator
        project = generateClientProject(currentSpec, archetype, customDirectives);
      }

      setTargets((prev) =>
        prev.map((t) =>
          t.id === activeTarget.id
            ? { ...t, project, stage: 'generated' }
            : t
        )
      );
      playDeployChime();
    } catch (err) {
      console.error('Code generation error, using fallback:', err);
      const fallback = generateClientProject(
        activeTarget.spec || { title: activeTarget.title, platform: activeTarget.platform, theme: activeTarget.theme },
        archetype,
        customDirectives
      );
      setTargets((prev) =>
        prev.map((t) => (t.id === activeTarget.id ? { ...t, project: fallback, stage: 'generated' } : t))
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunQA = async () => {
    if (!activeTarget.project?.files) return;
    setIsAuditing(true);
    setActiveTab('qa');

    try {
      const res = await safeFetchJson<any>('/api/radar/qa-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: activeTarget.project.files,
          specTitle: activeTarget.title,
        }),
      });

      let qaResult: any;
      if (res.ok && res.data && res.data.qaStatus) {
        qaResult = {
          ...res.data,
          auditedAt: new Date().toISOString(),
        };
      } else {
        qaResult = generateClientQA(activeTarget.project.files, activeTarget.title);
      }

      setTargets((prev) =>
        prev.map((t) =>
          t.id === activeTarget.id
            ? {
                ...t,
                qaResult,
                stage: 'qa_passed',
              }
            : t
        )
      );
      playDeployChime();
    } catch (err) {
      console.error('QA audit error, using fallback:', err);
      const fallbackQA = generateClientQA(activeTarget.project.files, activeTarget.title);
      setTargets((prev) =>
        prev.map((t) => (t.id === activeTarget.id ? { ...t, qaResult: fallbackQA, stage: 'qa_passed' } : t))
      );
    } finally {
      setIsAuditing(false);
    }
  };

  const handleGenerateBundle = async () => {
    if (!activeTarget.project) return;
    setIsPackaging(true);
    setActiveTab('submission');

    try {
      const currentSpec = activeTarget.spec || {
        title: activeTarget.title,
        platform: activeTarget.platform,
        theme: activeTarget.theme,
        judgingCriteria: ['Innovation', 'Technical Depth', 'Polish'],
      };

      const res = await safeFetchJson<any>('/api/radar/package-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spec: currentSpec,
          project: activeTarget.project,
        }),
      });

      let bundle: any;
      if (res.ok && res.data?.bundle) {
        bundle = {
          ...res.data.bundle,
          repoUrl: activeTarget.githubRepo?.html_url || res.data.bundle.repoUrl,
        };
      } else {
        bundle = generateClientSubmissionBundle(currentSpec, activeTarget.project);
      }

      setTargets((prev) =>
        prev.map((t) =>
          t.id === activeTarget.id
            ? {
                ...t,
                submissionBundle: bundle,
                stage: 'packaged',
              }
            : t
        )
      );
      playDeployChime();
    } catch (err) {
      console.error('Packaging error, using fallback:', err);
      const currentSpec = activeTarget.spec || {
        title: activeTarget.title,
        platform: activeTarget.platform,
        theme: activeTarget.theme,
      };
      const fallbackBundle = generateClientSubmissionBundle(currentSpec, activeTarget.project);
      setTargets((prev) =>
        prev.map((t) => (t.id === activeTarget.id ? { ...t, submissionBundle: fallbackBundle, stage: 'packaged' } : t))
      );
    } finally {
      setIsPackaging(false);
    }
  };

  const handleDownloadActiveZip = async () => {
    try {
      playTactileClick();
      await downloadDeployableZip(activeTarget);
      setNotification({
        title: 'Deployable ZIP Pack Downloaded',
        message: `Complete build archive for "${activeTarget.title}" downloaded (.zip).`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error('Error downloading zip pack:', err);
    }
  };

  const handleLiveRadarScan = async () => {
    setIsSyncingLive(true);
    try {
      const res = await fetch('/api/radar/live-advisories');
      if (res.ok) {
        const data = await res.json();
        if (data.liveAdvisories && data.liveAdvisories.length > 0) {
          setTargets((prev) => {
            const existingIds = new Set(prev.map((t) => t.id));
            const fresh = data.liveAdvisories
              .filter((t: TargetEvent) => !existingIds.has(t.id))
              .map((t: TargetEvent) => ({
                ...t,
                status: t.status || 'live',
                category: t.category || 'vrp_security',
                prizeAmountUsd: typeof t.prizeAmountUsd === 'number' ? t.prizeAmountUsd : 15000,
                stage: t.stage || 'detected',
              }));
            if (fresh.length > 0) {
              playDeployChime();
              setNotification({
                title: 'Live Radar Feed Synced',
                message: `Ingested ${fresh.length} real-time CVE and Bug Bounty security advisories from GitHub Advisories API.`,
              });
              setTimeout(() => setNotification(null), 5000);
              return [...prev.slice(0, 13), ...fresh, ...prev.slice(13)];
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.warn('Live radar scan warning:', err);
    } finally {
      setIsSyncingLive(false);
    }
  };

  const handleExpandGlobalRegistry = async (batchCount = 250) => {
    setIsSyncingLive(true);
    try {
      const nextBatch = extendedBatchIndex + 1;
      setExtendedBatchIndex(nextBatch);
      const res = await fetch(`/api/radar/catalog?mode=extended&batchIndex=${nextBatch}&count=${batchCount}`);
      let newTargets: TargetEvent[] = [];
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.targets)) {
          newTargets = data.targets;
        }
      }
      if (newTargets.length === 0) {
        newTargets = generateExtendedRegistryBatch(nextBatch, batchCount);
      }
      setTargets((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const deduped = newTargets.filter((t) => !existingIds.has(t.id));
        playDeployChime();
        setNotification({
          title: 'Global Registry Batch Loaded',
          message: `Indexed +${deduped.length} additional Hackathons, Bug Bounties & NVD/GHSA Advisories into active memory (${prev.length + deduped.length} loaded of 108,450+ Global Index).`,
        });
        setTimeout(() => setNotification(null), 5000);
        return [...prev, ...deduped];
      });
    } catch (err) {
      console.warn('Expand global registry fallback:', err);
    } finally {
      setIsSyncingLive(false);
    }
  };

  const handleSimulateDetection = handleLiveRadarScan;

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
        onLiveRadarScan={handleLiveRadarScan}
        onDownloadZip={activeTarget.project?.files?.length ? handleDownloadActiveZip : undefined}
        hasApiKey={hasApiKey}
        activeTargetTitle={activeTarget?.title}
        githubUser={githubUser}
        onOpenGitHubAuth={() => setIsGitHubModalOpen(true)}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        isAudioOn={isAudioOn}
        onToggleAudio={handleToggleAudio}
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
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        {/* Center Main Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950/80">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'radar' && (
              <RadarFeedView
                targets={displayedTargets}
                policy={policy}
                onSelectTarget={(t, tab) => handleSelectTarget(t, tab)}
                onOpenIngest={() => setIsIngestModalOpen(true)}
                onSyncLiveFeed={handleLiveRadarScan}
                onExpandGlobalRegistry={handleExpandGlobalRegistry}
                isSyncingLive={isSyncingLive}
                onTargetAudited={(targetId, receiptDigest, repairCount) => {
                  setTargets((prev) =>
                    prev.map((t) =>
                      t.id === targetId
                        ? {
                            ...t,
                            lifecycleState: 'AUDITED',
                            stage: 'qa_passed',
                            canonicalHash: receiptDigest,
                            repairCount,
                          }
                        : t
                    )
                  );
                }}
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
                onUpdateFiles={handleUpdateFiles}
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
                onNavigateToStrategy={() => setActiveTab('strategy')}
              />
            )}

            {activeTab === 'strategy' && (
              <StrategyEngineView
                targets={targets}
                outcomes={metaLearningState.outcomes}
                currentPolicy={policy}
                onUpdatePolicy={(newPolicy) => {
                  setPolicy(newPolicy);
                  setNotification({
                    title: 'Policy Engine Reconfigured',
                    message: `Applied optimal build strategy: $${newPolicy.minimumPrizeUsd.toLocaleString()} Min Prize Gate, ${newPolicy.whitelistedPlatforms.length} Whitelisted Platforms.`,
                  });
                  setTimeout(() => setNotification(null), 4000);
                }}
                onSelectTarget={(t, tab = 'studio') => handleSelectTarget(t, tab)}
              />
            )}

            {activeTab === 'meta_learning' && (
              <MetaLearningView
                metaState={metaLearningState}
                onUpdateMetaState={(newState) => {
                  setMetaLearningState(newState);
                  saveMetaLearningState(newState);
                }}
                currentPolicy={policy}
                onUpdatePolicy={(newPolicy) => {
                  setPolicy(newPolicy);
                  setNotification({
                    title: 'Governance Policy Auto-Tuned',
                    message: 'Applied optimal meta-learning rules to live Policy Engine.',
                  });
                  setTimeout(() => setNotification(null), 4000);
                }}
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

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setIsCommandPaletteOpen(false);
        }}
        onTriggerAction={(actionId) => {
          setIsCommandPaletteOpen(false);
          switch (actionId) {
            case 'simulate':
              handleSimulateDetection();
              break;
            case 'ingest':
              setIsIngestModalOpen(true);
              break;
            case 'build':
              handleProceedToPipeline(
                activeTarget.project?.archetype || 'multi_agent_orchestrator',
                'Autonomous synthesis pass via Command Palette'
              );
              break;
            case 'qa':
              handleRunQA();
              break;
            case 'github':
              setIsGitHubModalOpen(true);
              break;
            case 'zip':
              handleDownloadActiveZip();
              break;
          }
        }}
        isAudioOn={isAudioOn}
        onToggleAudio={handleToggleAudio}
      />
    </div>
  );
}
