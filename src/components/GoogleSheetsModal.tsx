import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Download, 
  LogOut,
  Sparkles,
  Code2,
  Send,
  Trash2,
  ArrowRight,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { User } from 'firebase/auth';
import { SurveyResponse } from '../types/survey';
import { copyTableForGoogleSheets, exportToCSV } from '../services/exportService';
import { 
  COMPLETE_APPS_SCRIPT_CODE, 
  getStoredWebhookUrl, 
  saveStoredWebhookUrl, 
  clearStoredWebhookUrl,
  testAndSyncAppsScriptWebhook 
} from '../services/googleSheets';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  isSheetsConnected: boolean;
  spreadsheetUrl: string | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onSyncAll: () => Promise<void>;
  isSyncing: boolean;
  totalResponses: number;
  responses: SurveyResponse[];
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  user,
  isSheetsConnected,
  spreadsheetUrl,
  onSignIn,
  onSignOut,
  onSyncAll,
  isSyncing,
  totalResponses,
  responses,
}) => {
  const [activeTab, setActiveTab] = useState<'appscript' | 'instant' | 'csv' | 'direct'>('appscript');
  
  // Apps Script Webhook State
  const [webhookUrlInput, setWebhookUrlInput] = useState<string>(() => getStoredWebhookUrl());
  const [isScriptCopied, setIsScriptCopied] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Instant Copy State
  const [isCopied, setIsCopied] = useState(false);
  const [domainCopied, setDomainCopied] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (!isOpen) return null;

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  const storedWebhook = getStoredWebhookUrl();

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(COMPLETE_APPS_SCRIPT_CODE);
      setIsScriptCopied(true);
      setTimeout(() => setIsScriptCopied(false), 3000);
    } catch (e) {
      console.error('Failed to copy Apps Script code:', e);
    }
  };

  const handleSaveAndTestWebhook = async () => {
    if (!webhookUrlInput.trim()) {
      setWebhookStatus({
        type: 'error',
        message: 'Please paste your Google Apps Script Web App URL first.',
      });
      return;
    }

    setIsTestingWebhook(true);
    setWebhookStatus(null);
    try {
      const result = await testAndSyncAppsScriptWebhook(webhookUrlInput, responses);
      if (result.success) {
        setWebhookStatus({
          type: 'success',
          message: result.message,
        });
      } else {
        setWebhookStatus({
          type: 'error',
          message: result.message,
        });
      }
    } catch (err: any) {
      setWebhookStatus({
        type: 'error',
        message: err.message || 'Failed to dispatch to Apps Script Webhook.',
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleRemoveWebhook = () => {
    clearStoredWebhookUrl();
    setWebhookUrlInput('');
    setWebhookStatus({
      type: 'success',
      message: 'Webhook URL removed.',
    });
    setTimeout(() => setWebhookStatus(null), 3000);
  };

  const handleCopyForSheets = async () => {
    const success = await copyTableForGoogleSheets(responses);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(currentDomain);
    setDomainCopied(true);
    setTimeout(() => setDomainCopied(false), 2500);
  };

  const handleSignInClick = async () => {
    try {
      setAuthError(null);
      setIsSigningIn(true);
      await onSignIn();
    } catch (err: any) {
      setAuthError(err.message || 'Google Sign-in failed.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Link & View Answers in Google Sheets
            </h3>
            <p className="text-xs text-slate-500">
              Employer management setup for automatic response syncing & reporting
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-1 sm:gap-2 mb-4 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('appscript')}
            className={`pb-2.5 px-3 text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'appscript'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4 text-emerald-600" />
            <span>Apps Script Webhook</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black uppercase">
              Recommended
            </span>
          </button>

          <button
            onClick={() => setActiveTab('instant')}
            className={`pb-2.5 px-3 text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'instant'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Copy className="w-4 h-4 text-indigo-600" />
            <span>Instant Copy & Paste (5s)</span>
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`pb-2.5 px-3 text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'csv'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('direct')}
            className={`pb-2.5 px-3 text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'direct'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Google Account Sign-In</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          
          {/* TAB 1: APPS SCRIPT WEBHOOK */}
          {activeTab === 'appscript' && (
            <div className="space-y-4 text-slate-700">
              <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-xs space-y-1">
                    <h4 className="font-bold text-emerald-950 text-sm">
                      Why Google Apps Script Webhook is the Best & 100% Guaranteed Method
                    </h4>
                    <p className="text-slate-600 leading-relaxed">
                      Google Apps Script operates directly inside your Google Sheet. It requires <strong>no OAuth domain authorizations, no pop-ups, and no sign-in errors</strong>. Once you deploy it, every time an employee submits feedback, it automatically appears inside your sheet!
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              {storedWebhook ? (
                <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                        Webhook Active & Connected
                      </div>
                      <div className="text-xs text-slate-300 font-mono truncate max-w-sm">
                        {storedWebhook}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveAndTestWebhook}
                      disabled={isTestingWebhook}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isTestingWebhook ? 'Syncing...' : 'Sync All Responses Now'}</span>
                    </button>
                    <button
                      onClick={handleRemoveWebhook}
                      title="Remove Webhook"
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Step-by-Step Instructions */}
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3.5">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span>Step-by-Step Instructions</span>
                  <span className="text-[11px] font-normal text-slate-500">(Takes under 2 minutes)</span>
                </h4>

                <ol className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="flex-1">
                      <span>Open a new or existing Google Sheet.</span>
                      <a
                        href="https://sheets.new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 ml-2 text-emerald-700 hover:text-emerald-900 font-bold underline"
                      >
                        <span>Open sheets.new</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="flex-1">
                      In the top menu, click <strong>Extensions</strong> ➔ <strong>Apps Script</strong>.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="flex-1 space-y-2">
                      <div>
                        Delete any placeholder code in the editor, then copy and paste the complete script:
                      </div>
                      <button
                        onClick={handleCopyScript}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        {isScriptCopied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Script Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-amber-400" />
                            <span>Copy Complete Apps Script Code (1-Click)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </span>
                    <div className="flex-1">
                      Click the <strong>Save icon (💾)</strong> in the Apps Script toolbar.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      5
                    </span>
                    <div className="flex-1">
                      In the top-right corner, click the blue <strong>Deploy</strong> button ➔ <strong>New deployment</strong>.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      6
                    </span>
                    <div className="flex-1">
                      Click the gear icon (⚙️) next to <em>Select type</em> and pick <strong>Web app</strong>. Configure:
                      <ul className="list-disc ml-5 mt-1 space-y-0.5 font-medium text-slate-800">
                        <li>Description: <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">Happy Hour Survey</code></li>
                        <li>Execute as: <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">Me</code></li>
                        <li>
                          Who has access: <strong className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Anyone</strong> 
                          <span className="text-[11px] text-slate-500 ml-1">(Crucial so responses can post without requiring employees to sign in)</span>
                        </li>
                      </ul>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      7
                    </span>
                    <div className="flex-1">
                      Click <strong>Deploy</strong>. When prompted for permissions, click <strong>Authorize access</strong> ➔ Choose your account ➔ Click <strong>Advanced</strong> ➔ Click <strong>Go to Untitled project (unsafe)</strong> ➔ Click <strong>Allow</strong>.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      8
                    </span>
                    <div className="flex-1">
                      Copy the <strong>Web app URL</strong> (it starts with <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">https://script.google.com/macros/s/...</code>) and paste it below:
                    </div>
                  </li>
                </ol>

                {/* Paste URL Input Form */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Paste Your Apps Script Web App URL:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={webhookUrlInput}
                      onChange={(e) => setWebhookUrlInput(e.target.value)}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={handleSaveAndTestWebhook}
                      disabled={isTestingWebhook}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {isTestingWebhook ? (
                        <span>Connecting...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Save & Sync to Sheet</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Feedback Banner */}
                  {webhookStatus && (
                    <div
                      className={`mt-2.5 p-3 rounded-xl text-xs flex items-center gap-2 ${
                        webhookStatus.type === 'success'
                          ? 'bg-emerald-100 border border-emerald-300 text-emerald-900'
                          : 'bg-rose-50 border border-rose-200 text-rose-900'
                      }`}
                    >
                      {webhookStatus.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{webhookStatus.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Code Preview Accordion */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-950 text-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white font-mono">Google Apps Script Source Code (Code.gs)</span>
                  </div>
                  <button
                    onClick={handleCopyScript}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {isScriptCopied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <div className="max-h-44 overflow-y-auto bg-slate-900 p-3 rounded-xl font-mono text-[11px] text-slate-300 leading-relaxed border border-slate-800">
                  <pre>{COMPLETE_APPS_SCRIPT_CODE}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSTANT COPY & PASTE */}
          {activeTab === 'instant' && (
            <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200/90 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Instant 5-Second Method: Copy & Paste Directly</span>
                </h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-full uppercase">
                  Fastest
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                If you just want to see the answers in Google Sheets right now without configuring anything:
              </p>

              <ol className="space-y-2 text-xs text-slate-700 list-decimal ml-5">
                <li>Click <strong>Copy Table for Google Sheets</strong> below.</li>
                <li>Click <strong>Open Google Sheets (sheets.new)</strong>.</li>
                <li>Click into cell <strong>A1</strong> and press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-semibold text-slate-800">Ctrl+V</kbd> (or <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-semibold text-slate-800">Cmd+V</kbd>). All {totalResponses} survey responses will paste into neat formatted columns!</li>
              </ol>

              <div className="flex flex-wrap gap-2.5 pt-2">
                <button
                  onClick={handleCopyForSheets}
                  className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span>Copied {totalResponses} Rows!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Table for Google Sheets</span>
                    </>
                  )}
                </button>

                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold transition shadow-sm"
                >
                  <ExternalLink className="w-4 h-4 text-emerald-600" />
                  <span>Open Google Sheets (sheets.new)</span>
                </a>
              </div>

              {isCopied && (
                <div className="p-3 bg-white rounded-xl border border-emerald-300 text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Table copied! Switch to Google Sheets and press <strong>Paste (Ctrl+V)</strong>.</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DOWNLOAD CSV */}
          {activeTab === 'csv' && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Download className="w-4 h-4 text-slate-700" />
                <span>Download CSV & Import into Google Sheets</span>
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed">
                You can download the full survey response dataset as a clean CSV file and open it in Google Sheets or Microsoft Excel anytime.
              </p>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-800 block">How to open in Google Sheets:</span>
                <ol className="list-decimal ml-5 text-slate-600 space-y-1">
                  <li>Download the CSV file below.</li>
                  <li>In Google Sheets, click <strong>File</strong> ➔ <strong>Import</strong> ➔ <strong>Upload</strong>.</li>
                  <li>Drag & drop the downloaded file. It will create a clean spreadsheet automatically.</li>
                </ol>
              </div>

              <button
                onClick={() => exportToCSV(responses)}
                className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download CSV File ({totalResponses} entries)</span>
              </button>
            </div>
          )}

          {/* TAB 4: DIRECT GOOGLE ACCOUNT OAUTH */}
          {activeTab === 'direct' && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">
                  Direct Cloud Sync (Google Account Sign-In)
                </h4>
                {isSheetsConnected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Connected
                  </span>
                ) : null}
              </div>

              {/* Error Message & Fix instructions for auth/unauthorized-domain */}
              {authError && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Why did the "unauthorized-domain" or sign-in error appear?</span>
                      <span>
                        Google requires your Cloud Run domain to be added to Firebase Authorized Domains once before OAuth popups are allowed.
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-amber-200 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      Quick Fix:
                    </span>
                    <div className="flex items-center justify-between gap-2 bg-slate-100 px-2.5 py-1.5 rounded text-[11px] font-mono text-slate-800">
                      <span className="truncate">{currentDomain}</span>
                      <button
                        onClick={handleCopyDomain}
                        className="text-indigo-600 hover:text-indigo-800 font-sans font-bold shrink-0 text-[10px]"
                      >
                        {domainCopied ? 'Copied!' : 'Copy Domain'}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Paste this domain in <a href="https://console.firebase.google.com/project/gen-lang-client-0872113114/authentication/settings" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-semibold">Firebase Console &gt; Authentication &gt; Settings &gt; Authorized Domains</a>.
                    </p>
                  </div>

                  <p className="text-[11px] text-emerald-800 font-semibold">
                    👉 To avoid this completely, use the <strong>Apps Script Webhook (Tab 1)</strong> or <strong>Instant Copy (Tab 2)</strong> above!
                  </p>
                </div>
              )}

              {isSheetsConnected ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span>Connected Google Account: <strong>{user?.email || user?.displayName}</strong></span>
                    <button
                      onClick={onSignOut}
                      className="text-rose-600 hover:text-rose-800 text-[11px] font-medium flex items-center gap-1"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Disconnect</span>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={onSyncAll}
                      disabled={isSyncing}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
                    >
                      <span>{isSyncing ? 'Syncing...' : `Sync All (${totalResponses} Entries)`}</span>
                    </button>

                    {spreadsheetUrl && (
                      <a
                        href={spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Sheet</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSignInClick}
                  disabled={isSigningIn}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isSigningIn ? 'Connecting...' : 'Sign in as Employer with Google'}</span>
                </button>
              )}
            </div>
          )}

        </div>

        {/* Footer info note */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Responses remain 100% anonymous in all exports & sheets</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
