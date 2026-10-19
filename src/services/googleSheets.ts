import { getAccessToken } from './auth';
import { SurveyResponse, CadenceOption } from '../types/survey';

const SHEET_NAME_DEFAULT = 'HAPPY HOUR AND ENGAGEMENT SURVEY - Responses';
const TAB_NAME = 'Responses';

export interface SheetSyncStatus {
  connected: boolean;
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  spreadsheetTitle: string | null;
  lastSyncedAt: string | null;
  error?: string;
}

export const getStoredSheetConfig = (): { id: string | null; url: string | null } => {
  return {
    id: localStorage.getItem('hh_survey_spreadsheet_id'),
    url: localStorage.getItem('hh_survey_spreadsheet_url'),
  };
};

export const saveStoredSheetConfig = (id: string, url: string) => {
  localStorage.setItem('hh_survey_spreadsheet_id', id);
  localStorage.setItem('hh_survey_spreadsheet_url', url);
};

export const clearStoredSheetConfig = () => {
  localStorage.removeItem('hh_survey_spreadsheet_id');
  localStorage.removeItem('hh_survey_spreadsheet_url');
};

const formatCadence = (cadence: CadenceOption): string => {
  switch (cadence) {
    case 'once_a_month':
      return 'Once a Month';
    case 'once_every_2_months':
      return 'Once Every 2 Months';
    case 'once_every_3_months':
      return 'Once every 3 Months';
    default:
      return cadence;
  }
};

/**
 * Ensures a Google Sheet exists for storing survey results.
 */
export const getOrCreateSurveySpreadsheet = async (
  customToken?: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const token = customToken || (await getAccessToken());
  if (!token) {
    throw new Error('Google authentication is required to sync with Google Sheets.');
  }

  // Check stored ID first
  const stored = getStoredSheetConfig();
  if (stored.id) {
    try {
      const verifyRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${stored.id}?fields=spreadsheetId,properties.title`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (verifyRes.ok) {
        return {
          spreadsheetId: stored.id,
          spreadsheetUrl: stored.url || `https://docs.google.com/spreadsheets/d/${stored.id}`,
        };
      }
    } catch {
      // Stored sheet inaccessible, create new one
    }
  }

  // Check if sheet exists in Drive
  try {
    const q = encodeURIComponent(`name = '${SHEET_NAME_DEFAULT}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`);
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const file = searchData.files[0];
        saveStoredSheetConfig(file.id, file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}`);
        return {
          spreadsheetId: file.id,
          spreadsheetUrl: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}`,
        };
      }
    }
  } catch (err) {
    console.warn('Drive search check skipped or failed:', err);
  }

  // Create new spreadsheet with styled columns matching user specification
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: SHEET_NAME_DEFAULT,
      },
      sheets: [
        {
          properties: {
            title: TAB_NAME,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Sheet: ${errText}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  // Add Header Row
  const headers = [
    'Timestamp',
    'Response ID',
    'Engagement Frequency',
    'Engagement Comments & Recommendations',
    'Engagement Rating (1-5 Stars)',
    'Engagement Preferred Days (Monday-Friday)',
    'Happy Hour Frequency',
    'Happy Hour Comments & Recommendations',
    'Happy Hour Rating (1-5 Stars)',
    'Happy Hour Preferred Days (Monday-Friday)',
    'Continue Happy Hour Events? (Yes/No/Maybe)',
    'Continue Engagement Activities? (Yes/No/Maybe)',
    'Other Ideas to Boost Team Spirit (Engagement & Happy Hour)',
    'Anonymity Status',
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(TAB_NAME)}!A1:N1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [headers],
      }),
    }
  );

  saveStoredSheetConfig(spreadsheetId, spreadsheetUrl);
  return { spreadsheetId, spreadsheetUrl };
};

export const serializeResponseRow = (r: SurveyResponse): any[] => {
  return [
    new Date(r.submittedAt).toLocaleString(),
    r.id,
    formatCadence(r.engagementFrequency),
    r.engagementComment || 'None',
    r.engagementRating,
    (r.engagementPreferredDays || []).join(', ') || 'Monday - Friday Flexible',
    formatCadence(r.happyHourFrequency),
    r.happyHourComment || 'None',
    r.happyHourRating,
    (r.happyHourPreferredDays || []).join(', ') || 'Monday - Friday Flexible',
    r.continueHappyHour || 'Yes',
    r.continueEngagement || 'Yes',
    r.moraleIdeas || 'None',
    r.isAnonymous ? '100% Anonymous Feedback' : 'Identified',
  ];
};

/**
 * Appends a survey response to the linked Google Sheet
 */
export const appendResponseToSheet = async (
  response: SurveyResponse,
  customToken?: string
): Promise<{ success: boolean; spreadsheetUrl: string }> => {
  const token = customToken || (await getAccessToken());
  if (!token) {
    throw new Error('Google authentication required');
  }

  const { spreadsheetId, spreadsheetUrl } = await getOrCreateSurveySpreadsheet(token);
  const rowData = serializeResponseRow(response);

  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(TAB_NAME)}!A:N:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowData],
      }),
    }
  );

  if (!appendRes.ok) {
    const errText = await appendRes.text();
    throw new Error(`Failed to append row to Google Sheet: ${errText}`);
  }

  return { success: true, spreadsheetUrl };
};

/**
 * Syncs an array of responses to the spreadsheet
 */
export const syncBatchResponsesToSheet = async (
  responses: SurveyResponse[],
  customToken?: string
): Promise<{ syncedCount: number; spreadsheetUrl: string }> => {
  const token = customToken || (await getAccessToken());
  if (!token) throw new Error('Not authenticated');

  const { spreadsheetId, spreadsheetUrl } = await getOrCreateSurveySpreadsheet(token);
  const rows = responses.map(serializeResponseRow);

  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(TAB_NAME)}!A:N:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!appendRes.ok) {
    const err = await appendRes.text();
    throw new Error(`Batch sync failed: ${err}`);
  }

  return { syncedCount: rows.length, spreadsheetUrl };
};
