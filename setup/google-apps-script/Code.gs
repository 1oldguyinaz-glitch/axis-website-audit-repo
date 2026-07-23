const SHEET_NAME = 'Audit Leads';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.appendRow([
        'Timestamp', 'Name', 'Email', 'Website', 'Consent',
        'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term',
        'Page URL', 'Submitted At', 'User Agent', 'Status', 'Notes'
      ]);
      sheet.setFrozenRows(1);
    }

    const p = e.parameter || {};
    if (!p.name || !p.email || !p.website || !p.consent) {
      throw new Error('Required fields are missing.');
    }

    sheet.appendRow([
      new Date(), sanitize(p.name), sanitize(p.email), sanitize(p.website), sanitize(p.consent),
      sanitize(p.utm_source), sanitize(p.utm_medium), sanitize(p.utm_campaign), sanitize(p.utm_content), sanitize(p.utm_term),
      sanitize(p.page_url), sanitize(p.submitted_at), sanitize(p.user_agent), 'New', ''
    ]);

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function sanitize(value) {
  const text = String(value || '').trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}