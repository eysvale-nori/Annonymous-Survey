import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  BellRing, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import { 
  getNotificationPermission, 
  requestNotificationPermission, 
  triggerTestNotification, 
  saveNotificationSettings 
} from '../services/notifications';
import { NotificationSettings } from '../types/survey';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onUpdateSettings: (newSettings: NotificationSettings) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [localSettings, setLocalSettings] = useState<NotificationSettings>(settings);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      const updated = { ...localSettings, enabled: true };
      setLocalSettings(updated);
      onUpdateSettings(updated);
      saveNotificationSettings(updated);
    }
  };

  const handleToggleEnable = async (checked: boolean) => {
    if (checked && permission !== 'granted') {
      const res = await requestNotificationPermission();
      setPermission(res);
      if (res !== 'granted') return;
    }

    const updated = { ...localSettings, enabled: checked };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await triggerTestNotification();
    setPermission(getNotificationPermission());
    setTestResult(result.message);
    setIsTesting(false);
    setTimeout(() => setTestResult(null), 5000);
  };

  const handleSave = () => {
    saveNotificationSettings(localSettings);
    onUpdateSettings(localSettings);
    onClose();
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
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-sm">
            <BellRing className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Survey Submission Reminders
            </h3>
            <p className="text-xs text-slate-500">
              Push notifications to maintain high team participation
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Browser Permission:</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              permission === 'granted'
                ? 'bg-emerald-100 text-emerald-800'
                : permission === 'denied'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {permission === 'granted' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              {permission === 'denied' && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
              {permission === 'granted' ? 'Allowed' : permission === 'denied' ? 'Blocked by Browser' : 'Not Requested'}
            </span>
          </div>

          {/* Toggle Enable */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Push Reminders Active</span>
              <span className="text-[11px] text-slate-500">Alert employee before the survey cutoff</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.enabled}
                onChange={(e) => handleToggleEnable(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>

        {/* Schedule & Deadline Config */}
        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Survey Deadline Cutoff:
            </label>
            <input
              type="datetime-local"
              value={localSettings.deadlineDate}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, deadlineDate: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Reminder Schedule:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${
                localSettings.reminderFrequency === 'daily'
                  ? 'border-amber-500 bg-amber-50/70 font-semibold text-amber-900'
                  : 'border-slate-200 text-slate-600'
              }`}>
                <input
                  type="radio"
                  name="freq"
                  checked={localSettings.reminderFrequency === 'daily'}
                  onChange={() => setLocalSettings({ ...localSettings, reminderFrequency: 'daily' })}
                  className="accent-amber-600"
                />
                <span>Daily Digest</span>
              </label>

              <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${
                localSettings.reminderFrequency === 'once_before_deadline'
                  ? 'border-amber-500 bg-amber-50/70 font-semibold text-amber-900'
                  : 'border-slate-200 text-slate-600'
              }`}>
                <input
                  type="radio"
                  name="freq"
                  checked={localSettings.reminderFrequency === 'once_before_deadline'}
                  onChange={() => setLocalSettings({ ...localSettings, reminderFrequency: 'once_before_deadline' })}
                  className="accent-amber-600"
                />
                <span>2 Hours Prior</span>
              </label>
            </div>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div className="mb-4 p-3 rounded-xl bg-slate-100 text-slate-800 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{testResult}</span>
          </div>
        )}

        {/* Test button & Save button */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={handleTestNotification}
            disabled={isTesting}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span>{isTesting ? 'Sending...' : 'Test Push Notification'}</span>
          </button>

          <button
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition cursor-pointer"
          >
            Save Settings
          </button>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            Desktop and mobile notifications appear directly in your device notification tray to maximize response turnout.
          </span>
        </div>
      </div>
    </div>
  );
};
