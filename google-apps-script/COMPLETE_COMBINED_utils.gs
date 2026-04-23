/**
 * ═══════════════════════════════════════════════════════════
 * NOBZTECH COURSE - COMPLETE COMBINED SYSTEM
 * 
 * This combines:
 * - Custom React Intake Form Handler (Robust Mapping)
 * - Automated Google Form Triggers (Module Progression)
 * - Email Templates & Module Data
 * - Utility Functions (Typo Detection, Reminders, MCQ Parsing)
 * - 18-Column Student Tracking
 * 
 * SETUP:
 * 1. Update SHEET_ID below with your Google Sheet ID
 * 2. Deploy as Web App with "Anyone" access
 * 3. Copy deployment URL to your React IntakeForm.tsx
 * ═══════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════
// CONFIGURATION - UPDATE THESE VALUES
// ═══════════════════════════════════════════════════════════
const ADMIN_EMAIL = 'learning@nobztech.co.za';
const WEB_APP_URL = 'https://limpopo-launchpad.vercel.app';
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // TODO: Replace with your actual Sheet ID

// Module Form URLs
const MODULE_FORMS = {
  0: "https://docs.google.com/forms/d/e/1FAIpQLScJQh93UVH9CB78SIN-vRS-w9Lu7f5pS_ljWY6W39cfJW6FuA/viewform",
  1: "https://docs.google.com/forms/d/e/1FAIpQLScmy__NjAQgAdsPH1xisMGNjfBX57eA1mvUZ3epdYMe94Euxw/viewform",
  2: "https://docs.google.com/forms/d/e/1FAIpQLSfGsPLp8suWoGIk2Gn7XmzH9X0pVI3iRviI4gega8x2d6Lz5Q/viewform",
  3: "https://docs.google.com/forms/d/e/1FAIpQLSdvMuiMp4dN022sQo-Q01f24gKl8v98R2uqyftyzB3loVn-NA/viewform"
};

// ═══════════════════════════════════════════════════════════
// WEB APP ENTRY POINT (doPost)
// ═══════════════════════════════════════════════════════════

function doPost(e) {
  try {
    const params = e.parameter;
    console.log('Action received:', params.action);
    
    if (params.action === 'intakeSubmit') {
      const formData = JSON.parse(params.formData);
      handleIntakeSubmit({ values: formData });
      return ContentService.createTextOutput('Intake processed');
    }
    
    if (params.action === 'moduleComplete') {
      const moduleNumber = parseInt(params.moduleNumber);
      const email = params.email;
      sendNextModuleOrCompletion(email, moduleNumber);
      return ContentService.createTextOutput('Success');
    }
    
    return ContentService.createTextOutput('Unknown action');
  } catch (error) {
    console.error('Web app error:', error);
    return ContentService.createTextOutput('Error: ' + error.toString());
  }
}

// ═══════════════════════════════════════════════════════════
// INTAKE FORM HANDLER (React Custom Form)
// ═══════════════════════════════════════════════════════════

function handleIntakeSubmit(e) {
  try {
    const responses = e.values;
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
    if (!sheet) {
      console.error('Learners sheet not found - Run createLearnersSheet() first');
      return;
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Robust header mapping (Supports both Object and Array)
    const getVal = (headerName) => {
      if (!Array.isArray(responses)) return responses[headerName] || '';
      const index = headers.indexOf(headerName);
      return index !== -1 ? responses[index] : '';
    };

    const email = getVal('Email Address') || getVal('Email');
    const fullName = getVal('Name and surname') || getVal('Full Name');
    
    if (!email) return;

    // Check if user already exists
    if (findLearnerByEmail(email)) {
      sendDuplicateEnrollmentEmail(email, fullName);
      return;
    }

    // Build the new row based on the 18-column structure
    const newRow = headers.map(header => {
      switch(header) {
        case 'Timestamp': return getVal('Timestamp') || new Date();
        case 'Name and surname': return fullName;
        case 'Email Address': return email.toLowerCase().trim();
        case 'Phone number': return getVal('Phone number');
        case 'Modules covered': return getVal('Modules covered');
        case 'Career Interest': return getVal('Career Interest');
        case 'Program Name': return getVal('Program Name');
        case 'Brief Summary': return getVal('Brief Summary');
        case 'Location': return getVal('Location');
        case 'CV Link': return getVal('CV Link');
        case 'Current Level': return getVal('Current Level') || '';
        case 'Status': return 'ACTIVE';
        case 'Current Module': return 0;
        case 'Last Activity Date': return new Date();
        case 'Module 0 Completed': return false;
        case 'Module 1 Completed': return false;
        case 'Module 2 Completed': return false;
        case 'Module 3 Completed': return false;
        case 'Notes': return getVal('Brief Summary');
        default: return '';
      }
    });

    sheet.appendRow(newRow);
    sendModuleEmail(email, fullName, 0);
    
  } catch (error) {
    console.error('Intake Handler Error:', error);
    sendErrorNotification('Intake Handler Error', error.toString());
  }
}

// ═══════════════════════════════════════════════════════════
// AUTOMATED PROGRESSION (Google Form Triggers)
// ═══════════════════════════════════════════════════════════

function onFormSubmit(e) {
  try {
    const response = e.response;
    const email = response.getRespondentEmail();
    const formId = e.source.getId();
    
    const formIdMap = {
      '1FAIpQLScJQh93UVH9CB78SIN-vRS-w9Lu7f5pS_ljWY6W39cfJW6FuA': 0,
      '1FAIpQLScmy__NjAQgAdsPH1xisMGNjfBX57eA1mvUZ3epdYMe94Euxw': 1,
      '1FAIpQLSfGsPLp8suWoGIk2Gn7XmzH9X0pVI3iRviI4gega8x2d6Lz5Q': 2,
      '1FAIpQLSdvMuiMp4dN022sQo-Q01f24gKl8v98R2uqyftyzB3loVn-NA': 3
    };
    
    const completedModule = formIdMap[formId];
    if (completedModule !== undefined && email) {
      updateLearnerProgress(email, completedModule);
      sendNextModuleOrCompletion(email, completedModule);
    }
  } catch (error) { console.error('onFormSubmit trigger error:', error); }
}

function sendNextModuleOrCompletion(email, completedModule) {
  const learner = findLearnerByEmail(email);
  const name = learner ? learner.fullName : email.split('@')[0];
  const nextModule = completedModule + 1;
  
  if (nextModule <= 3) {
    sendModuleEmail(email, name, nextModule);
  } else {
    sendCompletionEmail(email, name);
  }
}

// ═══════════════════════════════════════════════════════════
// EMAIL TEMPLATES & MODULE DATA
// ═══════════════════════════════════════════════════════════

function sendModuleEmail(email, name, moduleNumber) {
  try {
    const moduleData = getModuleData(moduleNumber);
    if (!moduleData) return;

    const subject = `NobzTech Free Course – Module ${moduleNumber}: ${moduleData.title}`;
    const body = `Hi ${name},

Congratulations! You now have access to Module ${moduleNumber}: ${moduleData.title}

🎥 Watch the video: ${moduleData.videoLinks.join('\n')}

📝 Complete the quiz: ${moduleData.formLink}

Your progress is tracked automatically. Once you submit the quiz, you'll receive the next module.

Keep up the great work!

– NobzTech Team`;
    
    GmailApp.sendEmail(email, subject, body);
    console.log(`Module ${moduleNumber} email sent to ${email}`);
  } catch (error) {
    console.error('Email error:', error);
    logFailedEmail(email, `Module ${moduleNumber}`, error.toString());
  }
}

function sendCompletionEmail(email, name) {
  const subject = '🎉 Congratulations! NobzTech Course Complete';
  const body = `Congratulations ${name},

You've successfully completed the NobzTech Workplace Readiness Course!

You'll now be invited to:
- CV Writing Workshops
- Interview Preparation Sessions
- Job Placement Support

We're proud of your achievement. Well done!

– NobzTech Team`;
  
  try {
    GmailApp.sendEmail(email, subject, body);
    console.log(`Completion email sent to ${email}`);
  } catch (error) {
    logFailedEmail(email, 'Completion', error.toString());
  }
}

function sendDuplicateEnrollmentEmail(email, name) {
  const subject = 'NobzTech Course - Welcome Back!';
  const body = `Hi ${name},

You're already enrolled in the NobzTech Course!

Access your dashboard here: ${WEB_APP_URL}/dashboard

If you're having trouble accessing your modules, please reply to this email.

– NobzTech Team`;
  
  try {
    GmailApp.sendEmail(email, subject, body);
  } catch (e) {
    console.error('Duplicate email error:', e);
  }
}

function getModuleData(moduleNumber) {
  const modules = {
    0: { title: "Workplace Foundations", videoLinks: ["https://www.youtube.com/watch?v=nuEhBT31KQw"], formLink: MODULE_FORMS[0] },
    1: { title: "CV Writing & AI Tools", videoLinks: ["https://www.youtube.com/watch?v=C67edx_QBIk"], formLink: MODULE_FORMS[1] },
    2: { title: "Interview Readiness", videoLinks: ["https://www.youtube.com/watch?v=-2r1pG9Y48Q"], formLink: MODULE_FORMS[2] },
    3: { title: "Professional Conduct", videoLinks: ["https://www.youtube.com/watch?v=XOYLHOm-AVw"], formLink: MODULE_FORMS[3] }
  };
  return modules[moduleNumber] || null;
}

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS (Database Operations)
// ═══════════════════════════════════════════════════════════

function findLearnerByEmail(email) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
    if (!sheet) return null;
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][2] && data[i][2].toString().toLowerCase().trim() === email.toLowerCase().trim()) {
        return {
          row: i + 1,
          fullName: data[i][1],
          email: data[i][2],
          status: data[i][11],
          currentModule: data[i][12],
          module0Completed: data[i][14],
          module1Completed: data[i][15],
          module2Completed: data[i][16],
          module3Completed: data[i][17]
        };
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

function updateLearnerProgress(email, completedModule) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
    const learner = findLearnerByEmail(email);
    if (!learner) return;
    
    // Column structure: Module X Completed is at column 15 + moduleNumber (0-indexed: 14+moduleNumber)
    sheet.getRange(learner.row, 15 + completedModule).setValue(true);
    sheet.getRange(learner.row, 13).setValue(completedModule < 3 ? completedModule + 1 : 3);
    sheet.getRange(learner.row, 14).setValue(new Date());
    
    if (completedModule === 3) {
      sheet.getRange(learner.row, 12).setValue('COMPLETED');
    }
  } catch (error) {
    console.error('❌ Update progress error:', error);
  }
}

function updateLearnerStatusByEmail(email, newStatus) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
    const learner = findLearnerByEmail(email);
    if (learner) {
      sheet.getRange(learner.row, 12).setValue(newStatus);
    }
  } catch (error) {
    console.error('❌ Update status error:', error);
  }
}

// ═══════════════════════════════════════════════════════════
// ERROR HANDLING & LOGGING
// ═══════════════════════════════════════════════════════════

function logFailedEmail(email, emailType, errorMessage) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let logSheet = ss.getSheetByName('EmailFailures');
    
    if (!logSheet) {
      logSheet = ss.insertSheet('EmailFailures');
      logSheet.appendRow(['Timestamp', 'Email', 'Type', 'Error', 'Resolved']);
      logSheet.getRange(1, 1, 1, 5)
        .setBackground('#ff0000')
        .setFontColor('white')
        .setFontWeight('bold');
    }
    
    logSheet.appendRow([new Date(), email, emailType, errorMessage, false]);
    console.log('📝 Failed email logged for manual recovery');
    
  } catch (error) {
    console.error('❌ Failed to log email failure:', error.message);
  }
}

function sendErrorNotification(title, error) {
  try {
    GmailApp.sendEmail(
      ADMIN_EMAIL,
      `NobzTech Error: ${title}`,
      `Error: ${error}\nTime: ${new Date()}`
    );
  } catch (e) {
    console.error('Failed to send error notification');
  }
}

// ═══════════════════════════════════════════════════════════
// EMAIL TYPO DETECTION
// ═══════════════════════════════════════════════════════════

function detectEmailIssue(email) {
  if (!email) return 'Email is empty';
  
  const emailLower = email.toLowerCase().trim();
  
  if (!emailLower.includes('@')) {
    return 'Email missing @ symbol';
  }
  
  const parts = emailLower.split('@');
  if (parts.length !== 2 || !parts[1].includes('.')) {
    return 'Email missing domain extension';
  }
  
  const commonTypos = {
    '@gmail.ocm': '@gmail.com',
    '@gmial.com': '@gmail.com',
    '@gmai.com': '@gmail.com',
    '@gmail.co': '@gmail.com',
    '@yahoo.ocm': '@yahoo.com',
    '@yahooo.com': '@yahoo.com',
    '@yaho.com': '@yahoo.com',
    '@hotmail.ocm': '@hotmail.com',
    '@outlook.ocm': '@outlook.com'
  };
  
  for (const [typo, correct] of Object.entries(commonTypos)) {
    if (emailLower.includes(typo)) {
      return `Did you mean ${emailLower.replace(typo, correct)}?`;
    }
  }
  
  return null;
}

// ═══════════════════════════════════════════════════════════
// MCQ ANSWER EXTRACTION
// ═══════════════════════════════════════════════════════════

function extractLetter(text) {
  if (!text || text.toString().trim() === '') return null;
  
  const str = text.toString().trim();
  
  let match = str.match(/^([A-D])\s*[\.\)\-]/i);
  if (match) return match[1].toUpperCase();
  
  match = str.match(/^([A-D])[\s:]/i);
  if (match) return match[1].toUpperCase();
  
  match = str.match(/(?:option|choice)\s*([A-D])/i);
  if (match) return match[1].toUpperCase();
  
  match = str.match(/\b([A-D])\b/i);
  if (match) return match[1].toUpperCase();
  
  return null;
}

function extractLetters(text) {
  if (!text || text.toString().trim() === '') return [];
  
  const str = text.toString();
  const letters = new Set();
  
  const patterns = [
    /([A-D])\s*[\.\)\-]/gi,
    /([A-D])[\s:,]/gi,
    /\b([A-D])\b/gi
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(str)) !== null) {
      letters.add(match[1].toUpperCase());
    }
  });
  
  return [...letters].sort();
}

// ═══════════════════════════════════════════════════════════
// INACTIVE LEARNER TRACKING & REMINDERS
// ═══════════════════════════════════════════════════════════

function findInactiveLearners(daysInactive = 7) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    const inactiveLearners = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);
    
    for (let i = 1; i < data.length; i++) {
      const status = data[i][11]; // Status column
      const currentModule = data[i][12]; // Current Module
      const lastActivity = data[i][13]; // Last Activity Date
      const email = data[i][2];
      const name = data[i][1];
      
      if (status === 'COMPLETED' || status === 'INACTIVE') continue;
      if (currentModule >= 3) continue;
      
      const lastActivityDate = new Date(lastActivity);
      if (lastActivityDate < cutoffDate) {
        const daysSince = Math.floor((new Date() - lastActivityDate) / (1000 * 60 * 60 * 24));
        
        inactiveLearners.push({
          row: i + 1,
          email: email,
          name: name,
          currentModule: currentModule,
          lastActivity: lastActivityDate,
          daysSinceLastActivity: daysSince
        });
      }
    }
    
    return inactiveLearners;
    
  } catch (error) {
    console.error('❌ Find inactive learners error:', error.message);
    return [];
  }
}

function getDaysSinceLastActivity(email) {
  const learner = findLearnerByEmail(email);
  if (!learner) return null;
  
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
  const lastActivity = sheet.getRange(learner.row, 14).getValue();
  
  if (!lastActivity) return null;
  
  const daysSince = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
  return daysSince;
}

function updateLastActivity(email) {
  try {
    const learner = findLearnerByEmail(email);
    if (!learner) return false;
    
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
    sheet.getRange(learner.row, 14).setValue(new Date());
    
    return true;
  } catch (error) {
    console.error('❌ Update last activity error:', error);
    return false;
  }
}

function logReminderSent(email, moduleNumber) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let reminderSheet = ss.getSheetByName('ReminderLog');
    
    if (!reminderSheet) {
      reminderSheet = ss.insertSheet('ReminderLog');
      reminderSheet.appendRow(['Timestamp', 'Email', 'Module', 'Days Inactive', 'Status']);
      reminderSheet.getRange(1, 1, 1, 5)
        .setBackground('#4285f4')
        .setFontColor('white')
        .setFontWeight('bold');
    }
    
    const learner = findLearnerByEmail(email);
    const daysSince = getDaysSinceLastActivity(email);
    
    reminderSheet.appendRow([
      new Date(),
      email,
      moduleNumber,
      daysSince,
      'Sent'
    ]);
    
    updateLastActivity(email);
    
    return true;
  } catch (error) {
    console.error('❌ Log reminder error:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════
// SETUP & INITIALIZATION
// ═══════════════════════════════════════════════════════════

function createLearnersSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  if (ss.getSheetByName('Learners')) {
    console.log('Learners sheet already exists');
    return;
  }
  const sheet = ss.insertSheet('Learners');
  const headers = [
    'Timestamp', 'Name and surname', 'Email Address', 'Phone number', 
    'Modules covered', 'Career Interest', 'Program Name', 'Brief Summary', 
    'Location', 'CV Link', 'Current Level', 'Status', 'Current Module', 
    'Last Activity Date', 'Module 0 Completed', 'Module 1 Completed', 
    'Module 2 Completed', 'Module 3 Completed', 'Notes'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setBackground('#4285f4')
    .setFontColor('white')
    .setFontWeight('bold');
  sheet.setFrozenRows(1);
  console.log('Learners sheet created successfully');
}

function installFormTriggers() {
  const formIds = [
    '1FAIpQLScJQh93UVH9CB78SIN-vRS-w9Lu7f5pS_ljWY6W39cfJW6FuA',
    '1FAIpQLScmy__NjAQgAdsPH1xisMGNjfBX57eA1mvUZ3epdYMe94Euxw',
    '1FAIpQLSfGsPLp8suWoGIk2Gn7XmzH9X0pVI3iRviI4gega8x2d6Lz5Q',
    '1FAIpQLSdvMuiMp4dN022sQo-Q01f24gKl8v98R2uqyftyzB3loVn-NA'
  ];
  
  // Remove existing triggers
  const existingTriggers = ScriptApp.getProjectTriggers();
  existingTriggers.forEach(t => {
    if (t.getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(t);
    }
  });
  
  // Install new triggers
  formIds.forEach(id => {
    try {
      const form = FormApp.openById(id);
      ScriptApp.newTrigger('onFormSubmit')
        .forForm(form)
        .onFormSubmit()
        .create();
      console.log(`Trigger installed for form ${id}`);
    } catch (e) {
      console.error('Trigger error for', id, e);
    }
  });
  
  console.log('Form triggers installation complete');
}
