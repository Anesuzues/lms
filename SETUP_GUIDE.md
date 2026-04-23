# NobzTech Course Setup Guide

## Overview
Simple, email-driven learning system using only Google tools.

## System Architecture
- **Landing Page**: React app for marketing only
- **Enrollment**: Google Form (intake)
- **Learning Flow**: Email → YouTube → Google Form → Next Email
- **Tracking**: Google Sheets only
- **Automation**: Google Apps Script

## Phase 1: React Landing Page (✅ COMPLETED)

Simple marketing page that directs users to Google Form for enrollment.

### Your YouTube Videos:
- **Module 0**: AI Skills (XOYLHOm-AVw) + Essential AI Skills (nuEhBT31KQw)
- **Module 1**: AI Resume Building (C67edx_QBIk)
- **Module 2**: AI Interview Prep (3 videos: -2r1pG9Y48Q, iGGkmKN8ilw, 9fDZ42pwSEI)
- **Module 3**: AI for Work (uIklPjEHtNc)

## Phase 2: Google Setup (❌ YOU NEED TO DO)

### Step 1: Create Master Google Sheet

1. **Create new Google Sheet**: "NobzTech Course Tracker"
2. **Set up Learners sheet** with exact columns (in this order):
   - Timestamp
   - Full Name
   - Email
   - WhatsApp
   - Current Level
   - Status
   - Current Module
   - Last Activity Date
   - Module 0 Completed
   - Module 1 Completed
   - Module 2 Completed
   - Module 3 Completed
   - Notes

### Step 2: Create Google Forms (5 Forms)

#### A. Intake Form: "NobzTech Course - Enrollment"
**Questions (exact order):**
1. Full Name (Short answer, Required)
2. Email (Short answer, Required)
3. WhatsApp (Short answer, Optional)
4. Current Level (Multiple choice, Required):
   - High School Student
   - College - 1st Year
   - College - 2nd Year
   - College - 3rd Year
   - University - 1st Year
   - University - 2nd Year
   - University - 3rd Year
   - University - 4th Year
   - Recent Graduate
   - Other

**Settings:**
- Response destination: Your Google Sheet
- Confirmation: "Thank you! Check your email for Module 0 access."

#### B. Module Forms (4 separate forms)

**Module 0 – Foundations**
**Module 1 – CV & AI**
**Module 2 – Interview**
**Module 3 – Work Conduct**

**Questions for each (exact order):**
1. Email address (Short answer, Required)
2. Most valuable insight from this module? (Paragraph, Required)
3. Confidence rating applying what you learned (Linear scale 1-5, Required)
4. What questions do you still have? (Paragraph, Optional)
5. Additional feedback? (Paragraph, Optional)

**Settings:**
- Response destination: Same Google Sheet (separate tabs)
- Confirmation: "Module completed! Next module unlocking shortly."

### Step 3: Set Up Apps Script

1. **In your Google Sheet**, go to Extensions → Apps Script
2. **Delete the default Code.gs file**
3. **Create 4 new files** and copy the code:
   - `intakeHandler.gs` - Copy from `google-apps-script/intakeHandler.gs`
   - `moduleHandler.gs` - Copy from `google-apps-script/moduleHandler.gs`  
   - `emailService.gs` - Copy from `google-apps-script/emailService.gs`
   - `utils.gs` - Copy from `google-apps-script/utils.gs`

4. **Update configuration**:
   - In `utils.gs`, replace form IDs with your actual Google Form IDs
   - In `intakeHandler.gs`, replace `getWebAppUrl()` with your React app URL
   - In `emailService.gs`, replace admin email with your email

5. **Set up triggers**:
   - Run the `setupTriggers()` function from `utils.gs`
   - This creates automatic triggers for form submissions

6. **Grant permissions**:
   - Apps Script will ask for Gmail and Sheets permissions
   - Accept all permissions for the automation to work

### Step 4: Connect Forms to Sheet

1. **For each Google Form**:
   - Go to Responses tab
   - Click the Google Sheets icon
   - Select "Select existing spreadsheet"
   - Choose your "NobzTech Course Tracker" sheet

2. **Set up form triggers**:
   - In Apps Script, go to Triggers (clock icon)
   - Verify triggers are created for each form
   - Each form should trigger its respective handler function

## Phase 3: Frontend Integration (❌ YOU NEED TO DO)

### Update Form URLs in React App

1. **Get your Google Form URLs**:
   - For each form, click "Send" → "Link" → Copy the link
   - Convert to embed format: Replace `/viewform` with `/viewform?embedded=true`

2. **Update the React code**:
   - In `src/pages/Module.tsx`, replace the `formUrl` values with your actual form URLs
   - In `src/pages/Enroll.tsx`, you can either:
     - Embed the Google Form directly, OR
     - Keep the custom form and submit to Google Forms via API

### Deploy React App

1. **Build the app**: `npm run build`
2. **Deploy to your hosting** (Vercel, Netlify, etc.)
3. **Update the web app URL** in Apps Script files

## Phase 4: Testing (❌ YOU NEED TO DO)

### Test the Complete Flow

1. **Test enrollment**:
   - Fill out the intake form
   - Check if email is sent
   - Verify data appears in Google Sheet

2. **Test module progression**:
   - Complete Module 0 form
   - Check if Module 1 email is sent
   - Verify progress tracking

3. **Test completion**:
   - Complete all 4 modules
   - Check completion email
   - Verify final status

### Debug Common Issues

- **Emails not sending**: Check Gmail permissions in Apps Script
- **Form not triggering**: Verify trigger setup in Apps Script
- **Data not saving**: Check Sheet permissions and column headers
- **Wrong email content**: Update email templates in `emailService.gs`

## Phase 5: Go Live (❌ YOU NEED TO DO)

### Final Steps

1. **Update all placeholder URLs** with your actual domain
2. **Test with real email addresses**
3. **Set up monitoring** (check Google Sheet daily)
4. **Create backup** of your Google Sheet
5. **Document your form IDs** for future reference

## Support

### What I Built For You:
✅ Complete React learning platform
✅ All Google Apps Script automation code  
✅ Email templates
✅ Progress tracking system
✅ YouTube video integration

### What You Need To Do:
❌ Create Google Sheets and Forms
❌ Deploy Apps Script code
❌ Connect forms to automation
❌ Test the complete system
❌ Deploy and go live

### Form IDs You'll Need:
After creating your Google Forms, you'll have 5 form IDs to update in the code:
- Intake Form ID
- Module 0 Form ID  
- Module 1 Form ID
- Module 2 Form ID
- Module 3 Form ID

## Questions?

The system is designed to be simple and maintainable. Once set up, it will:
- Automatically enroll students
- Send module access emails
- Track progress in Google Sheets
- Send completion certificates
- Handle reminder emails for inactive students

Ready to transform Limpopo students' careers! 🚀