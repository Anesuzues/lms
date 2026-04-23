/**
 * COMPLETE GOOGLE APPS SCRIPT - CONSOLIDATED VERSION
 * Copy this ENTIRE content to your Google Apps Script project as "Code.gs"
 * Delete all other files (emailService.gs, moduleHandler.gs, utils.gs, intakeHandler.gs)
 * 
 * SETUP STEPS:
 * 1. Copy this code to Code.gs in your Google Apps Script project
 * 2. Run createLearnersSheet() once to set up your data sheet
 * 3. Set up the intake form trigger (instructions below)
 * 4. Test with testIntakeWithSampleData() function
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

// ===== INTAKE HANDLER =====

function handleIntakeSubmit(e) {
  try {
    console.log('=== INTAKE FORM SUBMITTED ===');
    console.log('Form response data:', e.values);
    
    // Get form response data
    const responses = e.values;
    const timestamp = responses[0];
    const fullName = responses[1];
    const email = responses[4];        // Email is at position 4
    const whatsapp = responses[5];     // WhatsApp is at position 5
    const currentLevel = responses[7]; // Current Level is at position 7
    const motivation = responses[6] || '';
    
    console.log('Extracted data:', {
      timestamp, fullName, email, whatsapp, currentLevel, motivation
    });
    
    // Validate required fields
    if (!fullName || !email || !currentLevel) {
      console.error('Missing required fields:', { fullName, email, currentLevel });
      return;
    }
    
    // Get the learners sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
    if (!sheet) {
      console.error('Learners sheet not found');
      return;
    }
    
    // Check if email already exists
    const emailColumn = 3; // Column C (Email)
    const lastRow = sheet.getLastRow();
    let emailExists = false;
    
    if (lastRow > 1) {
      const existingEmails = sheet.getRange(2, emailColumn, lastRow - 1, 1).getValues();
      emailExists = existingEmails.some(row => 
        row[0] && row[0].toString().toLowerCase() === email.toLowerCase()
      );
    }
    
    if (emailExists) {
      console.log('Email already exists:', email);
      sendDuplicateEnrollmentEmail(email, fullName);
      return;
    }
    
    // Add new learner to sheet
    const newRow = [
      timestamp,              // Timestamp
      fullName,               // Full Name
      email.toLowerCase(),    // Email
      whatsapp,               // WhatsApp
      currentLevel,           // Current Level
      'NEW',                  // Status
      0,                      // Current Module
      new Date(),             // Last Activity Date
      false,                  // Module 0 Completed
      false,                  // Module 1 Completed
      false,                  // Module 2 Completed
      false,                  // Module 3 Completed
      motivation || ''        // Notes
    ];
    
    sheet.appendRow(newRow);
    console.log('New learner added:', email);
    
    // Send Module 0 access email
    sendModuleEmail(email, fullName, 0);
    
    // Update status to ACTIVE
    updateLearnerStatusByEmail(email, 'ACTIVE');
    
    console.log('✅ Intake processing completed for:', email);
    
  } catch (error) {
    console.error('❌ Error in handleIntakeSubmit:', error);
    sendErrorNotification('Intake Handler Error', error.toString());
  }
}

// ===== EMAIL FUNCTIONS =====

function sendModuleEmail(email, name, moduleNumber) {
  try {
    const moduleData = getModuleData(moduleNumber);
    if (!moduleData) {
      console.error('Invalid module number:', moduleNumber);
      return;
    }
    
    const subject = `NobzTech Free Course – Module ${moduleNumber}`;
    const body = generateModuleEmailBody(name, moduleNumber, moduleData);
    
    GmailApp.sendEmail(email, subject, body);
    console.log(`✅ Module ${moduleNumber} email sent to:`, email);
    
  } catch (error) {
    console.error(`❌ Error sending module ${moduleNumber} email:`, error);
  }
}

function sendCompletionEmail(email, name) {
  try {
    const subject = 'Congratulations! NobzTech Course Complete';
    const body = `Congratulations ${name},

You've completed the NobzTech Free Course.

You'll now be invited to:
• CV Workshop
• Interview Prep
• WIL Readiness Sessions

Well done.

– NobzTech Team`;

    GmailApp.sendEmail(email, subject, body);
    console.log('✅ Completion email sent to:', email);
    
  } catch (error) {
    console.error('❌ Error sending completion email:', error);
  }
}

function sendDuplicateEnrollmentEmail(email, name) {
  const subject = 'NobzTech Course - Welcome Back!';
  const body = `Hi ${name},

We noticed you tried to enroll again in the NobzTech Workplace Readiness Course.

Good news - you're already enrolled! You can access your dashboard and continue where you left off.

If you're having trouble accessing your modules, please reply to this email.

Keep learning!

– NobzTech Team`;

  try {
    GmailApp.sendEmail(email, subject, body);
    console.log('✅ Duplicate enrollment email sent to:', email);
  } catch (error) {
    console.error('❌ Error sending duplicate enrollment email:', error);
  }
}

function generateModuleEmailBody(name, moduleNumber, moduleData) {
  return `Hi ${name},

You now have access to Module ${moduleNumber}.

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

// ===== TEST FUNCTIONS =====

function testIntakeWithSampleData() {
  console.log('=== TESTING INTAKE HANDLER ===');
  
  const sampleEvent = {
    values: [
      new Date(),                    // Position 0: Timestamp
      'Test User',                   // Position 1: Full Name
      'Some other field',            // Position 2: (unknown field)
      'Another field',               // Position 3: (unknown field)
      'test@example.com',            // Position 4: Email
      '+27123456789',                // Position 5: WhatsApp
      'Motivation text',             // Position 6: Motivation
      'Beginner'                     // Position 7: Current Level
    ]
  };
  
  handleIntakeSubmit(sampleEvent);
  console.log('=== TEST COMPLETED ===');
}

function testDirectEmail() {
  console.log('=== TESTING EMAIL FUNCTION ===');
  
  try {
    sendModuleEmail('test@example.com', 'Test User', 0);
    console.log('✅ Test email sent successfully');
  } catch (error) {
    console.error('❌ Test email failed:', error);
  }
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