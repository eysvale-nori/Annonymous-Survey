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
  Info,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { User } from 'firebase/auth';
import { SurveyResponse } from '../types/survey';
import { copyTableForGoogleSheets, exportToCSV } from '../services/exportService';

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
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [domainCopied, setDomainCopied] = useState(false);

  if (!isOpen) return null;

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              View Survey Answers in Google Sheets
            </h3>
            <p className="text-xs text-slate-500">
              Choose the easiest method to open, paste, or sync responses
            </p>
          </div>
        </div>

        {/* METHOD 1: Instant 1-Click Copy & Paste (Works 100% Guaranteed) */}
        <div className="bg-emerald-50/70 rounded-2xl p-4 sm:p-5 border border-emerald-200/90 mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h4 className="text-sm font-bold text-emerald-950">
                Instant Method: Copy & Open in Google Sheets
              </h4>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-full uppercase">
              Recommended
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            No authorization setup needed! Click below to copy all {totalResponses} survey responses formatted for Google Sheets, then open a blank sheet and press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-semibold text-slate-800">Ctrl+V</kbd> (or <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-semibold text-slate-800">Cmd+V</kbd>).
          </p>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              onClick={handleCopyForSheets}
              className="flex-1 min-w-[170px] inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
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
            <div className="p-2.5 bg-white rounded-xl border border-emerald-300 text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Table copied! Now open Google Sheets and press <strong>Paste (Ctrl+V)</strong> into cell A1.</span>
            </div>
          )}
        </div>

        {/* METHOD 2: Download CSV for Google Sheets */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                Alternative: Download CSV & Import into Google Sheets
              </h4>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Download the pre-formatted survey dataset file, then in Google Sheets select <strong>File &gt; Import &gt; Upload</strong>.
          </p>

          <button
            onClick={() => exportToCSV(responses)}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download CSV File</span>
          </button>
        </div>

        {/* METHOD 3: Cloud Direct Sync (with Error Fix Guidance) */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                Direct Cloud Sync (Google Account Sign-In)
              </h4>
            </div>
            {isSheetsConnected ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connected
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">Optional</span>
            )}
          </div>

          {/* Error Message & Fix instructions for auth/unauthorized-domain */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Why did the "unauthorized-domain" error appear?</span>
                  <span>
                    Google requires your app's Cloud Run web address to be added to Firebase Authorized Domains once before pop-ups are accepted.
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-amber-200 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Quick 1-Minute Fix:
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
                👉 In the meantime, use <strong>Method 1 above</strong> to immediately view and edit all your responses in Google Sheets!
              </p>
            </div>
          )}

          {isSheetsConnected ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Account: <strong>{user?.email || user?.displayName}</strong></span>
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
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
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
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isSigningIn ? 'Connecting...' : 'Sign in as Employer with Google'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
