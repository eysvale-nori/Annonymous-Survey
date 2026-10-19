export type CadenceOption = 'once_a_month' | 'once_every_2_months' | 'once_every_3_months';
export type YesNoMaybe = 'Yes' | 'No' | 'Maybe';

export interface SurveyResponse {
  id: string;
  submittedAt: string; // ISO string

  // Engagement Activity Section
  engagementFrequency: CadenceOption;
  engagementComment: string; // Comments and Recommendation for Engagement
  engagementRating: number; // 1 to 5 Stars
  engagementPreferredDays: string[]; // Monday - Friday

  // Happy Hour Activity Section
  happyHourFrequency: CadenceOption;
  happyHourComment: string; // Comments and Recommendation for Happy Hour
  happyHourRating: number; // 1 to 5 Stars
  happyHourPreferredDays: string[]; // Monday - Friday

  // Section 3: Additional Selection & Ideas
  continueHappyHour: YesNoMaybe;
  continueEngagement: YesNoMaybe;
  moraleIdeas: string; // Other Ideas to Boost Team Spirit for Enggament and Happy Hour

  // Optional Confirmation & Privacy
  confirmationEmail?: string;
  isAnonymous: boolean;
  syncedToGoogleSheets?: boolean;
}

export interface SurveyStats {
  totalResponses: number;
  // Engagement stats
  engagementFreqBreakdown: {
    monthly: number;
    biMonthly: number;
    triMonthly: number;
  };
  avgEngagementRating: number;
  topEngagementDays: { day: string; count: number }[];

  // Happy Hour stats
  happyHourFreqBreakdown: {
    monthly: number;
    biMonthly: number;
    triMonthly: number;
  };
  avgHappyHourRating: number;
  topHappyHourDays: { day: string; count: number }[];

  // Section 3 Continuation breakdown
  continueHappyHourStats: { yes: number; no: number; maybe: number };
  continueEngagementStats: { yes: number; no: number; maybe: number };
}

export interface NotificationSettings {
  enabled: boolean;
  deadlineDate: string;
  reminderFrequency: 'daily' | 'once_before_deadline' | 'custom';
  reminderTime: string;
  lastNotified?: string;
}
