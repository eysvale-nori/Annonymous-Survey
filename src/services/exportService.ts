import { jsPDF } from 'jspdf';
import { SurveyResponse, SurveyStats, CadenceOption } from '../types/survey';

const escapeCsvCell = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

const formatCadence = (c: CadenceOption): string => {
  switch (c) {
    case 'once_a_month':
      return 'Once a Month';
    case 'once_every_2_months':
      return 'Once Every 2 Months';
    case 'once_every_3_months':
      return 'Once Every 3 Months';
    default:
      return c;
  }
};

/**
 * Copies all responses formatted as TSV for immediate 1-click paste into Google Sheets
 */
export const copyTableForGoogleSheets = async (responses: SurveyResponse[]): Promise<boolean> => {
  const headers = [
    'Response ID',
    'Date Submitted',
    'Engagement Frequency',
    'Engagement Comments & Recommendations',
    'Engagement Rating (1-5 Stars)',
    'Engagement Preferred Days',
    'Happy Hour Frequency',
    'Happy Hour Comments & Recommendations',
    'Happy Hour Rating (1-5 Stars)',
    'Happy Hour Preferred Days',
    'Continue Happy Hour (Yes/No/Maybe)',
    'Continue Engagement (Yes/No/Maybe)',
    'Other Ideas to Boost Team Spirit (Engagement & Happy Hour)',
    'Anonymity Status',
  ];

  const rows = responses.map((r) => [
    r.id,
    new Date(r.submittedAt).toLocaleString(),
    formatCadence(r.engagementFrequency),
    (r.engagementComment || '').replace(/\t|\r?\n/g, ' '),
    r.engagementRating,
    (r.engagementPreferredDays || []).join(', '),
    formatCadence(r.happyHourFrequency),
    (r.happyHourComment || '').replace(/\t|\r?\n/g, ' '),
    r.happyHourRating,
    (r.happyHourPreferredDays || []).join(', '),
    r.continueHappyHour || 'Yes',
    r.continueEngagement || 'Yes',
    (r.moraleIdeas || '').replace(/\t|\r?\n/g, ' '),
    r.isAnonymous ? '100% Anonymous' : 'Identified',
  ]);

  const tsvContent = [
    headers.join('\t'),
    ...rows.map((row) => row.join('\t')),
  ].join('\n');

  try {
    await navigator.clipboard.writeText(tsvContent);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};

/**
 * Exports all responses to CSV matching the specified schema
 */
export const exportToCSV = (responses: SurveyResponse[]) => {
  const headers = [
    'Response ID',
    'Date Submitted',
    'Engagement Frequency',
    'Engagement Comments & Recommendations',
    'Engagement Rating (1-5 Stars)',
    'Engagement Preferred Days',
    'Happy Hour Frequency',
    'Happy Hour Comments & Recommendations',
    'Happy Hour Rating (1-5 Stars)',
    'Happy Hour Preferred Days',
    'Continue Happy Hour (Yes/No/Maybe)',
    'Continue Engagement (Yes/No/Maybe)',
    'Other Ideas to Boost Team Spirit (Engagement & Happy Hour)',
    'Anonymity Status',
  ];

  const rows = responses.map((r) => [
    r.id,
    new Date(r.submittedAt).toLocaleString(),
    formatCadence(r.engagementFrequency),
    r.engagementComment,
    r.engagementRating,
    (r.engagementPreferredDays || []).join('; '),
    formatCadence(r.happyHourFrequency),
    r.happyHourComment,
    r.happyHourRating,
    (r.happyHourPreferredDays || []).join('; '),
    r.continueHappyHour || 'Yes',
    r.continueEngagement || 'Yes',
    r.moraleIdeas,
    r.isAnonymous ? '100% Anonymous' : 'Identified',
  ]);

  const csvContent = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `HAPPY_HOUR_AND_ENGAGEMENT_SURVEY_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generates an executive management PDF report using jsPDF
 */
export const exportToPDF = (responses: SurveyResponse[], stats: SurveyStats) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = 45;

  // Header Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 90, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('HAPPY HOUR AND ENGAGEMENT SURVEY', margin, y);

  y += 22;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  doc.text(`Executive Leadership & Planning Report  |  ${dateFormatted}  |  100% Anonymous Feedback`, margin, y);

  y = 115;

  // Overview Cards: Engagement vs Happy Hour
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('1. Executive Overview & Activity Comparison', margin, y);
  y += 18;

  const cardW = (pageWidth - margin * 2 - 15) / 2;
  const cardH = 80;

  // Engagement Summary Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, cardW, cardH, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(79, 70, 229);
  doc.text('ENGAGEMENT ACTIVITY', margin + 14, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Rating: ${stats.avgEngagementRating.toFixed(1)} / 5.0 Stars`, margin + 14, y + 38);
  doc.text(`Monthly: ${stats.engagementFreqBreakdown.monthly}%  |  Bi-Monthly: ${stats.engagementFreqBreakdown.biMonthly}%  |  3-Months: ${stats.engagementFreqBreakdown.triMonthly}%`, margin + 14, y + 54);
  const topEngDay = stats.topEngagementDays[0]?.day || 'Flexible';
  doc.text(`Preferred Day: ${topEngDay}`, margin + 14, y + 70);

  // Happy Hour Summary Card
  const card2X = margin + cardW + 15;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(card2X, y, cardW, cardH, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(217, 119, 6);
  doc.text('HAPPY HOUR ACTIVITY', card2X + 14, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Rating: ${stats.avgHappyHourRating.toFixed(1)} / 5.0 Stars`, card2X + 14, y + 38);
  doc.text(`Monthly: ${stats.happyHourFreqBreakdown.monthly}%  |  Bi-Monthly: ${stats.happyHourFreqBreakdown.biMonthly}%  |  3-Months: ${stats.happyHourFreqBreakdown.triMonthly}%`, card2X + 14, y + 54);
  const topHHDay = stats.topHappyHourDays[0]?.day || 'Flexible';
  doc.text(`Preferred Day: ${topHHDay}`, card2X + 14, y + 70);

  y += cardH + 22;

  // Section 2: Event Continuation Voting
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Event Continuation Preferences (Section 3 Additional Selection)', margin, y);
  y += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`• Continue Happy Hour: Yes (${stats.continueHappyHourStats.yes}%), Maybe (${stats.continueHappyHourStats.maybe}%), No (${stats.continueHappyHourStats.no}%)`, margin + 10, y);
  y += 14;
  doc.text(`• Continue Engagement Activities: Yes (${stats.continueEngagementStats.yes}%), Maybe (${stats.continueEngagementStats.maybe}%), No (${stats.continueEngagementStats.no}%)`, margin + 10, y);
  y += 20;

  // Section 3: Engagement Comments
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Engagement Activity - Comments & Recommendations', margin, y);
  y += 16;

  const engComments = responses.filter((r) => r.engagementComment?.trim().length > 3).slice(0, 3);
  if (engComments.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('No comments recorded yet.', margin, y);
    y += 14;
  } else {
    engComments.forEach((item) => {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      const textLines = doc.splitTextToSize(`"${item.engagementComment}"`, pageWidth - margin * 2 - 24);
      const boxH = textLines.length * 11 + 16;
      doc.roundedRect(margin, y, pageWidth - margin * 2, boxH, 4, 4, 'FD');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(textLines, margin + 12, y + 14);
      y += boxH + 6;
    });
  }

  y += 14;

  // Section 4: Happy Hour Comments
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Happy Hour Activity - Comments & Recommendations', margin, y);
  y += 16;

  const hhComments = responses.filter((r) => r.happyHourComment?.trim().length > 3).slice(0, 3);
  if (hhComments.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('No comments recorded yet.', margin, y);
    y += 14;
  } else {
    hhComments.forEach((item) => {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      const textLines = doc.splitTextToSize(`"${item.happyHourComment}"`, pageWidth - margin * 2 - 24);
      const boxH = textLines.length * 11 + 16;
      doc.roundedRect(margin, y, pageWidth - margin * 2, boxH, 4, 4, 'FD');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(textLines, margin + 12, y + 14);
      y += boxH + 6;
    });
  }

  y += 14;

  // Section 5: Other Ideas
  if (y > pageHeight - 120) {
    doc.addPage();
    y = 50;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('5. Other Ideas to Boost Team Spirit for Engagement & Happy Hour', margin, y);
  y += 16;

  const moraleIdeas = responses.filter((r) => r.moraleIdeas?.trim().length > 3).slice(0, 4);
  if (moraleIdeas.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('No additional ideas submitted.', margin, y);
    y += 14;
  } else {
    moraleIdeas.forEach((item, idx) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(79, 70, 229);
      doc.text(`Idea #${idx + 1}:`, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      const lines = doc.splitTextToSize(item.moraleIdeas, pageWidth - margin * 2 - 60);
      doc.text(lines, margin + 60, y);
      y += lines.length * 11 + 8;
    });
  }

  // Footer on page
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Confidential - Internal Employee Engagement Report. 100% Anonymous Feedback (Responses are pooled without names).',
    margin,
    pageHeight - 20
  );

  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`HAPPY_HOUR_AND_ENGAGEMENT_SURVEY_${dateStr}.pdf`);
};
