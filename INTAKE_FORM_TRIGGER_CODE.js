/**
 * INTAKE FORM TRIGGER CODE
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to your intake form: https://docs.google.com/forms/d/17f_dVJEPQweDEuNl4QPf0v7I2sa7uRAZKuyH1w_UaYY/edit
 * 2. Click the 3 dots menu (⋮) in the top right
 * 3. Select "Script editor"
 * 4. Delete any existing code and paste this ENTIRE code
 * 5. Save the script (Ctrl+S)
 * 6. Click "Triggers" (clock icon) in the left sidebar
 * 7. Click "+ Add Trigger"
 * 8. Configure:
 *    - Choose which function to run: onFormSubmit
 *    - Choose which deployment should run: Head
 *    - Select event source: From form
 *    - Select event type: On form submit
 * 9. Click "Save"
 * 10. Authorize the script when prompted
 */

// Your main Google Apps Script web app URL
const MAIN_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxNegfSjZeF1zJ9loRUddsMssE9hdYjYQ3zbRRvM0fgnUhJhoymqIvUBmiVpupMxfg_1A/exec';

function onFormSubmit(e) {
  try {
    console.log('=== INTAKE FORM SUBMITTED ===');
    console.log('Form response:', e.values);
    
    // Get form response data
    const formData = e.values;
    
    // Call the main Google Apps Script
    const payload = {
      'action': 'intakeSubmit',
      'formData': JSON.stringify(formData)
    };
    
    const options = {
      'method': 'POST',
      'payload': payload
    };
    
    console.log('Calling main script with payload:', payload);
    
    const response = UrlFetchApp.fetch(MAIN_SCRIPT_URL, options);
    const responseText = response.getContentText();
    
    console.log('Main script response:', responseText);
    console.log('✅ Intake form trigger completed successfully');
    
  } catch (error) {
    console.error('❌ Error in intake form trigger:', error);
    
    // Send error notification
    try {
      GmailApp.sendEmail(
        'learning@nobztech.co.za',
        'Intake Form Trigger Error',
        `Error in intake form trigger: ${error.toString()}\n\nTime: ${new Date()}`
      );
    } catch (emailError) {
      console.error('Failed to send error email:', emailError);
    }
  }
}

// Test function to verify the trigger works
function testTrigger() {
  console.log('=== TESTING INTAKE FORM TRIGGER ===');
  
  // Create sample form data
  const sampleEvent = {
    values: [
      new Date(),                    // Position 0: Timestamp
      'Test User',                   // Position 1: Full Name
      'Some other field',            // Position 2: (unknown field)
      'Another field',               // Position 3: (unknown field)
      'test@example.com',            // Position 4: Email
      '+27123456789',                // Position 5: WhatsApp
      'Test motivation',             // Position 6: Motivation
      'Beginner'                     // Position 7: Current Level
    ]
  };
  
  onFormSubmit(sampleEvent);
  console.log('=== TEST COMPLETED ===');
}