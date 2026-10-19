import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  ArrowLeft, 
  BarChart3
} from 'lucide-react';
import { SurveyResponse, CadenceOption } from '../types/survey';
import { jsPDF } from 'jspdf';

interface SubmissionSuccessProps {
  response: SurveyResponse;
  onReset: () => void;
  onViewDashboard: () => void;
  googleSheetUrl: string | null;
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

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({
  response,
  onReset,
  onViewDashboard,
  googleSheetUrl,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#6366f1', '#10b981'],
    });
  }, []);

  const confirmationSlipText = `================================================
HAPPY HOUR AND ENGAGEMENT SURVEY
================================================
Reference ID: ${response.id}
Timestamp: ${new Date(response.submittedAt).toLocaleString()}
100% Anonymous Feedback (Responses are pooled without names)

ENGAGEMENT ACTIVITY:
- Frequency: ${formatCadence(response.engagementFrequency)}
- Comments & Recommendation: "${response.engagementComment || 'None'}"
- Overall Enjoyment Rating: ${response.engagementRating} / 5 Stars
- Preferred Days: ${(response.engagementPreferredDays || []).join(', ') || 'Monday - Friday'}

HAPPY HOUR ACTIVITY:
- Frequency: ${formatCadence(response.happyHourFrequency)}
- Comments & Recommendation: "${response.happyHourComment || 'None'}"
- Overall Enjoyment Rating: ${response.happyHourRating} / 5 Stars
- Preferred Days: ${(response.happyHourPreferredDays || []).join(', ') || 'Monday - Friday'}

SECTION 3 - CONTINUATION VOTING:
- Continue Happy Hour Events: ${response.continueHappyHour || 'Yes'}
- Continue Engagement Activities: ${response.continueEngagement || 'Yes'}

OTHER IDEAS TO BOOST TEAM SPIRIT:
"${response.moraleIdeas || 'None'}"
================================================`;

  const handleCopySlip = () => {
    navigator.clipboard.writeText(confirmationSlipText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPersonalReceiptPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a5',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 28;
    let y = 35;

    doc.setFillColor(30, 41, 59);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 60, 6, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('Happy Hour and Engagment Survey', margin + 14, y + 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text('100% Anonymous Feedback (Responses are pooled without names)', margin + 14, y + 42);

    y += 80;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Verification ID: ${response.id}`, margin, y);
    y += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Submitted On: ${new Date(response.submittedAt).toLocaleString()}`, margin, y);
    y += 20;

    // Engagement Activity Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 85, 4, 4, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.text('ENGAGEMENT ACTIVITY', margin + 10, y + 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Frequency: ${formatCadence(response.engagementFrequency)}  |  Rating: ${response.engagementRating} / 5 Stars`, margin + 10, y + 29);
    doc.text(`Preferred Days: ${(response.engagementPreferredDays || []).join(', ')}`, margin + 10, y + 43);

    const engLines = doc.splitTextToSize(`Comments: "${response.engagementComment || 'None'}"`, pageWidth - margin * 2 - 20);
    doc.text(engLines, margin + 10, y + 57);

    y += 95;

    // Happy Hour Activity Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 85, 4, 4, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(217, 119, 6);
    doc.text('HAPPY HOUR ACTIVITY', margin + 10, y + 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Frequency: ${formatCadence(response.happyHourFrequency)}  |  Rating: ${response.happyHourRating} / 5 Stars`, margin + 10, y + 29);
    doc.text(`Preferred Days: ${(response.happyHourPreferredDays || []).join(', ')}`, margin + 10, y + 43);

    const hhLines = doc.splitTextToSize(`Comments: "${response.happyHourComment || 'None'}"`, pageWidth - margin * 2 - 20);
    doc.text(hhLines, margin + 10, y + 57);

    y += 95;

    // Continuation Voting
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Event Continuation Voting:', margin, y);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`• Continue Happy Hour: ${response.continueHappyHour || 'Yes'}`, margin, y);
    y += 11;
    doc.text(`• Continue Engagement Activities: ${response.continueEngagement || 'Yes'}`, margin, y);
    y += 16;

    // Morale Ideas
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Other Ideas to Boost Team Spirit:', margin, y);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const mLines = doc.splitTextToSize(response.moraleIdeas || 'None', pageWidth - margin * 2);
    doc.text(mLines, margin, y);

    doc.save(`Survey_Receipt_${response.id}.pdf`);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
      <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-xl border border-slate-200 text-center relative overflow-hidden">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% Anonymous Feedback (Responses are pooled without names)</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
          Thank You For Your Feedback!
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6">
          Your feedback has been recorded. 
          Your preferred cadence and ideas will guide our upcoming planning committee!
        </p>

        {/* Verification Card */}
        <div className="bg-slate-50 rounded-2xl p-5 text-left border border-slate-200 mb-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Verification Reference ID
              </span>
              <span className="font-mono font-bold text-slate-900 text-base">
                {response.id}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Timestamp
              </span>
              <span className="text-xs text-slate-600 font-medium">
                {new Date(response.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Engagement Activity Summary */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-indigo-700 block">
              Engagement Activity:
            </span>
            <div className="flex justify-between text-slate-600">
              <span>Frequency: <strong>{formatCadence(response.engagementFrequency)}</strong></span>
              <span>Rating: <strong>{response.engagementRating} / 5 Stars</strong></span>
            </div>
            <div className="text-slate-500 text-[11px]">
              Days: {(response.engagementPreferredDays || []).join(', ')}
            </div>
            {response.engagementComment && (
              <p className="text-slate-700 italic pt-1 border-t border-slate-100">
                "{response.engagementComment}"
              </p>
            )}
          </div>

          {/* Happy Hour Activity Summary */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-amber-700 block">
              Happy Hour Activity:
            </span>
            <div className="flex justify-between text-slate-600">
              <span>Frequency: <strong>{formatCadence(response.happyHourFrequency)}</strong></span>
              <span>Rating: <strong>{response.happyHourRating} / 5 Stars</strong></span>
            </div>
            <div className="text-slate-500 text-[11px]">
              Days: {(response.happyHourPreferredDays || []).join(', ')}
            </div>
            {response.happyHourComment && (
              <p className="text-slate-700 italic pt-1 border-t border-slate-100">
                "{response.happyHourComment}"
              </p>
            )}
          </div>

          {/* Continuation Voting Summary */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-800 block">
              Section 3 - Event Continuation:
            </span>
            <div className="grid grid-cols-2 gap-2 text-slate-600 pt-0.5">
              <div>
                <span className="text-slate-400 block text-[10px]">Continue Happy Hour?</span>
                <span className="font-bold text-amber-800">{response.continueHappyHour || 'Yes'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Continue Engagement?</span>
                <span className="font-bold text-indigo-800">{response.continueEngagement || 'Yes'}</span>
              </div>
            </div>
          </div>

          {response.moraleIdeas && (
            <div className="text-xs text-slate-700">
              <span className="text-slate-400 block text-[11px] font-semibold">Other Ideas to Boost Team Spirit:</span>
              <p className="bg-white p-2.5 rounded-lg border border-slate-200 mt-1">
                {response.moraleIdeas}
              </p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
          <button
            onClick={handleCopySlip}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-sm transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPersonalReceiptPDF}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download PDF</span>
          </button>

          {googleSheetUrl && (
            <a
              href={googleSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 text-xs font-semibold shadow-sm transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              <span>View Google Sheet</span>
            </a>
          )}
        </div>

        {/* Navigation bottom */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Submit another survey response</span>
          </button>

          <button
            onClick={onViewDashboard}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>View Management Trends & Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};
