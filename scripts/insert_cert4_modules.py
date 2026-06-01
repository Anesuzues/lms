# -*- coding: utf-8 -*-
import urllib.request, urllib.error, json

BASE = "https://amarfzhlbhzchmeqkbyg.supabase.co/rest/v1"
KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtYXJmemhsYmh6Y2htZXFrYnlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njk0MDI0NSwiZXhwIjoyMDkyNTE2MjQ1fQ.BCViogF93CceiUtIJ9j2P7zYrfK_9dBQtV2QLGnlP-o"

def req(method, path, payload=None):
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8") if payload else None
    r = urllib.request.Request(f"{BASE}/{path}", data=data, method=method)
    r.add_header("apikey", KEY); r.add_header("Authorization", f"Bearer {KEY}")
    r.add_header("Content-Type", "application/json; charset=utf-8")
    r.add_header("Prefer", "return=representation")
    try:
        with urllib.request.urlopen(r) as resp:
            body = resp.read(); return json.loads(body) if body else [], None
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
# MODULE 13: Building Your First AI Application
# =============================================================================
print("\n-- MODULE 13: Building Your First AI Application --")
M13 = "ai-app-m13"
C13 = course("Building Your First AI Application",
    "Learn how AI is integrated into real applications — AI APIs, chatbots, automation, and how to connect AI services to software systems.",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800")
module(M13, C13, "Building Your First AI Application")

lesson(C13, M13, 1, "What is an AI Application?",
    "An AI application combines traditional software with artificial intelligence capabilities.",
"""## What is an AI Application?

An **AI application** combines traditional software with artificial intelligence to create systems that can understand input, generate responses, and perform intelligent tasks.

---

## Examples of AI Applications

| Application | AI Capability |
|---|---|
| **ChatGPT** | Conversational AI — answers questions, writes content |
| **Grammarly** | Language AI — improves writing style and grammar |
| **GitHub Copilot** | Code AI — suggests and generates code |
| **AI Customer Support Bots** | Automated responses to common questions |
| **Netflix Recommendations** | AI suggesting content based on viewing history |

---

## How AI Applications Differ from Traditional Software

**Traditional software:**
- Follows fixed, pre-written rules
- Gives the same output for the same input every time
- Cannot handle inputs it was not explicitly programmed for

**AI application:**
- Generates responses based on learned patterns
- Can handle varied, natural language input
- Produces different responses based on context

---

> **Key Point:** AI applications are not magic — they are software systems that use trained AI models to process input and generate intelligent output.""")

lesson(C13, M13, 2, "AI APIs",
    "Most developers access AI capabilities through APIs — they don't build AI models from scratch.",
"""## AI APIs

Most developers do **not** build AI models from scratch.

Training an AI model requires:
- Massive datasets (billions of examples)
- Enormous computing power
- Months or years of development
- Teams of AI researchers

Instead, developers **use APIs** provided by AI companies to access these capabilities instantly.

---

## Major AI API Providers

| Provider | API | Capability |
|---|---|---|
| **OpenAI** | GPT-4, DALL-E | Text generation, image generation |
| **Anthropic** | Claude API | Text generation, analysis |
| **Google** | Gemini API | Text, code, multimodal |
| **Stability AI** | Stable Diffusion | Image generation |

---

## How an AI API Call Works

1. Your application sends a **request** to the API
   - The user's message or input
   - Instructions for how to respond
2. The AI API processes the request using the trained model
3. The API returns a **response**
   - The generated text, code, or analysis
4. Your application displays or uses the response

---

## Real World Example

A company wants a customer support chatbot. Instead of training their own AI:

1. They sign up for the Claude API
2. They send customer questions to the API
3. The API returns helpful responses
4. The chatbot displays those responses to customers

**Result:** A working AI chatbot built in days, not years.

---

> **Key Point:** AI APIs democratise access to artificial intelligence. You do not need to be an AI researcher to build AI-powered applications.""")

lesson(C13, M13, 3, "User Input and AI Output",
    "Understanding the flow: user sends input, AI processes it, application displays the output.",
"""## User Input and AI Output

Every AI application follows the same fundamental flow.

---

## The Basic Flow

```
User → Application → AI Model → Response → User
```

1. **User** provides input (a question, a request, text to analyse)
2. **Application** receives the input and prepares an API request
3. **AI Model** processes the request and generates a response
4. **Application** receives the response and formats it
5. **User** sees the result

---

## Examples

### Writing Assistant
- **User input:** "Write a professional email declining a meeting."
- **AI output:** A polished, professional email draft

### Code Helper
- **User input:** "Explain what this function does: [paste code]"
- **AI output:** A plain-language explanation of the code

### Study Assistant
- **User input:** "Quiz me on Python variables."
- **AI output:** A series of quiz questions with answers

---

## Designing the Input Experience

The quality of user input affects the quality of AI output.

Good AI applications help users provide better input by:
- Offering example prompts
- Providing clear input fields
- Guiding users on what information to include

---

> **Key Point:** The user experience around input and output is what makes an AI application useful or frustrating. The AI model is only part of the product.""")

lesson(C13, M13, 4, "Building an AI Chatbot",
    "Chatbots allow users to ask questions and receive AI-generated responses in a conversational interface.",
"""## Building an AI Chatbot

A **chatbot** is an application that allows users to have a text-based conversation with an AI system.

---

## Common Chatbot Use Cases

- **Customer support** — answering frequently asked questions instantly
- **Internal company assistants** — helping employees find policies, procedures, and information
- **Learning assistants** — guiding students through content
- **Sales assistants** — helping customers find the right product
- **HR assistants** — answering leave, payroll, and policy questions

---

## Core Components of a Chatbot

| Component | Role |
|---|---|
| **Input interface** | Where users type their questions |
| **Message history** | Previous messages that provide conversation context |
| **AI API connection** | Sends messages to the AI model |
| **Response display** | Shows AI responses to the user |

---

## Conversation Context

A key feature of modern chatbots is **memory within a conversation**.

When you ask:
> "What is Python?"

And then:
> "Give me an example."

The chatbot knows "an example" refers to Python — because conversation history is sent with each request.

---

## AI Automation

AI can automate repetitive work:
- Summarising long reports
- Creating structured meeting notes
- Responding to common customer queries
- Categorising incoming emails

---

> **Key Point:** Chatbots reduce the burden of repetitive communication tasks while providing instant responses to users.""")

lesson(C13, M13, 5, "Module Summary and Practical Activity",
    "Summary of AI application concepts and a practical design activity.",
"""## Module Summary

In this module you learned:

1. What an AI application is — software that integrates AI to handle intelligent tasks
2. AI APIs — how developers access AI without building models from scratch
3. The user input → AI output flow — the core pattern of every AI application
4. Chatbots — conversational AI interfaces and their business uses
5. AI automation — using AI to handle repetitive, information-based tasks

---

## Key Concepts Recap

| Concept | Definition |
|---|---|
| **AI Application** | Software combining traditional code with AI capabilities |
| **AI API** | A service that provides access to an AI model |
| **Chatbot** | A conversational interface powered by AI |
| **Automation** | Using technology to perform tasks automatically |
| **Context** | Conversation history that helps AI give relevant responses |

---

## Practical Activity

**Design an AI Study Assistant.**

Define:

1. **User inputs** — What questions or tasks will users ask?
2. **AI outputs** — What responses should the AI provide?
3. **Conversation context** — What history does the AI need to give relevant answers?
4. **Benefits to students** — How does this improve their learning experience?
5. **One feature** — What is the single most valuable feature to build first?

---

> **Key Point:** AI applications solve real problems by making intelligent capabilities accessible through software. The best ones are built around clear user needs.""", dur=5)

questions(C13, M13, [
    (1,  "What is an AI application?",
         ["A programming language","Software that combines traditional code with artificial intelligence capabilities","A database system","A web browser"], 1),
    (2,  "What is an AI API?",
         ["A type of database","A service that provides access to an AI model without building one from scratch","A programming language","A user interface framework"], 1),
    (3,  "Why do most developers use AI APIs instead of building their own models?",
         ["APIs are free","Building AI models requires massive data, compute, and research expertise","APIs are faster to type","AI models are illegal to build"], 1),
    (4,  "What is a chatbot?",
         ["A type of database","A text-based conversational interface powered by AI","A programming language","A testing tool"], 1),
    (5,  "Which of the following is an example of an AI application?",
         ["Microsoft Excel","GitHub Copilot (AI code suggestions)","A basic calculator","A plain text editor"], 1),
    (6,  "What is AI automation?",
         ["A programming language","Using AI to perform repetitive tasks automatically","A type of manual testing","A database backup process"], 1),
    (7,  "What is the basic flow of an AI application?",
         ["Database → Server → Browser","User input → Application → AI Model → Response → User","Code → Test → Deploy","Design → Build → Launch"], 1),
    (8,  "What is conversation context in a chatbot?",
         ["The visual design of the chat interface","Previous messages sent with each request so the AI understands the conversation","The database storing messages","The programming language used"], 1),
    (9,  "Why are AI applications becoming popular?",
         ["They are always free to build","They solve problems faster and handle tasks that previously required human effort","They replace all software","They require no development skills"], 1),
    (10, "What should you define before building an AI application?",
         ["The most expensive technology to use","The problem being solved, the users, and the required inputs and outputs","The largest possible feature set","The longest possible development timeline"], 1),
])


# =============================================================================
# MODULE 14: Introduction to AI Agents
# =============================================================================
print("\n-- MODULE 14: Introduction to AI Agents --")
M14 = "ai-agents-m14"
C14 = course("Introduction to AI Agents",
    "Discover AI agents — systems that go beyond answering questions to taking actions, using tools, and completing multi-step tasks autonomously.",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800")
module(M14, C14, "Introduction to AI Agents")

lesson(C14, M14, 1, "What is an AI Agent?",
    "An AI agent can understand goals, make decisions, use tools, and complete tasks autonomously.",
"""## What is an AI Agent?

An **AI agent** is software that can understand goals, make decisions, use tools, and perform tasks to achieve those goals — often without step-by-step human instruction.

---

## Agent vs Chatbot

| Feature | Chatbot | AI Agent |
|---|---|---|
| **Purpose** | Answer questions | Complete tasks |
| **Interaction** | Single response | Multi-step actions |
| **Tools** | None | Calendars, databases, email, search |
| **Autonomy** | Low | High |

---

## Example: Scheduling a Meeting

**Chatbot:** Tells you how to schedule a meeting.

**AI Agent:**
1. Checks your calendar for available times
2. Checks the other person's availability
3. Finds a mutually available slot
4. Sends a calendar invitation
5. Confirms the meeting is booked

The agent **does the work** — not just describes it.

---

> **Key Point:** AI agents are not just responders — they are doers. They take actions in the world to achieve goals.""")

lesson(C14, M14, 2, "Goals and Tasks",
    "Agents work toward defined goals by breaking them into specific tasks.",
"""## Goals and Tasks

AI agents work by breaking **goals** into **tasks**.

---

## Goals

A goal is the desired outcome.

Examples:
- Schedule a meeting with the sales team
- Research competitors and summarise findings
- Process all customer refund requests from today

---

## Tasks

Tasks are the specific actions taken to achieve the goal.

**Goal:** Schedule a meeting with the sales team.

**Tasks:**
1. Check the user's calendar for availability
2. Check each sales team member's calendar
3. Find a time that works for everyone
4. Create the calendar event
5. Send invitations to all attendees
6. Confirm the booking

---

## Why This Matters

Traditional software executes fixed, pre-programmed steps.

AI agents can:
- Determine **what steps are needed** based on the goal
- **Adapt** if a step fails (try a different time if one is blocked)
- **Learn from context** to make better decisions

---

> **Key Point:** Agents translate high-level goals into sequences of specific actions — handling complexity that would normally require a human.""")

lesson(C14, M14, 3, "Tools, Memory, and Business Applications",
    "Agents use tools to interact with systems and memory to maintain context across tasks.",
"""## Tools, Memory, and Business Applications

---

## Tools

Agents use **tools** to interact with external systems.

Common agent tools:

| Tool | Purpose |
|---|---|
| **Calendar API** | Check and create calendar events |
| **Email API** | Send and read emails |
| **Database** | Query and update stored information |
| **Search engine** | Find current information online |
| **Document reader** | Extract text from files |
| **CRM system** | Manage customer records |

An agent selects which tools to use based on the task at hand.

---

## Memory

**Memory** allows agents to remember information across multiple steps.

**Short-term memory:** Information from the current task or conversation.

> A support agent remembers the customer's name, issue, and all previous messages in the conversation.

**Long-term memory:** Information stored and retrieved across sessions.

> A personal assistant remembers your preferences, past decisions, and frequently used contacts.

---

## Business Applications

Agents are being deployed across industries:

| Industry | Agent Use Case |
|---|---|
| **Sales** | Find leads, send follow-ups, update CRM |
| **HR** | Answer policy questions, process leave requests |
| **Customer support** | Handle common issues automatically |
| **Research** | Search, gather, and summarise information |
| **Finance** | Process transactions, flag anomalies, generate reports |

---

## Real World Example

A sales agent:
1. Searches for potential leads matching a target profile
2. Drafts personalised outreach emails
3. Sends emails when approved
4. Logs all activity in the CRM
5. Follows up with leads that did not respond

Automatically. With minimal human input.

---

> **Key Point:** Agents with the right tools and memory can handle entire workflows — not just individual tasks.""")

lesson(C14, M14, 4, "How Agents Make Decisions",
    "Agents use a reasoning loop to plan, act, observe results, and adjust.",
"""## How Agents Make Decisions

AI agents use a continuous reasoning loop to complete tasks.

---

## The Agent Loop

```
Goal → Plan → Act → Observe → Adjust → Repeat
```

1. **Goal** — receive the objective
2. **Plan** — decide what steps are needed
3. **Act** — use a tool or generate output
4. **Observe** — check the result of the action
5. **Adjust** — update the plan based on what happened
6. **Repeat** — continue until the goal is achieved

---

## Example: Research Agent

**Goal:** Summarise the three main AI trends for 2025.

**Loop:**
1. Plan: Search the web for AI trends
2. Act: Use the search tool
3. Observe: Results returned from five sources
4. Plan: Read each source and extract key points
5. Act: Process each article
6. Observe: Key points extracted
7. Plan: Synthesise into a structured summary
8. Act: Generate the summary
9. Observe: Summary is complete and accurate
10. **Goal achieved.**

---

## Limitations

Agents are not perfect. They can:
- Take incorrect actions
- Get stuck in loops
- Make mistakes that compound
- Require human oversight for critical decisions

**Human oversight remains important**, especially for high-stakes tasks.

---

> **Key Point:** The agent loop allows AI to handle complex, multi-step tasks dynamically — but human review is still essential for critical work.""")

lesson(C14, M14, 5, "Module Summary",
    "Summary of AI agent concepts and a practical design activity.",
"""## Module Summary

In this module you learned:

1. What an AI agent is — software that takes actions to achieve goals
2. How agents differ from chatbots — agents do, chatbots respond
3. Goals and tasks — how agents break objectives into actions
4. Tools — the external systems agents use to take action
5. Memory — how agents maintain context within and across sessions
6. Business applications — real-world agent deployments
7. The agent loop — how agents plan, act, observe, and adjust

---

## Practical Activity

**Design an AI Travel Assistant Agent.**

Define:
1. **Goal** — what task does the agent complete?
2. **Tasks** — what steps does it take?
3. **Tools** — what systems does it need access to?
4. **Memory** — what does it need to remember?
5. **Output** — what does the user receive at the end?

---

> **Key Point:** AI agents represent the next evolution of AI applications — from systems that answer questions to systems that complete entire workflows autonomously.""", dur=5)

questions(C14, M14, [
    (1,  "What is an AI agent?",
         ["A simple question-answering chatbot",
          "Software that can understand goals, make decisions, use tools, and complete tasks",
          "A type of database",
          "A web browser extension"], 1),
    (2,  "How is an AI agent different from a basic chatbot?",
         ["Agents only answer questions","Chatbots are more powerful than agents",
          "Agents take actions and complete multi-step tasks while chatbots primarily respond to questions",
          "There is no difference"], 2),
    (3,  "What are goals in the context of AI agents?",
         ["Programming variables","The desired outcomes that agents work to achieve","Database queries","Test cases"], 1),
    (4,  "What are tasks in the context of AI agents?",
         ["The agent's training data","The specific actions taken to achieve a goal","Memory storage","API calls only"], 1),
    (5,  "Why do agents need tools?",
         ["Tools make agents look impressive",
          "Tools allow agents to interact with external systems to complete real-world tasks",
          "Tools replace the need for goals",
          "Tools are optional for all agents"], 1),
    (6,  "What is agent memory?",
         ["The agent's storage capacity",
          "The ability to retain and use information within and across tasks",
          "A type of database only",
          "The agent's response speed"], 1),
    (7,  "Which is a real-world business use case for AI agents?",
         ["Replacing all human employees","Automatically processing customer refunds and updating records",
          "Only generating marketing content","Only writing code"], 1),
    (8,  "Can AI agents make mistakes?",
         ["No, agents are always correct",
          "Yes, agents can take incorrect actions and require human oversight",
          "Only when the internet is slow",
          "Only for complex mathematical tasks"], 1),
    (9,  "What is the agent reasoning loop?",
         ["A type of programming loop",
          "The cycle of: plan, act, observe results, adjust, and repeat until the goal is achieved",
          "A memory management system",
          "A tool selection algorithm"], 1),
    (10, "What is the key lesson from this module?",
         ["AI agents replace all human workers immediately",
          "AI agents are limited to answering questions",
          "AI agents can handle complete workflows by taking actions — but human oversight remains important",
          "AI agents are too complex for business use"], 2),
])


# =============================================================================
# MODULE 15: Introduction to RAG Systems
# =============================================================================
print("\n-- MODULE 15: Introduction to RAG Systems --")
M15 = "rag-systems-m15"
C15 = course("Introduction to RAG Systems",
    "Learn how Retrieval-Augmented Generation (RAG) connects AI to specific knowledge sources — enabling accurate, context-aware responses from company documents.",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800")
module(M15, C15, "Introduction to RAG Systems")

lesson(C15, M15, 1, "What is RAG?",
    "RAG stands for Retrieval-Augmented Generation — it helps AI access specific information before generating responses.",
"""## What is RAG?

**RAG** stands for **Retrieval-Augmented Generation**.

It is a technique that improves AI responses by connecting the AI model to a specific knowledge source before generating an answer.

---

## The Three Steps of RAG

1. **Retrieve** — search the knowledge base for information relevant to the question
2. **Augment** — provide that retrieved information to the AI along with the question
3. **Generate** — the AI generates a response grounded in the retrieved information

---

## Why This Matters

Standard AI models are trained on general knowledge up to a certain date. They do not know:

- Your company's specific policies
- Your product's documentation
- Your organisation's procedures
- Recent events after their training cutoff

**RAG solves this by giving AI access to specific, current information at the time of the query.**

---

## Simple Analogy

Think of a RAG system as an open-book exam.

**Without RAG:** AI answers from memory only — limited to what it was trained on.

**With RAG:** AI first looks up the relevant pages in the book, then answers using that information.

---

> **Key Point:** RAG makes AI more accurate, specific, and trustworthy by grounding responses in retrieved facts rather than trained memory alone.""")

lesson(C15, M15, 2, "Knowledge Bases and Document Search",
    "A knowledge base is the collection of documents that a RAG system searches to find relevant information.",
"""## Knowledge Bases and Document Search

---

## What is a Knowledge Base?

A **knowledge base** is a structured collection of information that a RAG system can search.

Examples:
- Company policy documents
- Employee training manuals
- Product guides and specifications
- FAQs and support documentation
- Legal and compliance documents

---

## How Document Search Works

When a user asks a question:

1. The question is converted into a mathematical representation (called an **embedding**)
2. The system searches the knowledge base for documents with similar embeddings
3. The most relevant sections are retrieved
4. These sections are sent to the AI along with the original question
5. The AI generates an answer based on the retrieved content

---

## Why Embeddings?

Traditional search looks for exact keyword matches.

**Embedding-based search** finds documents that are *semantically similar* — meaning they are about the same topic even if they use different words.

**Example:**
- Question: "What is the leave policy for new employees?"
- Retrieved document section: "Probationary staff are entitled to..."

The words are different but the meaning matches — embedding search finds it.

---

> **Key Point:** The quality of a RAG system depends on the quality of its knowledge base. Well-organised, accurate documents produce accurate, helpful responses.""")

lesson(C15, M15, 3, "Business Applications of RAG",
    "RAG enables powerful internal tools — HR assistants, support bots, and company knowledge systems.",
"""## Business Applications of RAG

RAG systems are being deployed across organisations to make internal knowledge instantly accessible.

---

## HR Assistant

**Problem:** Employees constantly email HR with the same questions.

**RAG Solution:** An HR assistant connected to the employee handbook answers instantly.

> "How many days of annual leave do I get?"
> *AI retrieves the leave policy section and provides the exact answer.*

---

## Customer Support System

**Problem:** Support agents spend time looking up the same product information repeatedly.

**RAG Solution:** A support assistant retrieves relevant product documentation for each customer query.

> "My device is showing error code E-45."
> *AI retrieves the troubleshooting guide for that error and provides step-by-step instructions.*

---

## Internal Company Chatbot

**Problem:** New employees struggle to find information across hundreds of documents.

**RAG Solution:** A chatbot connected to all company documentation answers onboarding questions instantly.

---

## Real World Example

An employee asks:

> "What is the company's work-from-home policy?"

The RAG system:
1. Searches the HR policy knowledge base
2. Retrieves the relevant policy section
3. Generates a clear, accurate answer citing the policy

The employee gets an instant, accurate answer without emailing HR.

---

> **Key Point:** RAG transforms static documents into interactive, intelligent knowledge systems that any employee can query in natural language.""")

lesson(C15, M15, 4, "Building a RAG System",
    "Understanding the technical components that make up a RAG system.",
"""## Building a RAG System

A RAG system has five core components.

---

## The Five Components

### 1. Document Collection

Gather all documents that should be searchable.
- PDFs, Word documents, web pages, database records

### 2. Document Processing

Split documents into smaller, searchable chunks.
- A 50-page policy document becomes hundreds of focused sections

### 3. Embedding Generation

Convert each chunk into a mathematical vector (embedding).
- Done once when documents are added to the system

### 4. Vector Database

Store all embeddings in a database optimised for similarity search.
- Examples: Pinecone, Weaviate, Supabase pgvector

### 5. Query and Generation Pipeline

When a user asks a question:
1. Convert the question to an embedding
2. Search the vector database for similar chunks
3. Retrieve the top results
4. Send retrieved content + question to the AI
5. Return the generated answer

---

## Keeping Knowledge Current

Documents in the knowledge base must be kept up to date.

If a policy changes but the document is not updated, the RAG system will give outdated information.

**Maintaining the knowledge base is as important as building it.**

---

> **Key Point:** RAG systems are powerful tools — but they are only as accurate and useful as the documents they are built on.""")

lesson(C15, M15, 5, "Module Summary",
    "Summary of RAG concepts and a practical design activity.",
"""## Module Summary

In this module you learned:

1. What RAG is — Retrieval-Augmented Generation
2. The three steps: Retrieve → Augment → Generate
3. Knowledge bases — the document collections that power RAG
4. Embedding-based search — finding semantically relevant content
5. Business applications — HR, customer support, internal knowledge systems
6. The five components of a RAG system

---

## Key Concept Summary

| Term | Definition |
|---|---|
| **RAG** | Technique that retrieves relevant documents before generating AI responses |
| **Knowledge base** | Collection of documents the system can search |
| **Embedding** | Mathematical representation of text used for similarity search |
| **Vector database** | Database optimised for storing and searching embeddings |
| **Retrieval** | Finding relevant document sections for a given query |

---

## Practical Activity

**Design a Company Policy Assistant.**

Define:
1. What documents would go in the knowledge base?
2. What questions should users be able to ask?
3. What would an ideal response look like?
4. How would you keep the knowledge base updated?
5. Who in the organisation would benefit most?

---

> **Key Point:** RAG is one of the most practical and immediately valuable AI techniques in business. It makes organisational knowledge instantly accessible to everyone.""", dur=5)

questions(C15, M15, [
    (1,  "What does RAG stand for?",
         ["Random Access Generation","Retrieval-Augmented Generation","Rapid AI Generation","Real-time Answer Generation"], 1),
    (2,  "Why is RAG useful?",
         ["It makes AI faster","It allows AI to access specific knowledge sources for more accurate responses","It replaces databases","It reduces AI costs"], 1),
    (3,  "What is a knowledge base in a RAG system?",
         ["A programming library","A collection of documents the system can search for relevant information","A type of neural network","A database management system"], 1),
    (4,  "Why retrieve information before generating a response?",
         ["To slow down the system","To increase costs","To ground the response in specific, relevant facts rather than general training","To avoid using AI"], 2),
    (5,  "What types of documents can be added to a RAG knowledge base?",
         ["Only PDFs","Only web pages","Policies, manuals, guides, FAQs, and any relevant text documents","Only database records"], 2),
    (6,  "How does RAG improve AI accuracy?",
         ["By making the model larger","By grounding responses in retrieved facts specific to the query","By reducing response length","By limiting the topics AI can discuss"], 1),
    (7,  "Which is a real business use case for RAG?",
         ["Replacing all employees","An HR assistant that answers policy questions by searching the employee handbook","Making websites load faster","Improving internet speeds"], 1),
    (8,  "What is document search in a RAG system?",
         ["Searching for files on your computer","Finding semantically relevant sections of documents for a given query","A type of web search","A database backup process"], 1),
    (9,  "What is retrieval in the context of RAG?",
         ["Backing up databases","The process of finding and accessing relevant information from the knowledge base","Generating AI responses","Training AI models"], 1),
    (10, "What is the main lesson from this module?",
         ["RAG makes AI slower but more expensive",
          "RAG is only useful for large corporations",
          "RAG improves AI by connecting it to specific knowledge sources — making responses more accurate and relevant",
          "RAG replaces the need for human experts entirely"], 2),
])


# =============================================================================
# MODULE 16: Professional Developer Skills
# =============================================================================
print("\n-- MODULE 16: Professional Developer Skills --")
M16 = "pro-dev-skills-m16"
C16 = course("Professional Developer Skills",
    "Build the professional skills that complement technical ability — Git, GitHub, Agile development, portfolio building, and career development.",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800")
module(M16, C16, "Professional Developer Skills")

lesson(C16, M16, 1, "Git and Version Control",
    "Git tracks every change to code, enabling collaboration and protecting against data loss.",
"""## Git and Version Control

**Version control** is a system that tracks changes to code over time, enabling collaboration and providing a complete history of every modification.

**Git** is the most widely used version control system in the world.

---

## Why Version Control Matters

Without Git:
- Only one person can work on a file safely at a time
- A mistake can permanently destroy work
- There is no history of who changed what or why
- Rolling back to a previous version is impossible

With Git:
- Multiple developers work simultaneously without conflicts
- Every change is recorded with who made it and when
- Any version can be restored instantly
- Mistakes can be undone

---

## Core Git Concepts

| Concept | Meaning |
|---|---|
| **Repository** | The project and its entire history |
| **Commit** | A saved snapshot of changes with a message |
| **Branch** | An independent line of development |
| **Merge** | Combining changes from one branch into another |
| **Pull Request** | Proposing changes for review before merging |

---

## Basic Git Workflow

1. Make changes to code
2. Stage the changes: `git add`
3. Commit with a message: `git commit -m "description"`
4. Push to the remote: `git push`

---

> **Key Point:** Git is not optional. Every professional developer uses version control. It is the foundation of collaborative software development.""")

lesson(C16, M16, 2, "GitHub",
    "GitHub is the platform where developers store, share, and collaborate on code using Git.",
"""## GitHub

**GitHub** is the world's largest code hosting platform, built on top of Git.

---

## What GitHub Provides

- **Code storage** — your repository lives in the cloud, safely backed up
- **Collaboration** — multiple developers work on the same project
- **Code review** — teams review changes before they are merged
- **Issue tracking** — bugs and tasks are logged and managed
- **Portfolio** — your public repositories showcase your skills

---

## GitHub for Developers

GitHub is where:
- Open-source projects are built collaboratively
- Companies host their private codebases
- Developers discover and contribute to projects
- Employers look to evaluate candidates' skills

---

## Building a Public Portfolio

Every project you push to GitHub becomes part of your developer portfolio.

A strong GitHub profile shows:
- Projects you have built
- Code quality and organisation
- Consistency over time
- Technologies you work with

---

## Real World Example

Many junior developers get hired because their GitHub profile shows real projects — even without formal employment experience.

A portfolio of three well-documented projects is more convincing than a CV with no evidence of work.

---

> **Key Point:** GitHub is both your code storage and your professional portfolio. Start using it early and commit often.""")

lesson(C16, M16, 3, "Agile Development",
    "Agile is a development methodology focused on small iterations, frequent feedback, and team collaboration.",
"""## Agile Development

**Agile** is the most widely used software development methodology.

It focuses on delivering value in small, frequent increments rather than building everything before releasing anything.

---

## Core Agile Principles

- **Small improvements** — deliver working software frequently, in weeks not months
- **Frequent feedback** — show progress to stakeholders and adjust based on their input
- **Team collaboration** — developers, designers, and business stakeholders work together daily
- **Respond to change** — adapt plans when requirements change rather than following a rigid plan

---

## Sprints

Most Agile teams work in **sprints** — fixed time periods (usually 1–2 weeks) during which a set of features is planned, built, and delivered.

**Sprint cycle:**
1. Plan — decide what to build this sprint
2. Build — develop the features
3. Review — demonstrate what was built
4. Retrospective — discuss what to improve next sprint
5. Repeat

---

## Agile vs Waterfall

| Waterfall | Agile |
|---|---|
| Plan everything upfront | Plan iteratively |
| Build all at once | Build in small pieces |
| Release once at the end | Release frequently |
| Change is expensive | Change is expected |

---

> **Key Point:** Agile teams deliver value faster, adapt to change more easily, and produce software that better matches what users actually need.""")

lesson(C16, M16, 4, "Building a Portfolio",
    "A strong portfolio demonstrates your skills more effectively than a CV alone.",
"""## Building a Portfolio

A **portfolio** is a collection of projects that demonstrates your technical skills, problem-solving ability, and professional approach.

---

## Why Portfolios Matter

Employers hiring junior developers often face a challenge: candidates have no work experience.

A portfolio solves this problem. It shows:
- What you can build
- How you approach problems
- The quality and organisation of your code
- The technologies you have worked with

---

## What to Include in Your Portfolio

| Element | What to Show |
|---|---|
| **Projects** | 3–5 real applications you have built |
| **README** | Clear explanation of what each project does |
| **Source code** | Well-organised, readable code on GitHub |
| **Screenshots/demos** | Visual proof the project works |
| **Technologies used** | List the tools and frameworks in each project |

---

## Project Ideas for Your Portfolio

- A personal task manager
- A simple quiz application
- A weather app using an API
- An AI-powered study assistant
- A student management system

---

## Real World Example

A junior developer applies for a role with no formal experience. Their GitHub profile shows three well-documented projects built during their learning programme.

The hiring manager reviews the code, sees clean organisation, good documentation, and working features. The developer is invited to interview.

**The portfolio spoke louder than the CV.**

---

> **Key Point:** Build projects. Document them well. Put them on GitHub. This is the most effective way to demonstrate junior developer readiness.""")

lesson(C16, M16, 5, "Career Development",
    "Technical skills open doors — but continuous learning, communication, and professional habits build careers.",
"""## Career Development

Technical skills get you hired. Professional skills help you grow.

---

## What Employers Value in Developers

| Skill | Why It Matters |
|---|---|
| **Technical ability** | The foundation of the role |
| **Problem-solving** | Dealing with unexpected challenges |
| **Communication** | Explaining work to teammates and non-technical stakeholders |
| **Continuous learning** | Technology evolves — staying current is essential |
| **Reliability** | Delivering on commitments consistently |
| **Collaboration** | Working effectively in a team |

---

## Continuous Learning

Technology changes faster than any other field. What is current today may be outdated in three years.

Successful developers commit to lifelong learning:
- Follow industry news and trends
- Complete new courses and certifications
- Build projects with new technologies
- Participate in developer communities

---

## Growing Your Network

Many opportunities come through people, not job boards.

- Attend meetups and tech events
- Contribute to open-source projects
- Engage with communities on LinkedIn and GitHub
- Help others — it builds reputation and relationships

---

## Module Summary

In this module you learned:

1. Git — tracking code changes and enabling collaboration
2. GitHub — the platform for storing code and showcasing your portfolio
3. Agile — the iterative development methodology used by most professional teams
4. Portfolio building — demonstrating skills through real projects
5. Career development — the professional habits that build long-term success

---

> **Key Point:** A developer's career is built on three foundations: technical skills, professional habits, and continuous learning. Start building all three from day one.""", dur=6)

questions(C16, M16, [
    (1,  "What is version control?",
         ["A type of programming language","A system that tracks changes to code over time, enabling collaboration and history","A web browser","A database system"], 1),
    (2,  "Why do professional developers use Git?",
         ["Because it is required by law","To track changes, collaborate safely, and maintain a complete code history","To make websites faster","To design user interfaces"], 1),
    (3,  "What is GitHub?",
         ["A programming language","A type of database","A platform for storing, sharing, and collaborating on code using Git","An AI model"], 2),
    (4,  "What is Agile development?",
         ["Building everything before releasing anything",
          "An iterative methodology focused on small releases, frequent feedback, and adaptation",
          "A programming language",
          "A testing framework"], 1),
    (5,  "Why should developers build a portfolio?",
         ["It is required by all employers","To demonstrate skills through real projects to potential employers","Portfolios replace CVs entirely","Only senior developers need portfolios"], 1),
    (6,  "What should a developer portfolio contain?",
         ["Only a CV","Projects, README files, source code, screenshots, and technologies used","Only a list of certifications","Only theoretical knowledge"], 1),
    (7,  "Why is continuous learning important for developers?",
         ["It is only necessary for senior developers",
          "Technology evolves rapidly — developers must stay current to remain effective",
          "It is optional once you have a job",
          "Continuous learning is less important than initial training"], 1),
    (8,  "What do employers value most in junior developers?",
         ["Only the number of certifications",
          "Technical ability, problem-solving, communication, and reliability",
          "Only years of experience",
          "Only the university they attended"], 1),
    (9,  "Why is documenting projects important?",
         ["It wastes development time","It helps others understand and evaluate your work","Only large teams need documentation","Documentation is only for APIs"], 1),
    (10, "What is career development for a software developer?",
         ["Getting one job and staying there forever",
          "Continuously growing technical skills, professional habits, and industry relationships",
          "Only completing formal education",
          "Avoiding new technologies"], 1),
])


# =============================================================================
# MODULE 17: Industry Capstone Project
# =============================================================================
print("\n-- MODULE 17: Industry Capstone Project --")
M17 = "capstone-m17"
C17 = course("Industry Capstone Project",
    "Apply everything learned across all four certificates in a real-world capstone project — demonstrating job-ready skills in AI, programming, web development, and professional practice.",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800")
module(M17, C17, "Industry Capstone Project")

lesson(C17, M17, 1, "Capstone Project Overview",
    "The capstone project is your opportunity to demonstrate everything learned across all four certificates.",
"""## Capstone Project Overview

The **Industry Capstone Project** is the final demonstration of your skills across all four certificates of the programme.

This is not a test with right or wrong answers. It is an opportunity to **build something real** that demonstrates your readiness for professional work.

---

## What the Capstone Demonstrates

- You can apply programming concepts to solve real problems
- You can integrate AI into a working application
- You can design systems with frontend, backend, and database components
- You can document your work professionally
- You can communicate your decisions clearly

---

## Choose Your Project

Select **one** of the following:

| Option | Project |
|---|---|
| **1** | AI Study Assistant |
| **2** | Personal Budget Tracker |
| **3** | AI Customer Support Assistant |
| **4** | Task Management Application |
| **5** | Inventory Management System |

Each option is designed to challenge you to apply concepts from all modules.

---

> **Key Point:** The capstone is your proof of readiness. Approach it as you would a real client project — with professionalism, planning, and attention to detail.""")

lesson(C17, M17, 2, "Project Requirements and Design",
    "Every capstone project must include a clear problem statement, system design, and feature list.",
"""## Project Requirements and Design

Before writing a single line of code, plan your project thoroughly.

---

## Required Deliverables

### 1. Project Overview

State clearly:
- What problem does this application solve?
- Who are the users?
- Why does this problem need a solution?

### 2. System Design

Document your architecture:

- **Frontend** — what screens and components will users see?
- **Backend** — what processing happens on the server?
- **Database** — what information needs to be stored?
- **AI Components** — where does AI add value?

### 3. Features List

Define the specific features you will implement.

Example for a Task Management Application:
- User registration and login
- Create, view, update, and delete tasks
- Mark tasks as complete
- AI-powered task priority suggestions
- Dashboard with progress summary

---

## Planning Tips

- Start with the core features — get them working before adding extras
- Design your database first — it determines what your app can do
- Think about the user journey — what does the user do step by step?

---

> **Key Point:** A well-planned project is built faster, maintained more easily, and serves users more effectively.""")

lesson(C17, M17, 3, "Documentation and Submission",
    "Professional documentation is a required deliverable alongside working code.",
"""## Documentation and Submission

A working application without documentation is an incomplete submission.

---

## Required Documentation

### README File

```markdown
# Project Name

## Overview
What does this application do and what problem does it solve?

## Features
- Feature 1
- Feature 2
- Feature 3

## Technologies Used
- Frontend: [technology]
- Backend: [technology]
- Database: [technology]
- AI: [API or service used]

## Installation
Step-by-step setup instructions.

## Usage
How to use the key features.
```

### System Design Document

- Architecture diagram or description
- Database schema (tables and fields)
- AI integration description

### Reflection Document

- What did you learn during this project?
- What challenges did you encounter?
- How did you solve them?
- What would you improve with more time?

---

## Submission Checklist

- Working application
- README with all required sections
- Source code pushed to GitHub
- System design documented
- Reflection completed

---

> **Key Point:** Documentation is a deliverable — not an afterthought. Professional developers document as they build.""")

lesson(C17, M17, 4, "Assessment Criteria",
    "Your capstone is assessed across five areas: functionality, documentation, UX, problem solving, and presentation.",
"""## Assessment Criteria

Your capstone project is assessed across five areas.

---

## Assessment Breakdown

| Criterion | Weight | Description |
|---|---|---|
| **Functionality** | 40% | Does the application work correctly? Does it solve the stated problem? |
| **Documentation** | 20% | Is the README clear? Is the system documented? Is reflection included? |
| **User Experience** | 15% | Is the application easy to use? Is the interface clear? |
| **Problem Solving** | 15% | Does the solution address the problem effectively? Are AI features used appropriately? |
| **Professional Presentation** | 10% | Is the code organised? Is naming consistent? Is the project well-structured? |

---

## Passing Standard

A passing capstone demonstrates that you can:

- Build a working application with real functionality
- Integrate AI in a meaningful way
- Document your work clearly
- Reflect on your learning honestly

---

## What Makes an Outstanding Capstone

- The problem is clearly defined and genuinely solved
- AI is used to add real value — not just added for the sake of it
- The code is clean, organised, and readable
- The documentation is detailed enough for someone else to install and use the app
- The reflection shows genuine learning and professional thinking

---

> **Key Point:** Your capstone is your professional debut. Treat it like a real project delivered to a real client.""")

lesson(C17, M17, 5, "Programme Complete",
    "Completing all four certificates marks the end of the AI-Powered Software Development programme.",
"""## Programme Complete

Congratulations on reaching the final module of the **Professional Certificate in AI-Powered Software Development** programme.

---

## What You Have Achieved

### Certificate 1: Certified AI Digital Professional
- Technology Fundamentals
- Working Smarter with AI
- Digital Productivity for Professionals

### Certificate 2: Certified Junior Software Developer
- Introduction to Programming
- Programming with AI Assistance
- Web Development Fundamentals
- Understanding Software Projects
- Debugging and Problem Solving
- Building Real Applications

### Certificate 3: Certified AI-Enhanced Developer
- Prompt Engineering for Developers
- Testing and Quality Assurance
- Technical Documentation and Communication

### Certificate 4: Certified AI Application Developer
- Building Your First AI Application
- Introduction to AI Agents
- Introduction to RAG Systems
- Professional Developer Skills
- Industry Capstone Project

---

## Final Award

Learners who complete all four certificates and pass the capstone receive:

**Professional Certificate in AI-Powered Software Development**

This represents completion of the full beginner-to-job-ready programme.

---

> **You started this programme as a learner. You finish it as a developer. Go build something great.**""", dur=3)

questions(C17, M17, [
    (1,  "What is the purpose of the capstone project?",
         ["To test only theoretical knowledge",
          "To demonstrate job-ready skills by building a real application",
          "To replace the need for final exams",
          "To test only AI knowledge"], 1),
    (2,  "What should a capstone project include?",
         ["Only working code","Only documentation",
          "Working application, README, system design, and reflection",
          "Only a project plan"], 2),
    (3,  "What is the highest-weighted assessment criterion?",
         ["Documentation","User Experience","Professional Presentation","Functionality"], 3),
    (4,  "Why must developers plan before writing code?",
         ["Planning is optional","A well-planned project is built faster and serves users more effectively","Planning replaces coding","Plans are only needed for large teams"], 1),
    (5,  "What does the README file in a capstone project include?",
         ["Only the project name",
          "Project overview, features, technologies, installation steps, and usage instructions",
          "Database passwords",
          "Only the reflection"], 1),
    (6,  "What are the four system design components required?",
         ["HTML, CSS, JavaScript, Python","Frontend, Backend, Database, and AI Components","Plan, Build, Test, Deploy","Variables, Functions, Loops, Classes"], 1),
    (7,  "What does the reflection document contain?",
         ["Only the features list","What was learned, challenges encountered, solutions found, and improvements identified","Only technical specifications","Only the project timeline"], 1),
    (8,  "What makes an outstanding capstone project?",
         ["The largest number of features",
          "A clearly defined problem, AI that adds real value, clean code, detailed documentation, and genuine reflection",
          "The most expensive technology used",
          "The longest README file"], 1),
    (9,  "What does completing all four certificates demonstrate?",
         ["Only that you can pass tests",
          "Job-ready skills in AI, programming, web development, and professional practice",
          "Only theoretical knowledge",
          "Only that you can use AI tools"], 1),
    (10, "What is the final award for completing the entire programme?",
         ["Certificate in Basic Computing",
          "Professional Certificate in AI-Powered Software Development",
          "Certificate in Web Design Only",
          "Certificate in AI Research"], 1),
])


# =============================================================================
# CERTIFICATE 4 FINAL EXAM
# =============================================================================
print("\n-- CERT 4 FINAL EXAM: Certified AI Application Developer --")
FE4_ID  = "cert4-final-exam"
FE4_CID = course("Certified AI Application Developer — Final Exam",
    "40-question certification exam covering AI Applications, AI Agents, RAG Systems, Professional Skills, and Capstone concepts. Score 80% to earn your Certified AI Application Developer certificate.",
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800")
module(FE4_ID, FE4_CID, "Certificate 4 Final Examination")

lesson(FE4_CID, FE4_ID, 1, "Certificate 4 Final Examination",
    "40 questions covering AI Applications, AI Agents, RAG Systems, Professional Developer Skills, and Capstone concepts.",
"""## Certified AI Application Developer

### Final Certification Examination

---

## Exam Information

| Detail | Info |
|---|---|
| **Questions** | 40 |
| **Pass Mark** | 80% (32/40) |
| **Time Limit** | 45 minutes |
| **Sections** | A: AI Apps, B: AI Agents, C: RAG, D: Professional Skills, E: Capstone |

---

## Grading

| Score | Result |
|---|---|
| 36-40 (90-100%) | Distinction |
| 32-35 (80-89%) | Pass |
| 24-31 (60-79%) | Retake Required |
| Below 24 | Re-enroll Recommended |

---

## Final Programme Award

Passing this exam, combined with completing the capstone project, earns you:

**Professional Certificate in AI-Powered Software Development**

---

> Click **Mark as Read** to begin.""", dur=45)

questions(FE4_CID, FE4_ID, [
    # Section A: AI Applications (Q1-8)
    (1,  "What is an AI application?", ["A spreadsheet tool","Software combining traditional code with AI capabilities","A database system","A web browser"], 1),
    (2,  "What is an AI API?", ["A type of database","A service providing access to AI models without building them from scratch","A programming language","A frontend framework"], 1),
    (3,  "Why do developers use AI APIs instead of building their own models?", ["APIs are always free","Building AI models requires massive data, compute, and AI research expertise","APIs are faster to type","AI models are illegal"], 1),
    (4,  "What is a chatbot?", ["A database","A conversational interface powered by AI","A programming language","A testing tool"], 1),
    (5,  "What is the basic flow of an AI application?", ["Database to Server to Browser","User input to AI model to response to user","Code to Test to Deploy","Design to Build to Launch"], 1),
    (6,  "What is AI automation?", ["Manual data entry","Using AI to perform repetitive tasks automatically","A type of testing","Database backup"], 1),
    (7,  "What is conversation context in AI applications?", ["The visual design","Previous messages that help AI give relevant responses","The database","The programming language"], 1),
    (8,  "What should you define before building an AI application?", ["The most expensive technology","The problem, users, and required inputs and outputs","The largest feature set","The longest timeline"], 1),
    # Section B: AI Agents (Q9-16)
    (9,  "What is an AI agent?", ["A basic chatbot","Software that understands goals, makes decisions, uses tools, and completes tasks","A database system","A web server"], 1),
    (10, "How do agents differ from chatbots?", ["Chatbots are more powerful","Agents take real-world actions to complete tasks while chatbots primarily respond to questions","There is no difference","Agents only work offline"], 2),
    (11, "What are goals in agent systems?", ["Programming variables","The desired outcomes agents work to achieve","Database queries","Test cases"], 1),
    (12, "Why do agents need tools?", ["To look impressive","To interact with external systems and complete real-world tasks","Tools replace goals","Tools are optional"], 1),
    (13, "What is agent memory?", ["Storage capacity only","The ability to retain and use information within and across tasks","A database only","Response speed"], 1),
    (14, "Can AI agents make mistakes?", ["No, agents are always correct","Yes, agents can take incorrect actions and require human oversight","Only with complex maths","Only on slow internet"], 1),
    (15, "What is the agent reasoning loop?", ["A code loop","Plan, act, observe, adjust, and repeat until the goal is achieved","Memory management","Tool selection only"], 1),
    (16, "What is a real business use case for AI agents?", ["Replacing all human employees","Automatically processing customer queries and updating CRM records","Only generating content","Only writing code"], 1),
    # Section C: RAG Systems (Q17-24)
    (17, "What does RAG stand for?", ["Random Access Generation","Retrieval-Augmented Generation","Rapid AI Generation","Real-time Answer Generation"], 1),
    (18, "Why is RAG useful?", ["It makes AI faster","It allows AI to access specific knowledge sources for accurate, context-specific responses","It replaces databases","It reduces AI costs"], 1),
    (19, "What is a knowledge base?", ["A programming library","A collection of documents a RAG system can search","A neural network","A database management platform"], 1),
    (20, "Why retrieve information before generating a response?", ["To slow the system","To increase costs","To ground the response in specific, relevant facts","To avoid using AI"], 2),
    (21, "How does RAG improve AI accuracy?", ["By making the model larger","By grounding responses in retrieved facts specific to the query","By shortening responses","By limiting topics"], 1),
    (22, "What is document search in RAG?", ["Searching your computer","Finding semantically relevant document sections for a given query","A web search","A database backup"], 1),
    (23, "Which is a business use case for RAG?", ["Replacing all staff","An HR assistant that searches the employee handbook to answer policy questions","Faster internet","Better graphics"], 1),
    (24, "What is the main lesson about RAG?", ["RAG is only for large companies","RAG improves AI by connecting it to specific knowledge sources","RAG is too complex to implement","RAG replaces human experts"], 1),
    # Section D: Professional Skills (Q25-32)
    (25, "What is version control?", ["A project management tool","A system that tracks code changes over time enabling collaboration and history","A programming language","A cloud service"], 1),
    (26, "Why use Git?", ["It is required by law","To track changes, collaborate safely, and maintain a complete code history","To make websites faster","To design interfaces"], 1),
    (27, "What is GitHub?", ["A programming language","A database","A platform for storing, sharing, and collaborating on code using Git","An AI model"], 2),
    (28, "What is Agile development?", ["Building all features before releasing","An iterative methodology focused on small releases and frequent feedback","A programming language","A testing framework"], 1),
    (29, "Why build a portfolio?", ["It is legally required","To demonstrate skills through real projects to employers","Portfolios replace CVs entirely","Only seniors need portfolios"], 1),
    (30, "What should a portfolio contain?", ["Only a CV","Projects, README files, source code, and technologies used","Only certifications","Only theory"], 1),
    (31, "Why is continuous learning important?", ["It is optional once employed","Technology evolves rapidly — developers must stay current","Only needed for AI developers","Continuous learning is less important than initial training"], 1),
    (32, "What do employers value in junior developers?", ["Only certifications","Technical ability, problem-solving, communication, and reliability","Only years of experience","Only the university attended"], 1),
    # Section E: Capstone (Q33-40)
    (33, "What is the purpose of the capstone project?", ["To test theory only","To demonstrate job-ready skills by building a real application","To replace final exams","To test only AI knowledge"], 1),
    (34, "What must a capstone project include?", ["Only code","Only documentation","Working application, README, system design, and reflection","Only a project plan"], 2),
    (35, "What is the highest-weighted assessment criterion in the capstone?", ["Documentation","User Experience","Professional Presentation","Functionality"], 3),
    (36, "Why plan before coding?", ["Planning is optional","A well-planned project is built faster and serves users more effectively","Planning replaces coding","Plans are only for large teams"], 1),
    (37, "What does a reflection document contain?", ["Only the feature list","What was learned, challenges encountered, solutions found, and improvements identified","Only technical specs","Only the timeline"], 1),
    (38, "What does completing all four certificates demonstrate?", ["Only test-passing ability","Job-ready skills in AI, programming, web development, and professional practice","Only theoretical knowledge","Only AI tool usage"], 1),
    (39, "What makes an AI feature worth including in a capstone?", ["It is expensive","It adds real, measurable value to the user experience","It uses the latest model","It is the most complex to build"], 1),
    (40, "What is the final award for completing the entire programme?", ["Certificate in Basic Computing","Professional Certificate in AI-Powered Software Development","Certificate in Web Design Only","Certificate in AI Research"], 1),
])

print("\nAll Certificate 4 data inserted successfully.")
