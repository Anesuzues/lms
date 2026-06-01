import urllib.request, urllib.error, json

BASE      = "https://amarfzhlbhzchmeqkbyg.supabase.co/rest/v1"
KEY       = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtYXJmemhsYmh6Y2htZXFrYnlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njk0MDI0NSwiZXhwIjoyMDkyNTE2MjQ1fQ.BCViogF93CceiUtIJ9j2P7zYrfK_9dBQtV2QLGnlP-o"
COURSE_ID = "1e59674d-3153-4f37-8f80-e86147fb0f85"
MODULE_ID = "tech-foundations-m1"

def req(method, path, payload=None):
    url = f"{BASE}/{path}"
    data = json.dumps(payload).encode() if payload else None
    r = urllib.request.Request(url, data=data, method=method)
    r.add_header("apikey", KEY)
    r.add_header("Authorization", f"Bearer {KEY}")
    r.add_header("Content-Type", "application/json")
    r.add_header("Prefer", "return=representation")
    try:
        with urllib.request.urlopen(r) as resp:
            body = resp.read()
            return json.loads(body) if body else [], None
    except urllib.error.HTTPError as e:
        return None, e.read().decode()

# ── 1. Delete old quiz questions ───────────────────────────────────────────────
res, err = req("DELETE", f"quiz_questions?course_id=eq.{COURSE_ID}")
print("Delete quiz_questions:", "OK" if err is None else f"ERR {err}")

# ── 2. Delete old lessons ──────────────────────────────────────────────────────
res, err = req("DELETE", f"lessons?course_id=eq.{COURSE_ID}")
print("Delete lessons:", "OK" if err is None else f"ERR {err}")

# ── 3. Insert 5 new lessons ────────────────────────────────────────────────────
LESSONS = [
    (1, "What Is Technology?",
     "Technology is the application of knowledge, tools, and systems to solve problems and make life easier.",
     """## What Is Technology?

Technology is the application of knowledge, tools, and systems to solve problems and make life easier.

Technology has existed for thousands of years. Early humans used simple tools such as spears and farming equipment. Today we use smartphones, computers, robots, and artificial intelligence.

Technology helps people:

- Communicate faster
- Work more efficiently
- Solve complex problems
- Access information instantly
- Build businesses

Without technology, many modern services would not exist.

---

## Real World Example

Imagine a supermarket. When a cashier scans a product:

- The barcode is read
- The system finds the product
- The price is displayed
- Stock levels are updated
- A receipt is generated

All of this happens within seconds because technology automates the process.

---

> **Key Point:** Technology is not just computers. It is any tool or system designed to solve a problem."""),

    (2, "What Is Software?",
     "Software is a collection of instructions that tells a computer what to do.",
     """## What Is Software?

Software is a collection of instructions that tells a computer what to do.

A computer without software is like a car without a driver. The hardware exists, but nothing useful happens.

Examples of software include:

- WhatsApp
- Instagram
- Microsoft Word
- Spotify
- Google Chrome

---

## Categories of Software

### System Software

System software manages the computer itself.

Examples:

- **Windows**
- **Linux**
- **macOS**

### Application Software

Application software helps users perform tasks.

Examples:

- Email applications
- Banking applications
- Social media platforms
- Accounting systems

---

## Real World Example

When you open Spotify:

- Software loads your playlists
- Software connects to Spotify servers
- Software streams music
- Software displays controls

Everything you see and hear is controlled by software."""),

    (3, "Websites vs Applications",
     "Websites and applications are related but serve different purposes.",
     """## Websites vs Applications

Many beginners think websites and applications are the same thing. They are related but different.

---

## Website

A website mainly provides **information**.

Examples:

- Company websites
- Blogs
- News websites

Users mostly **read content**. Interaction is limited.

---

## Application

An application allows users to **perform actions**.

Examples:

- Gmail
- Facebook
- Uber
- Online Banking

Users interact with data and perform tasks.

---

## Real World Example

A **restaurant website** may show:

- Menu
- Contact information
- Opening hours

A **restaurant application** may allow users to:

- Create accounts
- Place orders
- Pay online
- Track deliveries

Applications are generally more complex than websites.

---

> **Key Point:** Websites provide information. Applications allow users to perform actions."""),

    (4, "Frontend and Backend",
     "Most software systems consist of two major parts: the frontend and the backend.",
     """## Frontend and Backend

Most software systems consist of two major parts: the **frontend** and the **backend**.

---

## Frontend

The frontend is **what users see**.

Examples:

- Buttons
- Menus
- Images
- Forms
- Pages

When you visit a website, everything visible is part of the frontend.

### Example — Instagram Frontend:

- Like button
- Comment section
- Profile page

These are all frontend components.

---

## Backend

The backend works **behind the scenes**. Users do not normally see it.

The backend handles:

- User logins
- Password verification
- Business rules
- Database access
- Data processing

---

## Real World Example

When you log into Instagram:

**Frontend shows:**
- Username field
- Password field
- Login button

**Backend does:**
- Verifies your credentials
- Retrieves your account information
- Loads your profile and feed

Without the backend, the frontend would not function.

---

> **Key Point:** Frontend = What users see. Backend = What makes everything work."""),

    (5, "Introduction to Artificial Intelligence",
     "AI is technology that allows computers to perform tasks that normally require human intelligence.",
     """## Introduction to Artificial Intelligence

Artificial Intelligence — often called **AI** — is technology that allows computers to perform tasks that normally require human intelligence.

Examples include:

- **ChatGPT** — Conversational AI by OpenAI
- **Claude** — AI assistant by Anthropic
- **Gemini** — AI by Google
- **Siri** — Apple's voice assistant
- **Alexa** — Amazon's voice assistant

---

## What Can AI Do?

- Answer questions
- Generate content
- Write code
- Analyze information
- Summarize documents

---

## AI Is Not Perfect

AI can:

- Make mistakes
- Produce incorrect information
- Misunderstand instructions

For this reason, AI should always be used as an **assistant** rather than a replacement for critical thinking.

---

## Real World Example

A customer support chatbot can answer common questions instantly. However, difficult issues may still need a human support agent.

This is an example of humans and AI working together.

---

## Module Summary

In this module, you learned:

1. What technology is
2. What software is
3. The difference between websites and applications
4. The difference between frontend and backend systems
5. The basics of artificial intelligence

These concepts form the foundation for everything else you will learn in this programme.

---

> **Key Point:** AI is a powerful tool, but human judgment remains important. Always verify AI-generated information before using it."""),
]

print("\nInserting lessons...")
lesson_ids = []
for oi, title, desc, content in LESSONS:
    payload = {
        "course_id": COURSE_ID,
        "module_id": MODULE_ID,
        "title": title,
        "description": desc,
        "content": content,
        "position": 1,
        "order_index": oi,
        "duration_minutes": 7,
        "type": "reading",
        "is_free": True,
    }
    res, err = req("POST", "lessons", payload)
    if err and "content" in err:
        # content column not yet added — insert without it
        del payload["content"]
        res, err = req("POST", "lessons", payload)
        if res:
            print(f"  Lesson {oi} '{title}': OK (no content column yet — run ALTER TABLE first)")
        else:
            print(f"  Lesson {oi} '{title}': ERR {err}")
    elif res:
        lid = res[0]["id"] if isinstance(res, list) else res.get("id")
        lesson_ids.append(lid)
        print(f"  Lesson {oi} '{title}': OK")
    else:
        print(f"  Lesson {oi} '{title}': ERR {err}")

# ── 4. Insert 10 quiz questions ────────────────────────────────────────────────
QUESTIONS = [
    (1,  "What is technology?",
         ["A programming language",
          "A tool or system used to solve problems",
          "A database",
          "A website"],
         1),
    (2,  "What is software?",
         ["Physical computer equipment",
          "Instructions that tell a computer what to do",
          "Internet access",
          "A database"],
         1),
    (3,  "Which of the following is application software?",
         ["Windows", "Linux", "WhatsApp", "BIOS"],
         2),
    (4,  "What is the primary purpose of a website?",
         ["Store data", "Provide information", "Replace applications", "Create hardware"],
         1),
    (5,  "Which of the following is an application?",
         ["Uber", "Company brochure website", "Newspaper homepage", "Landing page"],
         0),
    (6,  "What is the frontend?",
         ["Database", "Server", "What users see and interact with", "Business logic"],
         2),
    (7,  "What is the backend responsible for?",
         ["Styling pages only",
          "Processing data and business logic",
          "Displaying images",
          "Designing logos"],
         1),
    (8,  "Which statement about AI is true?",
         ["AI is always correct",
          "AI never makes mistakes",
          "AI output should always be verified",
          "AI replaces all human workers"],
         2),
    (9,  "Which of the following is an example of AI?",
         ["Microsoft Word", "ChatGPT", "MySQL", "HTML"],
         1),
    (10, "Why is human judgment still important when using AI?",
         ["AI is completely reliable and needs no oversight",
          "AI can make mistakes or provide incorrect information and must be verified",
          "Human judgment slows down the process",
          "AI has already replaced all critical thinking"],
         1),
]

print("\nInserting quiz questions...")
for pos, question, options, correct in QUESTIONS:
    res, err = req("POST", "quiz_questions", {
        "course_id": COURSE_ID,
        "module_id": MODULE_ID,
        "question": question,
        "options": options,
        "correct": correct,
        "position": pos,
    })
    print(f"  Q{pos}: {'OK' if res is not None else f'ERR {err}'}")

print("\nAll done.")
