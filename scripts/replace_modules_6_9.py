# -*- coding: utf-8 -*-
import urllib.request, urllib.error, json

BASE = "https://amarfzhlbhzchmeqkbyg.supabase.co/rest/v1"
KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtYXJmemhsYmh6Y2htZXFrYnlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njk0MDI0NSwiZXhwIjoyMDkyNTE2MjQ1fQ.BCViogF93CceiUtIJ9j2P7zYrfK_9dBQtV2QLGnlP-o"

# Existing course IDs from previous insert
COURSES = {
    "m6": ("d74b5df8-c20c-40c1-9508-a45ce64e4256", "web-dev-m6"),
    "m7": ("75a40da6-61b9-4e05-b551-eca1cd7f3394", "software-projects-m7"),
    "m8": ("fcc6aeb1-4d0f-47de-87b7-4677d5c16260", "debugging-m8"),
    "m9": ("2d7dae7d-667c-4aa7-aed2-c4ba5ff03342", "building-apps-m9"),
}

def req(method, path, payload=None):
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8") if payload else None
    r = urllib.request.Request(f"{BASE}/{path}", data=data, method=method)
    r.add_header("apikey", KEY)
    r.add_header("Authorization", f"Bearer {KEY}")
    r.add_header("Content-Type", "application/json; charset=utf-8")
    r.add_header("Prefer", "return=representation")
    try:
        with urllib.request.urlopen(r) as resp:
            body = resp.read()
            return json.loads(body) if body else [], None
    except urllib.error.HTTPError as e:
        return None, e.read().decode()

def delete_content(cid):
    req("DELETE", f"quiz_questions?course_id=eq.{cid}")
    req("DELETE", f"lessons?course_id=eq.{cid}")
    print(f"  Cleared old content for {cid}")

def lesson(cid, mid, oi, title, desc, content, duration=7):
    res, err = req("POST", "lessons", {"course_id": cid, "module_id": mid, "title": title,
        "description": desc, "content": content, "position": 1, "order_index": oi,
        "duration_minutes": duration, "type": "reading", "is_free": True})
    print(f"    L{oi} '{title}':", "OK" if res is not None else f"ERR {err}")

def questions(cid, mid, qs):
    for pos, q, opts, correct in qs:
        res, err = req("POST", "quiz_questions", {"course_id": cid, "module_id": mid,
            "question": q, "options": opts, "correct": correct, "position": pos})
        print(f"    Q{pos}:", "OK" if res is not None else f"ERR {err}")


# =============================================================================
# MODULE 6: Web Development Fundamentals
# =============================================================================
C6, M6 = COURSES["m6"]
print(f"\n-- MODULE 6: Web Development Fundamentals (replacing {C6}) --")
delete_content(C6)

lesson(C6, M6, 1, "What is a Website?",
    "A website is a collection of web pages that can be accessed through the internet.",
"""## What is a Website?

A website is a collection of web pages that can be accessed through the internet.

Examples of popular websites:

- **Google** — Search engine
- **Amazon / Takealot** — Online shopping
- **YouTube** — Video streaming
- **Facebook** — Social networking

---

## What Websites Help Users Do

- Find information
- Buy products
- Watch videos
- Communicate with others
- Complete tasks online

---

## Real World Example

A travel agency website may allow users to:

- View destinations
- Compare prices
- Make bookings
- Contact agents

Without websites, customers would need to visit physical offices for every interaction.

---

> **Key Point:** Websites remove the need for physical presence. They allow businesses to serve customers anywhere in the world, at any time.""")

lesson(C6, M6, 2, "HTML — The Structure of a Website",
    "HTML provides the structure of every webpage — it is the skeleton that holds everything together.",
"""## HTML — The Structure of a Website

**HTML** stands for **HyperText Markup Language**.

HTML provides the **structure** of a webpage. Think of HTML as the skeleton of a human body — without a skeleton, the body cannot hold its shape. Without HTML, a webpage has no structure.

---

## Common HTML Elements

### Headings

Used for titles and section labels.

```html
<h1>Welcome to My Website</h1>
<h2>Our Services</h2>
```

### Paragraphs

Used for blocks of text content.

```html
<p>We provide software development services.</p>
```

### Buttons

Used to trigger user actions.

```html
<button>Contact Us</button>
```

### Forms

Used to collect information from users.

Examples:
- Registration forms
- Login forms
- Contact forms

```html
<input type="email" placeholder="Enter your email" />
```

---

## Real World Example

A banking website contains:

- **Login form** — collects username and password
- **Account summary** — displays balance and account number
- **Transfer button** — triggers a money transfer
- **Transaction history** — displays past transactions

All of these visible elements are structured using HTML.

---

> **Key Point:** HTML is the foundation of every web page. It defines what is on the page — but not how it looks. That is CSS's job.""")

lesson(C6, M6, 3, "CSS — Making Websites Look Good",
    "CSS controls the appearance of websites — colours, fonts, layouts, and visual design.",
"""## CSS — Making Websites Look Good

**CSS** stands for **Cascading Style Sheets**.

CSS controls the **appearance** of a website. Think of HTML as the structure of a house. CSS is the paint, furniture, decorations, and interior design.

---

## What CSS Controls

- **Colors** — text colour, background colour, borders
- **Fonts** — typeface, size, weight, line spacing
- **Layouts** — how elements are positioned on the page
- **Spacing** — margins and padding around elements
- **Animations** — movement and transitions

---

## Poor Design vs Professional Design

**Without CSS:**
A website may look plain, unformatted, and unattractive — like a plain text document.

**With CSS:**
The website becomes professional, visually appealing, and on-brand.

---

## Real World Example

A company's website uses CSS to enforce brand consistency:

- **Specific colours** — matching the brand identity
- **Consistent fonts** — the same typeface throughout
- **Structured layouts** — content in organised columns and sections

These visual elements are all controlled using CSS.

---

## Example CSS

```css
body {
  background-color: #0f172a;
  color: white;
  font-family: 'Inter', sans-serif;
}

button {
  background-color: #3b82f6;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
}
```

---

> **Key Point:** CSS transforms a plain HTML structure into a professional, visually engaging experience. Good design builds trust with users.""")

lesson(C6, M6, 4, "JavaScript — Adding Interactivity",
    "JavaScript makes websites interactive and dynamic — responding to user actions in real time.",
"""## JavaScript — Adding Interactivity

**JavaScript** makes websites **interactive**.

Without JavaScript, websites would be completely static — like reading a printed page. JavaScript allows websites to respond to what users do.

---

## What JavaScript Enables

- Respond to user actions (clicks, typing, scrolling)
- Validate forms before submission
- Display alerts and notifications
- Update content dynamically without reloading the page

---

## Real World Example: Online Shopping Cart

When a user clicks **"Add to Cart"** on Takealot:

1. The cart item count updates immediately
2. The total price changes
3. The item appears in the cart

No page reload required. This instant update is powered by JavaScript.

---

## More Examples of JavaScript in Action

| Feature | JavaScript at Work |
|---|---|
| Search suggestions | Results appear as you type |
| Form validation | Error shown before submission |
| Like button | Count updates without reload |
| Mobile menu | Opens and closes on click |
| Image carousel | Slides rotate automatically |

---

## JavaScript Example

```javascript
// Show alert when button is clicked
document.getElementById("myButton").addEventListener("click", function() {
  alert("Item added to cart!");
});
```

---

> **Key Point:** JavaScript is what makes web pages feel alive. Without it, every website would be a static, unresponsive document.""")

lesson(C6, M6, 5, "Responsive Design",
    "Responsive design ensures websites work correctly on all screen sizes and devices.",
"""## Responsive Design

People use many different devices to browse the internet:

- Smartphones
- Tablets
- Laptops
- Desktop computers

A modern website must work properly on **all screen sizes**. This is called **Responsive Design**.

---

## Why Responsive Design Matters

Imagine visiting a website on your phone and:

- Text is too small to read
- Buttons are impossible to tap
- Images are cut off or overflowing

Most users would leave immediately and never return.

**Responsive design ensures a positive experience for every user on every device.**

---

## How Responsive Design Works

Developers write CSS rules that change the layout based on screen size:

```css
/* Mobile: single column */
.container {
  width: 100%;
}

/* Tablet and larger: fixed width */
@media (min-width: 768px) {
  .container {
    width: 750px;
  }
}
```

---

## Real World Context

In South Africa, more than 60% of internet users browse primarily on mobile phones.

A website that is not responsive is excluding the majority of potential visitors.

---

> **Key Point:** Responsive design is not optional for modern web development. A website that does not work on mobile is a broken website.""")

lesson(C6, M6, 6, "Frontend vs Backend",
    "Websites have two major parts: the frontend (what users see) and the backend (what makes it work).",
"""## Frontend vs Backend

Every modern website has two major parts working together.

---

## Frontend

The **frontend** is **what users see and interact with**.

Examples:
- Buttons
- Images
- Navigation menus
- Forms
- Pages

**Built using:**
- HTML — structure
- CSS — appearance
- JavaScript — interactivity

---

## Backend

The **backend** is **what users do not see** — it works behind the scenes.

Examples:
- Login processing and verification
- Database access and queries
- User authentication
- Payment processing
- Business rules and logic

**Common backend technologies:**
- Python
- Node.js
- Java
- PHP

---

## Real World Example

When a user logs into Facebook:

**Frontend (what you see):**
- The login page with username and password fields
- The login button

**Backend (what happens invisibly):**
- Receives your credentials
- Queries the database to find your account
- Verifies your password
- Loads your profile, feed, and notifications
- Returns all of this to the frontend

---

## Module Summary

In this module you learned:

1. What websites are and the role they play
2. HTML — the structure of every web page
3. CSS — the visual appearance of websites
4. JavaScript — the interactivity of web pages
5. Responsive design — making sites work on all devices
6. Frontend vs Backend — the two major parts of every website

---

> **Key Point:** HTML builds it. CSS styles it. JavaScript makes it work. Responsive design makes it work everywhere. Frontend shows it. Backend powers it.""", duration=6)

questions(C6, M6, [
    (1,  "What does HTML stand for?",
         ["HyperLinks and Text Markup Language", "HyperText Markup Language",
          "High Transfer Markup Language", "HyperText Management Language"], 1),
    (2,  "What is HTML used for?",
         ["Styling website colours", "Adding user interactivity",
          "Creating website structure and content", "Hosting websites on servers"], 2),
    (3,  "What does CSS stand for?",
         ["Creative Style System", "Cascading Style Sheets",
          "Computer Style System", "Content Style Syntax"], 1),
    (4,  "What is CSS used for?",
         ["Website structure", "Backend processing",
          "Database queries", "Styling and visual appearance"], 3),
    (5,  "What is JavaScript used for?",
         ["Website structure", "Visual styling and colours",
          "Adding interactivity and dynamic behaviour", "Hosting web servers"], 2),
    (6,  "What is responsive design?",
         ["Faster website loading", "Designing websites that work correctly on multiple devices and screen sizes",
          "Better database performance", "Cloud storage management"], 1),
    (7,  "Which three technologies form the core of web development?",
         ["Python, Java, PHP", "AWS, Azure, GCP",
          "HTML, CSS, JavaScript", "React, Vue, Angular"], 2),
    (8,  "What is the frontend?",
         ["The database layer", "The server infrastructure",
          "The part users see and interact with", "The backend logic"], 2),
    (9,  "What is the backend?",
         ["The visual interface users see", "The part that processes data behind the scenes",
          "The website design and colours", "The HTML structure"], 1),
    (10, "Why is responsive design important?",
         ["It makes websites cheaper to build", "It reduces server load",
          "It ensures websites work properly on all devices and screen sizes",
          "It improves database performance"], 2),
])


# =============================================================================
# MODULE 7: Understanding Software Projects
# =============================================================================
C7, M7 = COURSES["m7"]
print(f"\n-- MODULE 7: Understanding Software Projects (replacing {C7}) --")
delete_content(C7)

lesson(C7, M7, 1, "What is a Software Project?",
    "A software project is a collection of files, folders, and code that work together to solve a problem.",
"""## What is a Software Project?

A **software project** is a collection of files, folders, and code that work together to solve a specific problem.

---

## Examples of Software Projects

- Banking system
- E-commerce platform
- Learning Management System
- Mobile application
- Hospital patient management system

Each of these is a complete software project — built over time, by teams, to serve real users.

---

## What Makes a Software Project

A software project typically includes:

- **Source code** — the actual programming instructions
- **Configuration files** — settings for how the software runs
- **Documentation** — explanations of how it works
- **Assets** — images, icons, fonts, and other files
- **Tests** — code that verifies the software works correctly

---

> **Key Point:** A software project is not just code. It is a complete organised system of files working together to solve a real problem.""")

lesson(C7, M7, 2, "Understanding Project Structure",
    "Projects are organised into folders to keep code manageable and easy to navigate.",
"""## Understanding Project Structure

Professional software projects are organised into **folders**. Good organisation makes projects easier to understand, maintain, and update.

---

## Common Project Folders

| Folder | Purpose |
|---|---|
| **Frontend** | User interface code (HTML, CSS, JS) |
| **Backend** | Server logic and API code |
| **Database** | Database schemas and migration files |
| **Assets** | Images, icons, fonts, and media |
| **Documentation** | README files and technical guides |
| **Tests** | Automated test files |

---

## Why Structure Matters

Imagine 10,000 lines of code in a single file with no organisation.

Finding anything would take hours. Making changes would be dangerous. New developers would be completely lost.

Good folder structure means:

- New developers understand the project faster
- Changes are made in the right place
- Nothing breaks unexpectedly

---

## Real World Example

A Learning Management System project might be structured like:

```
lms-project/
  src/
    components/     -- reusable UI components
    pages/          -- individual screens
    services/       -- API and data logic
  database/         -- SQL files and migrations
  docs/             -- documentation
  tests/            -- automated tests
  README.md         -- project overview
```

---

> **Key Point:** A well-organised project is a professional project. Structure is not optional — it is what makes a project maintainable.""")

lesson(C7, M7, 3, "Reading Documentation",
    "Documentation explains what a project does, how to install it, and how it works.",
"""## Reading Documentation

**Documentation** explains:

- What the project does
- How to install and set it up
- How to use it
- How it works internally

---

## Good Developers Always Read Documentation First

A common beginner mistake is diving into code before reading the documentation.

Professional developers read first. They ask:

- What does this system do?
- How is it structured?
- Are there any setup steps I need to follow?
- Have others already solved problems I might encounter?

---

## Types of Documentation

### README File

The first document anyone reads. It provides:

- Project overview
- Installation instructions
- Usage examples
- Contribution guidelines

### Code Comments

Short explanations written within the code itself — explaining *why* something was done, not just *what* it does.

### API Documentation

Describes how to interact with the backend — what endpoints exist, what data to send, and what responses to expect.

---

## Real World Example

A developer joins NobzTech and is assigned to work on an existing CRM system.

Instead of immediately writing code, they:

1. Read the README file
2. Read the setup instructions
3. Read the API documentation
4. Explore the folder structure

Only then do they begin development.

This approach saves hours of confusion and prevents costly mistakes.

---

> **Key Point:** Documentation is not optional reading. It is the starting point for every professional developer on any new project.""")

lesson(C7, M7, 4, "Understanding Application Flow",
    "Application flow describes how users move through a system — the path from entry to goal.",
"""## Understanding Application Flow

**Application flow** describes how users move through a system from one step to the next.

---

## Simple Flow Example

A basic user journey in a web application:

```
Home Page → Login → Dashboard → Profile → Settings → Logout
```

Each step depends on the previous one. Understanding this flow helps developers know:

- Where data comes from
- Where it needs to go
- What happens if a step fails

---

## Why Application Flow Matters

When developers understand application flow, they can:

- **Troubleshoot problems** — know exactly where in the journey something broke
- **Improve experiences** — identify steps that are slow or confusing
- **Add features** — know where new functionality fits into the existing flow
- **Avoid breaking things** — understand the impact of changes

---

## Mapping a Real Flow

**Online Exam System Flow:**

```
Register → Verify Email → Login → Select Course →
Read Lesson → Mark Complete → Take Quiz → View Results → Certificate
```

Every step in this flow has code behind it — and understanding the full journey helps developers work on any part of it confidently.

---

> **Key Point:** Understand the journey before you change any part of it. Application flow is the map of how your software works.""")

lesson(C7, M7, 5, "Understanding Architecture",
    "Software architecture describes how the components of a system are structured and connected.",
"""## Understanding Architecture

**Software architecture** refers to how software components are structured and how they work together.

---

## The Standard Three-Layer Architecture

Most modern applications follow this structure:

```
Frontend  →  Backend  →  Database
```

| Layer | Role |
|---|---|
| **Frontend** | What users see and interact with |
| **Backend** | Business logic, rules, and processing |
| **Database** | Stores all information permanently |

---

## Why Architecture Matters

Good architecture makes software:

- **Understandable** — new developers can navigate it
- **Maintainable** — changes in one area do not break others
- **Scalable** — handles more users without being rebuilt
- **Reliable** — problems are isolated and easier to fix

---

## Real World Example

A student learning platform (like this one):

- **Frontend** — displays lessons, quiz questions, progress bars
- **Backend** — verifies quiz answers, tracks progress, manages enrollments
- **Database** — stores users, courses, lessons, quiz attempts, and results

Change the frontend design — the backend and database are unaffected.
Fix a backend bug — the frontend and database are unaffected.
This separation is the power of good architecture.

---

> **Key Point:** Understanding architecture helps you see the big picture. It tells you where code lives, where it belongs, and how changes in one place affect the rest.""")

lesson(C7, M7, 6, "Why Developers Read Before They Build",
    "Analysing and understanding code before modifying it is a core professional standard.",
"""## Why Developers Read Before They Build

A very common and costly mistake is modifying code before understanding it.

---

## The Wrong Approach

A new developer joins a team. They see code they do not understand. Instead of reading and learning, they make changes immediately.

Result:
- They break existing functionality
- They introduce new bugs
- They waste hours debugging problems they created
- They damage the trust of their team

---

## The Professional Approach

Professional developers **analyze first, understand first, modify second**.

Before touching any code, they:

1. Read all available documentation
2. Explore the folder structure
3. Trace the application flow end to end
4. Understand what the current code does
5. Identify what needs to change and why

Only then do they write a single line of new code.

---

## Real World Example

A developer joins NobzTech and is assigned to an existing CRM system.

Instead of immediately changing code, they:

- Read the documentation thoroughly
- Explore all folders and files
- Understand the workflows and dependencies
- Identify what the system does and how

Only then do they begin making changes — confidently and without breaking anything.

---

## Module Summary

In this module you learned:

1. What a software project is and what it contains
2. How professional projects are organised into folders
3. The importance of reading documentation before coding
4. What application flow is and why it matters
5. Basic software architecture principles (Frontend → Backend → Database)
6. Why developers must understand code before modifying it

---

> **Key Point:** The fastest way to work on an existing project is to understand it completely before touching it. Rushing in without reading creates problems that take far longer to fix.""", duration=6)

questions(C7, M7, [
    (1,  "What is a software project?",
         ["A single programming file",
          "A collection of files, folders, and code that work together to solve a problem",
          "A programming language",
          "A web browser"], 1),
    (2,  "Why are folders used in software projects?",
         ["To store passwords",
          "To replace documentation",
          "To organise code and make projects easier to maintain and navigate",
          "To run the application"], 2),
    (3,  "What is documentation?",
         ["A programming language",
          "Written information explaining what a project does and how it works",
          "A type of database",
          "A project folder"], 1),
    (4,  "Why should developers read documentation before writing code?",
         ["It wastes development time",
          "It is optional for experienced developers",
          "To understand the project before making changes and avoid costly mistakes",
          "Documentation is never accurate"], 2),
    (5,  "What is application flow?",
         ["The speed of the internet connection",
          "How users move through a system from one step to the next",
          "A type of database query",
          "The server response time"], 1),
    (6,  "What is software architecture?",
         ["The physical office building where developers work",
          "A type of programming language",
          "How software components are structured and work together",
          "The visual design of an application"], 2),
    (7,  "Why should developers understand a project before modifying it?",
         ["To make projects take longer to complete",
          "To reduce errors and avoid breaking existing functionality",
          "Documentation is not important for developers",
          "To avoid writing any code"], 1),
    (8,  "What does a README file contain?",
         ["Database passwords and secret keys",
          "The compiled application",
          "An overview of the project, installation steps, and usage instructions",
          "The user interface design"], 2),
    (9,  "What is a dependency in a software project?",
         ["A type of programming bug",
          "External code, libraries, or tools that a project relies on to function",
          "A database table",
          "A deployment server"], 1),
    (10, "What is the most important lesson from this module?",
         ["Always modify code immediately when you join a project",
          "Documentation is a waste of a developer's time",
          "Analyse and understand a project thoroughly before making any changes",
          "Folder organisation does not matter in modern projects"], 2),
])


# =============================================================================
# MODULE 8: Debugging and Problem Solving
# =============================================================================
C8, M8 = COURSES["m8"]
print(f"\n-- MODULE 8: Debugging and Problem Solving (replacing {C8}) --")
delete_content(C8)

lesson(C8, M8, 1, "What is a Bug?",
    "A bug is an error or flaw in software that causes it to behave unexpectedly.",
"""## What is a Bug?

A **bug** is an error or flaw in software that causes it to behave unexpectedly.

---

## Examples of Bugs

- Login button does not respond when clicked
- Incorrect calculations displayed to the user
- Application crashes unexpectedly
- Missing or corrupted data
- Broken pages or layouts

Bugs range from **minor inconveniences** (a button in the wrong colour) to **critical failures** (a system that loses user data).

---

## Real World Example

A banking application has a bug that processes a transfer twice when the user clicks the button multiple times.

This bug could:
- Drain a customer's account
- Create fraud alerts
- Damage the bank's reputation
- Result in legal consequences

One bug. Serious consequences.

---

## Why Bugs Happen

- Human error — no programmer is perfect
- Complex systems interact in unexpected ways
- Edge cases — unusual inputs that were not considered
- Changes in one part of the system affect another

**Bugs are inevitable. How you find and fix them is what matters.**

---

> **Key Point:** Every developer creates bugs. Great developers find and fix them systematically. The goal is not to avoid all bugs — it is to resolve them confidently.""")

lesson(C8, M8, 2, "Reading Error Messages",
    "Error messages are information — they tell you exactly what went wrong, where, and why.",
"""## Reading Error Messages

Many beginners ignore error messages and start guessing at solutions. **Professional developers read error messages carefully.**

---

## Error Messages Are Information

Error messages often tell you:

- **What** went wrong
- **Where** it happened (file name, line number)
- **Why** it happened

---

## Example

**Error message:**
```
TypeError: Cannot read properties of undefined (reading 'email')
at UserProfile.js:47
```

This tells you:
- **What:** Trying to read `email` from something that is undefined
- **Where:** `UserProfile.js`, line 47
- **Why:** The user object was not loaded before trying to access its properties

You now know exactly where to look — without guessing.

---

## Simple Example

**Error:** `Password cannot be empty`

This immediately tells you the problem. Instead of investigating the entire system, you know to check password validation.

---

## Developer Mindset

> Do not fear errors. Errors are information. They help developers locate problems faster.

A developer who reads error messages carefully will solve problems in minutes. A developer who ignores them and guesses may spend hours.

---

## Using AI With Error Messages

Paste any error message into AI:

> "I am getting this error in my JavaScript application: [paste error]. Here is the relevant code: [paste code]. What caused this and how do I fix it?"

AI can explain the error in plain language and suggest a solution.

---

> **Key Point:** Read every error message before doing anything else. It is the fastest path to the solution.""")

lesson(C8, M8, 3, "Root Cause Analysis",
    "Root cause analysis means finding the true source of a problem — not just treating the symptom.",
"""## Root Cause Analysis

**Fixing symptoms is not enough. Developers must identify the real cause of a problem.**

This process is called **Root Cause Analysis**.

---

## Symptoms vs Root Causes

| Symptom | Possible Root Cause |
|---|---|
| Website loading slowly | Large uncompressed images |
| Login not working | Authentication token expired |
| Incorrect totals displayed | Wrong calculation in backend function |
| Users not receiving emails | Email service API key expired |

Treating the symptom may **temporarily hide** a problem. Finding the root cause **prevents it from happening again**.

---

## Real World Example

**Problem:** A website is loading slowly.

**Possible causes:**
- Large images that are not compressed
- Slow database queries fetching too much data
- Poor internet connection on the user's side
- Too many server requests being made at once

**The goal:** Find the *actual* cause before applying a solution.

If you compress images but the real cause is slow database queries — the problem persists.

---

## The 5 Whys Technique

Ask "Why?" five times to drill down to the root cause.

**Problem:** Users cannot complete checkout.
1. **Why?** Payment button is not responding.
2. **Why?** JavaScript error is blocking the function.
3. **Why?** A variable is undefined at that point.
4. **Why?** The cart data was not loaded before the function ran.
5. **Why?** The loading sequence was changed in the last update without updating this function.

**Root cause:** A code change broke the loading sequence.
**Proper fix:** Restore the correct loading order.

---

> **Key Point:** Treat the root cause, not the symptom. A fix that does not address the true source of a problem is not actually a fix.""")

lesson(C8, M8, 4, "A Structured Problem-Solving Process",
    "Professional developers follow a systematic process to debug problems reliably.",
"""## A Structured Problem-Solving Process

Professional developers follow a **process** when debugging. Random guessing wastes time and creates new problems.

---

## The Six-Step Process

### Step 1: Identify the Problem

Clearly define what is wrong.

- What exactly is failing?
- When did it start?
- Does it happen every time or only sometimes?

### Step 2: Gather Information

Collect all available evidence.

- Read the error message carefully
- Check browser console logs
- Review recent code changes
- Identify which users are affected

### Step 3: Analyse Possible Causes

Based on the evidence, list the most likely causes.

- What changed recently?
- What part of the system handles this feature?
- Are there any similar known issues?

### Step 4: Test a Solution

Make **one focused change** at a time.

Never make multiple changes simultaneously — you will not know which one fixed it.

### Step 5: Verify the Fix

After applying a fix:

- Does the original problem no longer occur?
- Does everything else still work correctly?
- Does the solution work for all users?

### Step 6: Document What Was Learned

Record:

- What the problem was
- What caused it
- How it was fixed
- How to prevent it in future

---

## Real World Example

**Problem:** Users cannot log in.

**Process:**
1. Read the error message — authentication service returning 401
2. Check when it started — after last deployment
3. Identify the cause — API key was not updated in the new environment
4. Fix — update the API key in the correct configuration file
5. Verify — login works for all users
6. Document — update deployment checklist to include API key verification

---

> **Key Point:** A structured process is always faster and more reliable than guessing. Follow the steps every time.""")

lesson(C8, M8, 5, "Testing Fixes",
    "After fixing a bug, thorough testing confirms the fix works and nothing new was broken.",
"""## Testing Fixes

Many developers make a fix and immediately assume the problem is solved.

**Professional developers test thoroughly.**

---

## Questions to Ask After Every Fix

- Does the **original issue** no longer occur?
- Did the fix **create any new problems**?
- Does the solution work for **all users** — not just your test account?
- Does it work across **all relevant devices and browsers**?

---

## Example: Fixing a Mobile Navigation Menu

A developer fixes a navigation bug on mobile.

**Testing checklist:**

- Test on an Android phone
- Test on an iPhone
- Test on a tablet
- Test on a desktop browser
- Test on the latest and older browser versions

The fix should work **everywhere** — not just the one device used to test.

---

## Regression Testing

**Regression testing** means checking that the fix did not accidentally break something that was working before.

A change in one part of a system can have unexpected effects on other parts. Always test related features after making a fix.

---

## Module Summary

In this module you learned:

1. What a bug is and why bugs are inevitable
2. How to read error messages — they are information, not obstacles
3. Root cause analysis — finding the true source of problems
4. A six-step structured debugging process
5. How to test fixes properly including regression testing
6. The mindset of a professional problem-solver

---

## Practical Activity

Your login page is not working. Create a troubleshooting checklist:

- List five possible causes
- List the information you would collect
- Describe the steps you would take to investigate
- Describe how you would verify the solution

---

> **Key Point:** Fixing is only half the job. Testing confirms the fix actually works and has not created new problems.""", duration=6)

lesson(C8, M8, 6, "Developing a Problem-Solving Mindset",
    "Successful developers stay calm, think logically, and break problems into manageable parts.",
"""## Developing a Problem-Solving Mindset

Software development is largely **problem solving**.

The technical skills matter — but the mindset you bring to problems often matters more.

---

## What Successful Developers Do

- **Stay calm** under pressure — panic leads to poor decisions
- **Think logically** — follow the evidence, not assumptions
- **Avoid guessing** — a wrong guess wastes time and creates new problems
- **Break problems into smaller parts** — every complex problem is made of simpler ones

---

## Staying Calm Under Pressure

When a critical system is broken and users are affected, it is easy to panic and make rushed decisions.

Professionals:
- Take a breath
- Collect evidence first
- Follow the process
- Communicate clearly with their team

Panic leads to mistakes. Calm thinking leads to solutions.

---

## Real World Example

A developer spends two hours investigating a difficult bug.

Instead of becoming frustrated and giving up, they:

- Collect all available evidence systematically
- Test one assumption at a time
- Narrow down the possibilities
- Eventually identify the root cause

**Two hours of disciplined investigation > two days of random guessing.**

---

## Using AI as a Debugging Partner

When stuck on a problem:

> "I have been debugging this issue for an hour. Here is what I know: [describe the problem]. Here is the error: [paste error]. Here is the relevant code: [paste code]. What else should I investigate?"

AI can suggest angles you have not considered.

---

> **Key Point:** Debugging is a skill that improves with practice. The mindset — calm, logical, systematic — is what separates professionals from beginners.""")

questions(C8, M8, [
    (1,  "What is a bug?",
         ["A physical insect found in computer hardware",
          "An error or flaw in software that causes unexpected behaviour",
          "A web browser extension",
          "A database query error only"], 1),
    (2,  "Why are error messages useful to developers?",
         ["They slow down the debugging process",
          "They provide clues about what went wrong, where, and why",
          "They are always incorrect and should be ignored",
          "They are only useful for senior developers"], 1),
    (3,  "What is root cause analysis?",
         ["Randomly trying different fixes until something works",
          "Identifying the true underlying source of a problem",
          "Rewriting all the code from scratch",
          "Restarting the application or server"], 1),
    (4,  "Should developers guess solutions when debugging?",
         ["Yes — guessing is the fastest approach",
          "Yes — always start with random changes",
          "No — developers should follow a structured, evidence-based process",
          "Only beginners should avoid guessing"], 2),
    (5,  "What is the first step in the structured problem-solving process?",
         ["Apply a fix immediately",
          "Identify and clearly define the problem",
          "Restart the server",
          "Write documentation"], 1),
    (6,  "Why must developers test fixes thoroughly?",
         ["Testing is optional for simple fixes",
          "To ensure the problem is resolved and no new problems were introduced",
          "To create more bugs",
          "Testing slows down development unnecessarily"], 1),
    (7,  "What should happen immediately after applying a fix?",
         ["Delete the project files",
          "Ignore the issue and move on",
          "Verification, testing, and documentation of what was learned",
          "Restart the user's computer"], 2),
    (8,  "Why should developers document bug fixes?",
         ["It wastes valuable development time",
          "To help with future troubleshooting and to prevent the same issue recurring",
          "Only large companies need to document fixes",
          "Documentation is not useful for debugging"], 1),
    (9,  "What does a debugging mindset involve?",
         ["Reacting emotionally and making rapid random changes",
          "Calm, logical, and systematic thinking based on evidence",
          "Avoiding all difficult problems",
          "Making as many changes as possible simultaneously"], 1),
    (10, "What is the key lesson from this module?",
         ["Bugs mean the developer is incompetent",
          "Guessing randomly is the best way to fix bugs",
          "Great developers solve problems through a calm, structured, and systematic process",
          "Documentation is not needed when debugging"], 2),
])


# =============================================================================
# MODULE 9: Building Real Applications
# =============================================================================
C9, M9 = COURSES["m9"]
print(f"\n-- MODULE 9: Building Real Applications (replacing {C9}) --")
delete_content(C9)

lesson(C9, M9, 1, "What is an Application?",
    "An application is software designed to help users complete specific tasks.",
"""## What is an Application?

An **application** is software designed to help users complete specific tasks.

---

## Examples

- **WhatsApp** — sending and receiving messages
- **Uber** — requesting and tracking transport
- **Facebook** — connecting and sharing with others
- **Banking Apps** — managing money and making payments
- **Learning Management Systems** — studying and earning certificates

---

## Applications Solve Problems

Every successful application solves a real problem for real users.

---

## Real World Example: Uber

Uber solves the urban transportation problem.

Without Uber:
- Hail a taxi on the street
- Negotiate a price
- Pay with cash
- No record of the journey

With Uber:
- Request a ride from your phone
- Track the driver in real time
- Automatic payment
- Full trip history

The application manages the **entire process** — from request to payment — efficiently and reliably.

---

> **Key Point:** Applications exist to solve problems. Before building any application, always ask: "What specific problem am I solving for which specific users?"  """)

lesson(C9, M9, 2, "Understanding CRUD",
    "CRUD — Create, Read, Update, Delete — is the foundation of almost every application.",
"""## Understanding CRUD

Almost every application ever built uses **CRUD operations**.

**CRUD** stands for:

| Letter | Operation | Meaning |
|---|---|---|
| **C** | Create | Adding new information |
| **R** | Read | Viewing existing information |
| **U** | Update | Modifying existing information |
| **D** | Delete | Removing information |

---

## CRUD in Facebook

| CRUD | Action |
|---|---|
| **Create** | Write a new post |
| **Read** | View your news feed |
| **Update** | Edit a post you published |
| **Delete** | Remove a post |

## CRUD in Online Banking

| CRUD | Action |
|---|---|
| **Create** | Open a new account |
| **Read** | View your transaction history |
| **Update** | Change your email address |
| **Delete** | Close an account |

## CRUD in This Learning Platform

| CRUD | Action |
|---|---|
| **Create** | Enroll in a new course |
| **Read** | View lesson content |
| **Update** | Update your profile details |
| **Delete** | Remove an enrollment |

---

> **Key Point:** If you understand CRUD, you understand the core data operations of almost every application ever built.""")

lesson(C9, M9, 3, "Databases in Applications",
    "Applications need databases to permanently store information across sessions.",
"""## Databases in Applications

Applications need a place to permanently store information. This is the role of a **database**.

---

## What Databases Store

| Application | Data Stored |
|---|---|
| Social media | Users, posts, comments, likes, messages |
| Online store | Products, orders, customers, payments |
| Banking app | Accounts, transactions, users, limits |
| Learning platform | Courses, lessons, enrollments, progress, results |

---

## Without a Database

Imagine an application with no database.

- Log in — session exists
- Close the app — everything is forgotten
- Log in again — no account, no history, no data

Without databases, applications cannot remember anything between sessions.

---

## Types of Databases

**Relational Databases** (most common):

Store data in organized tables with rows and columns — like a spreadsheet.

Examples: **PostgreSQL**, **MySQL**

**Non-Relational Databases:**

Store data in flexible formats — better for certain types of applications.

Examples: **MongoDB**, **Firebase**

---

## Real World Example

When you complete a lesson on this platform:

1. Your progress is **saved to the database** immediately
2. If you close the browser and return tomorrow — your progress is still there
3. When you earn a certificate — it is permanently recorded in the database

The database is the **memory** of the application.

---

> **Key Point:** Databases are what make applications persistent and useful. Without them, every session starts from zero.""")

lesson(C9, M9, 4, "APIs and Communication",
    "APIs allow applications to communicate with other systems and share data.",
"""## APIs and Communication

Applications often need to communicate with other systems. This communication is done through **APIs**.

---

## What is an API?

**API** stands for **Application Programming Interface**.

An API is a defined way for one system to request data or actions from another system.

---

## The Waiter Analogy

Think of an API as a waiter in a restaurant:

| Restaurant | API |
|---|---|
| Customer | Your application |
| Waiter | API |
| Kitchen | External service |
| Menu | API documentation |

The customer (your app) never enters the kitchen (external system). They place an order through the waiter (API), and the kitchen prepares and returns the result.

---

## Real World API Examples

| Application | API Used |
|---|---|
| Weather app | Requests weather data from a weather service API |
| Uber | Uses Google Maps API for navigation |
| Online store | Uses PayFast or Stripe API for payments |
| This platform | Uses Supabase API for data storage and authentication |

---

## How an API Call Works

1. Your application sends a **request**: "Give me the weather for Johannesburg"
2. The API receives and processes the request
3. The API sends back a **response**: temperature, conditions, forecast

Your application never needs to know how the weather service works internally — it only needs to know how to ask.

---

## User Authentication

**Authentication** confirms who a user is.

Examples:
- Username and password
- Fingerprint recognition
- Face ID
- One-time PIN (OTP)

Authentication protects user information and prevents unauthorised access.

**Real World Example:**

When logging into online banking, the system verifies your username and password. Only after successful verification does it grant access to your account information.

---

> **Key Point:** APIs are how modern applications talk to each other. Almost nothing is built in isolation — payments, maps, messaging, and authentication all use APIs.""")

lesson(C9, M9, 5, "How Applications Work Together",
    "Complete applications combine frontend, backend, database, and APIs into one working system.",
"""## How Applications Work Together

Most complete applications consist of four components working in coordination:

| Component | Role |
|---|---|
| **Frontend** | User interface — what users see and interact with |
| **Backend** | Business logic — what makes the application work |
| **Database** | Information storage — what the application remembers |
| **APIs** | Communication layer — how components talk to each other |

---

## Real World Example: Food Delivery App

**Frontend:**
- The order screen users interact with
- Menu display, cart, and payment form

**Backend:**
- Processes the order
- Verifies stock and availability
- Calculates delivery time and cost
- Sends confirmation notification

**Database:**
- Stores the customer's details
- Stores the order history
- Stores restaurant menus and pricing

**API:**
- Communicates with the payment provider to process the transaction
- Communicates with the mapping service to show delivery tracking

---

## The Flow of a Complete Transaction

A customer places a food order:

```
Customer clicks "Place Order" [Frontend]
        ↓
Order details sent to server [API call]
        ↓
Backend validates and processes the order [Backend]
        ↓
Order saved to database [Database]
        ↓
Payment API is called [External API]
        ↓
Confirmation sent back to customer [Frontend]
```

All four components work together — seamlessly and in seconds.

---

> **Key Point:** No component works alone. Understanding how all four parts connect is what separates someone who can read code from someone who can build real systems.""")

lesson(C9, M9, 6, "Building Solutions for Real Problems",
    "Great applications start with a clear problem definition before a single line of code is written.",
"""## Building Solutions for Real Problems

Technology should solve problems. The best applications save time, reduce effort, improve experiences, and increase efficiency.

---

## The Right Question to Start With

Before building any software, ask:

> **"What specific problem am I solving for which specific users?"**

This question prevents the most common mistake in software development: **building solutions nobody needs**.

---

## Characteristics of Good Applications

| Quality | Meaning |
|---|---|
| **Saves time** | The task is faster with the app than without it |
| **Reduces effort** | The user does less work to achieve the same result |
| **Improves experience** | The process is more enjoyable or less stressful |
| **Increases efficiency** | More can be achieved with the same resources |

---

## Planning Before Building

Professional developers plan before they code.

1. **Define the problem** — what is broken or missing?
2. **Define the users** — who experiences this problem?
3. **Define the features** — what does the solution need to do?
4. **Define the data** — what information needs to be stored?
5. **Choose the technology** — what is the best tool for this job?

---

## Module Summary

In this module you learned:

1. What an application is — software that solves problems for users
2. CRUD operations — the foundation of all data management
3. Databases — the memory of every application
4. APIs — how applications communicate with each other and external services
5. How frontend, backend, database, and APIs work together
6. How to think about building solutions to real problems

**You now understand how complete software systems are designed and how all components work together.**

---

## Practical Activity

Design a **Student Management System**.

Identify:
- Three **frontend** features (what users see)
- Three **backend** processes (what happens behind the scenes)
- Five pieces of **database** information to store
- Two **CRUD operations** the system performs
- The **authentication** requirements

---

> **Key Point:** Great applications solve real problems clearly, efficiently, and reliably. Technology is the tool — the problem is the starting point.""", duration=8)

lesson(C9, M9, 7, "Certificate 2 Complete",
    "You have completed all six modules of the Certified Junior Software Developer certificate.",
"""## Certificate 2 Complete

Congratulations on completing all six modules of **Certificate 2: Certified Junior Software Developer**.

---

## What You Have Learned

| Module | Topics Covered |
|---|---|
| Module 4 | Programming fundamentals — variables, data types, loops, functions |
| Module 5 | AI-assisted development — prompts, debugging, responsible use |
| Module 6 | Web development — HTML, CSS, JavaScript, responsive design |
| Module 7 | Software projects — structure, documentation, architecture |
| Module 8 | Debugging — error messages, root cause analysis, systematic fixing |
| Module 9 | Building applications — CRUD, databases, APIs, authentication |

---

## Next Step: Final Examination

After completing all six modules, you are ready for:

**Certified Junior Software Developer Final Examination**

- **Total Questions:** 40
- **Pass Mark:** 80% (32/40)
- **Time Limit:** 45 minutes

---

## Grading

| Score | Result |
|---|---|
| 36-40 (90-100%) | Distinction |
| 32-35 (80-89%) | Pass |
| 24-31 (60-79%) | Retake Required |
| Below 24 | Re-enroll Recommended |

---

## Certificate Award

Learners who pass earn:

**Certified Junior Software Developer**

and unlock:

**Certificate 3: Certified AI-Enhanced Developer**

---

> **You have built a strong foundation. The examination is your opportunity to demonstrate what you have learned. Good luck!**""", duration=3)

questions(C9, M9, [
    (1,  "What is an application?",
         ["A programming language",
          "Software designed to help users complete specific tasks",
          "A database table",
          "A web server"], 1),
    (2,  "What does CRUD stand for?",
         ["Code, Run, Upload, Deploy",
          "Create, Read, Update, Delete",
          "Create, Remove, Undo, Delete",
          "Copy, Read, Update, Design"], 1),
    (3,  "What does Create mean in CRUD?",
         ["Viewing existing information",
          "Removing information",
          "Adding new information",
          "Modifying existing information"], 2),
    (4,  "What does Read mean in CRUD?",
         ["Adding new information",
          "Removing information",
          "Modifying information",
          "Viewing existing information"], 3),
    (5,  "What does Update mean in CRUD?",
         ["Adding new information",
          "Modifying existing information",
          "Removing information",
          "Viewing information"], 1),
    (6,  "What does Delete mean in CRUD?",
         ["Adding information",
          "Viewing information",
          "Modifying information",
          "Removing information"], 3),
    (7,  "What is a database used for in an application?",
         ["Styling the visual interface",
          "Storing and organising information permanently",
          "Running JavaScript code",
          "Hosting the website"], 1),
    (8,  "What is an API?",
         ["A type of database",
          "A programming language",
          "A defined mechanism that allows software systems to communicate",
          "A frontend framework"], 2),
    (9,  "What is authentication?",
         ["Creating database tables",
          "Designing the user interface",
          "Verifying a user's identity before granting access",
          "Writing code comments"], 2),
    (10, "What are the four main components of most complete applications?",
         ["HTML, CSS, JavaScript, Python",
          "Server, Router, Switch, Firewall",
          "Frontend, Backend, Database, APIs",
          "Planning, Design, Development, Testing"], 2),
])

print("\nAll modules 6-9 replaced successfully.")
