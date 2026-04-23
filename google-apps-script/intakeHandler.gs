/**
 * GOOGLE APPS SCRIPT DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. Go to script.google.com and create a new project
 * 2. This file should be renamed to "Code.gs" (the main file)
 * 3. Copy the other files: emailService.gs, moduleHandler.gs, utils.gs
 * 4. Update configuration values below (marked with TODO)
 * 5. Set up Google Sheet for data storage
 * 6. Deploy as web app with "Anyone" access
 * 7. Copy the deployment URL for your React app
 * 
 * See GOOGLE_APPS_SCRIPT_DEPLOYMENT.md for detailed instructions
 */

/**
 * NobzTech Course - Intake Form Handler
 * Handles new student registrations and sends Module 0 access
 */

// CONFIGURATION VALUES - UPDATED
const ADMIN_EMAIL = 'learning@nobztech.co.za'; // Admin email for notifications
const WEB_APP_URL = 'https://limpopo-launchpad.vercel.app'; // Deployed React app URL

// TEST FUNCTION - Use this to debug form data mapping
function testIntakeWithSampleData() {
  console.log('Testing intake handler with sample data...');
  
  // Create sample form response data - adjust positions based on your actual form
  const sampleEvent = {
    values: [
      new Date(),                    // Position 0: Timestamp
      'Test User',                   // Position 1: Full Name
      'Some other field',            // Position 2: (unknown field)
      'Another field',               // Position 3: (unknown field)
      'anesukamombe8@gmail.com',     // Position 4: Email
      '+27123456789',                // Position 5: WhatsApp
      'Motivation text',             // Position 6: Motivation
      'Beginner'                     // Position 7: Current Level
    ]
  };
  
  // Call the handler
  handleIntakeSubmit(sampleEvent);
  console.log('Test completed - check execution log for results');
}

function handleIntakeSubmit(e) {
  try {
    console.log('Intake form submitted');
    const responses = e.values;
    console.log('Form response data:', responses);
    
    // Get the learners sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Learners');
    if (!sheet) {
      console.error('Learners sheet not found');
      return;
    }
    
    // Get headers to map responses correctly
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Helper to get value by header name
    const getVal = (headerName) => {
      const index = headers.indexOf(headerName);
      return index !== -1 ? responses[index] : '';
    };

    // New Mapping based on exact requested fields
    const email = getVal('Email Address') || getVal('Email Address?') || getVal('Email');
    const fullName = getVal('Name and surname?') || getVal('Name and surname') || getVal('Full Name');
    const phone = getVal('Phone number?') || getVal('Phone number') || getVal('WhatsApp');
    const modulesCovered = getVal('Modules covered?') || getVal('Modules covered');
    const careerInterest = getVal('Career Interest (choose all that apply)') || getVal('Career Interest');
    const programName = getVal('Provide the program name you were on?') || getVal('Program Name');
    const summary = getVal('Give us a brief summary about yourself and your outcome from the qualification you are working towards?') || getVal('Brief Summary');
    const location = getVal('Where are you based?') || getVal('Location');
    const cvLink = getVal('Share updated CV') || getVal('CV Link');
    
    console.log('Extracted data:', { fullName, email, phone, location });
    
    if (!email) {
      console.error('Email is missing from submission');
      return;
    }
    
    // Check if email already exists
    const lastRow = sheet.getLastRow();
    let emailExists = false;
    if (lastRow > 1) {
      let emailColIndex = headers.indexOf('Email Address');
      if (emailColIndex === -1) emailColIndex = headers.indexOf('Email Address?');
      if (emailColIndex === -1) emailColIndex = headers.indexOf('Email');
      if (emailColIndex !== -1) {
        const existingEmails = sheet.getRange(2, emailColIndex + 1, lastRow - 1, 1).getValues();
        emailExists = existingEmails.some(row => 
          row[0] && row[0].toString().toLowerCase() === email.toLowerCase()
        );
      }
    }
    
    if (emailExists) {
      console.log('Email already exists:', email);
      sendDuplicateEnrollmentEmail(email, fullName);
      return;
    }
    
    // Build the new row based on the header structure
    // We'll map values to headers to ensure correct placement
    const newRow = headers.map(header => {
      switch(header) {
        case 'Timestamp': return responses[0] || new Date();
        case 'Name and surname?':
        case 'Name and surname':
        case 'Full Name': return fullName;
        case 'Email Address?':
        case 'Email Address':
        case 'Email': return email ? email.toLowerCase() : '';
        case 'Phone number?':
        case 'Phone number':
        case 'WhatsApp': return phone;
        case 'Modules covered?':
        case 'Modules covered': return modulesCovered;
        case 'Career Interest (choose all that apply)':
        case 'Career Interest': return careerInterest;
        case 'Provide the program name you were on?':
        case 'Program Name': return programName;
        case 'Give us a brief summary about yourself and your outcome from the qualification you are working towards?':
        case 'Brief Summary': return summary;
        case 'Where are you based?':
        case 'Location': return location;
        case 'Share updated CV':
        case 'CV Link': return cvLink;
        case 'Status': return 'NEW';
        case 'Current Module': return 0;
        case 'Last Activity Date': return new Date();
        case 'Module 0 Completed': return false;
        case 'Module 1 Completed': return false;
        case 'Module 2 Completed': return false;
        case 'Module 3 Completed': return false;
        case 'Notes': return summary || '';
        default: return '';
      }
    });
    
    sheet.appendRow(newRow);
    console.log('New learner added:', email);
    
    // Send Module 0 access email
    sendModuleEmail(email, fullName, 0);
    
    // Update status to ACTIVE
    updateLearnerStatusByEmail(email, 'ACTIVE');
    
  } catch (error) {
    console.error('Error in handleIntakeSubmit:', error);
    sendErrorNotification('Intake Handler Error', error.toString());
  }
}

function sendDuplicateEnrollmentEmail(email, name) {
  const subject = 'NobzTech Course - Welcome Back!';
  const body = `
Hi ${name},

We noticed you tried to enroll again in the NobzTech Workplace Readiness Course.

Good news - you're already enrolled! You can access your dashboard and continue where you left off:

🎯 Access Your Dashboard: ${getWebAppUrl()}/dashboard

If you're having trouble accessing your modules, please reply to this email.

Keep learning!
– NobzTech Team
  `;
  
  try {
    GmailApp.sendEmail(email, subject, body);
    console.log('Duplicate enrollment email sent to:', email);
  } catch (error) {
    console.error('Error sending duplicate enrollment email:', error);
  }
}

function getWebAppUrl() {
  // TODO: Replace with your actual React app URL
  return WEB_APP_URL;
}

function updateLearnerStatusByEmail(email, newStatus) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Learners');
    if (!sheet) return;
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const emailColIndex = headers.indexOf('Email');
    const statusColIndex = headers.indexOf('Status');
    
    if (emailColIndex === -1 || statusColIndex === -1) return;
    
    // Find learner row and update status
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailColIndex] && data[i][emailColIndex].toString().toLowerCase() === email.toLowerCase()) {
        sheet.getRange(i + 1, statusColIndex + 1).setValue(newStatus);
        console.log(`Status updated for ${email}: ${newStatus}`);
        break;
      }
    }
    
  } catch (error) {
    console.error('Error updating learner status:', error);
  }
}

function sendErrorNotification(title, error) {
  const adminEmail = ADMIN_EMAIL; // Uses the configuration value above
  const subject = `NobzTech Course Error: ${title}`;
  const body = `
Error occurred in NobzTech Course system:

Title: ${title}
Error: ${error}
Time: ${new Date()}

Please check the system.
  `;
  
  try {
    GmailApp.sendEmail(adminEmail, subject, body);
  } catch (e) {
    console.error('Failed to send error notification:', e);
  }
}