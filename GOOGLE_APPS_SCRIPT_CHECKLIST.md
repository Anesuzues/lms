# Google Apps Script Setup Checklist

## ✅ Pre-Deployment Checklist

### 1. Create Google Forms
- [ ] Create intake/enrollment form
- [ ] Create Module 0 completion form  
- [ ] Create Module 1 completion form
- [ ] Create Module 2 completion form
- [ ] Create Module 3 completion form
- [ ] Copy all form IDs (from the URL)

### 2. Create Google Sheet
- [ ] Create new Google Sheet for data storage
- [ ] Copy the Sheet ID (from the URL)
- [ ] Name it "Limpopo Launchpad Submissions" or similar

### 3. Create Google Apps Script Project
- [ ] Go to script.google.com
- [ ] Create new project
- [ ] Name it "Limpopo Launchpad Backend"

## ✅ Deployment Steps

### 4. Copy Script Files
- [ ] Copy `intakeHandler.gs` → rename to `Code.gs` (main file)
- [ ] Copy `emailService.gs` → keep as `emailService.gs`
- [ ] Copy `moduleHandler.gs` → keep as `moduleHandler.gs`  
- [ ] Copy `utils.gs` → keep as `utils.gs`

### 5. Update Configuration Values

#### In Code.gs (intakeHandler.gs):
```javascript
const ADMIN_EMAIL = 'your-admin@email.com';
const WEB_APP_URL = 'https://your-react-app-url.com';
```

#### In emailService.gs:
```javascript
const MODULE_FORMS = {
  0: "https://forms.gle/YOUR_MODULE_0_FORM_ID",
  1: "https://forms.gle/YOUR_MODULE_1_FORM_ID", 
  2: "https://forms.gle/YOUR_MODULE_2_FORM_ID",
  3: "https://forms.gle/YOUR_MODULE_3_FORM_ID"
};
```

#### In utils.gs:
```javascript
const FORM_IDS = {
  INTAKE: 'YOUR_INTAKE_FORM_ID',
  MODULE_0: 'YOUR_MODULE_0_FORM_ID',
  MODULE_1: 'YOUR_MODULE_1_FORM_ID', 
  MODULE_2: 'YOUR_MODULE_2_FORM_ID',
  MODULE_3: 'YOUR_MODULE_3_FORM_ID'
};
```

### 6. Set Up Data Sheet
- [ ] Run `createLearnersSheet()` function once
- [ ] Verify the sheet was created with proper headers

### 7. Set Up Form Triggers
- [ ] Update form IDs in utils.gs
- [ ] Run `setupTriggers()` function
- [ ] Verify triggers were created in the Triggers section

### 8. Deploy Web App
- [ ] Click Deploy → New Deployment
- [ ] Type: Web app
- [ ] Execute as: Me
- [ ] Access: Anyone
- [ ] Click Deploy
- [ ] Copy the web app URL

### 9. Test the System
- [ ] Run `testEmailService()` function
- [ ] Submit a test form entry
- [ ] Check that data appears in Google Sheet
- [ ] Verify email notifications work

### 10. Update React App
- [ ] Update form submission URLs in React components
- [ ] Replace placeholder URLs with your deployed web app URL
- [ ] Test form submissions from your React app

## ✅ Post-Deployment

### 11. Monitor and Maintain
- [ ] Check Google Apps Script logs regularly
- [ ] Monitor email delivery
- [ ] Review learner progress in Google Sheet
- [ ] Set up backup/export procedures

## 🚨 Common Issues

### Forms not triggering:
- Check that form IDs are correct
- Verify triggers are set up properly
- Check Google Apps Script execution logs

### Emails not sending:
- Verify Gmail API is enabled
- Check email addresses are valid
- Review email quotas and limits

### Data not saving:
- Check Sheet ID is correct
- Verify sheet structure matches expected headers
- Check Google Sheets API permissions

## 📞 Support

If you encounter issues:
1. Check the Google Apps Script execution logs
2. Verify all configuration values are updated
3. Test each component individually
4. Check Google API quotas and permissions