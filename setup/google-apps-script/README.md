# Zero-cost lead capture with Google Sheets

1. Create a blank Google Sheet.
2. Open **Extensions → Apps Script**.
3. Delete the sample code and paste `Code.gs`.
4. Click **Deploy → New deployment**.
5. Select **Web app**.
6. Execute as **Me**. Set access to **Anyone**.
7. Deploy and copy the Web App URL.
8. Paste it into `assets/js/config.js` as `formEndpoint`.
9. Submit a test lead from the live GitHub Pages site.

The script creates an **Audit Leads** tab automatically and appends each submission.

## Important

- Test the form before sending traffic.
- Restrict access to the spreadsheet.
- Add a real email platform later only after the funnel is producing leads.
- This endpoint captures leads; it does not automatically send email. Start with manual Gmail templates, then automate after validation.
