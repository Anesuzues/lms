/**
 * INTAKE FORM TRIGGER - DEBUG VERSION
 * Copy this to your intake form's script editor
 * This version has extra logging to help debug the issue
 */

// Your main Google Apps Script web app URL
const MAIN_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxNegfSjZeF1zJ9loRUddsMssE9hdYjYQ3zbRRvM0fgnUhJhoymqIvUBmiVpupMxfg_1A/exec';

function onFormSubmit(e) {
  console.log('🚀 INTAKE FORM TRIGGER FIRED!');
  console.log('Event object:', e);
  console.log('Form values:', e.values);
  
  try {
    // Get form response data
    const formData = e.values;
    console.log('📝 Form data to send:', formData);
    
    // Call the main Google Apps Script
    const payload = {
      'action': 'intakeSubmit',
      'formData': JSON.stringify(formData)
    };
    
    console.log('📤 Sending payload to main script:', payload);
    
    const options = {
      'method': 'POST',
      'payload': payload
    };
    
    console.log('🌐 Calling main script URL:', MAIN_SCRIPT_URL);
    
    const response = UrlFetchApp.fetch(MAIN_SCRIPT_URL, options);
    const responseText = response.getContentText();
    
    console.log('📥 Main script response:', responseText);
    console.log('✅ Intake form trigger completed successfully');
    
    // Send confirmation email to admin
    GmailApp.sendEmail(
      'learning@nobztech.co.za',
      'Intake Form Trigger Success',
      `Intake form trigger fired successfully!\n\nForm data: ${JSON.stringify(formData)}\n\nMain script response: ${responseText}\n\nTime: ${new Date()}`
    );
    
  } catch (error) {
    console.error('❌ Error in intake form trigger:', error);
    
    // Send detailed error notification
    try {
      GmailApp.sendEmail(
        'learning@nobztech.co.za',
        'Intake Form Trigger ERROR',
        `ERROR in intake form trigger:\n\nError: ${error.toString()}\n\nStack: ${error.stack}\n\nForm data: ${JSON.stringify(e.values)}\n\nTime: ${new Date()}`
      );
    } catch (emailError) {
      console.error('Failed to send error email:', emailError);
    }
  }
}

// Test function - run this manually to test
function testTriggerManually() {
  console.log('🧪 TESTING INTAKE FORM TRIGGER MANUALLY');
  
  // Create sample form data that matches your actual form structure
  const sampleEvent = {
    values: [
      new Date(),                    // Position 0: Timestamp
      'Manual Test User',            // Position 1: Full Name
      'Field 2',                     // Position 2: (unknown field)
      'Field 3',                     // Position 3: (unknown field)
      'test@example.com',            // Position 4: Email
      '+27123456789',                // Position 5: WhatsApp
      'Test motivation message',     // Position 6: Motivation
      'Beginner'                     // Position 7: Current Level
    ]
  };
  
  console.log('📝 Sample event data:', sampleEvent);
  onFormSubmit(sampleEvent);
  console.log('🧪 Manual test completed');
}

// Function to check if trigger exists
function checkTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  console.log('📋 Current triggers:', triggers.length);
  
  triggers.forEach((trigger, index) => {
    console.log(`Trigger ${index + 1}:`);
    console.log('- Function:', trigger.getHandlerFunction());
    console.log('- Event type:', trigger.getEventType());
    console.log('- Source:', trigger.getTriggerSource());
  });
  
  if (triggers.length === 0) {
    console.log('⚠️ NO TRIGGERS FOUND! You need to set up the onFormSubmit trigger.');
  }
}