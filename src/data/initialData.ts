import { SurveyResponse, SurveyStats } from '../types/survey';

export const INITIAL_RESPONSES: SurveyResponse[] = [
  {
    id: 'HH-2026-9041',
    submittedAt: '2026-10-15T16:24:00Z',
    engagementFrequency: 'once_every_2_months',
    engagementComment: 'Having dedicated team-building workshops or off-sites once every 2 months allows deep bonding without meeting fatigue.',
    engagementRating: 4,
    engagementPreferredDays: ['Wednesday', 'Thursday'],

    happyHourFrequency: 'once_a_month',
    happyHourComment: 'Casual happy hours are great once a month on Thursdays after releases so folks can unwind freely.',
    happyHourRating: 5,
    happyHourPreferredDays: ['Thursday'],

    continueHappyHour: 'Yes',
    continueEngagement: 'Yes',
    moraleIdeas: 'Rooftop venues with nice mocktail selections and occasional trivia rounds with mini prizes!',
    confirmationEmail: 'alex.chen@company.internal',
    isAnonymous: true,
    syncedToGoogleSheets: true,
  },
  {
    id: 'HH-2026-8812',
    submittedAt: '2026-10-16T11:10:00Z',
    engagementFrequency: 'once_a_month',
    engagementComment: 'Monthly team engagement sessions (like hack days or skill swaps) keep cross-department collaboration lively.',
    engagementRating: 5,
    engagementPreferredDays: ['Friday'],

    happyHourFrequency: 'once_every_2_months',
    happyHourComment: 'Every 2 months allows us to organize bigger outings like TopGolf or bowling rather than just sitting at a local bar.',
    happyHourRating: 4,
    happyHourPreferredDays: ['Thursday', 'Friday'],

    continueHappyHour: 'Yes',
    continueEngagement: 'Yes',
    moraleIdeas: 'Include activity options like indoor mini-golf, escape rooms, or arcade nights.',
    confirmationEmail: '',
    isAnonymous: true,
    syncedToGoogleSheets: true,
  },
  {
    id: 'HH-2026-7519',
    submittedAt: '2026-10-17T09:45:00Z',
    engagementFrequency: 'once_every_3_months',
    engagementComment: 'Quarterly half-day team engagement retreats give us time to really dive into culture and long-term vision.',
    engagementRating: 4,
    engagementPreferredDays: ['Thursday'],

    happyHourFrequency: 'once_a_month',
    happyHourComment: 'Monthly happy hour is the sweet spot. Keeps informal connections warm across all teams.',
    happyHourRating: 5,
    happyHourPreferredDays: ['Thursday'],

    continueHappyHour: 'Yes',
    continueEngagement: 'Maybe',
    moraleIdeas: 'Outdoor picnic in the park with lawn games when the weather is warm.',
    confirmationEmail: 'sara.k@company.internal',
    isAnonymous: true,
    syncedToGoogleSheets: true,
  },
  {
    id: 'HH-2026-6204',
    submittedAt: '2026-10-17T17:30:00Z',
    engagementFrequency: 'once_every_2_months',
    engagementComment: 'Every 2 months for engagement activities prevents schedule overload while keeping morale high.',
    engagementRating: 4,
    engagementPreferredDays: ['Tuesday', 'Wednesday'],

    happyHourFrequency: 'once_a_month',
    happyHourComment: 'Starting happy hour at 4:30 PM is great so parents and commuters can attend without late-night stress.',
    happyHourRating: 4,
    happyHourPreferredDays: ['Thursday'],

    continueHappyHour: 'Yes',
    continueEngagement: 'Yes',
    moraleIdeas: 'Cooking or pizza-making workshop where everyone participates in making dinner together.',
    confirmationEmail: '',
    isAnonymous: true,
    syncedToGoogleSheets: true,
  },
  {
    id: 'HH-2026-5120',
    submittedAt: '2026-10-18T14:15:00Z',
    engagementFrequency: 'once_a_month',
    engagementComment: 'Monthly engagement activities help new hires integrate quickly into the team spirit.',
    engagementRating: 5,
    engagementPreferredDays: ['Thursday', 'Friday'],

    happyHourFrequency: 'once_a_month',
    happyHourComment: 'Monthly socials foster friendships across departments that usually work in silos.',
    happyHourRating: 5,
    happyHourPreferredDays: ['Friday'],

    continueHappyHour: 'Yes',
    continueEngagement: 'Yes',
    moraleIdeas: 'Boutique brewery patio or cider house with artisan appetizers and comfortable lounge seating.',
    confirmationEmail: 'marcus.t@company.internal',
    isAnonymous: true,
    syncedToGoogleSheets: true,
  },
  {
    id: 'HH-2026-4099',
    submittedAt: '2026-10-19T08:00:00Z',
    engagementFrequency: 'once_every_2_months',
    engagementComment: 'Focusing on quality experiences over frequency makes each engagement event feel special.',
    engagementRating: 4,
    engagementPreferredDays: ['Wednesday', 'Thursday'],

    happyHourFrequency: 'once_every_2_months',
    happyHourComment: 'Every 2 months means higher attendance and excitement each time.',
    happyHourRating: 4,
    happyHourPreferredDays: ['Thursday'],

    continueHappyHour: 'Maybe',
    continueEngagement: 'Yes',
    moraleIdeas: 'Company subsidy for rideshares home after events gives peace of mind.',
    confirmationEmail: 'jordan.lee@company.internal',
    isAnonymous: true,
    syncedToGoogleSheets: true,
  },
];

export const calculateStats = (responses: SurveyResponse[]): SurveyStats => {
  const total = responses.length;
  if (total === 0) {
    return {
      totalResponses: 0,
      engagementFreqBreakdown: { monthly: 0, biMonthly: 0, triMonthly: 0 },
      avgEngagementRating: 0,
      topEngagementDays: [],
      happyHourFreqBreakdown: { monthly: 0, biMonthly: 0, triMonthly: 0 },
      avgHappyHourRating: 0,
      topHappyHourDays: [],
      continueHappyHourStats: { yes: 0, no: 0, maybe: 0 },
      continueEngagementStats: { yes: 0, no: 0, maybe: 0 },
    };
  }

  // Engagement calculations
  const engMonthly = responses.filter((r) => r.engagementFrequency === 'once_a_month').length;
  const engBiMonthly = responses.filter((r) => r.engagementFrequency === 'once_every_2_months').length;
  const engTriMonthly = responses.filter((r) => r.engagementFrequency === 'once_every_3_months').length;
  const engTotalRating = responses.reduce((acc, r) => acc + (r.engagementRating || 0), 0);

  const engDayMap: Record<string, number> = {};
  responses.forEach((r) => {
    (r.engagementPreferredDays || []).forEach((day) => {
      engDayMap[day] = (engDayMap[day] || 0) + 1;
    });
  });
  const topEngagementDays = Object.entries(engDayMap)
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => b.count - a.count);

  // Happy hour calculations
  const hhMonthly = responses.filter((r) => r.happyHourFrequency === 'once_a_month').length;
  const hhBiMonthly = responses.filter((r) => r.happyHourFrequency === 'once_every_2_months').length;
  const hhTriMonthly = responses.filter((r) => r.happyHourFrequency === 'once_every_3_months').length;
  const hhTotalRating = responses.reduce((acc, r) => acc + (r.happyHourRating || 0), 0);

  const hhDayMap: Record<string, number> = {};
  responses.forEach((r) => {
    (r.happyHourPreferredDays || []).forEach((day) => {
      hhDayMap[day] = (hhDayMap[day] || 0) + 1;
    });
  });
  const topHappyHourDays = Object.entries(hhDayMap)
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => b.count - a.count);

  // Section 3: Continue Questions
  const hhYes = responses.filter((r) => r.continueHappyHour === 'Yes').length;
  const hhNo = responses.filter((r) => r.continueHappyHour === 'No').length;
  const hhMaybe = responses.filter((r) => r.continueHappyHour === 'Maybe').length;

  const engYes = responses.filter((r) => r.continueEngagement === 'Yes').length;
  const engNo = responses.filter((r) => r.continueEngagement === 'No').length;
  const engMaybe = responses.filter((r) => r.continueEngagement === 'Maybe').length;

  return {
    totalResponses: total,
    engagementFreqBreakdown: {
      monthly: Math.round((engMonthly / total) * 100),
      biMonthly: Math.round((engBiMonthly / total) * 100),
      triMonthly: Math.round((engTriMonthly / total) * 100),
    },
    avgEngagementRating: Number((engTotalRating / total).toFixed(1)),
    topEngagementDays,
    happyHourFreqBreakdown: {
      monthly: Math.round((hhMonthly / total) * 100),
      biMonthly: Math.round((hhBiMonthly / total) * 100),
      triMonthly: Math.round((hhTriMonthly / total) * 100),
    },
    avgHappyHourRating: Number((hhTotalRating / total).toFixed(1)),
    topHappyHourDays,
    continueHappyHourStats: {
      yes: Math.round((hhYes / total) * 100),
      no: Math.round((hhNo / total) * 100),
      maybe: Math.round((hhMaybe / total) * 100),
    },
    continueEngagementStats: {
      yes: Math.round((engYes / total) * 100),
      no: Math.round((engNo / total) * 100),
      maybe: Math.round((engMaybe / total) * 100),
    },
  };
};
