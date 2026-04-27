/**
 * NOBZTECH COURSE SYSTEM - CLEAN VERSION
 * Copy this entire code into your new Google Apps Script project
 */

// CONFIGURATION
const ADMIN_EMAIL = 'learning@nobztech.co.za';
const WEB_APP_URL = 'https://limpopo-launchpad.vercel.app';

// YOUR FORM URLs
const MODULE_FORMS = {
  0: "https://docs.google.com/forms/d/e/1FAIpQLScJQh93UVH9CB78SIN-vRS-w9Lu7f5pS_ljWY6W39cfJW6FuA/viewform",
  1: "https://docs.google.com/forms/d/e/1FAIpQLScmy__NjAQgAdsPH1xisMGNjfBX57eA1mvUZ3epdYMe94Euxw/viewform",
  2: "https://docs.google.com/forms/d/e/1FAIpQLSfGsPLp8suWoGIk2Gn7XmzH9X0pVI3iRviI4gega8x2d6Lz5Q/viewform",
  3: "https://docs.google.com/forms/d/e/1FAIpQLSdvMuiMp4dN022sQo-Q01f24gKl8v98R2uqyftyzB3loVn-NA/viewform"
};

// ===== MAIN WEB APP HANDLER =====
function doPost(e) {
  try {
    const params = e.parameter;
    console.log('Web app called with action:', params.action);
    
    if (params.action === 'intakeSubmit') {
      handleIntakeSubmission(params.formData);
      return ContentService.createTextOutput('Intake processed');
    }
    
    if (params.action === 'moduleComplete') {
      const moduleNumber = parseInt(params.moduleNumber);
      const email = params.email;
      sendNextModuleOrCompletion(email, moduleNumber);
      return ContentService.createTextOutput('Module processed');
    }
    
    return ContentService.createTextOutput('Unknown action');
    
  } catch (error) {
    console.error('Web app error:', error);
    return ContentService.createTextOutput('Error: ' + error.toString());
  }
}

// ===== INTAKE PROCESSING =====
function handleIntakeSubmission(formDataString) {
  try {
    const formData = JSON.parse(formDataString);
    console.log('Processing intake:', formData);
    
    // Extract data (adjust positions based on your form)
    const timestamp = formData[0];
    const fullName = formData[1];
    const email = formData[2]; // Adjust position as needed
    
    console.log('New signup:', fullName, email);
    
    // Send Module 0 email immediately
    sendModuleEmail(email, fullName, 0);
    
    // Log to sheet (optional)
    logToSheet(timestamp, fullName, email, 'NEW', 0);
    
  } catch (error) {
    console.error('Intake processing error:', error);
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
    const body = `Hi ${name},

You now have access to Module ${moduleNumber}.

🎥 Watch here:
${moduleData.videoLinks.join('\n')}

📝 Complete the questions:
${moduleData.formLink}

Your progress is tracked automatically.

– NobzTech Team`;

    GmailApp.sendEmail(email, subject, body);
    console.log(`✅ Module ${moduleNumber} email sent to:`, email);
    
  } catch (error) {
    console.error(`Error sending module ${moduleNumber} email:`, error);
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
    console.log('🎉 Completion email sent to:', email);
    
  } catch (error) {
    console.error('Error sending completion email:', error);
  }
}

function sendNextModuleOrCompletion(email, completedModule) {
  const name = email.split('@')[0]; // Simple name extraction
  const nextModule = completedModule + 1;
  
  if (nextModule <= 3) {
    sendModuleEmail(email, name, nextModule);
  } else {
    sendCompletionEmail(email, name);
  }
}

// ===== MODULE DATA =====
function getModuleData(moduleNumber) {
  const modules = {
    0: {
      title: "Foundations",
      videoLinks: [
        "https://www.youtube.com/watch?v=nuEhBT31KQw",
        "https://www.youtube.com/watch?v=uIklPjEHtNc"
      ],
      formLink: MODULE_FORMS[0]
    },
    1: {
      title: "CV & AI",
      videoLinks: [
        "https://www.youtube.com/watch?v=C67edx_QBIk",
        "https://www.youtube.com/watch?v=Bi40ZSV8FWI"
      ],
      formLink: MODULE_FORMS[1]
    },
    2: {
      title: "Interview Readiness",
      videoLinks: [
        "https://www.youtube.com/watch?v=-2r1pG9Y48Q",
        "https://www.youtube.com/watch?v=iGGkmKN8ilw",
        "https://www.youtube.com/watch?v=9fDZ42pwSEI"
      ],
      formLink: MODULE_FORMS[2]
    },
    3: {
      title: "Work Conduct & WIL Readiness",
      videoLinks: [
        "https://www.youtube.com/watch?v=XOYLHOm-AVw"
      ],
      formLink: MODULE_FORMS[3]
    }
  };

  return modules[moduleNumber] || null;
}

// ===== OPTIONAL: LOGGING TO SHEET =====
function logToSheet(timestamp, name, email, status, currentModule) {
  try {
    // Create or get spreadsheet
    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e) {
      spreadsheet = SpreadsheetApp.create('NobzTech Learners');
    }
    
    let sheet = spreadsheet.getSheetByName('Learners');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Learners');
      // Add headers
      sheet.getRange(1, 1, 1, 5).setValues([['Timestamp', 'Name', 'Email', 'Status', 'Current Module']]);
    }
    
    // Add new row
    sheet.appendRow([timestamp, name, email, status, currentModule]);
    
  } catch (error) {
    console.error('Sheet logging error:', error);
  }
}

// ===== TEST FUNCTIONS =====
function testEmailSystem() {
  const testEmail = 'test@example.com'; // Replace with your email
  const testName = 'Test User';
  
  console.log('Testing Module 0 email...');
  sendModuleEmail(testEmail, testName, 0);
}

function testIntakeFlow() {
  const sampleData = [
    new Date(),
    'Test User',
    'test@example.com'
  ];
  
  console.log('Testing intake flow...');
  handleIntakeSubmission(JSON.stringify(sampleData));
}