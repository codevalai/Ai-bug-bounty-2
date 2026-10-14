import React, { useState, useEffect } from 'react';
import { GitHubUser } from '../types/radar';
import {
  Github,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  X,
  KeyRound,
  AlertTriangle,
  ShieldCheck,
  LogOut,
  Eye,
  EyeOff,
  Sliders,
  Save,
  RotateCcw,
} from 'lucide-react';
import { playTactileClick, playDeployChime } from '../utils/audio';

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
  const [showSecret, setShowSecret] = useState(false);
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedDev, setCopiedDev] = useState(false);
  const [copiedShared, setCopiedShared] = useState(false);
  const [copiedHomepage, setCopiedHomepage] = useState(false);

  // Load current OAuth configuration from server
  const loadOAuthInfo = () => {
    fetch('/api/github/oauth-info')
      .then((res) => res.json())
      .then((data) => {
        setOauthInfo(data);
        if (data.clientId) {
          setInputClientId(data.clientId);
        }
        if (!data.configured) {
          setIsEditingCredentials(true);
        }
      })
      .catch(() => setOauthInfo(null));
  };

  useEffect(() => {
    if (isOpen) {
      loadOAuthInfo();
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  // Listen for popup OAuth postMessage
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data.token) {
        const token = event.data.token;
        try {
          setIsVerifying(true);
          const userRes = await fetch('/api/github/user', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            playDeployChime();
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

  // Launch GitHub OAuth popup directly
  const handleOAuthConnect = async () => {
    playTactileClick();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsVerifying(true);

    try {
      const currentOrigin = window.location.origin;
      const redirectUri = `${currentOrigin}/auth/callback`;

      const res = await fetch(`/api/auth/github/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to generate GitHub authorization URL.');
      }

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

  // Save new Client ID & Secret
  const handleSaveCredentials = async (andAuthorize = false) => {
    playTactileClick();
    if (!inputClientId.trim() || !inputClientSecret.trim()) {
      setErrorMsg('Both Client ID and Client Secret are required.');
      return;
    }

    setIsSavingConfig(true);
    setErrorMsg(null);
    setSuccessMsg(null);

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

      playDeployChime();
      setOauthInfo((prev) => (prev ? { ...prev, configured: true, clientId: data.clientId } : null));
      setSuccessMsg('GitHub Client ID & Secret successfully updated and saved!');
      setIsEditingCredentials(false);
      setInputClientSecret('');

      if (andAuthorize) {
        await handleOAuthConnect();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to configure OAuth credentials.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Manual PAT Submit
  const handleManualTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    playTactileClick();
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
      playDeployChime();
      onConnectSuccess(tokenInput.trim(), userData.user);
      setTokenInput('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Token verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const devCallback = oauthInfo?.devCallbackUrl || 'https://ais-dev-6n5got2jwmdicxiyigq3yz-97208276971.us-east1.run.app/auth/callback';
  const sharedCallback = oauthInfo?.sharedCallbackUrl || 'https://ais-pre-6n5got2jwmdicxiyigq3yz-97208276971.us-east1.run.app/auth/callback';
  const homepageUrl = 'https://ais-dev-6n5got2jwmdicxiyigq3yz-97208276971.us-east1.run.app';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden text-xs text-slate-300 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 font-semibold text-white">
            <Github className="w-4 h-4 text-cyan-400" />
            <span>GitHub OAuth &amp; Deployment Service</span>
          </div>
          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 transition-colors rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Notifications */}
          {successMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Active Connection Status Banner */}
          {githubUser && (
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
                  onClick={() => {
                    playTactileClick();
                    onDisconnect();
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 rounded transition-colors inline-flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          )}

          {/* Section: OAuth Client Credentials (View / Change) */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>GitHub OAuth Application Credentials</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Configure your GitHub OAuth App credentials to enable 1-click authorization and auto-pushing.
                </p>
              </div>

              {oauthInfo?.configured && !isEditingCredentials && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                  Configured
                </span>
              )}
            </div>

            {/* If already configured and NOT currently editing, show active client and "Change Credentials" button */}
            {oauthInfo?.configured && !isEditingCredentials ? (
              <div className="space-y-3 pt-1">
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Current Client ID:</span>
                  <span className="font-mono text-cyan-300 font-semibold">{oauthInfo.clientId}</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {!githubUser && (
                    <button
                      onClick={handleOAuthConnect}
                      disabled={isVerifying}
                      className="flex-1 py-2 px-3 font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-md transition-colors flex items-center justify-center gap-2 shadow-sm shadow-cyan-900/30"
                    >
                      <Github className="w-4 h-4" />
                      <span>{isVerifying ? 'Opening Popup...' : 'Authorize with GitHub (OAuth)'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      playTactileClick();
                      setIsEditingCredentials(true);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="py-2 px-3 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors text-[11px] inline-flex items-center gap-1.5 border border-slate-700"
                  >
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Change Client ID &amp; Secret</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Credential Edit Form */
              <div className="space-y-3 pt-1">
                <div className="p-2.5 bg-cyan-950/30 border border-cyan-800/40 rounded text-[11px] text-cyan-300 leading-relaxed">
                  Enter your new <strong>Client ID</strong> and <strong>Client Secret</strong> from your GitHub OAuth App below:
                </div>

                <div className="space-y-2.5">
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
                    <div className="relative">
                      <input
                        type={showSecret ? 'text' : 'password'}
                        required
                        value={inputClientSecret}
                        onChange={(e) => setInputClientSecret(e.target.value)}
                        placeholder="Enter your new Client Secret"
                        className="w-full pl-3 pr-9 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        title={showSecret ? 'Hide Secret' : 'Show Secret'}
                      >
                        {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={() => handleSaveCredentials(false)}
                    disabled={isSavingConfig || isVerifying || !inputClientId.trim() || !inputClientSecret.trim()}
                    className="flex-1 py-2 px-3 font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-950"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingConfig ? 'Saving...' : 'Save New Credentials'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveCredentials(true)}
                    disabled={isSavingConfig || isVerifying || !inputClientId.trim() || !inputClientSecret.trim()}
                    className="flex-1 py-2 px-3 font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-cyan-900/30"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>Save &amp; Authorize</span>
                  </button>

                  {oauthInfo?.configured && (
                    <button
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        setIsEditingCredentials(false);
                        setErrorMsg(null);
                      }}
                      className="py-2 px-3 text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors text-[11px]"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Fallback Option: Personal Access Token (PAT) */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-3">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>Or Connect via Personal Access Token (PAT)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Prefer token access? Create a Classic Token with <code className="text-cyan-300 font-mono">repo</code> and <code className="text-cyan-300 font-mono">read:user</code> scopes at <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-cyan-400 underline">github.com/settings/tokens</a>.
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

          {/* OAuth App Settings Guide for GitHub Developer Portal */}
          <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-lg space-y-2.5 text-[11px]">
            <div className="font-semibold text-slate-300 flex items-center justify-between">
              <span>Required GitHub OAuth App Settings</span>
              <a
                href="https://github.com/settings/developers"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>github.com/settings/developers</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-400">
              When updating or creating your OAuth app at GitHub, ensure your application has these exact URLs:
            </p>

            <div className="space-y-2 pt-1">
              <div>
                <div className="text-slate-500 mb-0.5">Homepage URL:</div>
                <div className="p-2 bg-slate-900 border border-slate-800 rounded flex items-center justify-between font-mono text-slate-300 select-all">
                  <span className="truncate">{homepageUrl}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(homepageUrl);
                      setCopiedHomepage(true);
                      setTimeout(() => setCopiedHomepage(false), 2000);
                    }}
                    className="p-1 text-slate-400 hover:text-white shrink-0 ml-2"
                    title="Copy Homepage URL"
                  >
                    {copiedHomepage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-slate-500 mb-0.5">Authorization Callback URL (Primary Development):</div>
                <div className="p-2 bg-slate-900 border border-slate-800 rounded flex items-center justify-between font-mono text-slate-300 select-all">
                  <span className="truncate">{devCallback}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(devCallback);
                      setCopiedDev(true);
                      setTimeout(() => setCopiedDev(false), 2000);
                    }}
                    className="p-1 text-slate-400 hover:text-white shrink-0 ml-2"
                    title="Copy Callback URL"
                  >
                    {copiedDev ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-slate-500 mb-0.5">Shared / Deployed Callback URL:</div>
                <div className="p-2 bg-slate-900 border border-slate-800 rounded flex items-center justify-between font-mono text-slate-300 select-all">
                  <span className="truncate">{sharedCallback}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(sharedCallback);
                      setCopiedShared(true);
                      setTimeout(() => setCopiedShared(false), 2000);
                    }}
                    className="p-1 text-slate-400 hover:text-white shrink-0 ml-2"
                    title="Copy Shared Callback URL"
                  >
                    {copiedShared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
