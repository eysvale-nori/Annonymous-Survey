import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Lock,
  LogOut
} from 'lucide-react';
import { User } from 'firebase/auth';

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
}) => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (!isOpen) return null;

  const handleSignInClick = async () => {
    try {
      setAuthError(null);
      setIsSigningIn(true);
      await onSignIn();
    } catch (err: any) {
      setAuthError(err.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Google Sheets Synchronization
            </h3>
            <p className="text-xs text-slate-500">
              Automatic mirroring of anonymous survey submissions
            </p>
          </div>
        </div>

        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Connection Status Box */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Connection Status:</span>
            {isSheetsConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Active & Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Authentication Required
              </span>
            )}
          </div>

          {user && (
            <div className="text-xs text-slate-700 pt-2 border-t border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">Connected Google Account</span>
                <span className="font-semibold text-slate-900">{user.email || user.displayName}</span>
              </div>
              <button
                onClick={onSignOut}
                className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium"
              >
                <LogOut className="w-3 h-3" />
                <span>Disconnect</span>
              </button>
            </div>
          )}

          {spreadsheetUrl && (
            <div className="text-xs pt-2 border-t border-slate-200/80">
              <span className="text-slate-400 block text-[10px]">Linked Spreadsheet</span>
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-emerald-700 hover:text-emerald-900 flex items-center gap-1 mt-0.5"
              >
                <span>HAPPY HOUR AND ENGAGEMENT SURVEY - Responses</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Action Button: Sign In or Sync Now */}
        {!isSheetsConnected ? (
          <div className="space-y-3 mb-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Sign in with your Google account to grant permission to automatically create 
              and append survey entries to your designated Google Spreadsheet.
            </p>

            {/* Official Google Styled Button */}
            <button
              onClick={handleSignInClick}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm shadow-sm transition active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            <div className="flex gap-2">
              <button
                onClick={onSyncAll}
                disabled={isSyncing}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : `Sync All (${totalResponses} Entries)`}</span>
              </button>

              {spreadsheetUrl && (
                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Sheet</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Transparency & Security Guarantee */}
        <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            Google Workspace scopes are strictly utilized to read and append rows to your survey spreadsheet. 
            No other files or personal records are modified.
          </span>
        </div>
      </div>
    </div>
  );
};
