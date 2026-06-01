# -*- coding: utf-8 -*-
import urllib.request, urllib.error, json

BASE = "https://amarfzhlbhzchmeqkbyg.supabase.co/rest/v1"
KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtYXJmemhsYmh6Y2htZXFrYnlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njk0MDI0NSwiZXhwIjoyMDkyNTE2MjQ1fQ.BCViogF93CceiUtIJ9j2P7zYrfK_9dBQtV2QLGnlP-o"

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

def course(title, desc, thumb):
    res, err = req("POST", "courses", {"title": title, "description": desc,
        "level": "beginner", "category": "Technology", "price": 0,
        "duration": "Self-paced", "thumbnail_url": thumb})
    if err: raise Exception(err)
    cid = res[0]["id"]; print(f"  Course: {cid}"); return cid

def module(mid, cid, title):
    res, err = req("POST", "modules", {"id": mid, "course_id": cid, "title": title, "position": 1})
    print(f"  Module:", "OK" if res is not None else f"ERR {err}")

def lesson(cid, mid, oi, title, desc, content, dur=7):
    res, err = req("POST", "lessons", {"course_id": cid, "module_id": mid, "title": title,
        "description": desc, "content": content, "position": 1, "order_index": oi,
        "duration_minutes": dur, "type": "reading", "is_free": True})
    print(f"    L{oi} '{title}':", "OK" if res is not None else f"ERR {err}")

def questions(cid, mid, qs):
    for pos, q, opts, correct in qs:
        res, err = req("POST", "quiz_questions", {"course_id": cid, "module_id": mid,
            "question": q, "options": opts, "correct": correct, "position": pos})
        print(f"    Q{pos}:", "OK" if res is not None else f"ERR {err}")


# =============================================================================
# MODULE 10: Prompt Engineering for Developers
# =============================================================================
print("\n-- MODULE 10: Prompt Engineering for Developers --")
M10 = "prompt-eng-m10"
C10 = course("Prompt Engineering for Developers",
    "Master the skill of communicating with AI — learn how to write prompts that produce accurate, useful, and professional results every time.",
    "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&q=80&w=800")
module(M10, C10, "Prompt Engineering for Developers")

lesson(C10, M10, 1, "What is a Prompt?",
    "A prompt is the instruction you provide to an AI system to get a response.",
"""## What is a Prompt?

A **prompt** is the instruction you provide to an AI system.

---

## Simple Example

> "Explain what a database is."

This is a prompt. AI will generate a response based on it.

---

## Poor Prompt vs Better Prompt

### Poor Prompt:
> "Tell me about programming."

This is too broad. AI does not know your level, your goal, or what format you need.

### Better Prompt:
> "Explain programming to a beginner using simple language and provide three real-world examples."

This provides:
- **Context** — beginner audience
- **Task** — explain programming
- **Format** — three real-world examples

The result is dramatically better.

---

> **Key Point:** The quality of your prompt determines the quality of the AI's response. Invest in writing better instructions.""")

lesson(C10, M10, 2, "Components of a Good Prompt",
    "Strong prompts contain three parts: Task, Context, and Format.",
"""## Components of a Good Prompt

Strong prompts generally contain three parts.

---

## The Three Components

### Task
What do you want AI to do?

> Explain cloud computing.

### Context
Why do you need it? Who is the audience?

> I am a beginner preparing for an AWS certification.

### Format
How should the answer be presented?

> Provide five bullet points and a short summary.

---

## Combined Example

> "Act as a cloud instructor. Explain cloud computing to a beginner preparing for an AWS certification. Use simple language and provide five bullet points and a short summary."

This single prompt contains all three components — and produces a far more useful result than a vague request.

---

## Why Format Matters

Specifying format helps you get:
- Tables for comparisons
- Bullet points for lists
- Step-by-step guides for processes
- Code blocks for technical examples

---

> **Key Point:** Task + Context + Format = consistently better AI responses.""")

lesson(C10, M10, 3, "Role Prompting",
    "Role prompting tells AI who it should act as, improving relevance and quality.",
"""## Role Prompting

**Role prompting** tells AI what role or persona to adopt when responding.

---

## Examples of Roles

- Senior Software Engineer
- Career Coach
- Python Tutor
- Business Analyst
- Technical Writer
- Cybersecurity Specialist

---

## How It Works

> "Act as a senior software engineer. Review this code and suggest three specific improvements."

By assigning the role of a senior engineer, the response is more technical, specific, and professionally framed than a generic request.

---

## Real World Example

**Without role:**
> "Explain APIs."

**With role:**
> "Act as a backend developer teaching a junior colleague. Explain APIs using a restaurant analogy and provide one practical example."

The second prompt produces an explanation at exactly the right level with the right style.

---

> **Key Point:** Role prompting shapes the voice, depth, and perspective of the AI's response. Use it whenever you need a specific kind of expertise.""")

lesson(C10, M10, 4, "Prompt Engineering for Coding",
    "Developers use prompt engineering to learn, debug, refactor, and document code faster.",
"""## Prompt Engineering for Coding

Developers frequently use AI prompts for four core activities.

---

## Learning

> "Act as a Python tutor. Explain this code line by line and explain what each part does."

This produces a teaching explanation rather than just a code output.

---

## Debugging

> "This Python function is returning None instead of the expected result. Here is the code: [paste code]. What is wrong and how do I fix it?"

Specific debugging prompts produce faster, more targeted solutions.

---

## Refactoring

> "Review this JavaScript function for readability and efficiency improvements. Explain each suggested change."

Understanding *why* to change code is as important as what to change.

---

## Documentation

> "Write a clear code comment for this function that explains its purpose, parameters, and return value."

AI can generate documentation drafts that developers then review and refine.

---

## Real World Example

A junior developer inherits an unfamiliar JavaScript function. Instead of searching through multiple websites, they ask AI:

> "Explain this function: what is its purpose, how does the logic work, what are the inputs and outputs, and are there any potential issues?"

Within seconds they understand the function completely.

---

> **Key Point:** Prompt engineering multiplies a developer's productivity. The same hour of work produces more when AI is used effectively.""")

lesson(C10, M10, 5, "Structured Outputs",
    "You can instruct AI to return responses in specific formats — tables, lists, JSON, reports.",
"""## Structured Outputs

Sometimes you need AI responses in a **specific format**. You can instruct AI explicitly.

---

## Examples

### Table
> "Create a table comparing AWS, Azure, and Google Cloud across five categories: pricing, storage, compute, AI services, and global regions."

### Step-by-step guide
> "Provide a numbered step-by-step installation guide for Node.js on Windows."

### JSON format
> "Return the following data as a JSON object with keys for name, role, and department."

### Report
> "Write a two-paragraph executive summary of the following findings: [data]."

---

## Why Structured Outputs Matter

- **Reports** need consistent formatting
- **Documentation** needs clear sections
- **Data** needs parseable formats
- **Presentations** need structured talking points

Specifying format saves you time reformatting AI responses.

---

> **Key Point:** You control the output format. Specifying it precisely saves time and produces results you can use immediately.""")

lesson(C10, M10, 6, "Prompt Engineering Best Practices",
    "Follow these habits to consistently produce better AI results.",
"""## Prompt Engineering Best Practices

---

## Always Do

- **Be specific** — vague prompts produce vague answers
- **Provide context** — tell AI who you are and why you need this
- **Define the audience** — beginner, expert, manager, student
- **Specify output format** — bullet points, table, numbered steps, code
- **Use roles** — "Act as a [role]" when expertise matters
- **Iterate** — refine prompts when results are not what you expected

---

## Avoid

- Vague, open-ended requests with no direction
- Missing context — AI cannot read your mind
- Ambiguous instructions that could be interpreted multiple ways
- Accepting the first response without refining it

---

## Module Summary

In this module you learned:

1. What a prompt is and why quality matters
2. The three components of a strong prompt: Task, Context, Format
3. Role prompting — assigning expertise to improve responses
4. Prompt engineering for coding: learning, debugging, refactoring, documentation
5. Structured outputs — controlling the format of AI responses
6. Best practices for consistent results

---

## Practical Activity

Write prompts for each of these tasks:
1. Learning Python variables as a beginner
2. Reviewing a CV for a junior developer role
3. Creating a professional business proposal
4. Debugging a login function that returns undefined
5. Writing documentation for an API endpoint

---

> **Key Point:** Prompt engineering is a learnable, practical skill. Better prompts = better results = faster, higher-quality work.""", dur=6)

questions(C10, M10, [
    (1,  "What is a prompt?",
         ["A database query", "An instruction given to an AI system", "A programming function", "A type of variable"], 1),
    (2,  "Why are specific prompts more effective?",
         ["They are longer", "They produce more accurate and relevant AI responses", "They use technical language", "They are easier to write"], 1),
    (3,  "What are the three components of a strong prompt?",
         ["Input, Process, Output", "Question, Answer, Review", "Task, Context, Format", "Goal, Method, Result"], 2),
    (4,  "What is role prompting?",
         ["Asking AI to write code only", "Assigning a role or persona to AI to improve response quality", "A type of database query", "A programming pattern"], 1),
    (5,  "Why does role prompting improve AI responses?",
         ["It makes responses shorter", "It shapes the expertise, voice, and depth of the response", "It reduces processing time", "It avoids all errors"], 1),
    (6,  "What is a structured output?",
         ["A database table", "A response formatted in a specific, requested way such as a table or list", "A programming pattern", "A type of variable"], 1),
    (7,  "Can prompt engineering improve coding assistance?",
         ["Yes — better prompts produce more targeted and educational code responses",
          "No — AI code quality is fixed regardless of prompt quality",
          "Only for advanced developers",
          "Only for Python"], 0),
    (8,  "Should prompts always include context?",
         ["Yes — context helps AI understand who you are and what you need",
          "No — context is optional",
          "Only for complex topics",
          "Only for business prompts"], 0),
    (9,  "What is one poor prompting habit?",
         ["Specifying the output format", "Providing context about your level", "Being vague and not providing direction", "Using role prompting"], 2),
    (10, "What is the main lesson from this module?",
         ["AI always produces the same quality regardless of prompts",
          "Better prompts consistently produce better AI responses",
          "Prompt engineering is only for AI researchers",
          "Short prompts are always better"], 1),
])


# =============================================================================
# MODULE 11: Testing and Quality Assurance
# =============================================================================
print("\n-- MODULE 11: Testing and Quality Assurance --")
M11 = "testing-qa-m11"
C11 = course("Testing and Quality Assurance",
    "Learn how professional developers verify their software works correctly — manual testing, automated testing, unit tests, integration tests, and UAT.",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800")
module(M11, C11, "Testing and Quality Assurance")

lesson(C11, M11, 1, "What is Testing?",
    "Testing is the process of checking whether software behaves as expected.",
"""## What is Testing?

**Testing** is the process of checking whether software behaves as expected.

The goal is simple: **find problems before users do**.

---

## Why Testing Matters

Every bug that reaches a user represents:
- A damaged user experience
- A loss of trust in the product
- Potential revenue loss
- Additional urgent work to fix in production

Testing catches these problems in the development phase — where they are cheapest and easiest to fix.

---

## Real World Example

An online store has a "Buy Now" button.

If payment processing fails unexpectedly:
- The customer loses their order
- The company loses revenue
- The customer may never return

**Testing this flow before launch prevents all of this.**

---

> **Key Point:** Software is not complete when it is written. Software is complete when it has been tested.""")

lesson(C11, M11, 2, "Types of Testing",
    "There are two fundamental approaches to testing: manual and automated.",
"""## Types of Testing

There are two fundamental approaches to testing software.

---

## Manual Testing

A human interacts with the software and verifies the results match expectations.

**Example:** A tester manually fills in a registration form, submits it, and confirms the account is created correctly.

**Advantages:**
- Good for exploring user experience
- Catches visual and usability issues
- No setup required for simple tests

**Disadvantages:**
- Slow for large test suites
- Inconsistent — humans make different checks each time
- Cannot run overnight automatically

---

## Automated Testing

Software runs predefined tests automatically and reports pass or fail results.

**Example:** A script automatically fills in the registration form 100 times with different inputs and checks that each result is correct.

**Advantages:**
- Fast — runs thousands of tests in seconds
- Repeatable — always runs the same checks
- Reliable — catches regressions automatically
- Can run on every code change

---

## Which to Use?

Most professional teams use **both**:
- Automated tests for repetitive, logic-based verification
- Manual testing for user experience and exploratory testing

---

> **Key Point:** Manual testing finds what humans notice. Automated testing finds what computers can check reliably at scale.""")

lesson(C11, M11, 3, "Unit Testing",
    "Unit tests verify individual pieces of code in isolation.",
"""## Unit Testing

A **unit test** verifies that a single, isolated piece of code works correctly.

---

## What a Unit Is

A unit is usually a single function or method — the smallest testable piece of code.

---

## Example: Testing a VAT Calculation

Function: `calculateVAT(price)` — adds 15% VAT to a price.

**Unit test:**
```
Input: 100
Expected output: 115

Input: 200
Expected output: 230

Input: 0
Expected output: 0
```

Each test checks one specific scenario and verifies the output matches the expectation.

---

## Why Unit Tests Are Valuable

- They catch bugs at the source — in the individual function
- They run instantly — feedback in milliseconds
- They document expected behaviour — the test IS the specification
- They prevent regressions — a change that breaks a function is caught immediately

---

## Real World Example

A payroll system has a function that calculates overtime pay. A unit test verifies:
- Regular hours are calculated correctly
- Overtime hours are calculated at the correct rate
- Zero hours returns zero pay
- Negative input is rejected

---

> **Key Point:** Unit tests are the foundation of a healthy codebase. They catch bugs early, when they are cheapest to fix.""")

lesson(C11, M11, 4, "Integration Testing",
    "Integration testing verifies that multiple components work correctly together.",
"""## Integration Testing

**Integration testing** verifies that multiple components of a system work correctly together — not just in isolation.

---

## Why Integration Testing is Necessary

Unit tests verify individual functions. But what happens when those functions work together?

Two individually correct functions can still fail when combined if:
- They pass data in incompatible formats
- They depend on each other in unexpected ways
- They access shared resources differently

---

## Example

**Components:** Website frontend + Database

**Integration test:** Submit a registration form and verify:
1. The data is received by the backend
2. The data is validated correctly
3. The data is saved to the database
4. The confirmation email is sent
5. The user can log in with the new account

This tests the **flow between components**, not just individual pieces.

---

## Real World Example

An e-commerce platform tests:
- Product page → Add to cart → Checkout → Payment → Order confirmation

Each step involves multiple components. Integration testing verifies the entire chain works end to end.

---

> **Key Point:** Integration testing catches the bugs that fall between the cracks — problems that only appear when components work together.""")

lesson(C11, M11, 5, "User Acceptance Testing",
    "UAT ensures software meets real business requirements and user needs before launch.",
"""## User Acceptance Testing

**User Acceptance Testing (UAT)** is the final phase of testing before software goes live.

The focus is not technical correctness — it is whether **real users can successfully achieve their goals** using the software.

---

## Who Performs UAT?

- End users (the actual people who will use the system)
- Business stakeholders
- Client representatives

---

## What UAT Tests

- Can users complete the core tasks without confusion?
- Does the software meet the originally agreed requirements?
- Is the language and terminology appropriate for the users?
- Are there any workflows that feel unintuitive or broken?

---

## Real World Example

A travel booking system is ready for launch. Before going live:

Real travel agents use the system for a week to:
- Search for flights
- Make bookings
- Process cancellations
- Generate reports

Their feedback reveals that the cancellation workflow requires too many steps. The development team simplifies it before launch.

**UAT caught a usability problem that no automated test could have found.**

---

> **Key Point:** UAT is the reality check. It confirms that what was built actually serves the users it was built for.""")

lesson(C11, M11, 6, "Testing with AI",
    "AI can generate test cases, edge cases, and testing scenarios to improve test coverage.",
"""## Testing with AI

AI can significantly accelerate the testing process.

---

## How AI Helps with Testing

### Generating Test Cases

> "Write ten test cases for a user login function, including valid logins, invalid passwords, empty fields, locked accounts, and SQL injection attempts."

AI generates a comprehensive set of scenarios in seconds.

### Identifying Edge Cases

> "What edge cases should I consider when testing a function that calculates loan repayments?"

AI can identify unusual inputs and boundary conditions that developers might miss.

### Generating Validation Scenarios

> "Generate test data for testing a South African ID number validator — include valid IDs, invalid IDs, and common formatting errors."

---

## Important Reminder

AI generates test *suggestions*. Developers must still:

- Review that test cases make sense
- Verify expected outputs are correct
- Add domain-specific cases AI might miss
- Ensure tests match the actual business requirements

---

## Module Summary

In this module you learned:

1. What testing is and why it is essential
2. Manual vs automated testing — when to use each
3. Unit testing — verifying individual pieces of code
4. Integration testing — verifying components work together
5. UAT — verifying software meets real user needs
6. How AI can accelerate test case generation

---

## Practical Activity

Create five test cases for a user login system:
1. Correct username and password
2. Incorrect password
3. Empty username field
4. Locked account
5. Forgotten password flow

---

> **Key Point:** Testing is not optional. Professional software development requires systematic verification at every level.""", dur=6)

questions(C11, M11, [
    (1,  "What is the purpose of software testing?",
         ["To increase development time", "To verify software behaves correctly and find problems before users do",
          "To replace documentation", "To slow releases down"], 1),
    (2,  "Why is testing important in professional development?",
         ["It makes projects more expensive",
          "It creates unnecessary delays",
          "It identifies issues before users encounter them, protecting quality and trust",
          "It is only needed for large projects"], 2),
    (3,  "What is manual testing?",
         ["Automated scripts that run tests", "Testing performed by people interacting with the software",
          "AI-generated test cases", "Code that checks other code"], 1),
    (4,  "What is automated testing?",
         ["Testing done by the client", "Writing documentation",
          "Testing performed automatically by software on every code change", "User interviews"], 2),
    (5,  "What is a unit test?",
         ["A test of the entire application", "A test performed by end users",
          "A test of an individual function or component in isolation", "A performance test"], 2),
    (6,  "What is integration testing?",
         ["Testing a single function in isolation",
          "Testing that multiple components work correctly together",
          "Testing performed by end users", "Testing the user interface only"], 1),
    (7,  "What does UAT stand for?",
         ["Unit Acceptance Testing", "Unified Automated Testing",
          "User Acceptance Testing", "Universal Application Testing"], 2),
    (8,  "Who typically performs User Acceptance Testing?",
         ["Only the development team", "End users or business stakeholders",
          "Only automated scripts", "Only the project manager"], 1),
    (9,  "How can AI assist with testing?",
         ["AI cannot help with testing",
          "AI generates perfect tests that never need review",
          "AI can generate test cases and edge cases that developers then review and verify",
          "AI replaces all manual testing"], 2),
    (10, "What is the ultimate goal of software testing?",
         ["To find as many bugs as possible regardless of impact",
          "To deliver reliable software that works as expected for its users",
          "To delay releases indefinitely",
          "To replace the need for good code"], 1),
])


# =============================================================================
# MODULE 12: Technical Documentation and Communication
# =============================================================================
print("\n-- MODULE 12: Technical Documentation and Communication --")
M12 = "tech-docs-m12"
C12 = course("Technical Documentation and Communication",
    "Learn how to write clear documentation and communicate professionally — essential skills for every developer working in a team.",
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800")
module(M12, C12, "Technical Documentation and Communication")

lesson(C12, M12, 1, "What is Documentation?",
    "Documentation is written information that explains how a system works.",
"""## What is Documentation?

**Documentation** is written information that explains how something works.

---

## Types of Documentation

| Type | Purpose |
|---|---|
| **User guides** | Help end users use the software |
| **Installation guides** | Step-by-step setup instructions |
| **API documentation** | How to interact with backend services |
| **Project requirements** | What the software needs to do |
| **Architecture documents** | How the system is structured |

---

## Why Documentation Exists

Software is built by people. People leave companies, change roles, or simply forget how things worked six months ago.

Documentation ensures that **knowledge is preserved and transferable**.

---

## Real World Consequence

A developer builds a critical data import system. They leave the company. No documentation exists.

Six months later, the import breaks. No one knows how it works. The team spends three weeks reverse-engineering code that took two days to build.

**Three weeks of lost productivity because documentation was skipped.**

---

> **Key Point:** Documentation is not extra work — it is part of the work. Undocumented systems are incomplete systems.""")

lesson(C12, M12, 2, "Why Documentation Matters",
    "Good documentation helps every person who touches a project — now and in the future.",
"""## Why Documentation Matters

Documentation benefits everyone who interacts with a software project.

---

## Who Benefits

| Person | How Documentation Helps |
|---|---|
| **New team members** | Understand the project without asking basic questions |
| **Developers** | Remember how systems work after months away |
| **Customers / users** | Know how to use the product effectively |
| **Stakeholders** | Understand project status and decisions |
| **Future maintainers** | Continue work without starting from scratch |

---

## The Cost of No Documentation

- **Onboarding takes weeks** instead of days
- **Knowledge is lost** when people leave
- **Mistakes repeat** because solutions were never recorded
- **Simple tasks take longer** because no instructions exist
- **Bugs are harder to fix** because the system is not understood

---

## The Value of Good Documentation

- New developers become productive in days
- Teams scale without bottlenecks
- Systems are maintained with confidence
- Knowledge survives team changes

---

> **Key Point:** Documentation multiplies the value of the work done. Without it, knowledge evaporates when people leave.""")

lesson(C12, M12, 3, "Writing Effective Documentation",
    "Good documentation is clear, accurate, organised, and easy to follow.",
"""## Writing Effective Documentation

Good documentation is not about quantity. It is about clarity.

---

## Qualities of Good Documentation

- **Clear** — the reader immediately understands the point
- **Accurate** — the information is correct and up to date
- **Organised** — information is easy to find and navigate
- **Easy to follow** — instructions can be followed without prior knowledge

---

## Poor vs Better Documentation

### Poor:
> "The thing connects to the thing."

This is meaningless without context.

### Better:
> "The application connects to the database using secure credentials stored in environment variables. See the `.env.example` file for the required variable names."

This is specific, actionable, and complete.

---

## Practical Writing Tips

- Use **short sentences** — one idea per sentence
- Use **numbered steps** for processes — sequence matters
- Use **headings** to organise sections — readers scan before reading
- **Avoid jargon** unless the audience definitely knows it
- **Update documentation** when the code changes — outdated docs are worse than none

---

## Using AI to Draft Documentation

> "Write documentation for this function: [paste code]. Include: purpose, parameters, return value, and one usage example."

AI produces a first draft. You review, correct, and refine it.

---

> **Key Point:** Write documentation for someone who does not know the system yet. If they cannot follow it, it needs to be clearer.""")

lesson(C12, M12, 4, "README Files",
    "A README is the first document anyone reads — it explains a project at a glance.",
"""## README Files

A **README** is the most important document in any software project. It is usually the first thing anyone reads.

---

## What a README Contains

| Section | Content |
|---|---|
| **Project Overview** | What the project does and what problem it solves |
| **Features** | Key capabilities of the software |
| **Installation Instructions** | Step-by-step setup guide |
| **Usage Instructions** | How to use the software |
| **Configuration** | Environment variables and settings required |
| **Contributing** | How others can contribute |
| **License** | Usage rights and restrictions |

---

## Real World Example

GitHub hosts millions of open-source projects. Every popular project has a clear README that enables:

- Developers to understand the project in minutes
- New contributors to set it up without asking for help
- Users to know if the project solves their problem

A poor README means fewer users and contributors.

---

## Example README Opening

```markdown
# NexaLearn LMS

A learning management system for delivering online courses
with reading-based lessons, quizzes, and progress tracking.

## Features
- Student enrollment and progress tracking
- Reading-based lesson delivery
- Module quizzes with pass marks
- Admin dashboard for course management

## Installation
1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your Supabase credentials
4. Run `npm run dev`
```

---

> **Key Point:** A good README is the difference between a project that people can use and one that sits unused because no one understands it.""")

lesson(C12, M12, 5, "Technical Communication",
    "Clear communication with teammates, clients, and stakeholders is a critical professional skill.",
"""## Technical Communication

Developers do not work in isolation. They communicate constantly with:

- Team members
- Clients and customers
- Managers and executives
- Stakeholders and investors

**Good communication prevents misunderstandings that cause expensive mistakes.**

---

## Communicating Technical Concepts to Non-Technical Audiences

Most stakeholders are not developers. When explaining technical decisions:

- Use analogies instead of jargon
- Focus on business impact, not implementation details
- Summarise first, detail second

**Example:**

Instead of: "We need to refactor the authentication middleware to support OAuth2 token refresh cycles."

Say: "We need to update the login system so users stay logged in longer without security risks. This takes about two days."

---

## Written Communication

Most developer communication happens in writing:
- Slack / Teams messages
- Email updates
- Pull request descriptions
- Bug reports
- Project proposals

Apply the same principles as documentation: **clear, specific, and actionable**.

---

## Real World Example

A developer discovers a bug that will delay a launch. Two ways to communicate this:

**Poor:**
> "There is a problem with the code."

**Professional:**
> "I have found a bug in the payment processing module that affects checkout for users with international cards. It will take approximately 4 hours to fix. I will have a solution ready by 3 PM and will notify you when testing is complete."

The second message is specific, honest, and includes an action plan.

---

> **Key Point:** Technical skills build software. Communication skills determine how successfully that software is delivered.""")

lesson(C12, M12, 6, "AI and Documentation",
    "AI can accelerate documentation work — but every output requires review before publication.",
"""## AI and Documentation

AI can dramatically speed up documentation work when used correctly.

---

## What AI Can Help With

### Drafting Documentation
> "Write API documentation for this endpoint: [paste code]. Include endpoint URL, method, parameters, request body, response format, and an example."

### Summarising Information
> "Summarise these meeting notes into key decisions and action items: [paste notes]."

### Creating User Guides
> "Write a beginner-friendly user guide for logging into and enrolling in a course on a learning platform."

### Improving Clarity
> "Rewrite this documentation section to be clearer and more concise: [paste text]."

---

## The Review Requirement

AI-generated documentation must always be reviewed before publication because:

- AI may misunderstand the technical context
- Details may be incorrect or incomplete
- Tone may not match your organisation's style
- Examples may not reflect your actual system

---

## Module Summary

In this module you learned:

1. What documentation is and its different types
2. Why documentation matters — for teams, users, and the future
3. How to write effective documentation — clear, accurate, organised
4. README files — the essential project overview document
5. Technical communication — explaining technical work clearly
6. How AI can accelerate documentation while requiring human review

---

## Practical Activity

Create a README for a simple To-Do List application. Include:
- Project overview
- Features list
- Installation steps
- Usage instructions

---

> **Key Point:** Clear documentation and clear communication are professional superpowers. They multiply the impact of your technical work.""", dur=6)

questions(C12, M12, [
    (1,  "What is technical documentation?",
         ["A programming language", "Written information that explains how systems work and how to use them",
          "A type of database", "A project management tool"], 1),
    (2,  "Why is documentation important in software projects?",
         ["It slows development down", "It creates unnecessary files",
          "It preserves and shares knowledge, preventing loss when people change roles",
          "It is only useful for large companies"], 2),
    (3,  "What qualities should good documentation have?",
         ["Long and comprehensive only", "Clear, accurate, organised, and easy to follow",
          "Technical and jargon-heavy", "Updated once and never changed"], 1),
    (4,  "What is a README file?",
         ["A file storing database passwords",
          "A compiled application file",
          "A document explaining a software project, its features, and how to set it up",
          "A configuration file for the server"], 2),
    (5,  "What should a README typically contain?",
         ["Only the project name",
          "Database connection strings",
          "Project overview, features, installation steps, and usage instructions",
          "Company financial information"], 2),
    (6,  "Why is technical communication important for developers?",
         ["It replaces the need for documentation",
          "It improves team collaboration and reduces costly misunderstandings",
          "It is only needed when presenting to clients",
          "Communication is less important than technical skill"], 1),
    (7,  "Can AI help write technical documentation?",
         ["No, AI cannot produce documentation",
          "Yes, AI can draft documentation which developers then review and refine",
          "Only for advanced technical topics",
          "Only for README files"], 1),
    (8,  "Should AI-generated documentation always be reviewed before publication?",
         ["Yes — AI may misunderstand context, introduce errors, or miss important details",
          "No — AI documentation is always accurate",
          "Only for customer-facing documents",
          "Only if it was generated by an older AI model"], 0),
    (9,  "Who benefits from good project documentation?",
         ["Only the developer who wrote it",
          "Only the project manager",
          "Developers, users, new team members, and stakeholders",
          "Only large enterprise teams"], 2),
    (10, "What is the key lesson from this module?",
         ["Documentation is optional for experienced developers",
          "Clear documentation and communication improve software quality and team effectiveness",
          "AI can fully replace human documentation writers",
          "README files are only needed for open-source projects"], 1),
])


# =============================================================================
# CERTIFICATE 3 FINAL EXAM
# =============================================================================
print("\n-- CERT 3 FINAL EXAM: Certified AI-Enhanced Developer --")
FE3_ID  = "cert3-final-exam"
FE3_CID = course("Certified AI-Enhanced Developer — Final Exam",
    "30-question certification exam covering Prompt Engineering, Testing and QA, and Technical Documentation. Score 80% to earn your Certified AI-Enhanced Developer certificate.",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800")
module(FE3_ID, FE3_CID, "Certificate 3 Final Examination")

lesson(FE3_CID, FE3_ID, 1, "Certificate 3 Final Examination",
    "30 questions covering Prompt Engineering, Testing and QA, and Technical Documentation.",
"""## Certified AI-Enhanced Developer

### Final Certification Examination

---

## Exam Information

| Detail | Info |
|---|---|
| **Questions** | 30 |
| **Pass Mark** | 80% (24/30) |
| **Time Limit** | 30 minutes |
| **Sections** | A: Prompt Engineering, B: Testing & QA, C: Documentation |

---

## Grading

| Score | Result |
|---|---|
| 27-30 (90-100%) | Distinction |
| 24-26 (80-89%) | Pass |
| 18-23 (60-79%) | Retake Required |
| Below 18 | Re-enroll Recommended |

---

> Click **Mark as Read** to begin.""", dur=30)

questions(FE3_CID, FE3_ID, [
    # Section A: Prompt Engineering (Q1-10)
    (1,  "What is a prompt?", ["A database query","An instruction given to an AI system","A programming function","A variable"], 1),
    (2,  "Why are specific prompts more effective?", ["They are longer","They produce more accurate and relevant responses","They use more technical language","They are faster to write"], 1),
    (3,  "What are the three components of a strong prompt?", ["Input, Process, Output","Question, Answer, Review","Task, Context, Format","Goal, Method, Result"], 2),
    (4,  "What is role prompting?", ["Asking AI to write code only","Assigning a role to AI to shape response quality","A type of database query","A programming pattern"], 1),
    (5,  "Why use role prompting?", ["It makes responses shorter","It shapes the voice, expertise, and depth of AI responses","It reduces processing time","It avoids errors"], 1),
    (6,  "What is a structured output?", ["A database schema","A response formatted in a specific requested way","A programming pattern","A type of loop"], 1),
    (7,  "How can prompt engineering help developers?", ["It replaces the need to understand code","It improves learning, debugging, refactoring, and documentation","It is only useful for AI researchers","It only works for Python"], 1),
    (8,  "What is one poor prompting habit?", ["Specifying output format","Providing audience context","Being vague with no direction or context","Using role prompting"], 2),
    (9,  "Which is a better prompt?", ['"Tell me about software."','"Explain software testing types to a beginner using examples for each."','"Software info please."','"Help with software."'], 1),
    (10, "What is the main lesson of prompt engineering?", ["AI quality is fixed regardless of prompts","Better prompts consistently produce better AI responses","Short prompts are always best","Prompt engineering is only for AI specialists"], 1),
    # Section B: Testing and QA (Q11-20)
    (11, "What is the purpose of software testing?", ["To increase costs","To verify software behaves correctly before users encounter problems","To slow releases","To replace code reviews"], 1),
    (12, "What is manual testing?", ["Automated scripts","Testing performed by people interacting with the software","AI-generated tests","Stress testing only"], 1),
    (13, "What is automated testing?", ["Testing by the client","Writing documentation","Testing performed automatically by software","User research"], 2),
    (14, "What does a unit test verify?", ["The entire application","Multiple components together","A single function or component in isolation","User experience"], 2),
    (15, "What does integration testing verify?", ["A single function in isolation","That multiple components work correctly together","That the UI looks correct","Database schema only"], 1),
    (16, "What does UAT stand for?", ["Unit Acceptance Testing","Unified Automated Testing","User Acceptance Testing","Universal Application Testing"], 2),
    (17, "Who performs User Acceptance Testing?", ["Only developers","Only automated scripts","End users or business stakeholders","Only the project manager"], 2),
    (18, "What is the advantage of automated testing over manual testing?", ["It is always cheaper","It can run thousands of tests instantly and catches regressions automatically","It never misses visual bugs","It requires no setup"], 1),
    (19, "How can AI assist with testing?", ["AI cannot help with testing","AI generates perfect tests requiring no review","AI can generate test cases and edge cases for developers to review","AI replaces all manual testing"], 2),
    (20, "What is the goal of testing?", ["Find every possible bug regardless of impact","Deliver reliable software that works correctly for its users","Delay all releases","Replace good coding practices"], 1),
    # Section C: Documentation (Q21-30)
    (21, "What is technical documentation?", ["A programming language","Written information explaining how systems work","A database","A testing framework"], 1),
    (22, "Why is documentation important?", ["It slows development","It creates unnecessary files","It preserves and shares knowledge across time and team changes","Only useful for large teams"], 2),
    (23, "What qualities make documentation effective?", ["Long and detailed only","Clear, accurate, organised, and easy to follow","Technical and jargon-heavy","Created once and never updated"], 1),
    (24, "What is a README file?", ["A database password file","A compiled application","A document explaining a project, its features, and setup","A server configuration file"], 2),
    (25, "What should a README include?", ["Only the project name","Database credentials","Project overview, features, installation, and usage instructions","Company financials"], 2),
    (26, "Why is technical communication important?", ["It replaces documentation","It improves collaboration and reduces costly misunderstandings","Only needed for client presentations","Less important than technical skill"], 1),
    (27, "Can AI help with writing documentation?", ["No","Yes — AI drafts documentation which developers review and refine","Only for advanced topics","Only for README files"], 1),
    (28, "Should AI-generated documentation be reviewed?", ["No, AI is always accurate","Yes — AI may misunderstand context, introduce errors, or miss details","Only for customer-facing docs","Only if the AI is older"], 0),
    (29, "Who benefits from clear project documentation?", ["Only the original developer","Only the project manager","Developers, users, new team members, and stakeholders","Only large enterprise teams"], 2),
    (30, "What is the key lesson from Certificate 3?", ["AI replaces the need to write documentation","Prompt engineering, testing, and documentation make developers more professional and effective","Testing is optional for experienced developers","README files are only for open source"], 1),
])

print("\nCertificate 3 modules inserted successfully.")
