# Google Apps Script Deployment Guide

## Overview
The Google Apps Script files in the `google-apps-script/` folder need to be deployed to Google Apps Script to handle form submissions, email notifications, and module management.

## Step 1: Create a New Google Apps Script Project

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Give your project a name (e.g., "Limpopo Launchpad Backend")

## Step 2: Copy Script Files

Copy the contents of each file from the `google-apps-script/` folder into your Google Apps Script project:

### File Structure in Google Apps Script:
```
Your Google Apps Script Project/
├── Code.gs (rename from intakeHandler.gs - this is your main file)
├── emailService.gs
├── moduleHandler.gs
└── utils.gs
```

### Files to Copy:

1. **Code.gs** (Main file - copy from `intakeHandler.gs`)
   - This contains the main doPost function that handles form submissions
   - Rename the default "Code.gs" file or create a new one

2. **emailService.gs**
   - Handles all email-related functions
   - Copy the entire contents

3. **moduleHandler.gs**
   - Manages module access and completion tracking
   - Copy the entire contents

4. **utils.gs**
   - Utility functions used across the project
   - Copy the entire contents

## Step 3: Set Up Google Sheets

1. Create a new Google Sheet for storing form submissions
2. Name it "Limpopo Launchpad Submissions" (or your preferred name)
3. Copy the Sheet ID from the URL (the long string between `/d/` and `/edit`)
4. In your Google Apps Script, update the `SHEET_ID` variable in the main file

## Step 4: Configure Script Properties

In Google Apps Script, go to Project Settings > Script Properties and add:

```
SHEET_ID: [Your Google Sheet ID]
ADMIN_EMAIL: [Your admin email address]
FROM_EMAIL: [Email address for sending notifications]
```

## Step 5: Set Up Required APIs

1. In Google Apps Script, go to Services (+ icon)
2. Add these services:
   - Gmail API (for sending emails)
   - Google Sheets API (for data storage)
   - Google Drive API (if using file attachments)

## Step 6: Deploy as Web App

1. Click "Deploy" > "New Deployment"
2. Choose type: "Web app"
3. Description: "Limpopo Launchpad Backend"
4. Execute as: "Me"
5. Who has access: "Anyone" (for form submissions)
6. Click "Deploy"
7. Copy the Web App URL - you'll need this for your React app

## Step 7: Update React App Configuration

In your React app, update the form submission URLs to point to your deployed Google Apps Script web app URL.

Look for fetch calls in your React components and update them:

```javascript
// Update this URL with your deployed Google Apps Script URL
const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

## Step 8: Test the Integration

1. Test form submissions from your React app
2. Check that data appears in your Google Sheet
3. Verify that email notifications are sent
4. Test module access functionality

## Important Notes

- **Security**: The web app is set to "Anyone" access for form submissions, but sensitive operations should be protected
- **CORS**: Google Apps Script automatically handles CORS for web requests
- **Rate Limits**: Google Apps Script has execution time limits (6 minutes max)
- **Permissions**: You may need to authorize the script to access Gmail and Sheets on first run

## Troubleshooting

- Check the Google Apps Script logs for errors
- Ensure all required APIs are enabled
- Verify Sheet ID and email addresses are correct
- Test with simple console.log statements first

## Environment Variables Needed

Update these in your Google Apps Script:

```javascript
// In your main script file, update these constants:
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
const ADMIN_EMAIL = 'admin@yourdomain.com';
const FROM_EMAIL = 'noreply@yourdomain.com';
```