/**
 * ═══════════════════════════════════════════════════════════
 * UTILITY FUNCTIONS
 * Database operations, logging, and helper functions
 * ═══════════════════════════════════════════════════════════
 */

/**
 * Find learner by email in tracking sheet
 */
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
          status: data[i][5],
          currentModule: data[i][6],
          module0Completed: data[i][8],
          module1Completed: data[i][9],
          module2Completed: data[i][10],
          module3Completed: data[i][11]
        };
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Add new learner to tracking sheet
 */
function addLearnerToTrackingSheet(email, fullName, whatsapp, currentLevel) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
    if (!sheet) return false;
    
    sheet.appendRow([
      new Date(),
      fullName,
      email.toLowerCase(),
      whatsapp,
      currentLevel,
      'ACTIVE',
      0,
      new Date(),
      false, false, false, false,
      ''
    ]);
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Update learner progress after module completion
 */
function updateLearnerProgress(email, completedModule) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
    const learner = findLearnerByEmail(email);
    if (!learner) return;
    
    sheet.getRange(learner.row, 9 + completedModule).setValue(true);
    sheet.getRange(learner.row, 7).setValue(completedModule < 3 ? completedModule + 1 : 3);
    sheet.getRange(learner.row, 8).setValue(new Date());
    
    if (completedModule === 3) {
      sheet.getRange(learner.row, 6).setValue('COMPLETED');
    }
  } catch (error) {
    console.error('❌ Update progress error:', error);
  }
}

/**
 * Update learner status
 */
function updateLearnerStatusByEmail(email, newStatus) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
    const learner = findLearnerByEmail(email);
    if (learner) {
      sheet.getRange(learner.row, 6).setValue(newStatus);
    }
  } catch (error) {
    console.error('❌ Update status error:', error);
  }
}

/**
 * Log failed emails for manual recovery
 */
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
    
    logSheet.appendRow([
      new Date(),
      email,
      emailType,
      errorMessage,
      false
    ]);
    
    console.log('📝 Failed email logged for manual recovery');
    
  } catch (error) {
    console.error('❌ Failed to log email failure:', error.message);
  }
}

/**
 * Send error notification to admin
 */
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

/**
 * Detect common email typos
 */
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

/**
 * Extract letter from MCQ answer text
 */
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

/**
 * Extract all letters from checkbox answer text
 */
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

/**
 * Find inactive learners who need reminders
 * @param {number} daysInactive - Days since last activity (default: 7)
 * @return {Array} List of inactive learners
 */
function findInactiveLearners(daysInactive = 7) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    const inactiveLearners = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);
    
    for (let i = 1; i < data.length; i++) {
      const status = data[i][5]; // Status column
      const currentModule = data[i][6]; // Current Module
      const lastActivity = data[i][7]; // Last Activity Date
      const email = data[i][2];
      const name = data[i][1];
      
      // Skip completed or inactive status
      if (status === 'COMPLETED' || status === 'INACTIVE') continue;
      
      // Skip if on final module
      if (currentModule >= 3) continue;
      
      // Check if last activity is older than cutoff
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

/**
 * Calculate days since last activity for a learner
 */
function getDaysSinceLastActivity(email) {
  const learner = findLearnerByEmail(email);
  if (!learner) return null;
  
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
  const lastActivity = sheet.getRange(learner.row, 8).getValue();
  
  if (!lastActivity) return null;
  
  const daysSince = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
  return daysSince;
}

/**
 * Update last activity date for a learner
 */
function updateLastActivity(email) {
  try {
    const learner = findLearnerByEmail(email);
    if (!learner) return false;
    
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
    sheet.getRange(learner.row, 8).setValue(new Date());
    
    return true;
  } catch (error) {
    console.error('❌ Update last activity error:', error);
    return false;
  }
}

/**
 * Log reminder sent to tracking
 */
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
    
    // Update last activity to prevent duplicate reminders
    updateLastActivity(email);
    
    return true;
  } catch (error) {
    console.error('❌ Log reminder error:', error);
    return false;
  }
}

/**
 * Find inactive learners who need reminders
 * @param {number} daysInactive - Days since last activity (default: 7)
 * @return {Array} List of inactive learners
 */
function findInactiveLearners(daysInactive = 7) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    const inactiveLearners = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);
    
    for (let i = 1; i < data.length; i++) {
      const status = data[i][5];
      const currentModule = data[i][6];
      const lastActivity = data[i][7];
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

/**
 * Calculate days since last activity for a learner
 */
function getDaysSinceLastActivity(email) {
  const learner = findLearnerByEmail(email);
  if (!learner) return null;
  
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
  const lastActivity = sheet.getRange(learner.row, 8).getValue();
  
  if (!lastActivity) return null;
  
  const daysSince = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
  return daysSince;
}

/**
 * Update last activity date for a learner
 */
function updateLastActivity(email) {
  try {
    const learner = findLearnerByEmail(email);
    if (!learner) return false;
    
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Learners');
    sheet.getRange(learner.row, 8).setValue(new Date());
    
    return true;
  } catch (error) {
    console.error('❌ Update last activity error:', error);
    return false;
  }
}

/**
 * Log reminder sent to tracking
 */
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