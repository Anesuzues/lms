/**
 * COMPLETE GOOGLE APPS SCRIPT - FIXED VERSION
 * All field mappings corrected based on actual form structure
 * 
 * SETUP STEPS:
 * 1. Copy this entire code to your Code.gs
 * 2. Save (Ctrl+S)
 * 3. Run setupTriggersFromSpreadsheet()
 * 4. Run diagnoseSetup() to verify
 * 5. Test with a real form submission
 */

// CONFIGURATION VALUES
const ADMIN_EMAIL = 'learning@nobztech.co.za';
const WEB_APP_URL = 'https://limpopo-launchpad.vercel.app';
const SHEET_ID = '15c8HzDixzPZQA9n6qtxTZBcCTxW6waQt4V-tHzR6e7w';

// MODULE FORMS
const MODULE_FORMS = {
  0: "https://docs.google.com/forms/d/e/1FAIpQLScJQh93UVH9CB78SIN-vRS-w9Lu7f5pS_ljWY6W39cfJW6FuA/viewform",
  1: "https://docs.google.com/forms/d/e/1FAIpQLScmy__NjAQgAdsPH1xisMGNjfBX57eA1mvUZ3epdYMe94Euxw/viewform",
  2: "https://docs.google.com/forms/d/e/1FAIpQLSfGsPLp8suWoGIk2Gn7XmzH9X0pVI3iRviI4gega8x2d6Lz5Q/viewform",
  3: "https://docs.google.com/forms/d/e/1FAIpQLSdvMuiMp4dN022sQo-Q01f24gKl8v98R2uqyftyzB3loVn-NA/viewform"
};

// ===== INTAKE HANDLER (CORRECTED FIELD MAPPING) =====

function handleIntakeSubmit(e) {
  try {
    console.log('=== INTAKE FORM SUBMITTED ===');
    
    const values = e.values;
    console.log('Form response data:', values);
    
    // CORRECTED FIELD MAPPING based on your actual form structure
    // Your form data: [timestamp, fullName, email, whatsapp, currentLevel, skills, motivation, empty, location, cvUrl]
    const formData = {
      timestamp: values[0],    // Timestamp
      fullName: values[1],     // Full Name
      email: values[2],        // Email (was [4], now [2]) ✅ FIXED
      whatsapp: values[3],     // WhatsApp (was [5], now [3]) ✅ FIXED
      currentLevel: values[4], // Current Level / Field
      skills: values[5],       // Skills/Interests
      motivation: values[6],   // Motivation
      location: values[8],     // Location
      cvUrl: values[9]         // CV Upload
    };
    
    console.log('Extracted data:', formData);
    
    // Validate required fields
    if (!formData.fullName || !formData.email) {
      console.error('Missing required fields:', formData);
      sendErrorNotification(
        'Intake Submission Error - Missing Fields',
        `Missing data:\nName: ${formData.fullName}\nEmail: ${formData.email}\n\nFull response: ${JSON.stringify(values)}`
      );
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      console.error('Invalid email format:', formData.email);
      sendErrorNotification(
        'Intake Submission Error - Invalid Email',
        `Invalid email: ${formData.email}\n\nFull response: ${JSON.stringify(values)}`
      );
      return;
    }
    
    console.log('✅ Validation passed');
    
    // Check for duplicate enrollment
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
    const existingData = sheet.getDataRange().getValues();
    
    const isDuplicate = existingData.some((row, index) => {
      if (index === 0) return false; // Skip header
      return row[2] && row[2].toString().toLowerCase() === formData.email.toLowerCase(); // Column C = email
    });
    
    if (isDuplicate) {
      console.log('⚠️  Duplicate enrollment detected for:', formData.email);
      sendDuplicateEnrollmentEmail(formData.email, formData.fullName);
      return;
    }
    
    console.log('✅ No duplicate found - processing new enrollment');
    
    // Add learner to tracking sheet
    const success = addLearnerToSheet(
      formData.email,
      formData.fullName,
      formData.whatsapp,
      formData.currentLevel
    );
    
    if (success) {
      console.log('✅ Learner added to sheet');
      
      // Send Module 0 email
      const emailSent = sendModuleEmail(formData.email, formData.fullName, 0);
      
      if (emailSent) {
        console.log('✅ Module 0 email sent successfully');
      } else {
        console.error('❌ Failed to send Module 0 email');
      }
    } else {
      console.error('❌ Failed to add learner to sheet');
    }
    
  } catch (error) {
    console.error('❌ ERROR in handleIntakeSubmit:', error.message);
    console.error('Stack:', error.stack);
    sendErrorNotification('Intake Handler Error', error.message + '\n\n' + error.stack);
  }
}

// ===== HELPER FUNCTION TO ADD LEARNER =====

function addLearnerToSheet(email, fullName, whatsapp, currentLevel) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
    if (!sheet) {
      console.error('Learners sheet not found');
      return false;
    }
    
    const newRow = [
      new Date(),              // A: Timestamp
      fullName,                // B: Full Name
      email.toLowerCase(),     // C: Email
      whatsapp,                // D: WhatsApp
      currentLevel,            // E: Current Level
      'ACTIVE',                // F: Status
      0,                       // G: Current Module
      new Date(),              // H: Last Activity Date
      false,                   // I: Module 0 Completed
      false,                   // J: Module 1 Completed
      false,                   // K: Module 2 Completed
      false,                   // L: Module 3 Completed
      ''                       // M: Notes
    ];
    
    sheet.appendRow(newRow);
    console.log('✅ Learner added to sheet:', email);
    return true;
    
  } catch (error) {
    console.error('❌ Error adding learner to sheet:', error);
    return false;
  }
}

// ===== EMAIL FUNCTIONS =====

function sendModuleEmail(email, name, moduleNumber) {
  try {
    console.log(`Attempting to send Module ${moduleNumber} email to: ${email}`);
    
    if (!email || !name || moduleNumber === undefined) {
      console.error('Missing required parameters:', { email, name, moduleNumber });
      return false;
    }
    
    const moduleData = getModuleData(moduleNumber);
    if (!moduleData) {
      console.error('Invalid module number:', moduleNumber);
      return false;
    }
    
    const subject = `NobzTech Free Course – Module ${moduleNumber}`;
    const body = generateModuleEmailBody(name, moduleNumber, moduleData);
    
    console.log('Email subject:', subject);
    console.log('Email body length:', body.length);
    console.log('Email recipient:', email);
    
    GmailApp.sendEmail(email, subject, body, {
      name: 'NobzTech Team',
      noReply: false
    });
    
    console.log(`✅ Module ${moduleNumber} email sent successfully to: ${email}`);
    return true;
    
  } catch (error) {
    console.error(`❌ FAILED to send module ${moduleNumber} email to ${email}`);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    sendErrorNotification(
      `Email Send Failure - Module ${moduleNumber}`, 
      `Failed to send to: ${email}\nError: ${error.message}\nStack: ${error.stack}`
    );
    return false;
  }
}

function sendCompletionEmail(email, name) {
  try {
    console.log('Attempting to send completion email to:', email);
    
    if (!email || !name) {
      console.error('Missing required parameters for completion email');
      return false;
    }
    
    const subject = 'Congratulations! NobzTech Course Complete';
    const body = `Congratulations ${name},

You've completed the NobzTech Free Course.

You'll now be invited to:
• CV Workshop
• Interview Prep
• WIL Readiness Sessions

Well done.

– NobzTech Team`;
    
    GmailApp.sendEmail(email, subject, body, {
      name: 'NobzTech Team'
    });
    
    console.log('✅ Completion email sent successfully to:', email);
    return true;
    
  } catch (error) {
    console.error('❌ FAILED to send completion email to:', email);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    sendErrorNotification('Completion Email Failure', `Failed to send to: ${email}\nError: ${error.message}`);
    return false;
  }
}

function sendDuplicateEnrollmentEmail(email, name) {
  try {
    console.log('Attempting to send duplicate enrollment email to:', email);
    
    if (!email || !name) {
      console.error('Missing required parameters for duplicate email');
      return false;
    }
    
    const subject = 'NobzTech Course - Welcome Back!';
    const body = `Hi ${name},

We noticed you tried to enroll again in the NobzTech Workplace Readiness Course.

Good news - you're already enrolled! You can access your dashboard and continue where you left off.

If you're having trouble accessing your modules, please reply to this email.

Keep learning!

– NobzTech Team`;
    
    GmailApp.sendEmail(email, subject, body, {
      name: 'NobzTech Team'
    });
    
    console.log('✅ Duplicate enrollment email sent to:', email);
    return true;
    
  } catch (error) {
    console.error('❌ FAILED to send duplicate enrollment email to:', email);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return false;
  }
}

function generateModuleEmailBody(name, moduleNumber, moduleData) {
  return `Hi ${name},

You now have access to Module ${moduleNumber}: ${moduleData.title}

${moduleData.subtitle}

🎥 Watch here:
${moduleData.videoLinks.join('\n')}

📝 Complete the questions:
${moduleData.formLink}

Your progress is tracked automatically.

– NobzTech Team`;
}

function getModuleData(moduleNumber) {
  const modules = {
    0: {
      title: "Foundations",
      subtitle: "AI literacy, research mindset, workplace context, WIL preparation",
      videoLinks: [
        "https://www.youtube.com/watch?v=nuEhBT31KQw",
        "https://www.youtube.com/watch?v=uIklPjEHtNc"
      ],
      formLink: MODULE_FORMS[0]
    },
    1: {
      title: "CV & AI", 
      subtitle: "CV creation, self-presentation, ethical AI use",
      videoLinks: [
        "https://www.youtube.com/watch?v=C67edx_QBIk",
        "https://www.youtube.com/watch?v=Bi40ZSV8FWI"
      ],
      formLink: MODULE_FORMS[1]
    },
    2: {
      title: "Interview Readiness",
      subtitle: "Interview preparation, confidence, simulation", 
      videoLinks: [
        "https://www.youtube.com/watch?v=-2r1pG9Y48Q",
        "https://www.youtube.com/watch?v=iGGkmKN8ilw",
        "https://www.youtube.com/watch?v=9fDZ42pwSEI"
      ],
      formLink: MODULE_FORMS[2]
    },
    3: {
      title: "Work Conduct & WIL Readiness",
      subtitle: "Professional behaviour, job search maturity, workplace expectations",
      videoLinks: [
        "https://www.youtube.com/watch?v=XOYLHOm-AVw"
      ],
      formLink: MODULE_FORMS[3]
    }
  };
  
  return modules[moduleNumber] || null;
}

// ===== MODULE PROGRESSION HANDLERS =====

function handleModuleSubmit(e, moduleNumber) {
  try {
    console.log(`=== MODULE ${moduleNumber} FORM SUBMITTED ===`);
    
    const responses = e.values;
    const email = responses[1]; // Email should be first question in module forms
    
    if (!email) {
      console.error('No email found in module form submission');
      return;
    }
    
    const learner = findLearnerByEmail(email);
    if (!learner) {
      console.error('Learner not found:', email);
      return;
    }
    
    // Prevent module skipping
    if (learner.currentModule !== moduleNumber) {
      console.error(`Module skipping attempt: Learner at module ${learner.currentModule}, trying to submit module ${moduleNumber}`);
      return;
    }
    
    // Check for duplicate submission
    const moduleCompletedCol = `module${moduleNumber}Completed`;
    if (learner[moduleCompletedCol]) {
      console.log(`Duplicate submission detected for ${email} on module ${moduleNumber}`);
      return;
    }
    
    // Update learner progress
    updateLearnerProgress(email, moduleNumber);
    
    // Send next module or completion email
    if (moduleNumber < 3) {
      sendModuleEmail(email, learner.fullName, moduleNumber + 1);
    } else {
      sendCompletionEmail(email, learner.fullName);
      updateLearnerStatusByEmail(email, 'COMPLETED');
    }
    
    console.log(`✅ Module ${moduleNumber} processing completed for:`, email);
    
  } catch (error) {
    console.error(`❌ Error in handleModuleSubmit for module ${moduleNumber}:`, error);
    console.error('Error stack:', error.stack);
  }
}

// Module-specific handlers
function onModule0Submit(e) { handleModuleSubmit(e, 0); }
function onModule1Submit(e) { handleModuleSubmit(e, 1); }
function onModule2Submit(e) { handleModuleSubmit(e, 2); }
function onModule3Submit(e) { handleModuleSubmit(e, 3); }

// ===== UTILITY FUNCTIONS =====

function findLearnerByEmail(email) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
    if (!sheet) return null;
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailColIndex = headers.indexOf('Email');
    
    if (emailColIndex === -1) return null;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailColIndex] && data[i][emailColIndex].toString().toLowerCase() === email.toLowerCase()) {
        return {
          row: i + 1,
          fullName: data[i][headers.indexOf('Full Name')],
          email: data[i][emailColIndex],
          status: data[i][headers.indexOf('Status')],
          currentModule: data[i][headers.indexOf('Current Module')],
          module0Completed: data[i][headers.indexOf('Module 0 Completed')],
          module1Completed: data[i][headers.indexOf('Module 1 Completed')],
          module2Completed: data[i][headers.indexOf('Module 2 Completed')],
          module3Completed: data[i][headers.indexOf('Module 3 Completed')]
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding learner:', error);
    return null;
  }
}

function updateLearnerProgress(email, completedModule) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
    const learner = findLearnerByEmail(email);
    
    if (!learner) return;
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Update completed module column
    const moduleCompletedCol = headers.indexOf(`Module ${completedModule} Completed`) + 1;
    if (moduleCompletedCol > 0) {
      sheet.getRange(learner.row, moduleCompletedCol).setValue(true);
    }
    
    // Update current module
    const currentModuleCol = headers.indexOf('Current Module') + 1;
    if (currentModuleCol > 0) {
      const nextModule = completedModule < 3 ? completedModule + 1 : 3;
      sheet.getRange(learner.row, currentModuleCol).setValue(nextModule);
    }
    
    // Update last activity date
    const lastActivityCol = headers.indexOf('Last Activity Date') + 1;
    if (lastActivityCol > 0) {
      sheet.getRange(learner.row, lastActivityCol).setValue(new Date());
    }
    
    // Update status
    const statusCol = headers.indexOf('Status') + 1;
    if (statusCol > 0) {
      const newStatus = completedModule === 3 ? 'COMPLETED' : 'ACTIVE';
      sheet.getRange(learner.row, statusCol).setValue(newStatus);
    }
    
    console.log(`✅ Progress updated for ${email}: Module ${completedModule} completed`);
    
  } catch (error) {
    console.error('❌ Error updating learner progress:', error);
  }
}

function updateLearnerStatusByEmail(email, newStatus) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
    if (!sheet) return;
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailColIndex = headers.indexOf('Email');
    const statusColIndex = headers.indexOf('Status');
    
    if (emailColIndex === -1 || statusColIndex === -1) return;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailColIndex] && data[i][emailColIndex].toString().toLowerCase() === email.toLowerCase()) {
        sheet.getRange(i + 1, statusColIndex + 1).setValue(newStatus);
        console.log(`✅ Status updated for ${email}: ${newStatus}`);
        break;
      }
    }
    
  } catch (error) {
    console.error('❌ Error updating learner status:', error);
  }
}

function sendErrorNotification(title, error) {
  const subject = `NobzTech Course Error: ${title}`;
  const body = `Error occurred in NobzTech Course system:

Title: ${title}
Error: ${error}
Time: ${new Date()}

Please check the system.`;

  try {
    GmailApp.sendEmail(ADMIN_EMAIL, subject, body);
    console.log('Error notification sent to admin');
  } catch (e) {
    console.error('Failed to send error notification:', e);
  }
}

// ===== SETUP FUNCTIONS =====

function createLearnersSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    
    let sheet = spreadsheet.getSheetByName('Learners');
    if (sheet) {
      console.log('✅ Learners sheet already exists');
      return;
    }
    
    sheet = spreadsheet.insertSheet('Learners');
    
    const headers = [
      'Timestamp', 'Full Name', 'Email', 'WhatsApp', 'Current Level',
      'Status', 'Current Module', 'Last Activity Date',
      'Module 0 Completed', 'Module 1 Completed', 'Module 2 Completed', 'Module 3 Completed',
      'Notes'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
    
    sheet.setFrozenRows(1);
    
    console.log('✅ Learners sheet created successfully');
    
  } catch (error) {
    console.error('❌ Error creating learners sheet:', error);
  }
}

// ===== UNIVERSAL TRIGGER SETUP =====

function setupTriggersFromSpreadsheet() {
  try {
    console.log('=== SETTING UP UNIVERSAL TRIGGER ===');
    
    // Delete existing triggers first
    const triggers = ScriptApp.getProjectTriggers();
    console.log('Found', triggers.length, 'existing triggers');
    
    triggers.forEach(trigger => {
      ScriptApp.deleteTrigger(trigger);
      console.log('Deleted trigger:', trigger.getHandlerFunction());
    });
    
    console.log('✅ Deleted all existing triggers');
    
    // Get the spreadsheet
    const ss = SpreadsheetApp.openById(SHEET_ID);
    
    // Create trigger for the spreadsheet's form submit event
    ScriptApp.newTrigger('onAnyFormSubmit')
      .forSpreadsheet(ss)
      .onFormSubmit()
      .create();
    
    console.log('✅ Created universal form submit trigger');
    console.log('This trigger will fire for ALL forms linked to this spreadsheet');
    console.log('');
    console.log('Run diagnoseSetup() to verify');
    
  } catch (error) {
    console.error('❌ Error setting up triggers:', error.message);
    console.error('Error details:', error);
  }
}

function onAnyFormSubmit(e) {
  try {
    console.log('=== FORM SUBMISSION DETECTED ===');
    const sheet = e.range.getSheet();
    const sheetName = sheet.getName();
    const row = e.range.getRow();
    
    console.log('Sheet name:', sheetName);
    console.log('Row number:', row);
    
    // Route based on sheet name (case-insensitive)
    const lowerSheetName = sheetName.toLowerCase();
    
    if (lowerSheetName === 'learners') {
      console.log('→ Routing to Intake handler (learners sheet)');
      handleIntakeSubmit(e);
    } else if (lowerSheetName === 'module0' || lowerSheetName === 'module 0') {
      console.log('→ Routing to Module 0 handler');
      onModule0Submit(e);
    } else if (lowerSheetName === 'module1' || lowerSheetName === 'module 1') {
      console.log('→ Routing to Module 1 handler');
      onModule1Submit(e);
    } else if (lowerSheetName === 'module2' || lowerSheetName === 'module 2') {
      console.log('→ Routing to Module 2 handler');
      onModule2Submit(e);
    } else if (lowerSheetName === 'module3' || lowerSheetName === 'module 3') {
      console.log('→ Routing to Module 3 handler');
      onModule3Submit(e);
    } else {
      console.log('⚠️  Unknown form submission - sheet name:', sheetName);
      console.log('Expected one of: learners, module0, module1, module2, module3');
    }
    
  } catch (error) {
    console.error('❌ ERROR in onAnyFormSubmit:', error.message);
    console.error('Stack:', error.stack);
    sendErrorNotification('Form Submit Handler Error', error.message + '\n\n' + error.stack);
  }
}

// ===== AUTHORIZATION & DIAGNOSTIC FUNCTIONS =====

function authorizeGmail() {
  try {
    console.log('=== AUTHORIZING GMAIL ACCESS ===');
    
    GmailApp.sendEmail(
      ADMIN_EMAIL, 
      'Gmail Authorization Test', 
      'If you receive this email, Gmail permissions are working correctly!\n\n' +
      'You can now set up your form triggers.\n\n' +
      '- NobzTech System'
    );
    
    console.log('✅ Authorization successful - check your inbox at:', ADMIN_EMAIL);
    console.log('✅ Remaining email quota:', MailApp.getRemainingDailyQuota());
    
  } catch (error) {
    console.error('❌ Authorization failed:', error.message);
    console.error('Error details:', error);
  }
}

function diagnoseSetup() {
  console.log('=== SYSTEM DIAGNOSTIC ===');
  console.log('');
  
  // Check sheet access
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
    if (sheet) {
      console.log('✅ Sheet access: OK');
      console.log('   Sheet ID:', SHEET_ID);
      console.log('   Row count:', sheet.getLastRow());
      console.log('   Column count:', sheet.getLastColumn());
    } else {
      console.log('⚠️  Sheet "Learners" not found - run createLearnersSheet()');
    }
  } catch (e) {
    console.log('❌ Sheet access: FAILED');
    console.log('   Error:', e.message);
  }
  
  console.log('');
  
  // Check Gmail access
  try {
    const quota = MailApp.getRemainingDailyQuota();
    console.log('✅ Gmail access: OK');
    console.log('   Remaining quota:', quota, '/ 100 emails per day');
    if (quota < 10) {
      console.log('   ⚠️  WARNING: Low email quota remaining!');
    }
  } catch (e) {
    console.log('❌ Gmail access: FAILED');
    console.log('   Error:', e.message);
    console.log('   ACTION: Run authorizeGmail() to grant permissions');
  }
  
  console.log('');
  
  // List triggers
  const triggers = ScriptApp.getProjectTriggers();
  console.log('📋 Active triggers:', triggers.length);
  if (triggers.length === 0) {
    console.log('   ⚠️  No triggers found');
    console.log('   ACTION: Run setupTriggersFromSpreadsheet()');
  } else {
    triggers.forEach(t => {
      console.log(`   - ${t.getHandlerFunction()} (${t.getEventType()})`);
    });
  }
  
  console.log('');
  console.log('=== DIAGNOSTIC COMPLETE ===');
}

// ===== TEST FUNCTIONS =====

function test1_Authorization() {
  console.log('=== TEST 1: Gmail Authorization ===');
  authorizeGmail();
}

function test2_DirectEmail() {
  console.log('=== TEST 2: Direct Email Test ===');
  console.log('Sending test email to:', ADMIN_EMAIL);
  
  const result = sendModuleEmail(ADMIN_EMAIL, 'Test User', 0);
  
  console.log('');
  console.log('Result:', result ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Check your inbox at:', ADMIN_EMAIL);
  console.log('Check spam folder if you don\'t see it');
}

function test3_FullIntake() {
  console.log('=== TEST 3: Full Intake Test ===');
  
  // Simulating the actual form structure based on your logs
  const sampleEvent = {
    values: [
      new Date(),                          // [0] Timestamp
      'Test User 999',                     // [1] Full Name
      'test999@example.com',               // [2] Email ✅ CORRECTED
      '+27123456789',                      // [3] WhatsApp ✅ CORRECTED
      'Beginner',                          // [4] Current Level
      'Web Development, Design',           // [5] Skills
      'Want to learn new skills',          // [6] Motivation
      '',                                  // [7] Empty field
      'Cape Town',                         // [8] Location
      'https://drive.google.com/file/...'  // [9] CV URL
    ]
  };
  
  handleIntakeSubmit(sampleEvent);
  
  console.log('');
  console.log('=== TEST COMPLETED ===');
  console.log('Check:');
  console.log('1. Learners sheet for new row');
  console.log('2. test999@example.com inbox for Module 0 email');
  console.log('3. Execution log above for any errors');
}

function testAllEmailTypes() {
  console.log('=== TESTING ALL EMAIL TYPES ===');
  console.log('');
  
  console.log('1. Testing Module Email...');
  const test1 = sendModuleEmail(ADMIN_EMAIL, 'Test User', 0);
  console.log('   Result:', test1 ? 'SUCCESS' : 'FAILED');
  
  console.log('');
  console.log('2. Testing Completion Email...');
  const test2 = sendCompletionEmail(ADMIN_EMAIL, 'Test User');
  console.log('   Result:', test2 ? 'SUCCESS' : 'FAILED');
  
  console.log('');
  console.log('3. Testing Duplicate Email...');
  const test3 = sendDuplicateEnrollmentEmail(ADMIN_EMAIL, 'Test User');
  console.log('   Result:', test3 ? 'SUCCESS' : 'FAILED');
  
  console.log('');
  console.log('=== ALL TESTS COMPLETE ===');
  console.log('Check your inbox at:', ADMIN_EMAIL);
}

// ===== WEB APP HANDLER =====

function doPost(e) {
  try {
    console.log('=== WEB APP POST REQUEST ===');
    console.log('Parameters:', e.parameter);
    
    const params = e.parameter;
    
    if (params.action === 'intakeSubmit') {
      const formData = JSON.parse(params.formData);
      console.log('Processing intake submission:', formData);
      
      const intakeEvent = { values: formData };
      handleIntakeSubmit(intakeEvent);
      
      return ContentService.createTextOutput('Intake processed');
    }
    
    return ContentService.createTextOutput('Unknown action');
    
  } catch (error) {
    console.error('❌ Web app error:', error);
    return ContentService.createTextOutput('Error: ' + error.toString());
  }
}