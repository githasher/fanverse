# FANVERSE AI – Your Personal FIFA Stadium Intelligence Agent

> **"An AI agent that thinks ahead, not just answers questions."**

Unlike a static navigation app or a standard Q&A chatbot, **FANVERSE AI** continuously monitors live stadium conditions (crowds, queues, weather, transport) to proactively guide fans through their entire FIFA World Cup 2026™ match-day journey.

---

## 📖 Chosen Vertical & Alignment

*   **Vertical**: Sports & Mega-Event Fan Experience (MetLife Stadium – FIFA 2026 Venue)
*   **Persona**: Context-aware proactive stadium concierge, adaptive to physical limitations, dietary needs, and real-time operational contingencies.

### Design Framework: The Fan Journey
FANVERSE AI maps every phase of a match-day into logical, context-aware decisions:
```
                BEFORE MATCH
                      │
     ┌────────────────────────────────┐
     │ Transportation & Parking       │
     │ Best Arrival & Gate Selection  │
     └────────────────────────────────┘
                      │
                      ▼
                ENTER STADIUM
                      │
     ┌────────────────────────────────┐
     │ OCR Ticket Scan to Seat        │
     │ Smart Gate Crowd Rerouting    │
     └────────────────────────────────┘
                      │
                      ▼
               INSIDE STADIUM
                      │
     ┌──────────────────────────────────────────────┐
     │ Dynamic Navigation & Halftime Queue Finder   │
     │ Dietary-aware Food Recommendations           │
     │ Accessibility Routing & Live Notifications   │
     └──────────────────────────────────────────────┘
                      │
                      ▼
               AFTER MATCH
                      │
     ┌────────────────────────────────┐
     │ Exit Optimization              │
     │ Transit & Rideshare Suggestion │
     └────────────────────────────────┘
```

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16.2 (App Router, Turbopack, standalone compilation)
- **Styling**: Tailwind CSS v4 (premium dark-mode styling with glassmorphism panels)
- **Animations**: Framer Motion (slide-in toast alerts, fade-up stat grids, page transition rings)
- **State Management**: Zustand (fully stateful global slices for profiles, logs, and chat history)
- **AI Core**: Google Gemini SDK (`@google/genai` client using `GoogleGenAI` model endpoints)
- **OCR/Vision**: Gemini 3.5 Flash (inline base64 image parsing)

---

## ⚡ Evaluation Focus Areas & Implementation

### 1. Code Quality (High Impact)
- **Architecture**: Modular structure separating data models, simulation scheduling, API routing, and visual presentations.
- **Strict Linting & Hygiene**: The project compiles with zero TypeScript errors and passes all ESLint rules cleanly.
- **State Separation**: Zustand stores manage runtime data locally to prevent rendering race conditions.

### 2. Problem Statement Alignment & Logic (High Impact)
- **Dynamic Context Injection**: The Gemini client reads live stadium sensors (crowds, weather, transit) and user profiles (location, accessibility, diet) at every prompt turn.
- **Proactive Notification Scheduler**: Background loops poll sensors every 3 seconds and push warning toasts when security lines exceed 15m, rain risk exceeds 50%, or gate closures occur.

### 3. Security (Medium Impact)
- **Zero Hardcoded Credentials**: API keys are excluded from git-committed files (like the Dockerfile) and parameters are loaded dynamically via `.env.local` or environment variables at runtime.
- **Standard Git Hygiene**: `.env.local` and compiler cache files are properly ignored in `.gitignore`.

### 4. Efficiency (Medium Impact)
- **Reduced Context Payload**: Chat history is truncated to the last 6 messages to preserve API tokens, minimize network latency, and stay within free tier thresholds.
- **Client-Side Simulation**: All sensory fluctuations are calculated client-side in CPU memory using a Mulberry32 PRNG seed rather than triggering constant server reads.
- **Optimized Standalone Container**: Next.js `standalone` mode excludes unneeded node packages in production docker builds, minimizing container sizes for Google Cloud Run.

### 5. Testing & Validation (Low Impact)
- **Automated Verification Suite**: Includes a dedicated TypeScript validation suite (`scripts/run-tests.ts`) confirming initial state creation, simulation engine ticks, phase transition overflows, and dietary filtering rules.
- **Command**: Run the tests easily using `npm run test`.

### 6. Accessibility & Inclusive Design (Low Impact)
- **Wheelchair Assist Mode**: Prioritizes step-free routes, elevator lobbies, and adjusts the chatbot's turn-by-turn navigation instructions.
- **Display Overrides**: Configurable High Contrast Mode, Large Text Scaling (for high-sun outdoor reading), and Voice Navigation dictation.

---

## 🔑 Environment & API Credentials

The project is pre-configured with the following credentials (stored locally in `.env.local` for development):

| Key Name | Value | Purpose |
|----------|-------|---------|
| `GEMINI_API_KEY` | `YOUR_GEMINI_API_KEY` | Google Cloud Gemini AI Inference & Vision |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `demo` | Google Maps JS Prototyping |

---

## 💻 Local Setup & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Validation Tests
Verify the core state machine, simulation engine, and logical matching rules:
```bash
npm run test
```

### 3. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to interact with the landing page and launch the Digital Twin dashboard.

### 4. Compile Production Build
```bash
npm run build
```

---

## ☁️ Google Cloud Run Deployment

The project is fully prepared for containerized deployment to Google Cloud.

- **Google Cloud Project ID**: `fanverse-502623`
- **Cloud Run Console**: [Google Cloud Run Dashboard](https://console.cloud.google.com/run/overview?project=fanverse-502623)

### How to Build & Deploy to Cloud Run

We have created an optimized multi-stage `Dockerfile` and `.dockerignore` file matching Next.js standalone guidelines. Run the following commands in your local terminal:

#### 1. Configure gcloud CLI
Ensure you are authenticated and target the correct project:
```bash
gcloud auth login
gcloud config set project fanverse-502623
```

#### 2. Submit Build to Artifact Registry
Use Google Cloud Build to build and push the container image:
```bash
gcloud builds submit --tag gcr.io/fanverse-502623/fanverse-ai
```

#### 3. Deploy to Cloud Run
Deploy the container to Cloud Run as a managed server:
```bash
gcloud run deploy fanverse-ai \
  --image gcr.io/fanverse-502623/fanverse-ai \
  --platform managed \
  --region us-east1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```
Once deployed, the terminal will print the public service URL for the app (e.g. `https://fanverse-ai-xxxx-uc.a.run.app`).
