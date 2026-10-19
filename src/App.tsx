import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { SurveyForm } from './components/SurveyForm';
import { SubmissionSuccess } from './components/SubmissionSuccess';
import { ManagementDashboard } from './components/ManagementDashboard';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { NotificationModal } from './components/NotificationModal';
import { SurveyResponse, NotificationSettings } from './types/survey';
import { INITIAL_RESPONSES, calculateStats } from './data/initialData';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken 
} from './services/auth';
import { 
  appendResponseToSheet, 
  syncBatchResponsesToSheet, 
  getStoredSheetConfig 
} from './services/googleSheets';
import { 
  getStoredNotificationSettings, 
  saveNotificationSettings 
} from './services/notifications';
import { Bell, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'hh_survey_responses_v2';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'survey' | 'dashboard'>('survey');
  const [submittedResponse, setSubmittedResponse] = useState<SurveyResponse | null>(null);

  // Survey Data State
  const [responses, setResponses] = useState<SurveyResponse[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load responses from local storage:', e);
    }
    return INITIAL_RESPONSES;
  });

  // Auth & Google Sheets State
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSheetsConnected, setIsSheetsConnected] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string | null>(() => {
    return getStoredSheetConfig().url;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Modals
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() =>
    getStoredNotificationSettings()
  );

  // Calculate live statistics
  const stats = calculateStats(responses);

  // Persist responses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(responses));
    } catch (e) {
      console.error('Failed to save responses:', e);
    }
  }, [responses]);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setIsSheetsConnected(true);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setIsSheetsConnected(false);
      }
    );

    const storedSheet = getStoredSheetConfig();
    if (storedSheet.url) {
      setGoogleSheetUrl(storedSheet.url);
    }

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    const result = await googleSignIn();
    if (result) {
      setUser(result.user);
      setAccessToken(result.accessToken);
      setIsSheetsConnected(true);
      // Auto-sync existing responses
      try {
        const syncResult = await syncBatchResponsesToSheet(responses, result.accessToken);
        setGoogleSheetUrl(syncResult.spreadsheetUrl);
        setSyncToast(`Connected! Synced ${syncResult.syncedCount} survey entries to Google Sheets.`);
        setTimeout(() => setSyncToast(null), 4000);
      } catch (err) {
        console.warn('Initial sheet sync notice:', err);
      }
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setIsSheetsConnected(false);
  };

  // Handle Survey Form Submission
  const handleFormSubmit = async (
    formData: Omit<SurveyResponse, 'id' | 'submittedAt' | 'syncedToGoogleSheets'>
  ) => {
    setIsSubmitting(true);
    try {
      const newId = `HH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newResponse: SurveyResponse = {
        ...formData,
        id: newId,
        submittedAt: new Date().toISOString(),
        syncedToGoogleSheets: false,
      };

      // Attempt live sync to Google Sheets if token is present
      const currentToken = accessToken || (await getAccessToken());
      if (currentToken) {
        try {
          const sheetResult = await appendResponseToSheet(newResponse, currentToken);
          newResponse.syncedToGoogleSheets = true;
          setGoogleSheetUrl(sheetResult.spreadsheetUrl);
        } catch (syncErr) {
          console.warn('Google Sheets sync queued locally:', syncErr);
        }
      }

      setResponses((prev) => [newResponse, ...prev]);
      setSubmittedResponse(newResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Batch Sync All Responses
  const handleSyncAllWithSheets = async () => {
    setIsSyncing(true);
    try {
      const currentToken = accessToken || (await getAccessToken());
      if (!currentToken) {
        setIsSheetsModalOpen(true);
        setIsSyncing(false);
        return;
      }

      const res = await syncBatchResponsesToSheet(responses, currentToken);
      setGoogleSheetUrl(res.spreadsheetUrl);
      setIsSheetsConnected(true);
      setResponses((prev) =>
        prev.map((item) => ({ ...item, syncedToGoogleSheets: true }))
      );
      setSyncToast(`Successfully synced ${res.syncedCount} responses into Google Sheet!`);
      setTimeout(() => setSyncToast(null), 4000);
    } catch (err: any) {
      setSyncToast(`Sync error: ${err.message || 'Failed to update Google Sheet'}`);
      setTimeout(() => setSyncToast(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Global Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSubmittedResponse(null);
        }}
        responseCount={responses.length}
        isSheetsConnected={isSheetsConnected}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenNotificationsModal={() => setIsNotifModalOpen(true)}
        notificationsEnabled={notificationSettings.enabled}
      />

      {/* Reminder Banner if Notifications Enabled */}
      {notificationSettings.enabled && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 border-b border-amber-600/40">
          <Bell className="w-3.5 h-3.5 animate-bounce" />
          <span>
            Survey deadline reminder set for{' '}
            {new Date(notificationSettings.deadlineDate).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            . Encourage team members to submit before cutoff!
          </span>
          <button
            onClick={() => setIsNotifModalOpen(true)}
            className="underline hover:text-slate-800 ml-1 font-bold"
          >
            Manage
          </button>
        </div>
      )}

      {/* Global Sync Toast */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl flex items-center gap-3 animate-fadeIn text-xs sm:text-sm max-w-md">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'survey' ? (
          submittedResponse ? (
            <SubmissionSuccess
              response={submittedResponse}
              onReset={() => setSubmittedResponse(null)}
              onViewDashboard={() => {
                setSubmittedResponse(null);
                setActiveTab('dashboard');
              }}
              googleSheetUrl={googleSheetUrl}
            />
          ) : (
            <SurveyForm
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
              isSheetsConnected={isSheetsConnected}
            />
          )
        ) : (
          <ManagementDashboard
            responses={responses}
            stats={stats}
            isSheetsConnected={isSheetsConnected}
            googleSheetUrl={googleSheetUrl}
            onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
            onSyncAllWithSheets={handleSyncAllWithSheets}
            isSyncing={isSyncing}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">HAPPY HOUR AND ENGAGEMENT SURVEY</span>
            <span className="text-slate-300">|</span>
            <span>Anonymous Employee Feedback System</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsSheetsModalOpen(true)}
              className="hover:text-slate-900 transition flex items-center gap-1"
            >
              Google Sheets Sync
            </button>
            <button
              onClick={() => setIsNotifModalOpen(true)}
              className="hover:text-slate-900 transition flex items-center gap-1"
            >
              Push Reminders
            </button>
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setSubmittedResponse(null);
              }}
              className="hover:text-slate-900 transition flex items-center gap-1"
            >
              Executive Report
            </button>
          </div>
        </div>
      </footer>

      {/* Google Sheets Modal */}
      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        user={user}
        isSheetsConnected={isSheetsConnected}
        spreadsheetUrl={googleSheetUrl}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        onSyncAll={handleSyncAllWithSheets}
        isSyncing={isSyncing}
        totalResponses={responses.length}
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        settings={notificationSettings}
        onUpdateSettings={setNotificationSettings}
      />
    </div>
  );
}
