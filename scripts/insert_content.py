import urllib.request, urllib.error, json

BASE = "https://amarfzhlbhzchmeqkbyg.supabase.co/rest/v1"
KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtYXJmemhsYmh6Y2htZXFrYnlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njk0MDI0NSwiZXhwIjoyMDkyNTE2MjQ1fQ.BCViogF93CceiUtIJ9j2P7zYrfK_9dBQtV2QLGnlP-o"
COURSE_ID = "1e59674d-3153-4f37-8f80-e86147fb0f85"

CONTENTS = {
"What is Technology?": """## What is Technology?

Technology refers to tools, systems, and processes created to solve problems and improve human life.

Examples include:

- Smartphones
- Computers
- Websites
- Mobile applications
- Artificial Intelligence systems
- Cloud platforms

Technology helps businesses operate efficiently, communicate effectively, and deliver services to customers.

---

### Real World Example

A supermarket uses technology to:

- Track stock levels
- Process payments
- Print receipts
- Generate sales reports

Without technology, these tasks would require significantly more time and effort.

> **Key Takeaway:** Technology is not just gadgets — it is any tool, system, or process that helps solve a problem or improve how we live and work.""",

"What is Software?": """## What is Software?

Software is a collection of instructions that tells a computer what actions to perform.

Software allows users to interact with computers and perform useful tasks.

Examples include:

- Microsoft Word
- WhatsApp
- Instagram
- Spotify
- Zoom

---

## Categories of Software

### System Software

System software manages computer hardware and provides a platform for other software to run.

Examples:

- **Windows** — Microsoft's operating system
- **Linux** — An open-source operating system
- **macOS** — Apple's operating system

### Application Software

Application software helps users perform specific tasks.

Examples:

- Word processing (Microsoft Word, Google Docs)
- Email applications (Gmail, Outlook)
- Banking applications
- Accounting software

> **Key Takeaway:** Software is the set of instructions that makes a computer useful. Without software, hardware is just a machine with no purpose.""",

"Websites vs Applications": """## Websites vs Applications

Many people use the terms website and application interchangeably, but they are not exactly the same.

---

## Website

A website primarily provides **information**.

Examples:

- Company websites
- News websites
- Blogs

Users mostly **read and consume** information. There is limited interaction.

---

## Application

An application allows users to **perform actions** and complete tasks.

Examples:

- Gmail
- Facebook
- Uber
- Online Banking

Applications involve more interaction, processing, and user input than standard websites.

---

### Real World Example

A **restaurant website** may display:

- Menu
- Contact details
- Opening hours

A **restaurant application** may additionally allow customers to:

- Place orders
- Make payments
- Track deliveries

> **Key Takeaway:** Websites inform. Applications enable action. Many modern platforms are both.""",

"Frontend and Backend": """## Frontend and Backend

Modern applications consist of two major components: the **frontend** and the **backend**.

---

## Frontend

The frontend is everything users **see and interact with**.

Examples include:

- Buttons
- Forms
- Images
- Navigation menus

### Frontend Technologies

- **HTML** — Structures the content on a page
- **CSS** — Styles the visual appearance
- **JavaScript** — Adds interactivity and behaviour

---

## Backend

The backend performs tasks **behind the scenes** that users do not directly see.

Examples include:

- User authentication
- Data processing
- Business logic
- Database communication

### Backend Technologies

- **Python**
- **Java**
- **Node.js**
- **PHP**

---

### Real World Example

When logging into Instagram:

**Frontend:**
- Login form
- Username and password fields

**Backend:**
- Verifies your credentials
- Retrieves your profile information
- Loads your feed and account data

> **Key Takeaway:** The frontend is the face of the application. The backend is the brain. Both must work together for an application to function.""",

"Databases": """## Databases

A database **stores and organises information**.

Almost every modern application uses a database to keep data safe, structured, and retrievable.

---

## What Do Databases Store?

- User accounts
- Product information
- Orders
- Messages
- Payment records

---

## Popular Databases

- **MySQL** — Widely used in web applications
- **PostgreSQL** — Powerful open-source database
- **MongoDB** — Stores data in a flexible document format

---

### Real World Example

An **online store** database may store:

**Customer:** Name, Email, Phone Number

**Product:** Product Name, Price, Stock Quantity

**Order:** Order Number, Purchase Date, Payment Status

> **Key Takeaway:** Databases are the memory of an application. Without a database, all data would be lost the moment you close the app.""",

"Cloud Computing": """## Cloud Computing

Cloud computing means using **computing resources over the internet** instead of relying only on local computers.

---

## What Do Cloud Providers Offer?

- Servers
- Storage
- Databases
- Artificial Intelligence services

---

## Popular Cloud Platforms

- **Amazon Web Services (AWS)** — The world's largest cloud provider
- **Microsoft Azure** — Microsoft's cloud platform
- **Google Cloud** — Google's cloud infrastructure

---

## Benefits of Cloud Computing

- **Scalability** — Easily increase or decrease resources as needed
- **Cost efficiency** — Pay only for what you use
- **Accessibility** — Access your systems from anywhere
- **Reliability** — Built-in backups and redundancy

---

### Real World Example

**Netflix** uses cloud infrastructure to stream content to millions of users worldwide simultaneously, scale up during peak hours, and store vast libraries of video content globally.

Without cloud computing, Netflix would need to own and maintain thousands of physical servers — which would be extremely expensive.

> **Key Takeaway:** Cloud computing allows businesses of all sizes to access powerful technology without building and maintaining their own physical infrastructure.""",

"Introduction to Artificial Intelligence": """## Introduction to Artificial Intelligence

Artificial Intelligence — commonly called **AI** — refers to computer systems that perform tasks that typically require human intelligence.

---

## Examples of AI Tools

- **ChatGPT** — Conversational AI by OpenAI
- **Claude** — AI assistant by Anthropic
- **Gemini** — AI by Google
- **Recommendation systems** — Netflix, YouTube, Spotify
- **Virtual assistants** — Siri, Alexa, Google Assistant

---

## What Can AI Help With?

- Writing and editing
- Coding and debugging
- Research and summarisation
- Data analysis
- Customer support

---

## AI as a Professional Tool

AI is a **tool**, not a replacement for human thinking.

Successful professionals use AI to enhance their abilities, speed up repetitive tasks, and explore ideas faster.

### Important Note

Always verify AI-generated information before using it. AI can make mistakes, provide outdated information, or generate incorrect responses. Critical thinking remains your most important skill.

---

## Module Summary

In this module you learned:

1. What technology is and how it shapes our world
2. What software is and its different categories
3. The difference between websites and applications
4. Frontend and backend concepts
5. Database fundamentals
6. Cloud computing basics
7. An introduction to Artificial Intelligence

These concepts form the foundation for the rest of the programme.

> **Key Takeaway:** AI is a powerful tool that amplifies human capability. Learn to use it well — but never stop thinking for yourself.""",
}

def patch(lesson_id, content):
    data = json.dumps({"content": content}).encode()
    url = f"{BASE}/lessons?id=eq.{lesson_id}"
    req = urllib.request.Request(url, data=data, method="PATCH")
    req.add_header("apikey", KEY)
    req.add_header("Authorization", f"Bearer {KEY}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "return=representation")
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read()), None
    except urllib.error.HTTPError as e:
        return None, e.read().decode()

def get_lessons():
    url = f"{BASE}/lessons?course_id=eq.{COURSE_ID}&select=id,title"
    req = urllib.request.Request(url)
    req.add_header("apikey", KEY)
    req.add_header("Authorization", f"Bearer {KEY}")
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

lessons = get_lessons()
print(f"Found {len(lessons)} lessons")

for lesson in lessons:
    title = lesson["title"]
    if title in CONTENTS:
        res, err = patch(lesson["id"], CONTENTS[title])
        print(f"  '{title}': {'OK' if res is not None else f'ERR {err}'}")
    else:
        print(f"  '{title}': NO MATCH")

print("Done.")
