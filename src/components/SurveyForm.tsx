import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Send, 
  Star, 
  Info,
  GlassWater,
  PartyPopper,
  HelpCircle
} from 'lucide-react';
import { CadenceOption, YesNoMaybe, SurveyResponse } from '../types/survey';

interface SurveyFormProps {
  onSubmit: (response: Omit<SurveyResponse, 'id' | 'submittedAt' | 'syncedToGoogleSheets'>) => Promise<void>;
  isSubmitting: boolean;
  isSheetsConnected?: boolean;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const YES_NO_MAYBE_OPTIONS: YesNoMaybe[] = ['Yes', 'No', 'Maybe'];

export const SurveyForm: React.FC<SurveyFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  // 1. Engagement Activity State
  const [engagementFrequency, setEngagementFrequency] = useState<CadenceOption>('once_every_2_months');
  const [engagementComment, setEngagementComment] = useState('');
  const [engagementRating, setEngagementRating] = useState<number>(5);
  const [engagementPreferredDays, setEngagementPreferredDays] = useState<string[]>(['Thursday', 'Friday']);

  // 2. Happy Hour Activity State
  const [happyHourFrequency, setHappyHourFrequency] = useState<CadenceOption>('once_a_month');
  const [happyHourComment, setHappyHourComment] = useState('');
  const [happyHourRating, setHappyHourRating] = useState<number>(5);
  const [happyHourPreferredDays, setHappyHourPreferredDays] = useState<string[]>(['Thursday']);

  // 3. Section 3: Additional Selection & Ideas
  const [continueHappyHour, setContinueHappyHour] = useState<YesNoMaybe>('Yes');
  const [continueEngagement, setContinueEngagement] = useState<YesNoMaybe>('Yes');
  const [moraleIdeas, setMoraleIdeas] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleDay = (
    day: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(day)) {
      if (list.length > 1) {
        setList(list.filter((d) => d !== day));
      }
    } else {
      setList([...list, day]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      await onSubmit({
        engagementFrequency,
        engagementComment: engagementComment.trim(),
        engagementRating,
        engagementPreferredDays,
        happyHourFrequency,
        happyHourComment: happyHourComment.trim(),
        happyHourRating,
        happyHourPreferredDays,
        continueHappyHour,
        continueEngagement,
        moraleIdeas: moraleIdeas.trim(),
        isAnonymous: true,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit survey. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Employee Survey</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            Happy Hour and Engagment Survey
          </h2>

          <p className="text-sm sm:text-base text-slate-300 mb-5 leading-relaxed">
            Your voice shapes our team gatherings! Help us determine the optimal event cadence, 
            dream up memorable activities, and choose inspiring venues to boost company camaraderie.
          </p>

          {/* Anonymity Banner */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-800/70 p-3 rounded-xl border border-slate-700/60">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white font-medium mr-1.5">100% Anonymous Feedback</strong>
                <span>Responses are pooled without names.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/70 text-rose-200 text-sm flex items-start gap-3 shadow-sm">
          <Info className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Notice</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ======================================================== */}
        {/* TRACK 1: ENGAGEMENT ACTIVITY                             */}
        {/* ======================================================== */}
        <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/90 transition-all hover:border-slate-300">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm">
              <PartyPopper className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">
                Section 1
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Engagement Activity
              </h3>
            </div>
          </div>

          {/* Event Frequency Determination: Engagement Activity */}
          <div className="mb-6">
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
              Event Frequency Determination
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: 'once_a_month', label: 'Once a Month' },
                { value: 'once_every_2_months', label: 'Once Every 2 Months' },
                { value: 'once_every_3_months', label: 'Once every 3 Months' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition text-xs sm:text-sm font-semibold ${
                    engagementFrequency === opt.value
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  <input
                    type="radio"
                    name="engagementFrequency"
                    value={opt.value}
                    checked={engagementFrequency === opt.value}
                    onChange={() => setEngagementFrequency(opt.value as CadenceOption)}
                    className="accent-indigo-600 w-4 h-4"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Feedback for Engagement: Comments and Recommendation */}
          <div className="mb-6">
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
              Feedback for Engagment
            </label>
            <span className="text-xs text-slate-500 block mb-1">
              Comments and Recomendation:
            </span>
            <textarea
              rows={2}
              value={engagementComment}
              onChange={(e) => setEngagementComment(e.target.value)}
              placeholder="Comments and recommendation for engagement activities..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Engagement Experience & Logistics */}
          <div className="pt-4 border-t border-slate-100 space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Engagement Experience & Logistics
            </h4>

            {/* Overall enjoyment rating Engagement */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-2">
                Overall enjoyment rating Engagement
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setEngagementRating(star)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border transition ${
                      engagementRating === star
                        ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${engagementRating >= star ? 'fill-current text-amber-300' : 'text-slate-400'}`} />
                    <span>{star} {star === 1 ? 'Star' : 'Stars'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Days of the Week: Monday- Friday */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                Preferred Days of the Week: Monday- Friday
              </label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => {
                  const isSelected = engagementPreferredDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day, engagementPreferredDays, setEngagementPreferredDays)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        isSelected
                          ? 'bg-indigo-900 border-indigo-900 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected && '✓ '}
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* TRACK 2: HAPPY HOUR ACTIVITY                             */}
        {/* ======================================================== */}
        <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/90 transition-all hover:border-slate-300">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              <GlassWater className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block">
                Section 2
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Happy Hour Activity
              </h3>
            </div>
          </div>

          {/* Event Frequency Determination: Happy Hour Activity */}
          <div className="mb-6">
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
              Event Frequency Determination
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: 'once_a_month', label: 'Once a Month' },
                { value: 'once_every_2_months', label: 'Once Every 2 Months' },
                { value: 'once_every_3_months', label: 'Once every 3 Months' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition text-xs sm:text-sm font-semibold ${
                    happyHourFrequency === opt.value
                      ? 'border-amber-500 bg-amber-50/70 text-amber-950 ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  <input
                    type="radio"
                    name="happyHourFrequency"
                    value={opt.value}
                    checked={happyHourFrequency === opt.value}
                    onChange={() => setHappyHourFrequency(opt.value as CadenceOption)}
                    className="accent-amber-600 w-4 h-4"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Feedback for Happy Hour: Comments and Recommendation */}
          <div className="mb-6">
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
              Feedback for Happy Hour
            </label>
            <span className="text-xs text-slate-500 block mb-1">
              Comments and Recomendation:
            </span>
            <textarea
              rows={2}
              value={happyHourComment}
              onChange={(e) => setHappyHourComment(e.target.value)}
              placeholder="Comments and recommendation for happy hour activities..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>

          {/* Engagement Experience & Logistics: Happy Hour */}
          <div className="pt-4 border-t border-slate-100 space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Engagement Experience & Logistics
            </h4>

            {/* Overall enjoyment rating Happy Hour */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-2">
                Overall enjoyment rating Happy Hour
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setHappyHourRating(star)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border transition ${
                      happyHourRating === star
                        ? 'bg-amber-500 border-amber-600 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${happyHourRating >= star ? 'fill-current text-amber-950' : 'text-slate-400'}`} />
                    <span>{star} {star === 1 ? 'Star' : 'Stars'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Days of the Week: Monday- Friday */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                Preferred Days of the Week: Monday- Friday
              </label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => {
                  const isSelected = happyHourPreferredDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day, happyHourPreferredDays, setHappyHourPreferredDays)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        isSelected
                          ? 'bg-amber-600 border-amber-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected && '✓ '}
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 3: ADDITIONAL SELECTION & OTHER IDEAS            */}
        {/* ======================================================== */}
        <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/90 transition-all hover:border-slate-300 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              ✨
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
                Section 3
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Additional Selection & Team Spirit Ideas
              </h3>
            </div>
          </div>

          {/* Question 1: Happy Hour Continuation */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-3">
              1. Happy Hour: Would you like the company to continue organizing Happy Hour events?
            </label>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              {YES_NO_MAYBE_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 cursor-pointer transition text-xs sm:text-sm font-bold text-center ${
                    continueHappyHour === opt
                      ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="continueHappyHour"
                    value={opt}
                    checked={continueHappyHour === opt}
                    onChange={() => setContinueHappyHour(opt)}
                    className="accent-amber-600 w-4 h-4"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Question 2: Engagement Activities Continuation */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-3">
              2. Engagement Activities: Would you like the company to continue organizing employee engagement activities?
            </label>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              {YES_NO_MAYBE_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 cursor-pointer transition text-xs sm:text-sm font-bold text-center ${
                    continueEngagement === opt
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-600/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="continueEngagement"
                    value={opt}
                    checked={continueEngagement === opt}
                    onChange={() => setContinueEngagement(opt)}
                    className="accent-indigo-600 w-4 h-4"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Other Ideas to Boost Team Spirit for Engagement and Happy Hour */}
          <div className="pt-2">
            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
              Other Ideas to Boost Team Spirit for Enggament and Happy Hour
            </label>
            <textarea
              rows={3}
              value={moraleIdeas}
              onChange={(e) => setMoraleIdeas(e.target.value)}
              placeholder="Share your ideas to boost team spirit for engagement and happy hour..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Anonymous Feedback (Responses are pooled without names)</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-500/25 transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Submitting Feedback...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Anonymous Survey</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
