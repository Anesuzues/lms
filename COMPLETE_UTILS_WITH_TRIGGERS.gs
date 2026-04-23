/**
 * COMPLETE GOOGLE APPS SCRIPT CODE WITH AUTOMATIC TRIGGERS
 * Copy this entire file to your Google Apps Script project as "utils.gs"
 * 
 * SETUP STEPS AFTER DEPLOYMENT:
 * 1. Run createLearnersSheet() once to set up your data sheet
 * 2. Run installFormTriggers() to set up automatic email triggers
 * 3. Test with testEmailService() function
 * 
 * NobzTech Course - Complete System with Automatic Module Progression
 */

// UPDATED WITH YOUR ACTUAL GOOGLE FORMS
const MODULE_FORMS = {
  0: "https://docs.google.com/forms/d/e/1FAIpQLScJQh93UVH9CB78SIN-vRS-w9Lu7f5pS_ljWY6W39cfJW6FuA/viewform",
  1: "https://docs.google.com/forms/d/e/1FAIpQLScmy__NjAQgAdsPH1xisMGNjfBX57eA1mvUZ3epdYMe94Euxw/viewform",
  2: "https://docs.google.com/forms/d/e/1FAIpQLSfGsPLp8suWoGIk2Gn7XmzH9X0pVI3iRviI4gega8x2d6Lz5Q/viewform",
  3: "https://docs.google.com/forms/d/e/1FAIpQLSdvMuiMp4dN022sQo-Q01f24gKl8v98R2uqyftyzB3loVn-NA/viewform"
};

const FORM_IDS = {
  INTAKE: '17f_dVJEPQweDEuNl4QPf0v7I2sa7uRAZKuyH1w_UaYY', // Intake/enrollment form
  MODULE_0: '1FAIpQLScJQh93UVH9CB78SIN-vRS-w9Lu7f5pS_ljWY6W39cfJW6FuA', 
  MODULE_1: '1FAIpQLScmy__NjAQgAdsPH1xisMGNjfBX57eA1mvUZ3epdYMe94Euxw',
  MODULE_2: '1FAIpQLSfGsPLp8suWoGIk2Gn7XmzH9X0pVI3iRviI4gega8x2d6Lz5Q',
  MODULE_3: '1FAIpQLSdvMuiMp4dN022sQo-Q01f24gKl8v98R2uqyftyzB3loVn-NA'
};

// ===== AUTOMATIC TRIGGER FUNCTIONS FOR MODULE PROGRESSION =====

function onFormSubmitTrigger(e) {
  try {
    console.log('=== FORM TRIGGER ACTIVATED ===');
    
    // Get the form that was submitted
    const form = e.source;
    const formId = form.getId();
    console.log('Form ID:', formId);
    
    // Get the response data
    const response = e.response;
    const email = response.getRespondentEmail();
    
    if (!email) {
      console.log('No email found in form response');
      return;
    }
    
    console.log('Email found:', email);
    
    // Determine which module was completed based on form ID
    const completedModule = getModuleNumberFromFormId(formId);
    
    if (completedModule === null) {
      console.log('Unknown form ID:', formId);
      return;
    }
    
    console.log(`Module ${completedModule} completed by:`, email);
    
    // Send next module or completion email
    sendNextModuleOrCompletion(email, completedModule);
    
  } catch (error) {
    console.error('Error in onFormSubmitTrigger:', error);
  }
}

function getModuleNumberFromFormId(formId) {
  // Extract form ID from your MODULE_FORMS URLs and map to module numbers
  const formIdMap = {
    '1FAIpQLScJQh93UVH9CB78SIN-vRS-w9Lu7f5pS_ljWY6W39cfJW6FuA': 0,
    '1FAIpQLScmy__NjAQgAdsPH1xisMGNjfBX57eA1mvUZ3epdYMe94Euxw': 1,
    '1FAIpQLSfGsPLp8suWoGIk2Gn7XmzH9X0pVI3iRviI4gega8x2d6Lz5Q': 2,
    '1FAIpQLSdvMuiMp4dN022sQo-Q01f24gKl8v98R2uqyftyzB3loVn-NA': 3
  };
  
  return formIdMap[formId] !== undefined ? formIdMap[formId] : null;
}

function sendNextModuleOrCompletion(email, completedModule) {
  // Extract name from email or use a default
  const name = email.split('@')[0]; // Simple name extraction
  
  const nextModule = completedModule + 1;
  
  if (nextModule <= 3) {
    // Send next module email
    sendModuleEmail(email, name, nextModule);
    console.log(`✅ Sent module ${nextModule} email to ${email}`);
  } else {
    // Send completion email (completed module 3)
    sendCompletionEmail(email, name);
    console.log(`🎉 Sent completion email to ${email}`);
  }
}

function installFormTriggers() {
  console.log('=== INSTALLING FORM TRIGGERS ===');
  
  // Install triggers for each Google Form
  const formIds = [
    '1FAIpQLScJQh93UVH9CB78SIN-vRS-w9Lu7f5pS_ljWY6W39cfJW6FuA', // Module 0
    '1FAIpQLScmy__NjAQgAdsPH1xisMGNjfBX57eA1mvUZ3epdYMe94Euxw', // Module 1
    '1FAIpQLSfGsPLp8suWoGIk2Gn7XmzH9X0pVI3iRviI4gega8x2d6Lz5Q', // Module 2
    '1FAIpQLSdvMuiMp4dN022sQo-Q01f24gKl8v98R2uqyftyzB3loVn-NA'  // Module 3
  ];
  
  try {
    // Delete existing triggers first
    const existingTriggers = ScriptApp.getProjectTriggers();
    existingTriggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'onFormSubmitTrigger') {
        ScriptApp.deleteTrigger(trigger);
        console.log('Deleted old trigger');
      }
    });
    
    // Install new triggers for each form
    let successCount = 0;
    formIds.forEach((formId, index) => {
      try {
        const form = FormApp.openById(formId);
        ScriptApp.newTrigger('onFormSubmitTrigger')
          .create(form)
          .onFormSubmit();
        console.log(`✅ Trigger installed for Module ${index} form`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to install trigger for Module ${index}:`, error);
      }
    });
    
    console.log(`=== TRIGGER INSTALLATION COMPLETE: ${successCount}/${formIds.length} successful ===`);
    
  } catch (error) {
    console.error('Error installing form triggers:', error);
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
    console.log(`Module ${moduleNumber} email sent to:`, email);
    
  } catch (error) {
    console.error(`Error sending module ${moduleNumber} email:`, error);
  }
}

function sendCompletionEmail(email, name) {
  try {
    // SPECIFICATION-COMPLIANT COMPLETION EMAIL
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
    console.log('Completion email sent to:', email);
    
  } catch (error) {
    console.error('Error sending completion email:', error);
  }
}

function generateModuleEmailBody(name, moduleNumber, moduleData) {
  // SPECIFICATION-COMPLIANT EMAIL TEMPLATE
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
        "https://www.youtube.com/watch?v=nuEhBT31KQw", // Every Essential AI Skill in 25 Minutes
        "https://www.youtube.com/watch?v=uIklPjEHtNc"  // A Practical Guide to Using AI for Work – Part 1
      ],
      formLink: MODULE_FORMS[0]
    },
    1: {
      title: "CV & AI", 
      subtitle: "CV creation, self-presentation, ethical AI use",
      videoLinks: [
        "https://www.youtube.com/watch?v=C67edx_QBIk", // JobSeekers: Using AI to Strengthen Your Resume & Cover
        "https://www.youtube.com/watch?v=Bi40ZSV8FWI"  // Perfecting Your Resume Using AI Technology
      ],
      formLink: MODULE_FORMS[1]
    },
    2: {
      title: "Interview Readiness",
      subtitle: "Interview preparation, confidence, simulation", 
      videoLinks: [
        "https://www.youtube.com/watch?v=-2r1pG9Y48Q", // How to Use AI to Prepare for a Job Interview
        "https://www.youtube.com/watch?v=iGGkmKN8ilw", // Top FREE AI Mock Interview Tools
        "https://www.youtube.com/watch?v=9fDZ42pwSEI"  // Interview Practice with Google AI
      ],
      formLink: MODULE_FORMS[2]
    },
    3: {
      title: "Work Conduct & WIL Readiness",
      subtitle: "Professional behaviour, job search maturity, workplace expectations",
      videoLinks: [
        "https://www.youtube.com/watch?v=XOYLHOm-AVw"  // AI Skills for the Modern Job Hunt – Full Workshop
      ],
      formLink: MODULE_FORMS[3]
    }
  };

  return modules[moduleNumber] || null;
}

// ===== EXISTING UTILITY FUNCTIONS =====

function setupTriggers() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  try {
    // Create spreadsheet trigger for form submissions
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    ScriptApp.newTrigger('onFormSubmit')
      .onFormSubmit()
      .create();
    
    console.log('Spreadsheet form submission trigger created');
    console.log('Triggers setup completed');
    
  } catch (error) {
    console.error('Error setting up triggers:', error);
    console.log('Manual trigger setup required - see instructions below');
  }
}

function onFormSubmit(e) {
  try {
    console.log('=== FORM SUBMISSION DETECTED ===');
    console.log('Event source:', e.source.getName());
    console.log('Form data:', e.values);
    console.log('Form data length:', e.values.length);
    
    const responses = e.values;
    
    // Log all responses for debugging
    responses.forEach((response, index) => {
      console.log(`Position ${index}:`, response);
    });
    
    // DETECTION LOGIC
    if (responses.length >= 7) {
      // This looks like an intake form (many fields)
      console.log('>>> DETECTED: Intake form submission');
      handleIntakeSubmit(e);
    } else if (responses.length >= 2) {
      // This looks like a module form (fewer fields)
      console.log('>>> DETECTED: Module form submission');
      
      // Find email in the responses (could be at position 1 or 2)
      let email = null;
      for (let i = 1; i < Math.min(responses.length, 4); i++) {
        if (responses[i] && typeof responses[i] === 'string' && responses[i].includes('@')) {
          email = responses[i];
          console.log(`Email found at position ${i}:`, email);
          break;
        }
      }
      
      if (email) {
        // Create a proper event object for module handling
        const moduleEvent = {
          values: responses
        };
        handleModuleFormSubmission(moduleEvent);
      } else {
        console.log('No email found in module form - cannot process');
      }
    } else {
      console.log('>>> UNKNOWN form type - too few fields');
    }
    
    console.log('=== FORM PROCESSING COMPLETED ===');
    
  } catch (error) {
    console.error('Error in onFormSubmit:', error);
  }
}

function handleModuleFormSubmission(e) {
  try {
    console.log('=== PROCESSING MODULE FORM ===');
    const responses = e.values;
    
    // Find email in responses
    let email = null;
    for (let i = 1; i < Math.min(responses.length, 4); i++) {
      if (responses[i] && typeof responses[i] === 'string' && responses[i].includes('@')) {
        email = responses[i];
        console.log(`Email found at position ${i}:`, email);
        break;
      }
    }
    
    if (!email) {
      console.error('No email found in module form submission');
      return;
    }
    
    // Find the learner to determine their current module
    const learner = findLearnerByEmail(email);
    if (!learner) {
      console.error('Learner not found for module submission:', email);
      return;
    }
    
    console.log('Learner found:', learner.fullName);
    console.log('Current module:', learner.currentModule);
    console.log('Status:', learner.status);
    
    // Process the module completion based on learner's current module
    const currentModule = learner.currentModule;
    console.log(`Processing module ${currentModule} completion for ${email}`);
    
    console.log('=== MODULE PROCESSING COMPLETED ===');
    
  } catch (error) {
    console.error('Error handling module form submission:', error);
  }
}

function createLearnersSheet() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Check if sheet already exists
    let sheet = spreadsheet.getSheetByName('Learners');
    if (sheet) {
      console.log('Learners sheet already exists');
      return;
    }
    
    // Create new sheet
    sheet = spreadsheet.insertSheet('Learners');
    
    // Set up headers
    const headers = [
      'Timestamp',           // Column A
      'Full Name',           // Column B
      'Email',               // Column C
      'WhatsApp',            // Column D
      'Current Level',       // Column E
      'Status',              // Column F
      'Current Module',      // Column G
      'Last Activity Date',  // Column H
      'Module 0 Completed',  // Column I
      'Module 1 Completed',  // Column J
      'Module 2 Completed',  // Column K
      'Module 3 Completed',  // Column L
      'Notes'                // Column M
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
    
    // Set column widths
    sheet.setColumnWidth(1, 150); // Timestamp
    sheet.setColumnWidth(2, 200); // Full Name
    sheet.setColumnWidth(3, 250); // Email
    sheet.setColumnWidth(4, 150); // WhatsApp
    sheet.setColumnWidth(5, 150); // Current Level
    sheet.setColumnWidth(6, 100); // Status
    sheet.setColumnWidth(7, 120); // Current Module
    sheet.setColumnWidth(8, 150); // Last Activity Date
    sheet.setColumnWidth(9, 120); // Module 0 Completed
    sheet.setColumnWidth(10, 120); // Module 1 Completed
    sheet.setColumnWidth(11, 120); // Module 2 Completed
    sheet.setColumnWidth(12, 120); // Module 3 Completed
    sheet.setColumnWidth(13, 300); // Notes
    
    // Freeze header row
    sheet.setFrozenRows(1);
    
    console.log('Learners sheet created successfully');
    
  } catch (error) {
    console.error('Error creating learners sheet:', error);
  }
}

function findLearnerByEmail(email) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Learners');
    if (!sheet) return null;
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find email column index
    const emailColIndex = headers.indexOf('Email');
    if (emailColIndex === -1) return null;
    
    // Find learner row - CASE INSENSITIVE MATCHING
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

// ===== TEST FUNCTIONS =====

function testEmailService() {
  // Test function to verify email sending works
  const testEmail = 'test@example.com'; // Replace with your test email
  const testName = 'Test User';
  
  try {
    sendModuleEmail(testEmail, testName, 0);
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Test email failed:', error);
  }
}

function testTriggerSystem() {
  console.log('=== TESTING TRIGGER SYSTEM ===');
  
  // Test the trigger functions with sample data
  const testEmail = 'test@example.com';
  
  console.log('Testing Module 0 completion...');
  sendNextModuleOrCompletion(testEmail, 0);
  
  console.log('Testing Module 1 completion...');
  sendNextModuleOrCompletion(testEmail, 1);
  
  console.log('Testing Module 2 completion...');
  sendNextModuleOrCompletion(testEmail, 2);
  
  console.log('Testing Module 3 completion (should send completion email)...');
  sendNextModuleOrCompletion(testEmail, 3);
  
  console.log('=== TRIGGER TEST COMPLETED ===');
}

function checkTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  console.log('=== CURRENT TRIGGERS ===');
  console.log('Total triggers:', triggers.length);
  
  triggers.forEach((trigger, index) => {
    console.log(`Trigger ${index + 1}:`);
    console.log('- Function:', trigger.getHandlerFunction());
    console.log('- Event type:', trigger.getEventType());
    console.log('- Source:', trigger.getTriggerSource());
    console.log('- Source ID:', trigger.getTriggerSourceId());
  });
  
  if (triggers.length === 0) {
    console.log('NO TRIGGERS FOUND - Run installFormTriggers() to set up automatic emails');
  }
  
  console.log('=== END TRIGGER CHECK ===');
}

// PHASE 2 FEATURES REMOVED PER SPECIFICATION
// Reminder emails are Phase 2 and explicitly excluded