import urllib.request, urllib.error, json

BASE = "https://amarfzhlbhzchmeqkbyg.supabase.co/rest/v1"
KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtYXJmemhsYmh6Y2htZXFrYnlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njk0MDI0NSwiZXhwIjoyMDkyNTE2MjQ1fQ.BCViogF93CceiUtIJ9j2P7zYrfK_9dBQtV2QLGnlP-o"

def post(path, payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(f"{BASE}/{path}", data=data, method="POST")
    req.add_header("apikey", KEY)
    req.add_header("Authorization", f"Bearer {KEY}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "return=representation")
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read()), None
    except urllib.error.HTTPError as e:
        return None, e.read().decode()

def insert_course(title, description, thumbnail):
    res, err = post("courses", {
        "title": title,
        "description": description,
        "level": "beginner",
        "category": "Technology",
        "price": 0,
        "duration": "Self-paced",
        "thumbnail_url": thumbnail,
    })
    if err:
        raise Exception(f"Course insert failed: {err}")
    cid = res[0]["id"]
    print(f"  Course '{title}': {cid}")
    return cid

def insert_module(module_id, course_id, title, position):
    res, err = post("modules", {
        "id": module_id,
        "course_id": course_id,
        "title": title,
        "position": position,
    })
    print(f"  Module '{title}':", "OK" if res is not None else f"ERR {err}")

def insert_lesson(course_id, module_id, order_index, title, description, content, duration=7):
    res, err = post("lessons", {
        "course_id": course_id,
        "module_id": module_id,
        "title": title,
        "description": description,
        "content": content,
        "position": 1,
        "order_index": order_index,
        "duration_minutes": duration,
        "type": "reading",
        "is_free": True,
    })
    print(f"    Lesson {order_index} '{title}':", "OK" if res is not None else f"ERR {err}")

def insert_questions(course_id, module_id, questions):
    for pos, question, options, correct in questions:
        res, err = post("quiz_questions", {
            "course_id": course_id,
            "module_id": module_id,
            "question": question,
            "options": options,
            "correct": correct,
            "position": pos,
        })
        print(f"    Q{pos}:", "OK" if res is not None else f"ERR {err}")


# ══════════════════════════════════════════════════════════════════════════════
# MODULE 2: Working Smarter with AI
# ══════════════════════════════════════════════════════════════════════════════
print("\n── MODULE 2: Working Smarter with AI ──────────────────────────────────────")
M2_ID   = "ai-smarter-m2"
M2_CID  = insert_course(
    "Working Smarter with AI",
    "Learn how to work effectively with AI tools, write better prompts, avoid common mistakes, and use AI responsibly as a professional.",
    "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&q=80&w=800",
)
insert_module(M2_ID, M2_CID, "Working Smarter with AI", 1)

print("  Inserting lessons...")
insert_lesson(M2_CID, M2_ID, 1, "Understanding Artificial Intelligence",
    "AI refers to computer systems that perform tasks normally requiring human intelligence.",
    """## Understanding Artificial Intelligence

Artificial Intelligence (AI) refers to computer systems that can perform tasks that normally require human intelligence.

These tasks include:

- Understanding language
- Recognizing patterns
- Generating content
- Solving problems
- Answering questions

---

## Popular AI Tools

- **ChatGPT** — Conversational AI by OpenAI
- **Claude** — AI assistant by Anthropic
- **Gemini** — AI by Google
- **Microsoft Copilot** — AI integrated into Microsoft products

These systems are trained using large amounts of information and generate responses based on patterns they have learned.

---

## Real World Example

A marketing manager needs ideas for a social media campaign.

Instead of spending hours brainstorming alone, they ask AI:

> "Give me 20 marketing campaign ideas for a small coffee shop."

Within seconds, AI provides ideas that the manager can review and improve.

**The manager still makes the final decisions.** AI simply speeds up the process.

---

> **Key Point:** AI is a tool that enhances human decision-making — it does not replace it.""")

insert_lesson(M2_CID, M2_ID, 2, "What AI Does Well",
    "AI is extremely useful for repetitive and information-based tasks.",
    """## What AI Does Well

AI is extremely useful for repetitive and information-based tasks.

---

## Research

AI can explain concepts and summarize information quickly.

**Example prompt:**

> "Explain cloud computing in simple terms."

---

## Writing

AI can draft:

- Emails
- Reports
- Articles
- Meeting notes

---

## Learning

AI can act like a personal tutor.

**Example prompt:**

> "Explain databases as if I am a complete beginner."

---

## Brainstorming

AI can generate ideas rapidly.

**Example prompt:**

> "Give me 30 business ideas suitable for South Africa."

---

## Coding

AI can:

- Explain code
- Suggest improvements
- Generate code examples
- Help debug errors

---

> **Key Point:** Use AI for tasks that are repetitive, information-heavy, or time-consuming. It frees you to focus on higher-level thinking and decision-making.""")

insert_lesson(M2_CID, M2_ID, 3, "What AI Does Poorly",
    "AI can make mistakes. Understanding its limitations helps you use it more effectively.",
    """## What AI Does Poorly

Many beginners assume AI is always correct. This is not true.

AI can and does make mistakes. Understanding its limitations is essential to using it effectively.

---

## Hallucinations

A **hallucination** occurs when AI confidently provides incorrect information.

### Example

You ask:

> "Who won the FIFA World Cup in 2028?"

The year has not happened yet. AI may still generate an answer — and that answer would be completely incorrect.

---

## Outdated Information

Some AI systems may not know about recent events. Always verify time-sensitive information from current sources.

---

## Lack of Context

AI only knows what you tell it. Poor instructions often produce poor results.

---

## Real World Example

A student asks AI to solve a mathematics problem. AI provides an answer. The student submits it without checking. The answer is wrong. The student loses marks.

The problem was **not AI**. The problem was **failing to verify the answer**.

---

> **Key Point:** Always verify AI-generated information before using it professionally or academically. Critical thinking is your responsibility.""")

insert_lesson(M2_CID, M2_ID, 4, "Writing Better Prompts",
    "A prompt is the instruction you give to AI. Good prompts produce much better results.",
    """## Writing Better Prompts

A **prompt** is the instruction you give to AI. Better prompts produce better results.

---

## Poor vs Better Prompts

### Poor Prompt

> "Write about business."

This is too vague. AI does not know what you want.

### Better Prompt

> "Write a 300-word introduction explaining how small businesses can use social media marketing to attract customers."

This prompt is specific. The AI knows exactly what is expected.

---

## Formula for Better Prompts

Use this three-part structure:

| Part | Description | Example |
|---|---|---|
| **Task** | What do you want? | Create a study plan |
| **Context** | Why do you need it? | I am preparing for a cloud certification |
| **Format** | How should it look? | Provide a four-week weekly schedule |

---

## Real World Example

**Prompt:**

> "Act as a career coach. Review my CV and suggest five specific improvements for a junior software developer role."

This prompt provides:

- A **role** (career coach)
- A **task** (review CV, suggest improvements)
- A **goal** (junior software developer role)

The result is far more useful than a vague request.

---

> **Key Point:** The quality of your prompt directly determines the quality of the AI's response. Invest time in writing clear, specific instructions.""")

insert_lesson(M2_CID, M2_ID, 5, "Using AI Responsibly",
    "AI should be used ethically, honestly, and with critical thinking.",
    """## Using AI Responsibly

AI should be used ethically and responsibly. How you use AI reflects your professional character.

---

## Always Verify Information

Before using AI-generated information:

- Check facts against reliable sources
- Review all calculations manually
- Confirm dates and statistics
- Validate sources independently

---

## Protect Sensitive Information

**Never upload the following to public AI systems:**

- Passwords or login details
- Banking or financial information
- Customer or client data
- Confidential company information

Public AI systems may store your input. Treat them like a public space.

---

## Learn, Don't Copy

The goal is not to let AI do everything. The goal is to **learn faster and work smarter**.

**Good learners ask:**
> "Explain why this solution works."

**Poor learners ask:**
> "Do everything for me."

---

## Real World Example

A junior developer receives code suggestions from AI.

Instead of copying it immediately, they:

1. Read the code carefully
2. Understand the logic behind it
3. Test the solution
4. Make improvements where needed

This approach builds real skills over time.

---

## Module Summary

In this module you learned:

1. What AI is and how it works
2. What AI does well
3. What AI does poorly (hallucinations, outdated info)
4. How to write effective prompts
5. How to use AI responsibly

**AI is a powerful tool. The most successful professionals use it to enhance their abilities — not to replace critical thinking.**

---

> **Key Point:** Responsible AI use means verifying outputs, protecting private data, and using AI as a learning partner rather than a shortcut.""")

print("  Inserting quiz questions...")
insert_questions(M2_CID, M2_ID, [
    (1,  "What does AI stand for?",
         ["Automated Internet", "Artificial Intelligence", "Advanced Integration", "Automated Information"], 1),
    (2,  "Which of the following is an AI tool?",
         ["Excel", "ChatGPT", "Paint", "Calculator"], 1),
    (3,  "Which task is AI particularly good at?",
         ["Predicting the future perfectly", "Summarizing information", "Never making mistakes", "Replacing human judgment"], 1),
    (4,  "What is a hallucination in AI?",
         ["Faster processing speed", "A visual display effect", "Incorrect information presented as fact", "A data storage method"], 2),
    (5,  "Why should AI-generated information be verified?",
         ["AI can make mistakes", "AI is too slow", "AI requires internet", "AI only works for developers"], 0),
    (6,  "What is a prompt?",
         ["A database", "An instruction given to AI", "A programming language", "A website"], 1),
    (7,  "Which prompt is more effective?",
         ["Write something.",
          "Write a 200-word article explaining cloud computing for beginners.",
          "Give me information about things.",
          "Tell me about business."], 1),
    (8,  "Should confidential company information be uploaded to public AI systems?",
         ["Yes, it helps AI understand your context.",
          "No, confidential information must always be kept private.",
          "Only if it is encrypted first.",
          "Yes, if you trust the AI tool."], 1),
    (9,  "What is the best way to use AI for learning?",
         ["Copy AI answers without reading them",
          "Ask AI to explain concepts and verify the answers",
          "Use AI to complete all your assessments",
          "Skip studying and rely on AI entirely"], 1),
    (10, "What is the main lesson from this module?",
         ["AI replaces all human work",
          "AI should only be used for coding",
          "AI is a powerful productivity tool that should be used responsibly and with verification",
          "AI never makes mistakes"], 2),
])


# ══════════════════════════════════════════════════════════════════════════════
# MODULE 3: Digital Productivity for Professionals
# ══════════════════════════════════════════════════════════════════════════════
print("\n── MODULE 3: Digital Productivity for Professionals ───────────────────────")
M3_ID  = "digital-prod-m3"
M3_CID = insert_course(
    "Digital Productivity for Professionals",
    "Master the productivity, communication, and documentation skills that employers value most — and learn how AI can supercharge your efficiency.",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
)
insert_module(M3_ID, M3_CID, "Digital Productivity for Professionals", 1)

print("  Inserting lessons...")
insert_lesson(M3_CID, M3_ID, 1, "What is Productivity?",
    "Productivity is the ability to complete meaningful work efficiently — not just staying busy.",
    """## What is Productivity?

Productivity is the ability to complete **meaningful work efficiently**.

Being productive does not mean being busy all day. It means **focusing on tasks that create real value**.

---

## Busy vs Productive

**Person A:**

- Checks social media every 10 minutes
- Starts many tasks at once
- Finishes very little by end of day

**Person B:**

- Focuses on one important task at a time
- Completes high-value work
- Avoids distractions

**Person B is more productive** — even if they appear less busy.

---

## Key Principle

> Focus on **results**, not activity.

At the end of each day, ask yourself:

- What did I actually complete?
- Did my work create value?
- Did I focus on what mattered most?

---

> **Key Point:** Productivity is not about working harder or longer — it is about working smarter and focusing on what truly matters.""")

insert_lesson(M3_CID, M3_ID, 2, "Managing Your Time Effectively",
    "Time is your most valuable resource. Learn how to prioritize and focus on high-impact work.",
    """## Managing Your Time Effectively

Time is one of your most valuable resources. Everyone has 24 hours in a day. The difference between high performers and others is **how those hours are used**.

---

## Prioritization

Prioritization means deciding what is **most important** before you start working.

Ask yourself every morning:

- What **must** be completed today?
- What can wait until tomorrow?
- Which tasks create the most value?

---

## The 80/20 Rule

A well-known productivity principle states:

> **20% of your efforts produce 80% of your results.**

This means a small number of tasks will have the biggest impact. Identify them and focus there first.

---

## Real World Example

A software developer starts their day with:

- 20 unread emails
- 3 scheduled meetings
- A project deadline due in 4 hours

**What should they do first?**

Complete the project — because it has the biggest impact and the closest deadline. The emails and meetings can be managed around the priority work.

---

## Practical Tips

- Write a short daily task list each morning
- Rank tasks by importance and deadline
- Protect focused work time — limit interruptions
- Avoid switching between tasks constantly

---

> **Key Point:** Prioritize ruthlessly. Focus on your 20% — the work that produces 80% of your results.""")

insert_lesson(M3_CID, M3_ID, 3, "Professional Communication",
    "Clear, concise, and respectful communication is one of the most valued workplace skills.",
    """## Professional Communication

Strong communication is one of the most valuable skills in any workplace.

Poor communication causes:

- Mistakes and errors
- Missed deadlines
- Confusion and frustration
- Damaged relationships

---

## What Good Communication Looks Like

Good professional communication is:

- **Clear** — the message is easy to understand
- **Concise** — no unnecessary words
- **Respectful** — professional in tone
- **Actionable** — the reader knows what to do next

---

## Poor vs Professional Messages

### Poor Message:

> "Need this ASAP."

This is vague, demanding, and unprofessional.

### Better Message:

> "Hi John, could you please send the sales report before 3 PM today? Thank you."

The second message is clear, specific, respectful, and professional.

---

## Workplace Checklist

Before sending any message, ask:

- **Who** is receiving this message?
- **What action** is required from them?
- Is my message **clear and complete**?
- Is my **tone appropriate**?

---

## Real World Example

A team member sends this message to their manager:

> "Hi Thabo, I wanted to let you know the client presentation has been updated with the latest data. It is ready for your review whenever convenient. Kind regards, Anesu."

This message is professional, clear, and respectful.

---

> **Key Point:** How you communicate reflects your professionalism. Clear, respectful communication builds trust and avoids costly mistakes.""")

insert_lesson(M3_CID, M3_ID, 4, "Professional Email Skills",
    "Email is one of the most important communication tools in business. Learn to write effective professional emails.",
    """## Professional Email Skills

Email remains one of the most important communication tools in business. A well-written email reflects professionalism and builds credibility.

---

## Email Structure

### Subject Line

Tell the reader exactly what the email is about before they open it.

**Example:**
> Project Status Update — Homepage Completed

### Greeting

Always open with a professional greeting.

**Example:**
> Hello Sarah,

### Main Message

Keep it **concise and clear**. State the key information and any required action.

### Closing

End professionally.

**Example:**
> Kind Regards,
> Anesu

---

## Example Email

**Subject:** Website Project Update

Hello Team,

The homepage development has been completed successfully and is ready for review.

The next development phase will begin tomorrow morning.

Please let me know if you have any questions.

Kind Regards,
Anesu

---

## Common Email Mistakes to Avoid

- **Missing subject line** — readers may ignore the email
- **Long, unbroken paragraphs** — hard to read quickly
- **Poor grammar and spelling** — appears unprofessional
- **Unclear requests** — reader does not know what action to take
- **Emotional or aggressive tone** — damages relationships

---

## Quick Tips

- Re-read every email before sending
- Use short paragraphs (2–3 sentences)
- Always include a subject line
- Be specific about deadlines and actions required

---

> **Key Point:** A professional email is clear, respectful, and actionable. It shows the reader that you value their time.""")

insert_lesson(M3_CID, M3_ID, 5, "Documentation and Note Taking",
    "Documentation preserves knowledge and helps teams work efficiently.",
    """## Documentation and Note Taking

Documentation is the process of **recording information for future reference**.

Professionals document:

- Processes and procedures
- Decisions and their reasons
- Instructions for tasks
- Meeting notes
- Project updates

---

## Why Documentation Matters

Imagine joining a new company where nothing is written down.

You would struggle to understand:

- How systems work
- What procedures to follow
- What decisions were made previously and why

Good documentation means **knowledge is never lost** when people change roles or leave the organisation.

---

## Real World Example

A software company maintains documentation for:

- How to deploy new application updates
- How to fix common technical issues
- How different systems are connected

New employees can learn independently because the information exists and is accessible.

---

## Meeting Notes

Always take notes during important meetings. Good meeting notes should include:

| Section | Details |
|---|---|
| **Date** | When the meeting took place |
| **Attendees** | Who was present |
| **Key Discussion Points** | Main topics covered |
| **Action Items** | Who is doing what |
| **Deadlines** | When each item is due |

---

## Documentation Tips

- Keep it simple and clear
- Update documents when things change
- Use headings to organize information
- Store documents where the team can access them

---

> **Key Point:** Documentation preserves knowledge and helps teams work efficiently. A professional who documents well is an asset to any organisation.""")

insert_lesson(M3_CID, M3_ID, 6, "Using AI to Improve Productivity",
    "AI can save professionals significant time when used correctly alongside critical thinking.",
    """## Using AI to Improve Productivity

AI can help professionals save significant time when used correctly alongside human judgment.

---

## How AI Improves Productivity

### Summarizing Meetings

Paste meeting notes into AI and ask:

> "Summarize these meeting notes into five key action points."

### Research

Ask AI to explain topics quickly:

> "Explain cybersecurity risks for small businesses in plain language."

### Writing

AI can help draft professional content:

- Emails
- Reports
- Presentations
- Project summaries

### Learning

Use AI as a tutor:

> "I am learning about SQL databases. Explain joins to me as a beginner."

---

## Important Reminder

AI should **improve** your productivity. It should **not replace** your thinking.

Always:

- Review AI-generated content before using it professionally
- Check facts and figures independently
- Add your own professional judgment

---

## Module Summary

In this module you learned:

1. What productivity truly means (results, not activity)
2. How to manage your time using prioritization and the 80/20 rule
3. How to communicate professionally in the workplace
4. How to write effective professional emails
5. Why documentation matters and how to do it well
6. How AI can enhance your workplace productivity

**These skills are valuable in every profession and will serve you throughout your entire career.**

---

> **Key Point:** The most effective professionals combine strong productivity habits, clear communication, and smart use of technology including AI.""", duration=8)

print("  Inserting quiz questions...")
insert_questions(M3_CID, M3_ID, [
    (1,  "What is productivity?",
         ["Being busy all day", "Completing meaningful work efficiently", "Working longer hours", "Using more software"], 1),
    (2,  "What is prioritization?",
         ["Doing everything at once", "Deciding what is most important", "Ignoring deadlines", "Delegating all work"], 1),
    (3,  "According to the 80/20 rule, most results often come from:",
         ["100% of activities", "80% of activities", "20% of activities", "None of the above"], 2),
    (4,  "Which communication style is most professional?",
         ["Vague and casual", "Clear and concise", "Aggressive and urgent", "Informal in all situations"], 1),
    (5,  "Why is a subject line important in an email?",
         ["It makes the email look longer", "It tells readers what the email is about", "It increases file size", "It is optional"], 1),
    (6,  "What should professional documentation contain?",
         ["Relevant and accurate information", "Random personal opinions", "Unrelated content", "Personal messages only"], 0),
    (7,  "What is one key benefit of documentation?",
         ["Preserves knowledge for future reference", "Creates confusion among teams", "Slows projects down", "Increases errors"], 0),
    (8,  "How can AI improve workplace productivity?",
         ["By summarizing information", "By helping with research", "By drafting content", "All of the above"], 3),
    (9,  "Should AI-generated content always be reviewed before professional use?",
         ["Yes, always verify and apply your own judgment",
          "No, AI is always correct",
          "Only for important documents",
          "Only if you are new to AI"], 0),
    (10, "What is the main lesson from this module?",
         ["Technology replaces all workplace skills",
          "Emails are the only important communication tool",
          "Strong productivity, communication, and documentation skills help professionals work more effectively",
          "Documentation is unnecessary in modern workplaces"], 2),
])


# ══════════════════════════════════════════════════════════════════════════════
# FINAL EXAM: Certified AI Digital Professional
# ══════════════════════════════════════════════════════════════════════════════
print("\n── FINAL EXAM: Certified AI Digital Professional ──────────────────────────")
FE_ID  = "cert1-final-exam"
FE_CID = insert_course(
    "Certified AI Digital Professional — Final Exam",
    "Complete the 30-question certification exam covering all three modules. Score 80% or above to earn your Certified AI Digital Professional certificate.",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800",
)
insert_module(FE_ID, FE_CID, "Certificate 1 Final Examination", 1)

print("  Inserting exam lesson...")
insert_lesson(FE_CID, FE_ID, 1, "Certificate 1 Final Examination",
    "30 questions covering Technology Fundamentals, Working Smarter with AI, and Digital Productivity.",
    """## Certified AI Digital Professional

### Final Certification Examination

Congratulations on completing all three modules of Certificate 1.

---

## Exam Information

| Detail | Information |
|---|---|
| **Total Questions** | 30 |
| **Pass Mark** | 80% (24 out of 30) |
| **Time Limit** | 30 minutes |
| **Sections** | A: Technology Fundamentals, B: Working Smarter with AI, C: Digital Productivity |

---

## Scoring Guide

| Score | Result |
|---|---|
| 27–30 correct (90–100%) | Distinction |
| 24–26 correct (80–89%) | Pass |
| 18–23 correct (60–79%) | Retake Required |
| Below 18 correct | Re-enroll in Certificate 1 |

---

## What You Need to Know

This exam covers everything from Modules 1, 2, and 3:

- **Module 1:** Technology Fundamentals — software, websites vs applications, frontend, backend, databases, cloud computing, AI basics
- **Module 2:** Working Smarter with AI — how AI works, what it does well and poorly, prompt writing, responsible use
- **Module 3:** Digital Productivity — productivity principles, time management, professional communication, email, documentation, AI for productivity

---

## Certificate Award

Learners who achieve **24 or more correct answers** earn:

**Certified AI Digital Professional**

and automatically unlock:

**Certificate 2: Certified Junior Software Developer** (Modules 4–9)

---

> **Read through the instructions carefully, take your time, and apply the knowledge you have gained. Good luck!**

When you are ready, click **Mark as Read** below to begin the exam.""", duration=30)

print("  Inserting 30 exam questions...")
insert_questions(FE_CID, FE_ID, [
    # Section A: Technology Fundamentals
    (1,  "What is technology?",
         ["A programming language", "A tool or system used to solve problems", "A database", "A website"], 1),
    (2,  "What is software?",
         ["Physical computer components", "A type of database", "Instructions that tell a computer what to do", "Internet access"], 2),
    (3,  "Which of the following is application software?",
         ["Windows", "Linux", "WhatsApp", "BIOS"], 2),
    (4,  "What is the primary purpose of a website?",
         ["To store passwords", "To provide information", "To replace applications", "To create databases"], 1),
    (5,  "Which of the following is an application?",
         ["Uber", "Company brochure website", "Online newspaper homepage", "Static landing page"], 0),
    (6,  "What is the frontend?",
         ["Database", "What users see and interact with", "Server hardware", "Business logic"], 1),
    (7,  "What is the backend responsible for?",
         ["Styling web pages", "Processing data and business logic", "Creating logos", "Designing websites"], 1),
    (8,  "What is a database primarily used for?",
         ["Creating websites", "Storing and organizing information", "Sending emails", "Creating graphics"], 1),
    (9,  "Which of the following is a cloud platform?",
         ["Microsoft Word", "AWS (Amazon Web Services)", "WhatsApp", "Canva"], 1),
    (10, "What is one key benefit of cloud computing?",
         ["Reduced storage capacity", "Scalability", "Less security", "Slower access speeds"], 1),
    # Section B: Working Smarter with AI
    (11, "What does AI stand for?",
         ["Advanced Internet", "Artificial Intelligence", "Automated Integration", "Artificial Information"], 1),
    (12, "Which of the following is an AI tool?",
         ["Excel", "ChatGPT", "Notepad", "Calculator"], 1),
    (13, "What is one task AI performs particularly well?",
         ["Predicting the future with certainty", "Summarizing information", "Never making mistakes", "Replacing managers"], 1),
    (14, "What is an AI hallucination?",
         ["Faster processing speed", "Incorrect information presented as fact", "A data storage method", "A software installation process"], 1),
    (15, "Why should AI responses always be verified?",
         ["AI always lies", "AI can make mistakes", "AI is illegal in most countries", "AI cannot read text"], 1),
    (16, "What is a prompt?",
         ["A database", "An instruction given to AI", "A website", "A cloud platform"], 1),
    (17, "Which prompt will produce better results from an AI tool?",
         ["Write something.",
          "Write a 200-word article explaining cloud computing for beginners.",
          "Give me info about things.",
          "Help."], 1),
    (18, "Should confidential company information be uploaded to public AI systems?",
         ["Yes, it helps AI provide better answers.",
          "No, confidential information must always be kept private.",
          "Only if you encrypt it first.",
          "Yes, all AI systems are fully secure."], 1),
    (19, "What is the best way to use AI for learning?",
         ["Copy answers without reading them",
          "Ask AI to explain concepts and verify the answers",
          "Avoid studying and rely on AI entirely",
          "Submit AI work as your own without review"], 1),
    (20, "What is the most important principle when using AI?",
         ["Trust every response without question",
          "Use it without thinking critically",
          "Verify outputs and apply critical thinking",
          "Avoid using AI altogether"], 2),
    # Section C: Digital Productivity
    (21, "What is productivity?",
         ["Working longer hours", "Completing meaningful work efficiently", "Using more software", "Attending more meetings"], 1),
    (22, "What is prioritization?",
         ["Doing everything at once", "Deciding what is most important", "Avoiding difficult tasks", "Delegating all work"], 1),
    (23, "According to the 80/20 rule, most results often come from:",
         ["20% of efforts", "50% of efforts", "80% of efforts", "100% of efforts"], 0),
    (24, "Which communication style is most effective in a professional environment?",
         ["Vague and casual", "Clear and concise", "Aggressive and urgent", "Informal in all situations"], 1),
    (25, "Why is a subject line important in a professional email?",
         ["It increases the storage size", "It tells readers what the email is about", "It makes emails longer", "It is optional"], 1),
    (26, "What is one key benefit of documentation in the workplace?",
         ["Preserves knowledge for future reference", "Creates confusion among teams", "Increases project errors", "Slows projects down"], 0),
    (27, "What should good meeting notes include?",
         ["Action items only", "Attendees only", "Key decisions only", "Date, attendees, key decisions, action items, and deadlines"], 3),
    (28, "How can AI improve workplace productivity?",
         ["Research assistance", "Drafting content", "Summarizing information", "All of the above"], 3),
    (29, "Should AI-generated work be reviewed before professional use?",
         ["Yes, always review and apply your own judgment",
          "No, AI output is always professional-grade",
          "Only for creative writing",
          "Only for technical documents"], 0),
    (30, "Which statement best summarizes the Certified AI Digital Professional certificate?",
         ["AI replaces all human workers in the digital age",
          "Technology, AI, and productivity skills help professionals work more effectively",
          "Productivity simply means working all day without breaks",
          "Documentation is no longer needed in modern workplaces"], 1),
])

print("\n✓ All data inserted successfully.")
