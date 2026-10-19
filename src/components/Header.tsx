import React from 'react';
import { Calendar, Bell, FileSpreadsheet, BarChart3, PenLine, Sparkles, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: 'survey' | 'dashboard';
  setActiveTab: (tab: 'survey' | 'dashboard') => void;
  responseCount: number;
  isSheetsConnected: boolean;
  onOpenSheetsModal: () => void;
  onOpenNotificationsModal: () => void;
  notificationsEnabled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
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
        {/* Brand / Title */}
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
            </div>
            <p className="text-xs text-slate-400">
              Team social cadence, morale activities & automatic Google Sheets sync
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center flex-wrap gap-2 justify-between md:justify-end">
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

          {/* Google Sheets Sync Pill */}
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

          {/* Push Notification Reminders Pill */}
          <button
            onClick={onOpenNotificationsModal}
            title="Configure Push Reminders"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              notificationsEnabled
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/50'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Bell className={`w-3.5 h-3.5 ${notificationsEnabled ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Reminders</span>
          </button>
        </div>
      </div>
    </header>
  );
};
