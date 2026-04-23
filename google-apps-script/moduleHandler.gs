/**
 * DEPLOYMENT INSTRUCTIONS:
 * Copy this entire file to your Google Apps Script project as "moduleHandler.gs"
 * 
 * IMPORTANT: You need to set up form triggers for each module form:
 * 1. Go to your Google Forms for each module
 * 2. Click the 3 dots menu > Script editor
 * 3. Set up onFormSubmit triggers that call the appropriate function:
 *    - Module 0 form calls onModule0Submit(e)
 *    - Module 1 form calls onModule1Submit(e)  
 *    - Module 2 form calls onModule2Submit(e)
 *    - Module 3 form calls onModule3Submit(e)
 * 
 * NobzTech Course - Module Completion Handler
 * Handles module form submissions and progression
 */

function handleModuleSubmit(e, moduleNumber) {
  try {
    console.log(`Module ${moduleNumber} form submitted`);
    
    // Get form response data
    const responses = e.values;
    const timestamp = responses[0];
    const email = responses[1]; // Email should be first question in module forms
    
    if (!email) {
      console.error('No email found in module form submission');
      return;
    }
    
    // Find learner in sheet
    const learner = findLearnerByEmail(email);
    if (!learner) {
      console.error('Learner not found:', email);
      return;
    }
    
    // SPECIFICATION REQUIREMENT: Prevent module skipping
    if (learner.currentModule !== moduleNumber) {
      console.error(`Module skipping attempt: Learner at module ${learner.currentModule}, trying to submit module ${moduleNumber}`);
      sendErrorNotification('Module Skipping Attempt', `Learner ${email} tried to skip from module ${learner.currentModule} to ${moduleNumber}`);
      return;
    }
    
    // Check for duplicate submission
    const moduleCompletedCol = `module${moduleNumber}Completed`;
    if (learner[moduleCompletedCol]) {
      console.log(`Duplicate submission detected for ${email} on module ${moduleNumber}`);
      return; // Silently ignore duplicate submissions
    }
    
    // Update learner progress
    updateLearnerProgress(email, moduleNumber);
    
    // Send next module or completion email
    if (moduleNumber < 3) {
      // Send next module access
      sendModuleEmail(email, learner.fullName, moduleNumber + 1);
    } else {
      // Send completion email and mark as COMPLETED
      sendCompletionEmail(email, learner.fullName);
      updateLearnerStatus(email, 'COMPLETED');
    }
    
    console.log(`Module ${moduleNumber} processing completed for:`, email);
    
  } catch (error) {
    console.error(`Error in handleModuleSubmit for module ${moduleNumber}:`, error);
    sendErrorNotification(`Module ${moduleNumber} Handler Error`, error.toString());
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

function updateLearnerProgress(email, completedModule) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Learners');
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
    
    console.log(`Progress updated for ${email}: Module ${completedModule} completed`);
    
  } catch (error) {
    console.error('Error updating learner progress:', error);
  }
}

function updateLearnerStatus(email, newStatus) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Learners');
    const learner = findLearnerByEmail(email);
    
    if (!learner) return;
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const statusCol = headers.indexOf('Status') + 1;
    
    if (statusCol > 0) {
      sheet.getRange(learner.row, statusCol).setValue(newStatus);
      console.log(`Status updated for ${email}: ${newStatus}`);
    }
    
  } catch (error) {
    console.error('Error updating learner status:', error);
  }
}

// Specific handlers for each module form
function onModule0Submit(e) {
  handleModuleSubmit(e, 0);
}

function onModule1Submit(e) {
  handleModuleSubmit(e, 1);
}

function onModule2Submit(e) {
  handleModuleSubmit(e, 2);
}

function onModule3Submit(e) {
  handleModuleSubmit(e, 3);
}