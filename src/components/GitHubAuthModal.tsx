import React, { useState, useEffect } from 'react';
import { GitHubUser } from '../types/radar';
import { Github, CheckCircle2, Copy, Check, ExternalLink, X, KeyRound, AlertTriangle, ShieldCheck, LogOut } from 'lucide-react';

interface GitHubAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  githubUser: GitHubUser | null;
  onConnectSuccess: (token: string, user: GitHubUser) => void;
  onDisconnect: () => void;
}

export const GitHubAuthModal: React.FC<GitHubAuthModalProps> = ({
  isOpen,
  onClose,
  githubUser,
  onConnectSuccess,
  onDisconnect,
}) => {
  const [oauthInfo, setOauthInfo] = useState<{
    configured: boolean;
    clientId: string;
    devCallbackUrl: string;
    sharedCallbackUrl: string;
  } | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [inputClientId, setInputClientId] = useState('');
  const [inputClientSecret, setInputClientSecret] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedDev, setCopiedDev] = useState(false);
  const [copiedShared, setCopiedShared] = useState(false);

  useEffect(() => {
    fetch('/api/github/oauth-info')
      .then((res) => res.json())
      .then((data) => {
        setOauthInfo(data);
        if (data.clientId) {
          setInputClientId(data.clientId);
        }
      })
      .catch(() => setOauthInfo(null));
  }, []);

  // Listen for popup OAuth postMessage
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Validate origin if needed
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data.token) {
        const token = event.data.token;
        try {
          setIsVerifying(true);
          const userRes = await fetch('/api/github/user', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            onConnectSuccess(token, userData.user);
            setErrorMsg(null);
            onClose();
          } else {
            setErrorMsg('Failed to verify user profile with returned token.');
          }
        } catch (e: any) {
          setErrorMsg(e.message || 'Error verifying token.');
        } finally {
          setIsVerifying(false);
        }
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setErrorMsg(event.data.error || 'OAuth authentication failed.');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConnectSuccess, onClose]);

  if (!isOpen) return null;

  const handleOAuthConnect = async () => {
    setErrorMsg(null);
    setIsVerifying(true);

    try {
      // 1. Fetch OAuth URL from server with redirectUri matching current origin
      const currentOrigin = window.location.origin;
      const redirectUri = `${currentOrigin}/auth/callback`;

      const res = await fetch(`/api/auth/github/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to generate GitHub authorization URL.');
      }

      // 2. Open GitHub's authorization URL directly in popup
      const authWindow = window.open(
        data.url,
        'github_oauth_popup',
        'width=600,height=720,menubar=no,toolbar=no'
      );

      if (!authWindow) {
        setErrorMsg('Popup was blocked by your browser. Please allow popups for this site.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start GitHub OAuth.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setErrorMsg(null);
    setIsVerifying(true);

    try {
      const userRes = await fetch('/api/github/user', {
        headers: { Authorization: `Bearer ${tokenInput.trim()}` },
      });

      if (!userRes.ok) {
        const err = await userRes.json().catch(() => ({}));
        throw new Error(err.error || 'Invalid Personal Access Token.');
      }

      const userData = await userRes.json();
      onConnectSuccess(tokenInput.trim(), userData.user);
      setTokenInput('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Token verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveConfigAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputClientId.trim() || !inputClientSecret.trim()) {
      setErrorMsg('Please enter both Client ID and Client Secret from your GitHub OAuth App.');
      return;
    }

    setIsSavingConfig(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/github/configure-oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: inputClientId.trim(),
          clientSecret: inputClientSecret.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save OAuth credentials.');
      }

      setOauthInfo((prev) => (prev ? { ...prev, configured: true, clientId: data.clientId } : null));
      await handleOAuthConnect();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to configure OAuth credentials.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleSimulateToken = async () => {
    // Quick operator testing mode
    const mockUser: GitHubUser = {
      login: 'autonomous-competitor',
      name: 'Sentinel Competitor Engine',
      avatar_url: 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
      html_url: 'https://github.com/autonomous-competitor',
      public_repos: 14,
      bio: 'Autonomous Hackathon & Bug Bounty Engine',
    };
    onConnectSuccess('simulated-gh-token-' + Date.now(), mockUser);
    onClose();
  };

  const devCallback = oauthInfo?.devCallbackUrl || 'https://ais-dev-6n5got2jwmdicxiyigq3yz-97208276971.us-east1.run.app/auth/callback';
  const sharedCallback = oauthInfo?.sharedCallbackUrl || 'https://ais-pre-6n5got2jwmdicxiyigq3yz-97208276971.us-east1.run.app/auth/callback';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden text-xs text-slate-300">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-semibold text-white">
            <Github className="w-4 h-4 text-cyan-400" />
            <span>GitHub OAuth &amp; Direct Deployment Service</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Active Connection Status Banner */}
          {githubUser ? (
            <div className="p-4 bg-slate-950 border border-emerald-500/40 rounded-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={githubUser.avatar_url}
                  alt={githubUser.login}
                  className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                />
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span>{githubUser.name || githubUser.login}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    @{githubUser.login} · {githubUser.public_repos} public repos
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={githubUser.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors inline-flex items-center gap-1"
                >
                  <span>Profile</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
                <button
                  onClick={onDisconnect}
                  className="px-2.5 py-1 text-[11px] font-medium text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 rounded transition-colors inline-flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          ) : (
            /* Not Connected: OAuth Section */
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>One-Click GitHub Authentication</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Authenticates via GitHub OAuth to enable one-click repository creation and direct code pushing.
                  </p>
                </div>
                {oauthInfo?.configured && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                    App Ready
                  </span>
                )}
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded text-rose-300 text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {oauthInfo?.configured ? (
                /* OAuth credentials already configured on server */
                <div className="space-y-3 pt-1">
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">OAuth Client ID:</span>
                    <span className="font-mono text-cyan-300 font-medium">{oauthInfo.clientId}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleOAuthConnect}
                      disabled={isVerifying}
                      className="flex-1 py-2.5 px-4 font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-md transition-colors flex items-center justify-center gap-2 shadow-sm shadow-cyan-900/30"
                    >
                      <Github className="w-4 h-4" />
                      <span>{isVerifying ? 'Connecting to GitHub...' : 'Authorize with GitHub (OAuth)'}</span>
                    </button>

                    <button
                      onClick={handleSimulateToken}
                      title="Connect with simulated credentials for testing"
                      className="py-2.5 px-3 font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors text-[11px] whitespace-nowrap"
                    >
                      Fast Demo Connect
                    </button>
                  </div>
                </div>
              ) : (
                /* Prompt user to input their Client ID & Client Secret from the OAuth app they just updated */
                <form onSubmit={handleSaveConfigAndConnect} className="space-y-3 pt-1">
                  <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded text-[11px] text-cyan-300">
                    Enter the <strong>Client ID</strong> and <strong>Client Secret</strong> from your GitHub OAuth App to activate one-click authorization:
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">GitHub Client ID</label>
                    <input
                      type="text"
                      required
                      value={inputClientId}
                      onChange={(e) => setInputClientId(e.target.value)}
                      placeholder="e.g. Iv23..."
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">GitHub Client Secret</label>
                    <input
                      type="password"
                      required
                      value={inputClientSecret}
                      onChange={(e) => setInputClientSecret(e.target.value)}
                      placeholder="e.g. 48f9..."
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={isSavingConfig || isVerifying}
                      className="flex-1 py-2.5 px-4 font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-md transition-colors flex items-center justify-center gap-2 shadow-sm shadow-cyan-900/30"
                    >
                      <Github className="w-4 h-4" />
                      <span>{isSavingConfig || isVerifying ? 'Saving & Authorizing...' : 'Save & Authorize with GitHub'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSimulateToken}
                      title="Connect with simulated credentials for testing without OAuth App"
                      className="py-2.5 px-3 font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors text-[11px] whitespace-nowrap"
                    >
                      Fast Demo Connect
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Fallback Option: Personal Access Token (PAT) */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-3">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>Or Authenticate with Personal Access Token (PAT)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              If you prefer direct token access, generate a Classic Token with <code className="text-cyan-300 font-mono">repo</code> and <code className="text-cyan-300 font-mono">read:user</code> scopes at <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-cyan-400 underline">github.com/settings/tokens</a>.
            </p>

            <form onSubmit={handleManualTokenSubmit} className="flex gap-2">
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
              />
              <button
                type="submit"
                disabled={isVerifying || !tokenInput.trim()}
                className="px-3.5 py-1.5 font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 rounded-md transition-colors whitespace-nowrap"
              >
                Connect Token
              </button>
            </form>
          </div>

          {/* OAuth App Configuration Details (Mandatory exact callback URLs) */}
          <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-lg space-y-2.5 text-[11px]">
            <div className="font-semibold text-slate-300 flex items-center justify-between">
              <span>GitHub OAuth App Configuration</span>
              <a
                href="https://github.com/settings/developers"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>GitHub Developer Settings</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-400">
              When creating your OAuth App at GitHub Settings, specify these exact Callback URLs:
            </p>

            <div className="space-y-1.5 pt-1">
              <div>
                <div className="text-slate-500">Development Callback URL:</div>
                <div className="p-2 bg-slate-900 border border-slate-800 rounded flex items-center justify-between font-mono text-slate-300 select-all">
                  <span className="truncate">{devCallback}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(devCallback);
                      setCopiedDev(true);
                      setTimeout(() => setCopiedDev(false), 2000);
                    }}
                    className="p-1 text-slate-400 hover:text-white shrink-0 ml-2"
                  >
                    {copiedDev ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-slate-500">Shared / Deployed Callback URL:</div>
                <div className="p-2 bg-slate-900 border border-slate-800 rounded flex items-center justify-between font-mono text-slate-300 select-all">
                  <span className="truncate">{sharedCallback}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(sharedCallback);
                      setCopiedShared(true);
                      setTimeout(() => setCopiedShared(false), 2000);
                    }}
                    className="p-1 text-slate-400 hover:text-white shrink-0 ml-2"
                  >
                    {copiedShared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-1 text-slate-500 leading-snug">
              Set <code className="text-slate-300 font-mono">GITHUB_CLIENT_ID</code> and <code className="text-slate-300 font-mono">GITHUB_CLIENT_SECRET</code> in your project environment to enable automatic authorization.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
