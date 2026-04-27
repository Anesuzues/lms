# 🚀 IMPLEMENTATION STEPS - COMPLETE GUIDE

## 📋 OVERVIEW
Follow these steps in order to launch your Limpopo Launchpad system in 1 hour.

---

## STEP 1: UPDATE GOOGLE FORMS (30 minutes)

### 1.1 Open Your Google Forms
You have 5 forms to update. Open each one:

**Intake Form**: https://docs.google.com/forms/d/1FAIpQLSeicnftUC9dRZKALdSJugUxYTEJTQQrEyOoEjyzxtSExc2inQ/edit

**Module 0**: https://docs.google.com/forms/d/1FAIpQLScJQh93UVH9CB78SIN-vRS-w9Lu7f5pS_ljWY6W39cfJW6FuA/edit

**Module 1**: https://docs.google.com/forms/d/1FAIpQLScmy__NjAQgAdsPH1xisMGNjfBX57eA1mvUZ3epdYMe94Euxw/edit

**Module 2**: https://docs.google.com/forms/d/1FAIpQLSfGsPLp8suWoGIk2Gn7XmzH9X0pVI3iRviI4gega8x2d6Lz5Q/edit

**Module 3**: https://docs.google.com/forms/d/1FAIpQLSdvMuiMp4dN022sQo-Q01f24gKl8v98R2uqyftyzB3loVn-NA/edit

### 1.2 For Each Module Form (0, 1, 2, 3):

**Add These Questions in Order:**

1. **Email Address** (Short answer, Required)
   - Description: "Used to track your progress"

2. **Question 1** (Paragraph, Required)
   - Copy from `GOOGLE_FORMS_SETUP_COMPLETE.md` for each module

3. **Question 2** (Paragraph, Required)
   - Copy from `GOOGLE_FORMS_SETUP_COMPLETE.md` for each module

4. **Question 3** (Paragraph, Required)
   - Copy from `GOOGLE_FORMS_SETUP_COMPLETE.md` for each module

5. **Question 4** (Paragraph, Required)
   - Copy from `GOOGLE_FORMS_SETUP_COMPLETE.md` for each module

6. **Question 5** (Paragraph, Required)
   - Copy from `GOOGLE_FORMS_SETUP_COMPLETE.md` for each module

7. **Confidence Rating** (Multiple choice, Required)
   - Options: 1 = Not confident at all, 2 = Slightly confident, 3 = Moderately confident, 4 = Quite confident, 5 = Very confident

### 1.3 Form Settings (For Each Form):
- ✅ Collect email addresses: ON
- ✅ Limit to 1 response: ON
- ✅ Require sign-in: OFF

---

## STEP 2: CREATE GOOGLE SHEET (5 minutes)

### 2.1 Create New Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Click "Blank" to create new sheet
3. Name it: "Limpopo Launchpad Learners"

### 2.2 Set Up Columns
In Row 1, add these headers (exact order):

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Timestamp | Name and surname | Email Address | Phone number | Modules covered | Career Interest | Program Name | Brief Summary | Location | CV Link | Current Level | Status | Current Module | Last Activity Date | Module 0 Completed | Module 1 Completed | Module 2 Completed | Module 3 Completed | Notes |

### 2.3 Copy Sheet ID
1. Look at the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
2. Copy the long ID between `/d/` and `/edit`
3. Save this ID - you'll need it in Step 3

---

## STEP 3: DEPLOY GOOGLE APPS SCRIPT (15 minutes)

### 3.1 Create New Apps Script Project
1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Name it: "Limpopo Launchpad Backend"

### 3.2 Copy Script Files
You need to create 4 files. For each file:

**File 1: Code.gs** (Main file)
1. Rename the default "Code.gs" or create new file
2. Copy entire contents from `google-apps-script/intakeHandler.gs`
3. Paste into Code.gs

**File 2: emailService.gs**
1. Click "+" next to "Files"
2. Choose "Script"
3. Name it: "emailService"
4. Copy entire contents from `google-apps-script/emailService.gs`
5. Paste into emailService.gs

**File 3: moduleHandler.gs**
1. Click "+" next to "Files"
2. Choose "Script"
3. Name it: "moduleHandler"
4. Copy entire contents from `google-apps-script/moduleHandler.gs`
5. Paste into moduleHandler.gs

**File 4: utils.gs**
1. Click "+" next to "Files"
2. Choose "Script"
3. Name it: "utils"
4. Copy entire contents from `google-apps-script/utils.gs`
5. Paste into utils.gs

### 3.3 Update Configuration
In your **Code.gs** file, find these lines and update:

```javascript
// UPDATE THESE VALUES:
const SHEET_ID = 'YOUR_SHEET_ID_FROM_STEP_2';
const ADMIN_EMAIL = 'learning@nobztech.co.za';
```

Replace `YOUR_SHEET_ID_FROM_STEP_2` with the Sheet ID you copied in Step 2.

### 3.4 Deploy as Web App
1. Click "Deploy" → "New Deployment"
2. Click gear icon → Choose "Web app"
3. Description: "Limpopo Launchpad Backend"
4. Execute as: "Me"
5. Who has access: "Anyone"
6. Click "Deploy"
7. **IMPORTANT**: Copy the Web App URL - save it!

### 3.5 Authorize Permissions
1. Click "Review permissions"
2. Choose your Google account
3. Click "Advanced" → "Go to Limpopo Launchpad Backend (unsafe)"
4. Click "Allow"

---

## STEP 4: CONNECT FORMS TO SCRIPT (10 minutes)

### 4.1 Set Up Form Triggers
For **EACH** of your 5 Google Forms:

1. Open the form
2. Click "Responses" tab
3. Click the green Sheets icon
4. Choose "Select existing spreadsheet"
5. Select your "Limpopo Launchpad Learners" sheet
6. Click "Create"

### 4.2 Set Up Script Triggers
1. Go back to your Google Apps Script
2. Click "Triggers" (clock icon on left)
3. Click "+ Add Trigger"

**For Intake Form:**
- Function: `handleIntakeSubmit`
- Event source: "From spreadsheet"
- Event type: "On form submit"
- Click "Save"

**For Module Forms:**
- Function: `handleModuleSubmit`
- Event source: "From spreadsheet"
- Event type: "On form submit"
- Click "Save"

---

## STEP 5: TEST THE SYSTEM (10 minutes)

### 5.1 Test Intake Form
1. Open your intake form: https://docs.google.com/forms/d/1FAIpQLSeicnftUC9dRZKALdSJugUxYTEJTQQrEyOoEjyzxtSExc2inQ/viewform
2. Fill it out with your email
3. Submit

### 5.2 Check Results
1. **Check Google Sheet**: New row should appear
2. **Check Email**: You should receive Module 0 email with YouTube links
3. **Check Apps Script Logs**: Go to script.google.com → your project → "Executions"

### 5.3 Test Module Flow
1. Click Module 0 form link from email
2. Fill out and submit
3. Check you receive Module 1 email

---

## STEP 6: GO LIVE! (5 minutes)

### 6.1 Update Your Website
Your React app is already deployed at: https://limpopo-launchpad.vercel.app

The "Start Course" button already points to your intake form.

### 6.2 Share With Students
Give students this link: https://limpopo-launchpad.vercel.app

They click "Start Course" → Fill intake form → Automatic email system begins!

---

## 🚨 TROUBLESHOOTING

### If Emails Don't Send:
1. Check Google Apps Script "Executions" for errors
2. Verify ADMIN_EMAIL is correct
3. Check Gmail spam folder

### If Forms Don't Connect:
1. Verify all forms point to same Google Sheet
2. Check trigger setup in Apps Script
3. Ensure permissions are granted

### If Sheet Doesn't Update:
1. Check form responses are going to correct sheet
2. Verify Sheet ID in Apps Script is correct
3. Check column headers match exactly

---

## ✅ SUCCESS CHECKLIST

- [ ] All 5 Google Forms updated with questions
- [ ] Google Sheet created with correct columns
- [ ] Google Apps Script deployed with 4 files
- [ ] Configuration updated (Sheet ID, email)
- [ ] Form triggers set up
- [ ] Test submission successful
- [ ] Email automation working
- [ ] Website live and functional

## 🎉 CONGRATULATIONS!

Your automated learning system is now live!

Students can:
1. Visit your website
2. Click "Start Course"
3. Fill intake form
4. Receive Module 0 via email
5. Complete modules and progress automatically
6. Get workshop invitation after completion

**Total Time**: ~1 hour
**Result**: Fully automated email-based learning platform!