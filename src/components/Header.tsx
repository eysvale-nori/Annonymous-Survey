import React from 'react';
import { 
  Bell, 
  FileSpreadsheet, 
  BarChart3, 
  PenLine, 
  ShieldCheck, 
  Lock, 
  LogOut,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  isEmployer: boolean;
  onOpenEmployerLogin: () => void;
  onEmployerLogout: () => void;
  activeTab: 'survey' | 'dashboard';
  setActiveTab: (tab: 'survey' | 'dashboard') => void;
  responseCount: number;
  isSheetsConnected: boolean;
  onOpenSheetsModal: () => void;
  onOpenNotificationsModal: () => void;
  notificationsEnabled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isEmployer,
  onOpenEmployerLogin,
  onEmployerLogout,
  activeTab,
  setActiveTab,
  responseCount,
  isSheetsConnected,
  onOpenSheetsModal,
  onOpenNotificationsModal,
  notificationsEnabled,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white transition-all shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-black text-xl shrink-0">
            🥂
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                HAPPY HOUR AND ENGAGEMENT SURVEY
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" /> Anonymous
              </span>
              {isEmployer && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Employer Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isEmployer
                ? 'Executive management analytics, response trends & Google Sheets integration'
                : 'Your anonymous voice shapes our team cadence and social activities'}
            </p>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center flex-wrap gap-2 justify-between md:justify-end">
          {isEmployer ? (
            /* EMPLOYER VIEW: Show Tabs, Google Sheets, and Logout */
            <>
              {/* View Switcher Tabs */}
              <div className="inline-flex rounded-lg bg-slate-800 p-1 border border-slate-700/80">
                <button
                  onClick={() => setActiveTab('survey')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                    activeTab === 'survey'
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <PenLine className="w-3.5 h-3.5" />
                  <span>Survey Form</span>
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Management Report</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/80 text-amber-300 border border-amber-500/30">
                    {responseCount}
                  </span>
                </button>
              </div>

              {/* Google Sheets Sync Button */}
              <button
                onClick={onOpenSheetsModal}
                title="Google Sheets Auto-Sync Status"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isSheetsConnected
                    ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/50'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <FileSpreadsheet className={`w-3.5 h-3.5 ${isSheetsConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">Google Sheets</span>
                <span className={`w-2 h-2 rounded-full ${isSheetsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              </button>

              {/* Exit Employer Mode */}
              <button
                onClick={onEmployerLogout}
                title="Exit Employer Mode"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 hover:border-rose-800/50 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit Mode</span>
              </button>
            </>
          ) : (
            /* EMPLOYEE VIEW: Survey Form Only (No Management Report, No Google Sheet) */
            <>
              {/* Push Notification Reminders */}
              <button
                onClick={onOpenNotificationsModal}
                title="Configure Submission Reminders"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  notificationsEnabled
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/50'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Bell className={`w-3.5 h-3.5 ${notificationsEnabled ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>Remind Me</span>
              </button>

              {/* Discreet Employer Access Button */}
              <button
                onClick={onOpenEmployerLogin}
                title="Employer Login"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Employer Access</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
