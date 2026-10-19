import React, { useState } from 'react';
import { 
  FileDown, 
  FileSpreadsheet, 
  TrendingUp, 
  Users, 
  Calendar, 
  Star, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  PartyPopper,
  GlassWater,
  HelpCircle
} from 'lucide-react';
import { SurveyResponse, SurveyStats, CadenceOption } from '../types/survey';
import { exportToCSV, exportToPDF } from '../services/exportService';

interface ManagementDashboardProps {
  responses: SurveyResponse[];
  stats: SurveyStats;
  isSheetsConnected: boolean;
  googleSheetUrl: string | null;
  onOpenSheetsModal: () => void;
  onSyncAllWithSheets: () => Promise<void>;
  isSyncing: boolean;
}

const formatCadence = (c: CadenceOption): string => {
  switch (c) {
    case 'once_a_month':
      return 'Once a Month';
    case 'once_every_2_months':
      return 'Once Every 2 Months';
    case 'once_every_3_months':
      return 'Once every 3 Months';
    default:
      return c;
  }
};

export const ManagementDashboard: React.FC<ManagementDashboardProps> = ({
  responses,
  stats,
  isSheetsConnected,
  googleSheetUrl,
  onOpenSheetsModal,
  onSyncAllWithSheets,
  isSyncing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const filteredResponses = responses.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      (r.engagementComment || '').toLowerCase().includes(term) ||
      (r.happyHourComment || '').toLowerCase().includes(term) ||
      (r.moraleIdeas || '').toLowerCase().includes(term) ||
      (r.continueHappyHour || '').toLowerCase().includes(term) ||
      (r.continueEngagement || '').toLowerCase().includes(term) ||
      r.id.toLowerCase().includes(term)
    );
  });

  const handleExportCSV = () => {
    exportToCSV(responses);
    setExportNotice('CSV dataset downloaded successfully!');
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleExportPDF = () => {
    exportToPDF(responses, stats);
    setExportNotice('Executive Leadership PDF report generated & downloaded!');
    setTimeout(() => setExportNotice(null), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-7 text-white shadow-lg border border-slate-700/80 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Leadership Analytics & Decision Support</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            HAPPY HOUR & ENGAGEMENT SURVEY REPORT
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            100% Anonymous Feedback (Responses are pooled without names) to determine event cadence, 
            evaluate continuation preferences, and plan future team gatherings.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Export PDF Report</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-semibold text-xs sm:text-sm transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {googleSheetUrl ? (
            <a
              href={googleSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-950/70 border border-emerald-600/50 hover:bg-emerald-900 text-emerald-300 text-xs sm:text-sm font-semibold transition"
            >
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <span>Open Google Sheet</span>
            </a>
          ) : (
            <button
              onClick={onOpenSheetsModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-400" />
              <span>Connect Google Sheets</span>
            </button>
          )}
        </div>
      </div>

      {exportNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs sm:text-sm flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* High-level KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Responses</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.totalResponses}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Pooled anonymously</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Engagement Rating</span>
            <Star className="w-4 h-4 text-indigo-500 fill-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600">
            {stats.avgEngagementRating.toFixed(1)} <span className="text-base text-slate-400 font-normal">/ 5</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Overall enjoyment</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Happy Hour Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {stats.avgHappyHourRating.toFixed(1)} <span className="text-base text-slate-400 font-normal">/ 5</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Overall enjoyment</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Top Day</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {stats.topHappyHourDays[0]?.day || 'Thursday'}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Preferred by team</span>
        </div>
      </div>

      {/* Section 3 Continuation Preferences Card Grid */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-base">
            Section 3: Event Continuation Preferences
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Question 1 Stats */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
            <span className="text-xs font-bold text-amber-900 block">
              1. Happy Hour: Continue organizing Happy Hour events?
            </span>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pt-1">
              <span className="text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                Yes: <strong>{stats.continueHappyHourStats.yes}%</strong>
              </span>
              <span className="text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                Maybe: <strong>{stats.continueHappyHourStats.maybe}%</strong>
              </span>
              <span className="text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg">
                No: <strong>{stats.continueHappyHourStats.no}%</strong>
              </span>
            </div>
          </div>

          {/* Question 2 Stats */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
            <span className="text-xs font-bold text-indigo-900 block">
              2. Engagement: Continue employee engagement activities?
            </span>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pt-1">
              <span className="text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                Yes: <strong>{stats.continueEngagementStats.yes}%</strong>
              </span>
              <span className="text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                Maybe: <strong>{stats.continueEngagementStats.maybe}%</strong>
              </span>
              <span className="text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg">
                No: <strong>{stats.continueEngagementStats.no}%</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Track Breakdown: Engagement vs Happy Hour */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Card 1: Engagement Activity Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Engagement Activity Cadence
              </h3>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
              Avg: {stats.avgEngagementRating.toFixed(1)} ★
            </span>
          </div>

          {/* Visual Percentage Breakdown Bar */}
          <div className="space-y-2">
            <div className="h-6 w-full bg-slate-100 rounded-lg overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${stats.engagementFreqBreakdown.monthly}%` }}
                className="bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center transition-all duration-500"
              >
                {stats.engagementFreqBreakdown.monthly > 15 && `Monthly (${stats.engagementFreqBreakdown.monthly}%)`}
              </div>
              <div
                style={{ width: `${stats.engagementFreqBreakdown.biMonthly}%` }}
                className="bg-indigo-400 text-white font-bold text-[10px] flex items-center justify-center transition-all duration-500"
              >
                {stats.engagementFreqBreakdown.biMonthly > 15 && `2 Mos (${stats.engagementFreqBreakdown.biMonthly}%)`}
              </div>
              <div
                style={{ width: `${stats.engagementFreqBreakdown.triMonthly}%` }}
                className="bg-indigo-200 text-indigo-900 font-bold text-[10px] flex items-center justify-center transition-all duration-500"
              >
                {stats.engagementFreqBreakdown.triMonthly > 15 && `3 Mos (${stats.engagementFreqBreakdown.triMonthly}%)`}
              </div>
            </div>

            <div className="flex justify-between text-[11px] text-slate-600 pt-1">
              <span>Once a Month: <strong>{stats.engagementFreqBreakdown.monthly}%</strong></span>
              <span>Once Every 2 Mos: <strong>{stats.engagementFreqBreakdown.biMonthly}%</strong></span>
              <span>Once every 3 Mos: <strong>{stats.engagementFreqBreakdown.triMonthly}%</strong></span>
            </div>
          </div>

          {/* Preferred Days for Engagement */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2">
              Preferred Days of Week (Monday - Friday):
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {stats.topEngagementDays.map((d) => (
                <span
                  key={d.day}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-100 text-xs font-medium"
                >
                  {d.day}: <strong>{d.count}</strong>
                </span>
              ))}
            </div>
          </div>

          {/* Sample Engagement Comments */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-2">
              Feedback for Engagement (Comments & Recommendations):
            </h4>
            <div className="space-y-2">
              {responses.slice(0, 2).map((r) => (
                <div key={r.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs italic text-slate-700">
                  "{r.engagementComment}"
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Happy Hour Activity Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <GlassWater className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Happy Hour Activity Cadence
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full">
              Avg: {stats.avgHappyHourRating.toFixed(1)} ★
            </span>
          </div>

          {/* Visual Percentage Breakdown Bar */}
          <div className="space-y-2">
            <div className="h-6 w-full bg-slate-100 rounded-lg overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${stats.happyHourFreqBreakdown.monthly}%` }}
                className="bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center transition-all duration-500"
              >
                {stats.happyHourFreqBreakdown.monthly > 15 && `Monthly (${stats.happyHourFreqBreakdown.monthly}%)`}
              </div>
              <div
                style={{ width: `${stats.happyHourFreqBreakdown.biMonthly}%` }}
                className="bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center transition-all duration-500"
              >
                {stats.happyHourFreqBreakdown.biMonthly > 15 && `2 Mos (${stats.happyHourFreqBreakdown.biMonthly}%)`}
              </div>
              <div
                style={{ width: `${stats.happyHourFreqBreakdown.triMonthly}%` }}
                className="bg-amber-200 text-amber-950 font-bold text-[10px] flex items-center justify-center transition-all duration-500"
              >
                {stats.happyHourFreqBreakdown.triMonthly > 15 && `3 Mos (${stats.happyHourFreqBreakdown.triMonthly}%)`}
              </div>
            </div>

            <div className="flex justify-between text-[11px] text-slate-600 pt-1">
              <span>Once a Month: <strong>{stats.happyHourFreqBreakdown.monthly}%</strong></span>
              <span>Once Every 2 Mos: <strong>{stats.happyHourFreqBreakdown.biMonthly}%</strong></span>
              <span>Once every 3 Mos: <strong>{stats.happyHourFreqBreakdown.triMonthly}%</strong></span>
            </div>
          </div>

          {/* Preferred Days for Happy Hour */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2">
              Preferred Days of Week (Monday - Friday):
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {stats.topHappyHourDays.map((d) => (
                <span
                  key={d.day}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium"
                >
                  {d.day}: <strong>{d.count}</strong>
                </span>
              ))}
            </div>
          </div>

          {/* Sample Happy Hour Comments */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-2">
              Feedback for Happy Hour (Comments & Recommendations):
            </h4>
            <div className="space-y-2">
              {responses.slice(0, 2).map((r) => (
                <div key={r.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs italic text-slate-700">
                  "{r.happyHourComment}"
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Morale Boost Ideas Spotlight */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-900 text-base">
            Other Ideas to Boost Team Spirit for Engagement and Happy Hour
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {responses.slice(0, 6).map((r) => (
            <div key={r.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-1">
              <span className="font-mono text-[10px] text-slate-400 block">{r.id}</span>
              <p className="text-slate-800 font-medium">
                {r.moraleIdeas || 'No specific idea submitted.'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filterable Responses Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Submitted Anonymous Feedback ({filteredResponses.length})
            </h3>
            <p className="text-xs text-slate-500">
              100% Anonymous Feedback (Responses are pooled without names)
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search feedback..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-amber-500 outline-none w-56"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Ref ID & Date</th>
                <th className="py-3 px-4 font-semibold">Engagement Activity</th>
                <th className="py-3 px-4 font-semibold">Happy Hour Activity</th>
                <th className="py-3 px-4 font-semibold">Continue?</th>
                <th className="py-3 px-4 font-semibold">Other Ideas for Team Spirit</th>
                <th className="py-3 px-4 font-semibold">Google Sheet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResponses.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-slate-900 block">{r.id}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(r.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        {formatCadence(r.engagementFrequency)}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-700">
                        ★ {r.engagementRating}.0
                      </span>
                    </div>
                    <p className="text-slate-700 italic line-clamp-2">
                      "{r.engagementComment}"
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Days: {(r.engagementPreferredDays || []).join(', ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {formatCadence(r.happyHourFrequency)}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-700">
                        ★ {r.happyHourRating}.0
                      </span>
                    </div>
                    <p className="text-slate-700 italic line-clamp-2">
                      "{r.happyHourComment}"
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Days: {(r.happyHourPreferredDays || []).join(', ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="space-y-1 text-[11px]">
                      <div>
                        <span className="text-slate-400">HH: </span>
                        <span className="font-bold text-amber-800">{r.continueHappyHour || 'Yes'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Eng: </span>
                        <span className="font-bold text-indigo-800">{r.continueEngagement || 'Yes'}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-slate-800 font-medium line-clamp-2">
                      {r.moraleIdeas || <span className="text-slate-400 italic">None</span>}
                    </p>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      Synced
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
