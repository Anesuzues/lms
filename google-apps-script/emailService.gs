/**
 * DEPLOYMENT INSTRUCTIONS:
 * Copy this entire file to your Google Apps Script project as "emailService.gs"
 * Update the TODO items below before deploying
 * 
 * NobzTech Course - Email Service
 * Handles all email communications
 */

// UPDATED WITH YOUR ACTUAL GOOGLE FORMS
const MODULE_FORMS = {
  0: "https://docs.google.com/forms/d/e/1FAIpQLScJQh93UVH9CB78SIN-vRS-w9Lu7f5pS_ljWY6W39cfJW6FuA/viewform",
  1: "https://docs.google.com/forms/d/e/1FAIpQLScmy__NjAQgAdsPH1xisMGNjfBX57eA1mvUZ3epdYMe94Euxw/viewform",
  2: "https://docs.google.com/forms/d/e/1FAIpQLSfGsPLp8suWoGIk2Gn7XmzH9X0pVI3iRviI4gega8x2d6Lz5Q/viewform",
  3: "https://docs.google.com/forms/d/e/1FAIpQLSdvMuiMp4dN022sQo-Q01f24gKl8v98R2uqyftyzB3loVn-NA/viewform"
};

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

// PHASE 2 FEATURES REMOVED PER SPECIFICATION
// Reminder emails are Phase 2 and explicitly excluded:
// "🔍 OPTIONAL (PHASE 2 – NOT NOW) - ⚠️ Do NOT implement phase 2 unless approved."