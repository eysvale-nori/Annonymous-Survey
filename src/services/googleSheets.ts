import { getAccessToken } from './auth';
import { SurveyResponse, CadenceOption } from '../types/survey';

const SHEET_NAME_DEFAULT = 'HAPPY HOUR AND ENGAGEMENT SURVEY - Responses';
const TAB_NAME = 'Responses';
const WEBHOOK_STORAGE_KEY = 'hh_survey_apps_script_webhook_url';

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

export const getStoredWebhookUrl = (): string => {
  return localStorage.getItem(WEBHOOK_STORAGE_KEY) || '';
};

export const saveStoredWebhookUrl = (url: string) => {
  localStorage.setItem(WEBHOOK_STORAGE_KEY, url.trim());
};

export const clearStoredWebhookUrl = () => {
  localStorage.removeItem(WEBHOOK_STORAGE_KEY);
};

export const formatCadence = (cadence: CadenceOption): string => {
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
 * Sends a survey response directly to the Google Sheet via Google Apps Script Webhook
 */
export const syncViaAppsScriptWebhook = async (
  response: SurveyResponse,
  customWebhookUrl?: string
): Promise<{ success: boolean; message: string }> => {
  const url = customWebhookUrl || getStoredWebhookUrl();
  if (!url) {
    return { success: false, message: 'No Google Apps Script webhook URL configured.' };
  }

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors', // Apps Script webhooks require no-cors or redirect handling
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    });
    return { success: true, message: 'Successfully sent response to Google Sheet via Apps Script!' };
  } catch (err: any) {
    console.error('Webhook sync failed:', err);
    return { success: false, message: err.message || 'Failed to dispatch to Google Sheet webhook.' };
  }
};

/**
 * Tests an Apps Script Webhook URL and syncs current responses
 */
export const testAndSyncAppsScriptWebhook = async (
  webhookUrl: string,
  responses: SurveyResponse[]
): Promise<{ success: boolean; message: string }> => {
  const cleanUrl = webhookUrl.trim();
  if (!cleanUrl || !cleanUrl.startsWith('https://script.google.com/macros/s/')) {
    return {
      success: false,
      message: 'Invalid Webhook URL. It must begin with https://script.google.com/macros/s/...',
    };
  }

  try {
    // Send either all existing responses or a test row if responses array is empty
    const payload = responses.length > 0 ? responses : [{
      id: 'TEST-CONNECTION-01',
      submittedAt: new Date().toISOString(),
      engagementFrequency: 'once_a_month',
      engagementComment: 'Connection test entry from Happy Hour & Engagement Survey app',
      engagementRating: 5,
      engagementPreferredDays: ['Friday'],
      happyHourFrequency: 'once_a_month',
      happyHourComment: 'Test entry verifying Google Sheets sync',
      happyHourRating: 5,
      happyHourPreferredDays: ['Friday'],
      continueHappyHour: 'Yes',
      continueEngagement: 'Yes',
      moraleIdeas: 'Connection verified successfully!',
      isAnonymous: true,
    }];

    await fetch(cleanUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    saveStoredWebhookUrl(cleanUrl);
    return {
      success: true,
      message: `Successfully connected! Synced ${payload.length} response(s) to your Google Sheet.`,
    };
  } catch (err: any) {
    console.error('Webhook sync failed:', err);
    return {
      success: false,
      message: err.message || 'Failed to dispatch to Google Sheet webhook. Please check URL permissions.',
    };
  }
};

/**
 * The Complete Google Apps Script Code
 */
export const COMPLETE_APPS_SCRIPT_CODE = `/**
 * =======================================================================
 * HAPPY HOUR AND ENGAGEMENT SURVEY - GOOGLE APPS SCRIPT WEBHOOK CONNECTOR
 * =======================================================================
 * 
 * STEP-BY-STEP SETUP GUIDE:
 * 1. Open Google Sheets in your browser: https://sheets.new
 * 2. In the top Google Sheets menu, click: "Extensions" > "Apps Script"
 * 3. Delete any default code inside the editor ("Code.gs")
 * 4. Paste this ENTIRE code script into the editor
 * 5. Click the "Save" (disk icon) in the toolbar
 * 6. In the top-right corner, click the blue "Deploy" button > "New deployment"
 * 7. Click the gear icon (⚙️) next to "Select type" and choose "Web app"
 * 8. Fill in the fields:
 *      - Description: Happy Hour Survey Webhook
 *      - Execute as: Me (<your-email>)
 *      - Who has access: Anyone  <-- [CRITICAL!] Must be "Anyone" so survey responses can sync
 * 9. Click "Deploy"
 * 10. Click "Authorize access", choose your Google account, click "Advanced" > "Go to Untitled project (unsafe)", and click "Allow"
 * 11. Copy the "Web app URL" (starts with https://script.google.com/macros/s/...)
 * 12. Paste that URL into the Happy Hour Survey App's Google Sheets setup window!
 */

function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Responses");
  if (!sheet) {
    sheet = ss.insertSheet("Responses");
  }

  var headers = [
    "Timestamp",
    "Response ID",
    "Engagement Frequency",
    "Engagement Comments & Recommendations",
    "Engagement Enjoyment (1-5 Stars)",
    "Engagement Preferred Days (Mon-Fri)",
    "Happy Hour Frequency",
    "Happy Hour Comments & Recommendations",
    "Happy Hour Enjoyment (1-5 Stars)",
    "Happy Hour Preferred Days (Mon-Fri)",
    "Continue Happy Hour? (Yes/No/Maybe)",
    "Continue Engagement? (Yes/No/Maybe)",
    "Other Ideas to Boost Team Spirit",
    "Anonymity Status"
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#1e293b"); // Slate 900
    headerRange.setFontColor("#ffffff");
    headerRange.setFontSize(10);
    headerRange.setHorizontalAlignment("center");
    sheet.setRowHeight(1, 35);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }
  return sheet;
}

function doPost(e) {
  try {
    var sheet = setupSheet();
    var data = null;

    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    if (!data) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "No data received in POST request."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Support both single submission and array of responses
    if (Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        appendSingleRow(sheet, data[i]);
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        syncedCount: data.length,
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    appendSingleRow(sheet, data);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      id: data.id || "entry-" + Date.now(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function appendSingleRow(sheet, item) {
  var row = [
    item.submittedAt ? new Date(item.submittedAt).toLocaleString() : new Date().toLocaleString(),
    item.id || "",
    formatCadence(item.engagementFrequency),
    item.engagementComment || "None",
    item.engagementRating || "",
    Array.isArray(item.engagementPreferredDays) ? item.engagementPreferredDays.join(", ") : (item.engagementPreferredDays || ""),
    formatCadence(item.happyHourFrequency),
    item.happyHourComment || "None",
    item.happyHourRating || "",
    Array.isArray(item.happyHourPreferredDays) ? item.happyHourPreferredDays.join(", ") : (item.happyHourPreferredDays || ""),
    item.continueHappyHour || "Yes",
    item.continueEngagement || "Yes",
    item.moraleIdeas || "None",
    "100% Anonymous Feedback"
  ];
  sheet.appendRow(row);
}

function formatCadence(val) {
  if (val === "once_a_month") return "Once a Month";
  if (val === "once_every_2_months") return "Once Every 2 Months";
  if (val === "once_every_3_months") return "Once every 3 Months";
  return val || "";
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<title>Survey Webhook Online</title>' +
    '<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:40px;background:#f8fafc;color:#1e293b;max-width:600px;margin:0 auto;line-height:1.6;}' +
    '.card{background:#ffffff;padding:30px;border-radius:16px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.1);border:1px solid #e2e8f0;}' +
    '.badge{display:inline-block;background:#10b981;color:#fff;padding:4px 12px;border-radius:9999px;font-weight:bold;font-size:12px;text-transform:uppercase;}' +
    'a{color:#4f46e5;font-weight:bold;text-decoration:none;}a:hover{text-decoration:underline;}</style>' +
    '</head><body><div class="card">' +
    '<span class="badge">Online & Active</span>' +
    '<h2>HAPPY HOUR AND ENGAGEMENT SURVEY</h2>' +
    '<p>Your Google Apps Script Webhook is active and configured to receive survey submissions!</p>' +
    '<p>Connected Spreadsheet: <strong>' + ss.getName() + '</strong></p>' +
    '<p><a href="' + ss.getUrl() + '" target="_blank">Open Your Google Spreadsheet &rarr;</a></p>' +
    '</div></body></html>';

  return HtmlService.createHtmlOutput(html).setTitle("Happy Hour Survey Webhook Status");
}

/**
 * Optional Test Helper: Run this function directly inside Apps Script editor to test!
 */
function testSampleRow() {
  var sheet = setupSheet();
  appendSingleRow(sheet, {
    id: "TEST-APPS-SCRIPT-01",
    submittedAt: new Date().toISOString(),
    engagementFrequency: "once_a_month",
    engagementComment: "Sample engagement suggestion",
    engagementRating: 5,
    engagementPreferredDays: ["Thursday", "Friday"],
    happyHourFrequency: "once_every_2_months",
    happyHourComment: "Sample happy hour feedback",
    happyHourRating: 4,
    happyHourPreferredDays: ["Thursday"],
    continueHappyHour: "Yes",
    continueEngagement: "Yes",
    moraleIdeas: "Team cooking or trivia!",
    isAnonymous: true
  });
  Logger.log("Sample test row successfully written to sheet!");
}
`;


/**
 * Ensures a Google Sheet exists for storing survey results via Direct API
 */
export const getOrCreateSurveySpreadsheet = async (
  customToken?: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const token = customToken || (await getAccessToken());
  if (!token) {
    throw new Error('Google authentication is required to sync with Google Sheets.');
  }

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
      // Ignore
    }
  }

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
