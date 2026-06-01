# -*- coding: utf-8 -*-
import urllib.request, urllib.error, json, sys

BASE = "https://amarfzhlbhzchmeqkbyg.supabase.co/rest/v1"
KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtYXJmemhsYmh6Y2htZXFrYnlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njk0MDI0NSwiZXhwIjoyMDkyNTE2MjQ1fQ.BCViogF93CceiUtIJ9j2P7zYrfK_9dBQtV2QLGnlP-o"

def post(path, payload):
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(f"{BASE}/{path}", data=data, method="POST")
    req.add_header("apikey", KEY)
    req.add_header("Authorization", f"Bearer {KEY}")
    req.add_header("Content-Type", "application/json; charset=utf-8")
    req.add_header("Prefer", "return=representation")
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read()), None
    except urllib.error.HTTPError as e:
        return None, e.read().decode()

def course(title, description, thumbnail):
    res, err = post("courses", {"title": title, "description": description,
        "level": "beginner", "category": "Technology", "price": 0,
        "duration": "Self-paced", "thumbnail_url": thumbnail})
    if err: raise Exception(f"Course failed: {err}")
    cid = res[0]["id"]
    print(f"  Course created: {cid}")
    return cid

def module(mid, cid, title, position=1):
    res, err = post("modules", {"id": mid, "course_id": cid, "title": title, "position": position})
    print(f"  Module '{title}':", "OK" if res is not None else f"ERR {err}")

def lesson(cid, mid, oi, title, desc, content, duration=7):
    res, err = post("lessons", {"course_id": cid, "module_id": mid, "title": title,
        "description": desc, "content": content, "position": 1, "order_index": oi,
        "duration_minutes": duration, "type": "reading", "is_free": True})
    print(f"    L{oi} '{title}':", "OK" if res is not None else f"ERR {err}")

def questions(cid, mid, qs):
    for pos, q, opts, correct in qs:
        res, err = post("quiz_questions", {"course_id": cid, "module_id": mid,
            "question": q, "options": opts, "correct": correct, "position": pos})
        print(f"    Q{pos}:", "OK" if res is not None else f"ERR {err}")


# =============================================================================
# MODULE 4: Introduction to Programming
# =============================================================================
print("\n-- MODULE 4: Introduction to Programming --")
M4 = "prog-intro-m4"
C4 = course("Introduction to Programming",
    "Learn the fundamental building blocks of programming — variables, data types, decisions, loops, and functions — the concepts that power every application.",
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=800")
module(M4, C4, "Introduction to Programming")

lesson(C4, M4, 1, "What is Programming?",
    "Programming is the process of creating instructions that tell a computer what actions to perform.",
"""## What is Programming?

Programming is the process of creating instructions that tell a computer what actions to perform.

Think of programming like writing a recipe. A recipe tells a chef what ingredients to use, what order to follow, and what actions to perform. Code works the same way.

It tells a computer:
- What information to process
- What calculations to perform
- What results to display

---

## Real World Example

An ATM machine follows programmed instructions. When you insert your card:

1. The ATM reads your card
2. It verifies your PIN
3. It checks your account balance
4. It processes your withdrawal
5. It updates your account balance

All of this happens because a programmer created precise instructions for the machine to follow.

---

## Why Programming Matters

Programming powers:

- Websites and mobile applications
- Banking and payment systems
- Social media platforms
- Artificial Intelligence systems
- Games and entertainment

Every digital product you use every day was built by someone who learned to program.

---

> **Key Point:** Programming is simply the skill of writing clear, logical instructions for a computer to follow. Computers are powerful — but they only do exactly what they are told.""")

lesson(C4, M4, 2, "Variables",
    "Variables are containers used to store information that a program needs to remember.",
"""## Variables

Programs need a way to store information. **Variables** are containers used to store data.

Think of a variable as a **labeled box**. You put a value inside, give it a name, and the computer remembers it for later.

---

## Examples

```
name = "John"
age = 25
balance = 5000.00
isLoggedIn = True
```

The computer stores these values and can use or update them at any point during the program.

---

## Naming Variables

Good variable names are:

- **Descriptive** — `customerAge` not `x`
- **Consistent** — use the same style throughout
- **Clear** — the name explains what it stores

---

## Real World Example

A banking application stores:

```
customerName = "Sarah"
accountBalance = 5000
isAccountActive = True
```

Every time the customer logs in, the application uses these variables to display the correct information.

---

> **Key Point:** Variables are how programs remember information. Without variables, a program would forget everything between each step.""")

lesson(C4, M4, 3, "Data Types",
    "Different types of information are stored differently. These categories are called data types.",
"""## Data Types

Different types of information need to be stored differently. These categories are called **data types**.

---

## The Four Main Data Types

### String (Text)

Stores words, sentences, and characters.

```
name = "South Africa"
message = "Hello World"
email = "user@example.com"
```

### Integer (Whole Numbers)

Stores numbers without decimals.

```
age = 25
quantity = 100
year = 2025
```

### Float (Decimal Numbers)

Stores numbers with decimal points.

```
price = 99.99
temperature = 36.5
taxRate = 0.15
```

### Boolean (True or False)

Stores only one of two values: **True** or **False**.

```
isPaid = True
isLoggedIn = False
hasPermission = True
```

---

## Why Data Types Matter

Imagine storing a person's age.

- Age should be stored as an **Integer**, not text
- You cannot do maths on text
- `25 + 5 = 30` works with integers
- `"25" + "5" = "255"` happens with strings — wrong result

The computer needs to know what type of information it is working with to process it correctly.

---

> **Key Point:** Using the correct data type ensures your program handles information accurately. A number stored as text will behave like text — not like a number.""")

lesson(C4, M4, 4, "Decision Making",
    "Programs use conditional statements to make decisions based on information.",
"""## Decision Making

Programs often need to make decisions based on conditions. This is done using **conditional statements** — most commonly the **IF statement**.

---

## How IF Statements Work

```
IF condition is true:
    do this
ELSE:
    do something else
```

---

## Real World Examples

### Nightclub Entry System

```
IF age >= 18:
    Allow entry
ELSE:
    Deny entry
```

### Banking Application

```
IF balance >= withdrawalAmount:
    Process transaction
ELSE:
    Decline — insufficient funds
```

### Login System

```
IF password is correct:
    Grant access
ELSE:
    Show error message
```

---

## Multiple Conditions

Programs can check more than one condition:

```
IF age >= 18 AND hasValidID:
    Allow entry
ELSE:
    Deny entry
```

---

> **Key Point:** Conditional statements allow programs to respond differently depending on the situation. They are how software makes intelligent decisions.""")

lesson(C4, M4, 5, "Loops",
    "Loops allow programs to repeat actions automatically without writing the same code multiple times.",
"""## Loops

Sometimes programs need to perform the same action many times. **Loops** allow programs to repeat tasks automatically.

---

## Without Loops

Imagine printing a welcome message 100 times without loops:

```
print("Welcome")
print("Welcome")
print("Welcome")
... (97 more times)
```

This is impractical and creates thousands of unnecessary lines of code.

---

## With Loops

```
REPEAT 100 times:
    print("Welcome")
```

One instruction. The computer does the repetition automatically.

---

## Types of Loops

### FOR Loop — when you know how many times

```
FOR each employee in employeeList:
    calculate salary
    make payment
```

### WHILE Loop — repeat until a condition changes

```
WHILE user is not logged in:
    ask for password
```

---

## Real World Examples

**Payroll System:**
A loop processes salary payments for 500 employees automatically — no need to manually process each one.

**Product Catalog:**
A loop displays all 200 products in an online store without writing 200 separate display instructions.

**Notifications:**
A loop sends reminder emails to all users who haven't completed their profile.

---

> **Key Point:** Loops eliminate repetition. Any task that needs to happen multiple times is a candidate for a loop.""")

lesson(C4, M4, 6, "Functions",
    "Functions are reusable blocks of code that perform a specific task.",
"""## Functions

**Functions** are reusable blocks of code designed to perform a specific task.

Instead of writing the same instructions over and over, programmers define a function once and call it whenever needed.

---

## Example

Without functions, a calculator might have this code written out in full every time:

```
number1 + number2 = result
display result
```

With functions:

```
FUNCTION addNumbers(number1, number2):
    return number1 + number2

result = addNumbers(10, 5)   -- returns 15
result = addNumbers(100, 50) -- returns 150
```

Write once. Use as many times as needed.

---

## Benefits of Functions

- **Reduce repetition** — write code once, use it many times
- **Improve organisation** — code is grouped by purpose
- **Easier to maintain** — fix the function in one place, it's fixed everywhere
- **Easier to test** — test each function independently

---

## Real World Example

A banking application might have these functions:

```
checkBalance(accountId)
processPayment(amount, recipient)
sendNotification(userId, message)
validatePin(enteredPin, storedPin)
```

Each function does one specific job. The whole system is built by combining these functions.

---

> **Key Point:** Functions are one of the most important concepts in programming. They keep code organised, reusable, and easier to maintain.""")

lesson(C4, M4, 7, "Why Programming Matters",
    "Programming is one of the most valuable skills in the digital economy.",
"""## Why Programming Matters

Programming is the foundation of the digital world. Every piece of software you use was built by someone who learned these exact concepts.

---

## What Programming Powers

- **Websites and web applications** — from simple blogs to complex platforms
- **Mobile applications** — everything on your phone
- **Banking and financial systems** — payments, transactions, accounts
- **Social media platforms** — content, connections, recommendations
- **Artificial Intelligence** — the AI tools you have been learning to use
- **Healthcare systems** — patient records, diagnostics, monitoring
- **Transport systems** — ride-sharing, navigation, logistics

---

## Skills Programming Develops

Beyond writing code, programming teaches you to:

- **Think logically** — break big problems into small steps
- **Solve problems systematically** — find root causes, not just symptoms
- **Think creatively** — find new approaches to challenges
- **Pay attention to detail** — one misplaced character can break a program

---

## Module Summary

In this module you learned:

1. Programming is writing instructions for computers to follow
2. Variables store information programs need to remember
3. Data types define what kind of information is stored
4. IF statements allow programs to make decisions
5. Loops repeat actions automatically
6. Functions organise reusable code

**These six concepts are the foundation of every programming language — from Python to JavaScript to Java.**

---

## Practical Activity

Imagine you are building a student registration system. Identify:

- **Three variables** the system needs to store
- **One decision** the system must make
- **One repetitive task** that would benefit from a loop

---

> **Key Point:** Programming is not just a technical skill — it is a way of thinking that helps you solve complex problems in any field.""", duration=6)

questions(C4, M4, [
    (1,  "What is programming?",
         ["Creating graphics", "Writing instructions for a computer", "Buying software", "Building hardware"], 1),
    (2,  "What is a variable?",
         ["A type of computer", "A container used to store data", "A website", "A database"], 1),
    (3,  "Which of the following is an example of a string?",
         ["25", "100", '"Hello"', "True"], 2),
    (4,  "Which data type stores whole numbers?",
         ["String", "Boolean", "Integer", "Function"], 2),
    (5,  "A Boolean value can be:",
         ["Text or Number", "True or False", "Integer or Decimal", "Input or Output"], 1),
    (6,  "What is the purpose of an IF statement?",
         ["Repeat actions", "Store information", "Make decisions based on conditions", "Print documents"], 2),
    (7,  "What is a loop used for?",
         ["Storing data", "Repeating actions automatically", "Creating websites", "Connecting databases"], 1),
    (8,  "What is a function?",
         ["A reusable block of code", "A database table", "A programming language", "A web browser"], 0),
    (9,  "Why are functions useful?",
         ["They reduce repetition", "They improve code organisation", "They save development time", "All of the above"], 3),
    (10, "What is the most important lesson from this module?",
         ["Programming only works for experts",
          "Programming is writing logical instructions that allow computers to solve problems",
          "You need expensive software to program",
          "Programming replaces all other workplace skills"], 1),
])


# =============================================================================
# MODULE 5: Programming with AI Assistance
# =============================================================================
print("\n-- MODULE 5: Programming with AI Assistance --")
M5 = "ai-coding-m5"
C5 = course("Programming with AI Assistance",
    "Learn how to use AI as your coding tutor and assistant — writing better prompts, debugging with AI, and developing strong programming skills alongside powerful tools.",
    "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800")
module(M5, C5, "Programming with AI Assistance")

lesson(C5, M5, 1, "AI as Your Personal Coding Tutor",
    "AI can explain any programming concept instantly, tailored to your level of understanding.",
"""## AI as Your Personal Coding Tutor

One of the most powerful advantages of modern AI is that it can explain any programming concept instantly — at exactly the level of detail you need.

---

## Traditional Learning vs AI-Assisted Learning

**Traditional approach:**
- Search through multiple websites
- Read documentation that may be too advanced
- Watch long videos to find a specific answer
- Wait for a teacher or mentor to be available

**With AI:**
- Ask your question in plain language
- Get an explanation at your exact level
- Ask follow-up questions immediately
- Get examples tailored to your context

---

## Example

Instead of searching for hours to understand loops, ask:

> "Explain loops to a complete beginner using a simple, real-world example."

AI will provide a clear, beginner-friendly explanation immediately.

---

## Real World Example

A junior developer is struggling to understand APIs.

Instead of spending an afternoon reading technical documentation, they ask:

> "Explain what an API is using a restaurant analogy. I am a beginner."

Within minutes, they understand the concept clearly enough to start working with it.

---

## Getting the Best Explanations

Tell AI:
- Your current level ("I am a beginner")
- What context you are learning in ("I am building a web application")
- How you want it explained ("Use a real-world analogy")

---

> **Key Point:** AI is available 24 hours a day, responds instantly, and never gets impatient. Used correctly, it is the most accessible learning tool ever created.""")

lesson(C5, M5, 2, "Learning Through Questions",
    "The quality of your answers depends entirely on the quality of your questions.",
"""## Learning Through Questions

With AI, the quality of answers depends entirely on the quality of your questions.

---

## Poor vs Effective Questions

### Poor Question:
> "Teach me Python."

This is too broad. AI does not know where to start, what you already know, or what you specifically need.

### Effective Question:
> "Explain Python variables to a complete beginner and provide three practical examples."

This gives AI clear direction and produces a useful, specific answer.

---

## Principles of Good Questions

| Principle | Poor | Better |
|---|---|---|
| **Be specific** | "Explain coding" | "Explain IF statements in Python" |
| **Give context** | "Help me" | "I am building a login system" |
| **State your level** | No level given | "I am a beginner" |
| **Request format** | Open-ended | "Give me three examples" |

---

## Building on Answers

Good learners do not just accept the first answer. They ask follow-up questions:

> "Can you show me another example?"
> "What happens if the condition is False?"
> "When would I use this in a real project?"

This is how deep understanding develops.

---

## Real World Example

A student wants to understand database queries.

**Poor approach:**
> "Tell me about databases."

**Effective approach:**
> "Explain how to retrieve data from a database using SQL. I am a beginner. Show me a simple example using a student records table."

The second question produces a directly useful, beginner-friendly answer.

---

> **Key Point:** AI amplifies the quality of your thinking. Better questions produce better answers, which produce better learning.""")

lesson(C5, M5, 3, "Using AI to Debug Code",
    "When code fails, AI can help you understand the error, find the cause, and fix the problem.",
"""## Using AI to Debug Code

**Debugging** is the process of finding and fixing errors in code. AI can dramatically speed up this process.

---

## What to Do When Code Fails

1. Read the error message carefully
2. Copy the error message
3. Paste it into AI with your code
4. Ask AI to explain what went wrong

---

## Example

Your code produces this error:

```
NameError: name 'age' is not defined
```

Ask AI:

> "I am getting this Python error: 'NameError: name age is not defined'. Here is my code: [paste code]. What does this mean and how do I fix it?"

AI will explain:
- **What** the error means (you used a variable before defining it)
- **Why** it happened (variable was not assigned a value first)
- **How** to fix it (define the variable before using it)

---

## AI Debugging Checklist

When asking AI to help debug:

- Include the **full error message**
- Include the **relevant code**
- Describe **what you expected** to happen
- Describe **what actually happened**

The more context you provide, the better the solution.

---

## Real World Example

A developer builds a simple calculator. It crashes when dividing by zero. They ask AI:

> "My Python calculator crashes with 'ZeroDivisionError' when I divide by zero. Here is the code. How do I prevent this crash?"

AI suggests adding a check: `IF number2 == 0: show error message`.

---

> **Key Point:** AI does not replace your need to understand errors — it accelerates your understanding of them. Always read the explanation, not just the fix.""")

lesson(C5, M5, 4, "Understanding AI Generated Code",
    "Never copy code without understanding it. Understanding before implementing is a professional standard.",
"""## Understanding AI Generated Code

AI can generate working code quickly. However, **never copy code without understanding it first**.

This is one of the most important professional standards in software development.

---

## Why You Must Understand Code Before Using It

- **You cannot fix what you do not understand** — if it breaks, you will be lost
- **You cannot extend what you do not understand** — you cannot add features to code you cannot read
- **It is a security risk** — AI-generated code may have vulnerabilities
- **It is your responsibility** — if you submit or deploy it, it is yours

---

## Questions to Ask About Every Piece of Code

Before using AI-generated code, ask:

1. **What does this code do?** — Understand the overall purpose
2. **How does it work step by step?** — Read line by line
3. **Why was this approach chosen?** — Is there a better way?
4. **What could go wrong?** — What are the edge cases?
5. **How do I test it?** — How do I verify it works correctly?

---

## The Right Process

1. Ask AI to generate the code
2. Ask AI to **explain the code line by line**
3. Read and understand it yourself
4. Test it with different inputs
5. Only then use it in your project

---

## Real World Example

A junior developer asks AI for code to validate an email address. AI provides a solution. Instead of copying it immediately:

1. They ask: "Explain each line of this code to me."
2. They test it with valid and invalid emails
3. They discover it does not handle one edge case
4. They fix it and understand why the fix works

This developer is now stronger for the experience.

---

> **Key Point:** Understanding code is not optional — it is a professional responsibility. AI generates starting points. You are responsible for what you build.""")

lesson(C5, M5, 5, "Best Practices for AI-Assisted Development",
    "Use AI to become a stronger developer — not as a shortcut that bypasses learning.",
"""## Best Practices for AI-Assisted Development

AI is a powerful tool for developers. Used well, it accelerates learning and productivity. Used poorly, it creates dependency and undermines real skill development.

---

## Use AI For...

| Good Use | Example |
|---|---|
| **Learning concepts** | "Explain recursion with examples" |
| **Generating code examples** | "Show me a basic login function in Python" |
| **Code review** | "Review this function for improvements" |
| **Documentation** | "Write a comment explaining what this function does" |
| **Debugging** | "Why is this code producing a TypeError?" |
| **Exploring approaches** | "What are three ways to solve this problem?" |

---

## Do NOT Use AI To...

- **Cheat assessments** — submitting AI work as your own without understanding it
- **Avoid learning** — using AI answers without reading explanations
- **Submit work you do not understand** — professional and academic dishonesty

---

## The Developer Mindset

The best developers use AI as a **collaborator**, not a replacement.

They ask:
> "Help me understand how this works."

Not:
> "Do this for me so I don't have to learn."

---

## Module Summary

In this module you learned:

1. How to use AI as a personal coding tutor
2. How to write better questions for better answers
3. How to use AI to debug code efficiently
4. Why you must understand code before using it
5. Best practices for AI-assisted development

**The goal is not to let AI think for you. The goal is to use AI to become a stronger developer.**

---

> **Key Point:** Developers who use AI responsibly to enhance their skills will consistently outperform those who either avoid AI entirely or rely on it without thinking.""", duration=6)

questions(C5, M5, [
    (1,  "How can AI help programmers?",
         ["Explain code concepts", "Help debug errors", "Generate code examples", "All of the above"], 3),
    (2,  "Why should code always be understood before it is used?",
         ["To slow down development",
          "Because you cannot fix, extend, or take responsibility for code you do not understand",
          "To impress colleagues",
          "It does not need to be understood"], 1),
    (3,  "What is debugging?",
         ["Writing comments in code", "Finding and fixing errors in code", "Building websites", "Creating databases"], 1),
    (4,  "What is a prompt when working with AI?",
         ["A database command", "An instruction or question given to AI", "A programming function", "A type of variable"], 1),
    (5,  "Why do specific prompts produce better results?",
         ["They are longer", "They give AI clear direction and context to produce relevant answers", "They use technical language", "They require less thinking"], 1),
    (6,  "Can AI generate incorrect or buggy code?",
         ["No, AI always generates perfect code",
          "Yes, AI can make mistakes and generate code with errors",
          "Only for advanced programming languages",
          "No, AI is trained on verified code only"], 1),
    (7,  "What should a developer do when AI provides code?",
         ["Copy and paste it immediately",
          "Read, understand, test, and verify it before using it",
          "Submit it without reviewing",
          "Delete it and start over"], 1),
    (8,  "Which of the following is a good use of AI in development?",
         ["Submitting AI answers as your own without reading them",
          "Using AI to explain a concept you are struggling with",
          "Letting AI complete your assessments",
          "Avoiding all learning and relying only on AI"], 1),
    (9,  "Which of the following is a poor use of AI?",
         ["Asking AI to review your code for improvements",
          "Asking AI to explain an error message",
          "Copying AI-generated code without reading or understanding it",
          "Using AI to generate code examples for learning"], 2),
    (10, "What is the key lesson from this module?",
         ["AI replaces the need to learn programming",
          "Use AI to enhance your skills and accelerate learning, not to bypass thinking",
          "Only experienced developers should use AI",
          "AI-generated code never needs to be tested"], 1),
])


# =============================================================================
# MODULE 6: Web Development Fundamentals
# =============================================================================
print("\n-- MODULE 6: Web Development Fundamentals --")
M6 = "web-dev-m6"
C6 = course("Web Development Fundamentals",
    "Understand how websites and web applications are built using HTML, CSS, and JavaScript — and how responsive design makes them work on every device.",
    "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=800")
module(M6, C6, "Web Development Fundamentals")

lesson(C6, M6, 1, "What is Web Development?",
    "Web development is the process of building websites and web applications.",
"""## What is Web Development?

**Web development** is the process of building and maintaining websites and web applications that run in a browser.

---

## Types of Web Development

### Frontend Development

Frontend developers build everything users see and interact with.

Tools: HTML, CSS, JavaScript

### Backend Development

Backend developers build the systems that run behind the scenes.

Tools: Python, Node.js, PHP, Java, databases

### Full-Stack Development

Full-stack developers work on both the frontend and backend.

---

## What Web Developers Build

- Company websites
- E-commerce stores
- Social media platforms
- Banking portals
- Online learning systems (like this one)
- Web-based applications

---

## Real World Example

When you visit an online store:

- The **frontend** shows you products, prices, and images
- The **backend** retrieves the products from a database, handles payments, and manages your order
- Both parts work together to create the experience

---

> **Key Point:** Web development combines design, logic, and data to create the websites and applications millions of people use every day.""")

lesson(C6, M6, 2, "HTML — Structure of Web Pages",
    "HTML is the language that defines the structure and content of every web page.",
"""## HTML — Structure of Web Pages

**HTML (HyperText Markup Language)** is the language used to create the structure of every web page. Every website on the internet uses HTML.

---

## What HTML Does

HTML defines:
- Headings and paragraphs
- Images and links
- Buttons and forms
- Lists and tables
- The overall layout of a page

---

## How HTML Works

HTML uses **tags** — labels enclosed in angle brackets — to describe content.

```html
<h1>Welcome to NexaLearn</h1>
<p>This is a paragraph of text.</p>
<button>Click Here</button>
```

The browser reads these tags and displays them correctly.

---

## Basic HTML Structure

Every web page has the same basic structure:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <h1>Hello World</h1>
    <p>This is my first web page.</p>
  </body>
</html>
```

- `<head>` — contains page settings (invisible to users)
- `<body>` — contains everything users see

---

## Common HTML Tags

| Tag | Purpose |
|---|---|
| `<h1>` to `<h6>` | Headings (large to small) |
| `<p>` | Paragraph of text |
| `<a>` | Link to another page |
| `<img>` | Display an image |
| `<button>` | Clickable button |
| `<input>` | Text input field |

---

> **Key Point:** HTML is the skeleton of every web page. It defines what is on the page — but not how it looks. That is CSS's job.""")

lesson(C6, M6, 3, "CSS — Styling Web Pages",
    "CSS controls the visual appearance of web pages — colours, fonts, layout, and spacing.",
"""## CSS — Styling Web Pages

**CSS (Cascading Style Sheets)** is the language used to control how web pages look. If HTML is the skeleton, CSS is the skin and clothing.

---

## What CSS Controls

- Colours and backgrounds
- Font styles and sizes
- Spacing and layout
- Borders and shadows
- Animations and transitions

---

## How CSS Works

CSS uses **selectors** to target HTML elements and **properties** to define their appearance.

```css
h1 {
  color: blue;
  font-size: 32px;
}

p {
  color: gray;
  font-size: 16px;
  line-height: 1.6;
}

button {
  background-color: green;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
}
```

---

## Common CSS Properties

| Property | What It Controls |
|---|---|
| `color` | Text colour |
| `background-color` | Background colour |
| `font-size` | Size of text |
| `margin` | Space outside an element |
| `padding` | Space inside an element |
| `border` | Outline around an element |
| `display` | How an element is laid out |

---

## Real World Example

The same HTML page can look completely different just by changing the CSS. One HTML file can have multiple themes applied to it simply by switching the stylesheet.

---

> **Key Point:** CSS transforms plain HTML structure into visually appealing, professional interfaces. Without CSS, every website would look like a plain text document.""")

lesson(C6, M6, 4, "JavaScript — Making Pages Interactive",
    "JavaScript adds interactivity and dynamic behaviour to web pages.",
"""## JavaScript — Making Pages Interactive

**JavaScript** is the programming language of the web. While HTML creates structure and CSS handles appearance, JavaScript makes pages interactive and dynamic.

---

## What JavaScript Does

- Responds to user clicks, typing, and scrolling
- Updates content without reloading the page
- Validates form inputs before submission
- Fetches data from servers in the background
- Creates animations and interactive effects

---

## Simple JavaScript Example

```javascript
// Show an alert when a button is clicked
button.addEventListener("click", function() {
  alert("Welcome to NexaLearn!");
});

// Change text dynamically
document.getElementById("greeting").innerText = "Hello, " + userName;

// Validate a form
if (password.length < 8) {
  showError("Password must be at least 8 characters.");
}
```

---

## Real World Examples

| Feature | JavaScript at Work |
|---|---|
| **Like button** | Updates count without reloading |
| **Search suggestions** | Shows results as you type |
| **Form validation** | Checks fields before submission |
| **Shopping cart** | Adds items dynamically |
| **Maps** | Responds to zoom and pan |

---

## JavaScript and AI

Modern AI applications like ChatGPT use JavaScript extensively to:
- Display messages as they are generated
- Handle user input
- Update the interface in real time

---

> **Key Point:** JavaScript is what makes web pages feel alive. It is the difference between a static document and an interactive application.""")

lesson(C6, M6, 5, "Responsive Design",
    "Responsive design ensures websites work correctly on all screen sizes — from phones to desktops.",
"""## Responsive Design

**Responsive design** is the practice of building websites that automatically adapt to different screen sizes and devices.

---

## Why Responsive Design Matters

In South Africa and globally:

- Over 60% of internet traffic comes from mobile phones
- Users access websites on phones, tablets, laptops, and desktops
- A website that only works on desktop loses more than half its users

---

## What Responsive Design Does

A responsive website:
- Adjusts layout for small screens (single column)
- Adjusts layout for large screens (multiple columns)
- Resizes images and text appropriately
- Keeps navigation usable on all devices

---

## How It Works

Developers use **media queries** in CSS to apply different styles at different screen sizes:

```css
/* Default: mobile first */
.container {
  width: 100%;
}

/* Tablet and larger */
@media (min-width: 768px) {
  .container {
    width: 750px;
  }
}

/* Desktop */
@media (min-width: 1200px) {
  .container {
    width: 1140px;
  }
}
```

---

## Module Summary

In this module you learned:

1. What web development is and its three areas (frontend, backend, full-stack)
2. HTML — the structure of every web page
3. CSS — the visual styling of web pages
4. JavaScript — the interactivity of web pages
5. Responsive design — making sites work on all devices

**HTML, CSS, and JavaScript together are the three core technologies of the web.**

---

> **Key Point:** Every modern website is built with HTML (structure), CSS (appearance), and JavaScript (behaviour). Understanding all three is the foundation of web development.""", duration=6)

lesson(C6, M6, 6, "How Web Pages Work Together",
    "Understanding how HTML, CSS, and JavaScript combine to create the web experience.",
"""## How Web Pages Work Together

HTML, CSS, and JavaScript do not work in isolation. Together, they create the complete web experience.

---

## The Three Layers

Think of a web page like a building:

| Layer | Technology | Role |
|---|---|---|
| **Foundation** | HTML | Structure and content |
| **Exterior** | CSS | Appearance and style |
| **Electricity** | JavaScript | Interactivity and behaviour |

Remove any one layer and the experience breaks down.

---

## The Journey of a Web Request

When you type a website address and press Enter:

1. **Browser sends a request** to the web server
2. **Server responds** with HTML, CSS, and JavaScript files
3. **Browser reads HTML** and builds the page structure
4. **Browser applies CSS** and styles the page visually
5. **Browser runs JavaScript** and makes the page interactive
6. **User sees the final result** in seconds

---

## Real World Example: NexaLearn

This very platform uses:

- **HTML** to structure lesson content, navigation, and buttons
- **CSS** to apply the dark theme, typography, and layout
- **JavaScript (React)** to update the page as you navigate between lessons

---

## Frontend vs Backend in Web Development

The browser handles the **frontend** (HTML, CSS, JavaScript).

The server handles the **backend** (data storage, logic, authentication).

Both communicate through **APIs** — which you will learn about in Module 9.

---

> **Key Point:** Web development is the combination of structure, style, and behaviour. Mastering how these three technologies work together is the key to building great web experiences.""", duration=5)

questions(C6, M6, [
    (1,  "What is HTML used for?",
         ["Styling web pages", "Defining the structure and content of web pages", "Adding interactivity", "Storing data"], 1),
    (2,  "What is CSS used for?",
         ["Page structure", "Server-side logic", "Visual appearance and styling", "Database queries"], 2),
    (3,  "What is JavaScript primarily used for?",
         ["Page structure", "Visual styling", "Adding interactivity and dynamic behaviour", "Web hosting"], 2),
    (4,  "What is responsive design?",
         ["Faster internet connection", "Web pages that adapt to different screen sizes and devices", "A type of database", "Cloud storage"], 1),
    (5,  "Which three technologies form the foundation of web development?",
         ["AWS, Azure, GCP", "HTML, CSS, JavaScript", "Python, Java, C#", "React, Vue, Angular"], 1),
    (6,  "What does a frontend developer primarily work on?",
         ["Database design", "Server configuration", "Everything users see and interact with", "Network infrastructure"], 2),
    (7,  "What happens when you type a website address and press Enter?",
         ["Nothing — the page is already stored on your device",
          "Your browser requests files from a server, which responds with HTML, CSS, and JavaScript",
          "The website is created in real time",
          "Your router creates the page locally"], 1),
    (8,  "Why is responsive design important?",
         ["It makes websites load faster",
          "Most internet traffic comes from mobile devices — sites must work on all screen sizes",
          "It improves database performance",
          "It is only important for large companies"], 1),
    (9,  "Which layer of a web page handles interactivity?",
         ["HTML", "CSS", "JavaScript", "The database"], 2),
    (10, "What is a full-stack developer?",
         ["A developer who only builds mobile apps",
          "A developer who works on both frontend and backend",
          "A developer who only works with databases",
          "A developer who manages cloud infrastructure"], 1),
])


# =============================================================================
# MODULE 7: Understanding Software Projects
# =============================================================================
print("\n-- MODULE 7: Understanding Software Projects --")
M7 = "software-projects-m7"
C7 = course("Understanding Software Projects",
    "Learn how real software projects are structured — from codebases and architecture to documentation, teamwork, and version control.",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800")
module(M7, C7, "Understanding Software Projects")

lesson(C7, M7, 1, "What is a Software Project?",
    "A software project is an organised effort to build a working software system.",
"""## What is a Software Project?

A **software project** is an organised effort to design, build, test, and deliver a working software system.

Unlike a simple script, a real software project involves:
- Multiple files and folders
- Multiple developers working together
- Planning, documentation, and testing
- Version control and deployment

---

## Components of a Software Project

| Component | Description |
|---|---|
| **Codebase** | All the source code files |
| **Documentation** | Instructions and explanations |
| **Tests** | Code that verifies correctness |
| **Configuration** | Settings and environment files |
| **Dependencies** | External libraries the project uses |

---

## The Software Development Lifecycle

Most projects follow these phases:

1. **Planning** — define what needs to be built and why
2. **Design** — plan the architecture and user experience
3. **Development** — write the actual code
4. **Testing** — verify everything works correctly
5. **Deployment** — release to users
6. **Maintenance** — fix bugs, add features over time

---

## Real World Example

Building a banking application involves:
- A team of developers (frontend, backend, database)
- Months of planning and design
- Thousands of files across many folders
- Hundreds of automated tests
- Deployment to secure servers
- Ongoing maintenance and updates

---

> **Key Point:** Real software is not written in a single file by a single person. It is a team effort that requires structure, planning, and discipline.""")

lesson(C7, M7, 2, "Understanding a Codebase",
    "A codebase is the complete collection of code that makes up a software project.",
"""## Understanding a Codebase

A **codebase** is the complete collection of source code files that make up a software project.

When you join a team or work on an existing project, understanding the codebase is your first priority.

---

## What a Codebase Contains

```
project/
  src/           -- source code
    components/  -- reusable UI components
    pages/       -- individual pages/screens
    services/    -- API and data logic
    utils/       -- helper functions
  public/        -- static assets (images, fonts)
  tests/         -- automated tests
  README.md      -- project documentation
  package.json   -- project configuration
```

---

## How to Approach a New Codebase

1. **Read the README** — get an overview of the project
2. **Understand the folder structure** — what goes where
3. **Find the entry point** — where does the program start?
4. **Follow the flow** — trace what happens from start to finish
5. **Ask questions** — use AI to explain code you do not understand

---

## Using AI to Understand Code

When you encounter unfamiliar code, ask AI:

> "Explain what this function does step by step: [paste code]"
> "What does this pattern mean in JavaScript: [paste code]"
> "Why would a developer structure code this way?"

---

## Real World Example

A new developer joins a team. On their first day, instead of writing code, they:
- Read all documentation
- Map out the folder structure
- Trace how a user login works end to end
- Ask the team to explain unfamiliar parts

This preparation makes them productive much faster.

---

> **Key Point:** Understanding before changing is a professional standard. Never modify code you do not understand.""")

lesson(C7, M7, 3, "Software Architecture",
    "Software architecture defines how a system is structured and how its components connect.",
"""## Software Architecture

**Software architecture** describes the overall structure of a software system — how components are organised and how they communicate with each other.

---

## Why Architecture Matters

Good architecture makes software:
- **Easier to understand** — new developers can navigate it quickly
- **Easier to maintain** — changes in one area don't break others
- **Easier to scale** — the system handles more users without rebuilding
- **More reliable** — problems are isolated and easier to fix

---

## Common Architecture Layers

Most web applications follow a three-layer architecture:

| Layer | Responsibility |
|---|---|
| **Presentation Layer** | What users see (frontend) |
| **Business Logic Layer** | Rules and processing (backend) |
| **Data Layer** | Storage and retrieval (database) |

---

## Real World Example: Online Store

**Presentation Layer (Frontend):**
- Product listings page
- Shopping cart display
- Checkout form

**Business Logic Layer (Backend):**
- Check if item is in stock
- Calculate total with tax
- Process payment
- Send confirmation email

**Data Layer (Database):**
- Store product information
- Store customer orders
- Store payment records

---

## Microservices vs Monolith

**Monolithic architecture:** One large application does everything.

**Microservices architecture:** Many small services, each doing one specific job.

Large companies like Netflix and Amazon use microservices to handle millions of users simultaneously.

---

> **Key Point:** Architecture is the blueprint of a software system. Understanding it helps you see the big picture and make better decisions about where to add code and how to structure changes.""")

lesson(C7, M7, 4, "Documentation in Software Projects",
    "Documentation preserves knowledge and helps teams build better software together.",
"""## Documentation in Software Projects

**Documentation** in software projects is the collection of written information that explains how a system works, why decisions were made, and how to use or contribute to the project.

---

## Types of Documentation

### README File

The README is usually the first file anyone reads. It explains:
- What the project does
- How to install and run it
- How to contribute
- Key configuration details

### Code Comments

Brief explanations within the code itself:

```javascript
// Check if user is authenticated before loading dashboard
if (!user.isLoggedIn) {
  redirect("/login");
}
```

### API Documentation

Explains how to use the backend services — what endpoints exist, what data they expect, and what they return.

### Wiki / Confluence

Detailed documentation about architecture, decisions, and processes — often used by larger teams.

---

## Why Documentation Matters

Imagine joining a team where nothing is documented:
- You do not know how to run the project
- You do not know why certain decisions were made
- You repeat mistakes others already solved
- Simple tasks take much longer than necessary

Good documentation solves all of these problems.

---

## Real World Example

A developer leaves a company. Because they documented everything thoroughly:
- The next developer understands the system within days
- No critical knowledge is lost
- The project continues without disruption

---

> **Key Point:** Documentation is not optional. It is a professional responsibility. Code that is not documented is a liability.""")

lesson(C7, M7, 5, "Working in Development Teams",
    "Professional software development is a team effort that requires collaboration and shared tools.",
"""## Working in Development Teams

Most professional software is built by teams, not individuals. Understanding how development teams work is essential for any aspiring developer.

---

## Team Roles

| Role | Responsibility |
|---|---|
| **Frontend Developer** | User interface and experience |
| **Backend Developer** | Server logic and APIs |
| **Database Administrator** | Data structure and queries |
| **QA Engineer** | Testing and quality assurance |
| **DevOps Engineer** | Deployment and infrastructure |
| **Project Manager** | Planning, timelines, and communication |

---

## Version Control

Teams use **version control** (most commonly **Git**) to:
- Track every change to the codebase
- Allow multiple developers to work simultaneously
- Revert to previous versions if something breaks
- Review and approve changes before they go live

---

## Key Git Concepts

| Concept | Meaning |
|---|---|
| **Repository** | The project and its entire history |
| **Commit** | A saved snapshot of changes |
| **Branch** | An independent copy for new features |
| **Pull Request** | A request to merge changes into the main codebase |

---

## Module Summary

In this module you learned:

1. What a software project consists of
2. How to understand and navigate a codebase
3. What software architecture means and why it matters
4. How to write and use documentation effectively
5. How development teams collaborate using tools like Git

---

> **Key Point:** Professional development is a team sport. Strong communication, clear documentation, and disciplined use of version control separate great teams from struggling ones.""", duration=6)

questions(C7, M7, [
    (1,  "What is a codebase?",
         ["A programming language", "The complete collection of source code for a project", "A database", "A web browser"], 1),
    (2,  "Why is documentation important in software projects?",
         ["It slows development down", "It preserves knowledge and helps teams work effectively", "It creates unnecessary files", "It is only useful for large projects"], 1),
    (3,  "What is software architecture?",
         ["The physical building where developers work", "The structure of a software system and how its components connect", "A programming language", "A type of web hosting"], 1),
    (4,  "What is the purpose of a README file?",
         ["Store passwords", "Explain the project, how to install it, and how to use it", "Create databases", "Host the application"], 1),
    (5,  "Why should developers understand a codebase before changing it?",
         ["To finish projects slower",
          "To avoid introducing new bugs or breaking existing functionality",
          "To increase the number of files",
          "Documentation is not needed"], 1),
    (6,  "Which of the following is a phase of the software development lifecycle?",
         ["Purchase", "Testing", "Printing", "Marketing"], 1),
    (7,  "What is version control used for?",
         ["Designing logos", "Tracking code changes and enabling team collaboration", "Storing images", "Managing emails"], 1),
    (8,  "What does a backend developer primarily work on?",
         ["User interface design", "Visual styling", "Server logic, APIs, and data processing", "Creating graphics"], 2),
    (9,  "What are the three layers of a typical web application architecture?",
         ["HTML, CSS, JavaScript", "Presentation, Business Logic, and Data layers", "Frontend, AI, and Cloud", "Planning, Design, and Launch"], 1),
    (10, "What is a Pull Request in software development?",
         ["A request to buy more servers",
          "A request to merge code changes into the main codebase for review",
          "A type of database query",
          "A customer support request"], 1),
])


# =============================================================================
# MODULE 8: Debugging and Problem Solving
# =============================================================================
print("\n-- MODULE 8: Debugging and Problem Solving --")
M8 = "debugging-m8"
C8 = course("Debugging and Problem Solving",
    "Learn how to systematically find and fix errors in code — reading error messages, root cause analysis, and professional debugging techniques.",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800")
module(M8, C8, "Debugging and Problem Solving")

lesson(C8, M8, 1, "What is a Bug?",
    "A bug is an error in software that causes it to behave incorrectly.",
"""## What is a Bug?

A **bug** is an error in software that causes it to produce an incorrect result or behave in an unexpected way.

The term comes from 1947, when engineers found an actual moth trapped inside a computer relay causing it to malfunction. They removed the moth and logged it as "the first actual case of a bug being found."

---

## Types of Bugs

### Syntax Errors

The code is written incorrectly — like a spelling mistake.

```python
# Missing closing bracket
print("Hello World"
```

The program will not run at all.

### Logic Errors

The code runs but produces the wrong result.

```python
# Wrong operator: subtraction instead of addition
total = price - tax  # Should be price + tax
```

No error message. Just a wrong answer.

### Runtime Errors

The code runs but crashes when it hits a specific situation.

```python
# Dividing by zero
result = 100 / 0  # ZeroDivisionError
```

---

## Why Bugs Are Inevitable

- No programmer writes perfect code every time
- Complex systems have millions of lines — human error is unavoidable
- Edge cases (unusual inputs) are hard to predict
- Systems interact with each other in unexpected ways

---

> **Key Point:** Bugs are not a sign of failure — they are a normal part of software development. The skill is finding them quickly and fixing them correctly.""")

lesson(C8, M8, 2, "Reading Error Messages",
    "Error messages tell you exactly what went wrong — learning to read them is essential.",
"""## Reading Error Messages

When code breaks, it usually tells you exactly what went wrong through an **error message**. Learning to read error messages is one of the most valuable debugging skills.

---

## Anatomy of an Error Message

```
Traceback (most recent call last):
  File "app.py", line 15, in calculate_total
    result = price / quantity
ZeroDivisionError: division by zero
```

This error message tells you:
- **File:** `app.py` — which file has the problem
- **Line 15** — exactly where the error occurred
- **Function:** `calculate_total` — which function it happened in
- **ZeroDivisionError** — the type of error
- **division by zero** — a human-readable explanation

---

## Common Error Types

| Error | Meaning |
|---|---|
| `SyntaxError` | Code is written incorrectly |
| `NameError` | Using a variable that doesn't exist |
| `TypeError` | Wrong data type for an operation |
| `ZeroDivisionError` | Dividing a number by zero |
| `IndexError` | Accessing a list position that doesn't exist |
| `404 Not Found` | Web resource does not exist |
| `500 Internal Server Error` | Server-side code crashed |

---

## Using AI to Decode Errors

When you encounter an unfamiliar error:

> "I am getting this error in Python: [paste error]. Here is my code: [paste code]. Explain what caused this and how to fix it."

AI can explain any error message in plain language.

---

> **Key Point:** Do not ignore error messages — read them carefully. They are the most direct information you have about what went wrong.""")

lesson(C8, M8, 3, "Root Cause Analysis",
    "Root cause analysis means finding the true source of a problem, not just treating its symptoms.",
"""## Root Cause Analysis

**Root cause analysis** means finding the true, underlying source of a problem — not just treating the visible symptom.

---

## Symptoms vs Root Causes

| Symptom | Likely Root Cause |
|---|---|
| Login button doesn't work | JavaScript error prevents form submission |
| Page shows wrong data | Database query returns incorrect results |
| Application crashes on startup | Missing configuration file or environment variable |
| User reports missing orders | Payment processing function has a bug |

Fixing the symptom without finding the root cause means the problem will return.

---

## The 5 Whys Technique

Ask "Why?" five times to drill down to the root cause.

**Problem:** The user cannot log in.

1. **Why?** The login button does nothing when clicked.
2. **Why?** The JavaScript function has an error.
3. **Why?** It is trying to read a property from an undefined variable.
4. **Why?** The API response structure changed and was not updated in the frontend.
5. **Why?** There was no communication between the backend and frontend teams about the change.

**Root Cause:** Lack of communication about API changes between teams.

**Real Fix:** Establish a process for communicating API changes — not just fixing the one variable.

---

## Real World Example

A bank's payment system starts failing for some customers. Instead of randomly trying fixes, the team:
1. Looks at which customers are affected (only those with surnames starting with certain letters)
2. Traces the issue to a sorting function
3. Discovers a bug introduced in the latest update
4. Fixes the specific function
5. Adds a test to prevent it from happening again

---

> **Key Point:** Great developers find root causes, not just symptoms. A quick fix that does not address the real problem is not actually a fix.""")

lesson(C8, M8, 4, "A Systematic Debugging Process",
    "Following a structured debugging process is faster and more reliable than guessing.",
"""## A Systematic Debugging Process

Random guessing is the slowest and least reliable way to fix bugs. Following a **systematic process** is much more effective.

---

## The Debugging Process

### Step 1: Reproduce the Bug

Before fixing anything, reliably reproduce the problem.

- What exact steps cause it?
- Does it happen every time or only sometimes?
- Does it happen for all users or specific ones?

### Step 2: Read the Error Message

Read the full error message carefully before doing anything else. It usually points directly to the problem.

### Step 3: Isolate the Problem

Narrow down where the bug exists.

- Which function is failing?
- Which line of code?
- What input causes the failure?

### Step 4: Form a Hypothesis

Based on what you know, form a theory about the root cause.

> "I think the variable is undefined because the API call failed before it could be assigned."

### Step 5: Test the Hypothesis

Make a small, focused change to test your theory. Do not make multiple changes at once — you will not know which one fixed it.

### Step 6: Verify the Fix

After fixing, verify:
- The original bug no longer occurs
- No new bugs were introduced
- Related functionality still works

---

## Using AI in the Debugging Process

At any step, AI can help:
- Explain what an error means (Step 2)
- Suggest what might cause the problem (Step 4)
- Review your fix for potential issues (Step 6)

---

> **Key Point:** Debugging is a skill that improves with practice. A systematic process is always faster than random trial and error.""")

lesson(C8, M8, 5, "Testing Your Fixes",
    "After fixing a bug, thorough testing ensures the fix works and nothing else broke.",
"""## Testing Your Fixes

Fixing a bug is only half the job. **Testing** confirms the fix works correctly and that nothing else was broken in the process.

---

## Types of Testing

### Manual Testing

You personally test the feature to confirm it works.

Steps:
1. Reproduce the original bug — confirm it is gone
2. Test related features — confirm they still work
3. Test edge cases — unusual inputs and scenarios

### Automated Testing

Write code that tests your code automatically. Every time the project is updated, these tests run to catch new bugs.

```python
def test_calculate_total():
    assert calculate_total(100, 10) == 110  # normal case
    assert calculate_total(0, 10) == 10     # zero price
    assert calculate_total(100, 0) == 100   # zero quantity
```

---

## Regression Testing

**Regression testing** confirms that fixing one bug did not introduce new bugs elsewhere.

This is critical because changes in one part of a system can have unexpected effects in another.

---

## Module Summary

In this module you learned:

1. What a bug is and the three types (syntax, logic, runtime errors)
2. How to read and interpret error messages
3. Root cause analysis — finding the true source of problems
4. A systematic six-step debugging process
5. How to test fixes properly including regression testing

---

## Practical Activity

Find a simple piece of code (or write one). Intentionally introduce three different types of bugs — one syntax error, one logic error, and one runtime error. Then practice finding and fixing each one.

---

> **Key Point:** Great developers are not those who never create bugs. They are the ones who find and fix them fastest, most reliably, and most permanently.""", duration=6)

questions(C8, M8, [
    (1,  "What is a bug in software?",
         ["A physical insect in hardware",
          "An error in software that causes incorrect behaviour",
          "A web browser",
          "A database error only"], 1),
    (2,  "Why should error messages be read carefully?",
         ["They waste development time",
          "They point directly to what went wrong, including file and line number",
          "They are always incorrect",
          "They are only useful for advanced developers"], 1),
    (3,  "What is root cause analysis?",
         ["Randomly trying fixes until one works",
          "Finding the true underlying source of a problem",
          "Writing more code to hide the error",
          "Restarting the application"], 1),
    (4,  "After fixing a bug, what should happen next?",
         ["Delete the project and start over",
          "Test the fix thoroughly and verify related features still work",
          "Ignore it",
          "Restart the computer"], 1),
    (5,  "What is a syntax error?",
         ["A mistake in how the code is written that prevents it from running",
          "A logical mistake that produces wrong results",
          "A crash that only happens in certain situations",
          "A database connection failure"], 0),
    (6,  "What does the 5 Whys technique help with?",
         ["Writing documentation",
          "Drilling down to the root cause of a problem",
          "Creating automated tests",
          "Designing user interfaces"], 1),
    (7,  "What is regression testing?",
         ["Testing a new feature for the first time",
          "Confirming that a fix did not introduce new bugs elsewhere",
          "Testing the database connection",
          "Testing the user interface design"], 1),
    (8,  "What is the first step in a systematic debugging process?",
         ["Try random fixes",
          "Reliably reproduce the bug",
          "Rewrite the code",
          "Contact the client"], 1),
    (9,  "A logic error in code means:",
         ["The code will not run at all",
          "The code runs but produces the wrong result",
          "The database has crashed",
          "The internet connection failed"], 1),
    (10, "What separates great developers from average developers when it comes to bugs?",
         ["Great developers never write bugs",
          "Great developers find and fix bugs fastest, most reliably, and most permanently",
          "Great developers avoid all testing",
          "Great developers only work on new features"], 1),
])


# =============================================================================
# MODULE 9: Building Real Applications
# =============================================================================
print("\n-- MODULE 9: Building Real Applications --")
M9 = "building-apps-m9"
C9 = course("Building Real Applications",
    "Learn how real applications are structured — CRUD operations, APIs, authentication, and how frontend, backend, and database work together.",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=800")
module(M9, C9, "Building Real Applications")

lesson(C9, M9, 1, "Application Components",
    "Every complete application consists of three core components: frontend, backend, and database.",
"""## Application Components

Every complete web application has three essential components working together: the **frontend**, the **backend**, and the **database**.

---

## The Three Components

### Frontend

The frontend is what users see and interact with — buttons, forms, pages, and menus. It runs in the user's browser.

Built with: HTML, CSS, JavaScript (React, Vue, Angular)

### Backend

The backend is the server-side logic — the rules, calculations, and processing that happen behind the scenes. It runs on a server.

Built with: Python, Node.js, Java, PHP, Ruby

### Database

The database stores all information permanently — user accounts, products, orders, messages.

Built with: PostgreSQL, MySQL, MongoDB

---

## How They Work Together

**Example: Logging into an application**

1. **Frontend** — user types username and password, clicks Login
2. **Frontend** — sends the credentials to the backend
3. **Backend** — retrieves the user's stored password from the database
4. **Backend** — compares and verifies — correct or incorrect?
5. **Backend** — sends the result back to the frontend
6. **Frontend** — shows the dashboard or an error message

All three components work in sequence, every time.

---

## Real World Comparison

| Restaurant | Application |
|---|---|
| Dining room | Frontend (what customers see) |
| Kitchen | Backend (where the work happens) |
| Pantry/Storage | Database (where ingredients are stored) |

---

> **Key Point:** You cannot build a complete, working application with only one or two components. Understanding all three and how they interact is fundamental.""")

lesson(C9, M9, 2, "CRUD Operations",
    "CRUD — Create, Read, Update, Delete — is the foundation of almost every application.",
"""## CRUD Operations

**CRUD** stands for:

- **C**reate — add new information
- **R**ead — view existing information
- **U**pdate — modify existing information
- **D**elete — remove information

Almost every application you have ever used is built on CRUD operations.

---

## CRUD in Action: Social Media

| CRUD | Action |
|---|---|
| **Create** | Post a new photo |
| **Read** | View your feed |
| **Update** | Edit your profile bio |
| **Delete** | Remove a post |

## CRUD in Action: Online Store

| CRUD | Action |
|---|---|
| **Create** | Add a product to the catalogue |
| **Read** | Browse products |
| **Update** | Change a product's price |
| **Delete** | Remove a discontinued product |

## CRUD in Action: Banking App

| CRUD | Action |
|---|---|
| **Create** | Open a new account |
| **Read** | View your transaction history |
| **Update** | Change your contact details |
| **Delete** | Close an account |

---

## CRUD and Databases

Each CRUD operation corresponds to a database action:

| CRUD | Database Operation |
|---|---|
| Create | INSERT a new record |
| Read | SELECT data |
| Update | UPDATE an existing record |
| Delete | DELETE a record |

---

> **Key Point:** If you understand CRUD, you understand the core of almost every application ever built. It is the foundation of data management.""")

lesson(C9, M9, 3, "APIs — How Applications Communicate",
    "APIs allow different software systems to communicate and share data with each other.",
"""## APIs — How Applications Communicate

An **API (Application Programming Interface)** is a set of rules that allows two software systems to communicate and share data.

---

## The Restaurant Analogy

| Restaurant | API |
|---|---|
| Customer | Frontend (your app) |
| Waiter | API |
| Kitchen | Backend / External service |
| Menu | API documentation |

The customer (frontend) does not walk into the kitchen (backend). They communicate through the waiter (API) using a structured menu (documentation).

---

## How APIs Work

1. Your application sends a **request** to an API
2. The API processes the request
3. The API sends back a **response** with data

Example:

> **Request:** "Give me the weather for Johannesburg"
> **Response:** `{ "city": "Johannesburg", "temperature": 22, "condition": "Sunny" }`

---

## Real World API Examples

| Application | API Used |
|---|---|
| Uber | Google Maps API for navigation |
| Online store | Payment gateway API (PayFast, Stripe) |
| WhatsApp | Sends messages via WhatsApp Business API |
| Weather app | OpenWeather API for forecasts |
| Login with Google | Google OAuth API |

---

## Why APIs Matter for Developers

As a developer, you will:
- **Use APIs** built by other companies (maps, payments, messaging)
- **Build APIs** that your own frontend connects to
- **Document APIs** so other developers can use them

---

> **Key Point:** APIs are how the modern internet works. Almost nothing is built in isolation — applications share data and functionality through APIs.""")

lesson(C9, M9, 4, "Authentication and User Security",
    "Authentication confirms who a user is — it is a fundamental part of any application that has accounts.",
"""## Authentication and User Security

**Authentication** is the process of confirming that a user is who they claim to be.

Every application that has user accounts needs authentication.

---

## Authentication vs Authorisation

These two terms are often confused:

| Concept | Meaning | Example |
|---|---|---|
| **Authentication** | Confirming identity — who are you? | Logging in with email and password |
| **Authorisation** | Confirming permissions — what can you do? | Admin can delete posts; student cannot |

---

## How Authentication Works

### Basic Flow

1. User enters email and password
2. Frontend sends credentials to the backend
3. Backend looks up the user in the database
4. Backend compares the password (securely hashed)
5. If correct: issue a **token** (a secure pass that proves identity)
6. Frontend stores the token
7. Every subsequent request includes the token
8. Backend verifies the token before responding

---

## Password Security

Passwords are **never stored as plain text**. They are **hashed** — converted into a fixed-length string that cannot be reversed.

```
Original: "MyPassword123"
Hashed:   "$2b$10$K3nHAF3r..."
```

Even if the database is stolen, passwords cannot be read.

---

## Common Security Mistakes

- Storing passwords in plain text — never acceptable
- Not validating input — allows SQL injection attacks
- Using weak or predictable tokens — can be guessed
- Not using HTTPS — data can be intercepted

---

## Real World Example

When you log into your banking app:
1. You enter your PIN
2. The backend verifies it against a hashed value in the database
3. A secure session token is created
4. Every action you take sends this token to verify your identity
5. The token expires after a period of inactivity

---

> **Key Point:** Authentication is fundamental to any application with user accounts. Getting it wrong has serious security consequences.""")

lesson(C9, M9, 5, "Planning Your First Application",
    "Planning is the most important phase of building an application. Clear planning prevents major problems.",
"""## Planning Your First Application

Before writing a single line of code, every professional developer **plans**. Clear planning prevents wasted effort and major problems.

---

## Step 1: Define the Problem

Answer these questions before starting:

- **What problem does this application solve?**
- **Who are the users?**
- **What must the application do?** (core features)
- **What is out of scope?** (what it will NOT do)

---

## Step 2: Define the Features

Break the application into specific features:

**Example: Student Portal**
- Students can register and log in
- Students can view enrolled courses
- Students can mark lessons as complete
- Admin can add and remove courses

---

## Step 3: Plan the Data

What information needs to be stored?

```
Users: id, name, email, password, role
Courses: id, title, description, created_at
Enrollments: user_id, course_id, enrolled_at
Progress: user_id, lesson_id, completed, completed_at
```

---

## Step 4: Plan the Architecture

- Frontend: What technology? (React, plain HTML)
- Backend: What language? (Node.js, Python)
- Database: What type? (PostgreSQL, MongoDB)
- Hosting: Where will it run? (Vercel, AWS)

---

## Step 5: Build the Simplest Version First

Start with the core features only. Get something working before adding complexity.

This is called the **Minimum Viable Product (MVP)**.

---

## Module Summary

In this module you learned:

1. The three components of every application: frontend, backend, database
2. CRUD operations — the foundation of data management
3. APIs — how applications communicate with each other
4. Authentication — confirming user identity securely
5. How to plan an application professionally

**You now have the complete conceptual foundation of a junior software developer.**

---

> **Key Point:** Planning saves more time than it costs. A well-planned application is built faster, maintained more easily, and serves users more effectively.""", duration=8)

questions(C9, M9, [
    (1,  "What does CRUD stand for?",
         ["Create, Read, Update, Delete",
          "Code, Run, Upload, Deploy",
          "Create, Remove, Undo, Delete",
          "Copy, Read, Update, Design"], 0),
    (2,  "What is an API?",
         ["A type of database",
          "A set of rules allowing software systems to communicate and share data",
          "A programming language",
          "A web browser"], 1),
    (3,  "Why do applications use databases?",
         ["To increase internet speed", "To permanently store and retrieve information", "To design websites", "To create graphics"], 1),
    (4,  "What is authentication?",
         ["Designing the user interface",
          "The process of confirming that a user is who they claim to be",
          "Creating database tables",
          "Writing API documentation"], 1),
    (5,  "What does Create mean in CRUD?",
         ["View existing information", "Add new information", "Remove information", "Modify information"], 1),
    (6,  "What does Read mean in CRUD?",
         ["Add information", "View and retrieve existing information", "Remove information", "Encrypt information"], 1),
    (7,  "What does Update mean in CRUD?",
         ["Modify existing information", "Delete information", "Create new information", "Back up information"], 0),
    (8,  "What does Delete mean in CRUD?",
         ["Create information", "View information", "Remove information", "Secure information"], 2),
    (9,  "Which three components make up a complete web application?",
         ["HTML, CSS, JavaScript",
          "Frontend, Backend, and Database",
          "Server, Router, and Switch",
          "Planning, Design, and Launch"], 1),
    (10, "What is the primary goal of software development?",
         ["Write as much code as possible",
          "Use the most expensive technology",
          "Solve real problems for real users effectively",
          "Build applications no one needs"], 2),
])


# =============================================================================
# CERTIFICATE 2 FINAL EXAM: Certified Junior Software Developer
# =============================================================================
print("\n-- CERT 2 FINAL EXAM: Certified Junior Software Developer --")
FE2_ID  = "cert2-final-exam"
FE2_CID = course("Certified Junior Software Developer — Final Exam",
    "Complete the 40-question certification exam covering all six modules (4-9). Score 80% or above to earn your Certified Junior Software Developer certificate.",
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800")
module(FE2_ID, FE2_CID, "Certificate 2 Final Examination")

lesson(FE2_CID, FE2_ID, 1, "Certificate 2 Final Examination",
    "40 questions covering Introduction to Programming, AI-Assisted Development, Web Development, Software Projects, Debugging, and Building Applications.",
"""## Certified Junior Software Developer

### Final Certification Examination

Congratulations on completing all six modules of Certificate 2.

---

## Exam Information

| Detail | Information |
|---|---|
| **Total Questions** | 40 |
| **Pass Mark** | 80% (32 out of 40) |
| **Time Limit** | 45 minutes |
| **Sections** | A: Programming, B: AI Dev, C: Web Dev, D: Software Projects, E: Debugging, F: Building Apps |

---

## Grading

| Score | Result |
|---|---|
| 36-40 correct (90-100%) | Distinction |
| 32-35 correct (80-89%) | Pass |
| 24-31 correct (60-79%) | Retake Required |
| Below 24 | Re-enroll Recommended |

---

## What This Exam Covers

- **Module 4:** Programming fundamentals — variables, data types, decisions, loops, functions
- **Module 5:** AI-assisted development — prompts, debugging with AI, responsible use
- **Module 6:** Web development — HTML, CSS, JavaScript, responsive design
- **Module 7:** Software projects — codebase, architecture, documentation, teamwork
- **Module 8:** Debugging — error types, reading errors, root cause analysis, testing
- **Module 9:** Building applications — CRUD, APIs, authentication, planning

---

## Certificate Award

Learners who achieve **32 or more correct answers** earn:

**Certified Junior Software Developer**

---

> **You have built a strong foundation. Take your time, apply what you have learned, and trust your knowledge. Good luck!**

Click **Mark as Read** below to begin the exam.""", duration=45)

print("  Inserting 40 exam questions...")
questions(FE2_CID, FE2_ID, [
    # Section A: Programming Fundamentals (Q1-Q10)
    (1,  "What is programming?",
         ["Designing logos", "Writing instructions for a computer", "Buying software", "Building hardware"], 1),
    (2,  "What is a variable?",
         ["A web page", "A database", "A container used to store data", "A programming language"], 2),
    (3,  "Which of the following is a string?",
         ["50", "True", '"Hello"', "10.5"], 2),
    (4,  "Which data type stores whole numbers?",
         ["Float", "String", "Integer", "Boolean"], 2),
    (5,  "A Boolean value can be:",
         ["Text or Number", "True or False", "Integer or Decimal", "Input or Output"], 1),
    (6,  "What does an IF statement do?",
         ["Repeats actions", "Makes decisions based on conditions", "Creates variables", "Stores files"], 1),
    (7,  "What is a loop used for?",
         ["Repeating actions automatically", "Storing data", "Creating databases", "Hosting websites"], 0),
    (8,  "What is a function?",
         ["A database table", "A reusable block of code", "A browser", "A programming language"], 1),
    (9,  "Why are functions useful?",
         ["Reduce repetition", "Improve organisation", "Save development time", "All of the above"], 3),
    (10, "What does programming allow computers to do?",
         ["Think independently", "Follow instructions to solve problems", "Create themselves", "Replace all humans"], 1),
    # Section B: AI-Assisted Development (Q11-Q15)
    (11, "How can AI help programmers?",
         ["Explain code", "Debug errors", "Generate examples", "All of the above"], 3),
    (12, "Should developers copy AI-generated code without reading it?",
         ["Yes, AI code is always correct",
          "No, always read, understand, and test code before using it",
          "Yes, if the deadline is close",
          "Only for small projects"], 1),
    (13, "What is debugging?",
         ["Writing comments", "Finding and fixing errors in code", "Building websites", "Creating databases"], 1),
    (14, "Why should you ask AI to explain code it generates?",
         ["To understand how it works and take responsibility for it",
          "To avoid learning",
          "To increase bugs",
          "To save storage space"], 0),
    (15, "Can AI generate incorrect or buggy code?",
         ["No, AI always generates perfect code",
          "Yes, AI can make mistakes",
          "Only for complex languages",
          "No, AI is tested on all scenarios"], 1),
    # Section C: Web Development (Q16-Q20)
    (16, "What is HTML used for?",
         ["Styling pages", "Defining structure and content of web pages", "Databases", "Hosting"], 1),
    (17, "What is CSS used for?",
         ["Page structure", "Server logic", "Visual appearance and styling", "Database queries"], 2),
    (18, "What is JavaScript primarily used for?",
         ["Page structure", "Visual styling", "Adding interactivity and dynamic behaviour", "Hosting"], 2),
    (19, "What is responsive design?",
         ["Faster internet", "Websites that adapt to work on multiple devices and screen sizes", "Databases", "Cloud storage"], 1),
    (20, "Which three technologies form the core of web development?",
         ["AWS, Azure, GCP", "HTML, CSS, JavaScript", "Python, Java, C#", "React, Vue, Angular"], 1),
    # Section D: Software Projects (Q21-Q25)
    (21, "What is a codebase?",
         ["The complete collection of source code for a project", "A programming language", "A database", "A browser"], 0),
    (22, "Why is documentation important?",
         ["It preserves knowledge and helps teams work effectively",
          "It creates unnecessary files",
          "It slows projects down",
          "It is only useful for large teams"], 0),
    (23, "What is software architecture?",
         ["A physical building design",
          "The structure of a software system and how its components connect",
          "A programming language",
          "A web hosting service"], 1),
    (24, "What is the purpose of a README file?",
         ["Store database passwords",
          "Explain the project, installation, and usage",
          "Create databases",
          "Host the application online"], 1),
    (25, "Why should developers understand a codebase before modifying it?",
         ["To finish projects slower",
          "To avoid introducing new bugs or breaking existing functionality",
          "To increase file count",
          "Documentation does not matter"], 1),
    # Section E: Debugging (Q26-Q30)
    (26, "What is a bug?",
         ["A physical insect in hardware", "An error in software that causes incorrect behaviour", "A web browser", "A database record"], 1),
    (27, "Why should error messages be read carefully?",
         ["They are always irrelevant",
          "They point directly to what went wrong — file, line, and error type",
          "They waste time",
          "They are optional information"], 1),
    (28, "What is root cause analysis?",
         ["Randomly trying fixes until something works",
          "Finding the true underlying source of a problem",
          "Rewriting all the code",
          "Restarting the server"], 1),
    (29, "After fixing a bug, what must happen next?",
         ["Delete the project",
          "Test the fix and verify related features still work correctly",
          "Ignore the issue",
          "Restart the computer"], 1),
    (30, "What is the best approach when code breaks?",
         ["Guess randomly until something works",
          "Follow a systematic debugging process",
          "Ignore all error messages",
          "Reinstall the operating system"], 1),
    # Section F: Building Applications (Q31-Q40)
    (31, "What does CRUD stand for?",
         ["Create, Read, Update, Delete",
          "Code, Run, Upload, Deploy",
          "Create, Remove, Undo, Delete",
          "Copy, Read, Update, Design"], 0),
    (32, "What is an API?",
         ["A set of rules allowing software systems to communicate and share data",
          "A type of database",
          "A web browser",
          "An operating system"], 0),
    (33, "Why do applications use databases?",
         ["To increase internet speed",
          "To permanently store and retrieve information",
          "To design the user interface",
          "To create graphics"], 1),
    (34, "What is authentication?",
         ["Designing user interfaces",
          "The process of confirming that a user is who they claim to be",
          "Creating database tables",
          "Writing code comments"], 1),
    (35, "What does Create mean in CRUD?",
         ["Add new information", "Delete information", "View information", "Secure information"], 0),
    (36, "What does Read mean in CRUD?",
         ["Add information", "View and retrieve existing information", "Remove information", "Encrypt information"], 1),
    (37, "What does Update mean in CRUD?",
         ["Modify existing information", "Delete information", "Create information", "Back up information"], 0),
    (38, "What does Delete mean in CRUD?",
         ["Create information", "View information", "Remove information", "Secure information"], 2),
    (39, "Which components make up a complete web application?",
         ["Frontend only", "Backend only", "Database only", "Frontend, Backend, and Database"], 3),
    (40, "What is the ultimate goal of software development?",
         ["Write as much code as possible",
          "Solve real problems for real users effectively",
          "Use the most expensive technology available",
          "Create bugs for others to fix"], 1),
])

print("\nAll Certificate 2 data inserted successfully.")
