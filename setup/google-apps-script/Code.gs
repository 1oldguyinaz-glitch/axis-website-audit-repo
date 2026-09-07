const SHEET_NAME = 'Audit Leads';
const HEADERS = ['Timestamp','Name','Business','Email','Phone','Website','Comments','Package Interest','Consent','UTM Source','UTM Medium','UTM Campaign','UTM Content','UTM Term','Page URL','Submitted At','User Agent','Status','Notes','Lead State','Next Action','Source'];

function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) { sheet = spreadsheet.insertSheet(SHEET_NAME); sheet.appendRow(HEADERS); sheet.setFrozenRows(1); }
    else if (sheet.getLastColumn() < HEADERS.length) sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    const p = e.parameter || {};
    if (!p.name || !p.email || !p.website || !p.consent) throw new Error('Required fields are missing.');
    sheet.appendRow([new Date(), sanitize(p.name), sanitize(p.business), sanitize(p.email), sanitize(p.phone), sanitize(p.website), sanitize(p.comments), sanitize(p.package_interest), sanitize(p.consent), sanitize(p.utm_source), sanitize(p.utm_medium), sanitize(p.utm_campaign), sanitize(p.utm_content), sanitize(p.utm_term), sanitize(p.page_url), sanitize(p.submitted_at), sanitize(p.user_agent), 'New', '', sanitize(p.lead_state || 'new'), sanitize(p.next_action || 'Run website diagnosis'), sanitize(p.source || 'Axis landing page')]);
    return jsonResponse({ ok: true });
  } catch (error) { console.error(error); return jsonResponse({ ok: false, error: String(error) }); }
  finally { lock.releaseLock(); }
}
function sanitize(value) { const text = String(value || '').trim(); return /^[=+\-@]/.test(text) ? "'" + text : text; }
function jsonResponse(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }