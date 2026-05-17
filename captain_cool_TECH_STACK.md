# 🏏 CAPTAIN COOL — Complete Tech Stack Reference
### Multi-Agent IPL Match Strategist · Google Gemini Hackathon
**Version:** 1.0 · **Team:** Synapsters · **Status:** BUILD-READY

---

## 0. STACK AT A GLANCE

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        CAPTAIN COOL — FULL STACK MAP                     │
├───────────────────┬──────────────────────────────────────────────────────┤
│   LAYER           │   TECHNOLOGY                                          │
├───────────────────┼──────────────────────────────────────────────────────┤
│ Frontend UI       │ Google Stitch → React 18 + Vite 5                    │
│ Styling           │ Tailwind CSS 3.4 + Custom CSS Variables               │
│ Fonts             │ Bebas Neue + IBM Plex Sans (Google Fonts)             │
│ State Management  │ Zustand 4.5                                           │
│ Streaming         │ SSE (EventSource API) + ReadableStream                │
│ Routing           │ React Router DOM 6                                    │
├───────────────────┼──────────────────────────────────────────────────────┤
│ Backend Server    │ Python 3.11 + FastAPI 0.111                           │
│ ASGI Server       │ Uvicorn 0.29 (dev) / Gunicorn 22 (prod)              │
│ Agent Framework   │ Google ADK (google-adk 0.5+)                         │
│ LLM SDK           │ google-genai 0.8+ (official Python SDK)               │
│ Async Runtime     │ asyncio + anyio                                       │
│ HTTP Client       │ httpx 0.27                                            │
│ Validation        │ Pydantic v2 (bundled with FastAPI)                    │
├───────────────────┼──────────────────────────────────────────────────────┤
│ AI Models         │ gemini-2.5-pro-preview-05-06 (Strategist + DA)       │
│                   │ gemini-2.5-flash-preview-04-17 (Stats + Commentator)  │
│ Tool Calling      │ Gemini Function Calling (native SDK)                  │
│ Context Caching   │ Gemini Context Caching API (multi-over memory)        │
│ URL Scraping      │ Gemini URL Context Tool (Cricbuzz live scrape)        │
│ AI Prototyping    │ Google AI Studio (aistudio.google.com)                │
├───────────────────┼──────────────────────────────────────────────────────┤
│ Cricket Data      │ Sportmonks Cricket API v2 (primary)                  │
│                   │ cricapi.com (fallback)                                │
│                   │ Gemini URL scrape → Cricbuzz (stretch)               │
│ Weather/Dew       │ OpenWeatherMap API (free tier)                        │
│ Win Probability   │ Custom DLS-style Python function (no external API)    │
├───────────────────┼──────────────────────────────────────────────────────┤
│ Database          │ Firebase Firestore (NoSQL, session + history)         │
│ Auth (optional)   │ Firebase Auth (anonymous auth for session tokens)     │
│ Realtime          │ Firestore onSnapshot (over-history updates)           │
├───────────────────┼──────────────────────────────────────────────────────┤
│ Hosting: Frontend │ Firebase Hosting (CDN, global, free tier)             │
│ Hosting: Backend  │ Google Cloud Run (containerized, serverless)          │
│ Container         │ Docker 24 + python:3.11-slim base image               │
│ Registry          │ Google Artifact Registry                              │
├───────────────────┼──────────────────────────────────────────────────────┤
│ Dev IDE           │ Google Antigravity (PRIMARY vibe-coding session)      │
│ Version Control   │ Git + GitHub (public repo required for submission)    │
│ Package Mgmt (BE) │ pip + requirements.txt (uv for speed if available)    │
│ Package Mgmt (FE) │ npm 10 + package.json                                 │
│ Env Management    │ python-dotenv + .env file                             │
│ Code Quality      │ ruff (Python linting) + ESLint (JS linting)           │
└───────────────────┴──────────────────────────────────────────────────────┘
```

---

## 1. FRONTEND LAYER

### 1.1 Core Framework

| Package | Version | Purpose | Install |
|---|---|---|---|
| react | 18.3.1 | UI framework | `npm i react` |
| react-dom | 18.3.1 | DOM renderer | bundled |
| vite | 5.2.11 | Build tool + dev server | `npm i -D vite` |
| @vitejs/plugin-react | 4.3.0 | Vite React plugin | `npm i -D @vitejs/plugin-react` |

**Why Vite over CRA:** 10x faster HMR. Critical in 3-hour window.

**`vite.config.js`:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

---

### 1.2 Styling

| Package | Version | Purpose | Install |
|---|---|---|---|
| tailwindcss | 3.4.4 | Utility CSS framework | `npm i -D tailwindcss` |
| postcss | 8.4.38 | CSS transformer | `npm i -D postcss` |
| autoprefixer | 10.4.19 | Vendor prefixes | `npm i -D autoprefixer` |

**`tailwind.config.js`:**
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B1426',
          900: '#0D1F3C',
          800: '#0F2A50',
          700: '#1E3A5F',
        },
        gold: {
          400: '#F5C842',
          500: '#F5A623',
          600: '#D4881C',
        },
        coral: '#FF4757',
        emerald: '#2ED573',
        sky: '#3A86FF',
        violet: '#7C3AED',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s infinite',
        'flip': 'flip 0.4s ease-in-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
        'thinking': 'thinking 1.5s infinite',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 166, 35, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(245, 166, 35, 0)' },
        },
        'flip': {
          '0%': { transform: 'rotateX(0deg)' },
          '50%': { transform: 'rotateX(-90deg)' },
          '100%': { transform: 'rotateX(0deg)' },
        },
        'slideInRight': {
          'from': { transform: 'translateX(100%)', opacity: 0 },
          'to': { transform: 'translateX(0)', opacity: 1 },
        },
        'fadeIn': {
          'from': { opacity: 0, transform: 'translateY(8px)' },
          'to': { opacity: 1, transform: 'translateY(0)' },
        },
        'thinking': {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 1 },
        }
      }
    }
  },
  plugins: []
}
```

**Custom CSS Variables (`src/styles/globals.css`):**
```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Core palette */
  --color-bg-primary:    #0B1426;
  --color-bg-secondary:  #0D1F3C;
  --color-bg-tertiary:   #0F2A50;
  --color-border:        #1E3A5F;
  --color-border-subtle: #162436;

  /* Accents */
  --color-gold:          #F5A623;
  --color-gold-dim:      rgba(245, 166, 35, 0.15);
  --color-coral:         #FF4757;
  --color-coral-dim:     rgba(255, 71, 87, 0.15);
  --color-emerald:       #2ED573;
  --color-sky:           #3A86FF;
  --color-violet:        #7C3AED;

  /* Agents */
  --agent-stats:         #3A86FF;
  --agent-strategist:    #2ED573;
  --agent-devil:         #FF4757;
  --agent-commentator:   #F5A623;

  /* Typography */
  --font-display:        'Bebas Neue', cursive;
  --font-body:           'IBM Plex Sans', sans-serif;
  --font-mono:           'IBM Plex Mono', monospace;
}

/* Scoreboard digit flip */
.digit-flip {
  display: inline-block;
  transition: transform 0.15s ease-in, opacity 0.15s ease-in;
}
.digit-flip.flipping {
  transform: rotateX(-90deg);
  opacity: 0;
}

/* Streaming text cursor */
.streaming-cursor::after {
  content: '▋';
  animation: blink 0.7s infinite;
  color: var(--color-gold);
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Agent glow effect when active */
.agent-active {
  box-shadow: 0 0 20px var(--agent-color, rgba(245, 166, 35, 0.3));
}
```

---

### 1.3 State Management

| Package | Version | Purpose | Install |
|---|---|---|---|
| zustand | 4.5.2 | Global state (match state, debate, session) | `npm i zustand` |
| immer | 10.0.4 | Immutable state helpers | `npm i immer` |

**Store Structure (`src/store/index.js`):**
```javascript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export const useMatchStore = create(immer((set) => ({
  // Match state (user input)
  matchState: {
    innings: 1, over: 1, ball: 0,
    score: 0, wickets: 0, target: null,
    battingTeam: null, bowlingTeam: null,
    strikerBatter: '', nonStrikerBatter: '',
    bowlers: [], pitch: 'flat', dew: 'none',
    venue: '', impactPlayerAvailable: true,
    strategicTimeoutUsed: false, phase: 'middle',
  },

  // Debate session
  session: {
    id: null,
    status: 'idle', // idle | loading | debating | complete | error
    factSheet: null,
    debateRounds: [],   // [{round, strategist, devil, revised}]
    finalDecision: null,
    commentary: null,
    confidenceScore: null,
    winProbBefore: null,
    winProbAfter: null,
    counterfactual: null,
  },

  // Over history
  history: [],         // past decisions per over

  // Active agent for UI animation
  activeAgent: null,   // 'stats_analyst' | 'strategist' | 'devils_advocate' | 'commentator'

  // Actions
  setMatchState: (partial) => set(state => { Object.assign(state.matchState, partial) }),
  setSessionStatus: (status) => set(state => { state.session.status = status }),
  setActiveAgent: (agent) => set(state => { state.activeAgent = agent }),
  appendDebateRound: (round) => set(state => { state.session.debateRounds.push(round) }),
  setFinalDecision: (decision) => set(state => { state.session.finalDecision = decision }),
  setCommentary: (text) => set(state => { state.session.commentary = text }),
  addToHistory: (entry) => set(state => { state.history.push(entry) }),
  resetSession: () => set(state => {
    state.session = { id: null, status: 'idle', factSheet: null,
      debateRounds: [], finalDecision: null, commentary: null,
      confidenceScore: null, winProbBefore: null, winProbAfter: null, counterfactual: null }
    state.activeAgent = null
  }),
})))
```

---

### 1.4 Routing

| Package | Version | Purpose | Install |
|---|---|---|---|
| react-router-dom | 6.23.1 | Client-side routing | `npm i react-router-dom` |

**Routes:**
```
/           → <LandingPage />
/match      → <MatchCommandCenter />   ← PRIMARY screen
/history    → <HistoryPage />          ← stretch
/about      → <AboutPage />            ← stretch
```

---

### 1.5 SSE / Streaming

**No external package needed.** Use native `EventSource` API + `fetch` with `ReadableStream`.

**`src/hooks/useDebateStream.js`:**
```javascript
import { useMatchStore } from '../store'

export function useDebateStream() {
  const { setActiveAgent, appendDebateRound, setFinalDecision,
          setCommentary, setSessionStatus, resetSession } = useMatchStore()

  const startDebate = async (matchState) => {
    resetSession()
    setSessionStatus('loading')

    const response = await fetch('/api/analyze/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchState),
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

      for (const line of lines) {
        const event = JSON.parse(line.slice(6))  // strip 'data: '
        handleEvent(event)
      }
    }
  }

  const handleEvent = (event) => {
    switch (event.type) {
      case 'agent_start':
        setActiveAgent(event.agent)
        setSessionStatus('debating')
        break
      case 'agent_token':
        // append to current agent's streaming buffer
        break
      case 'tool_call':
        // show tool call progress in Stats Analyst card
        break
      case 'debate_round':
        appendDebateRound(event.data)
        break
      case 'final_decision':
        setFinalDecision(event.data)
        break
      case 'commentary':
        setCommentary(event.data)
        setSessionStatus('complete')
        setActiveAgent(null)
        break
      case 'error':
        setSessionStatus('error')
        break
    }
  }

  return { startDebate }
}
```

---

### 1.6 Utility Packages

| Package | Version | Purpose | Install |
|---|---|---|---|
| clsx | 2.1.1 | Conditional className builder | `npm i clsx` |
| date-fns | 3.6.0 | Date formatting for timestamps | `npm i date-fns` |
| lucide-react | 0.383.0 | Icon library | `npm i lucide-react` |

---

### 1.7 Google Stitch Integration Notes

Stitch generates deployable web apps. Workflow with Stitch:

1. Use Stitch to scaffold the 3-column layout and all card components
2. Export the project (ZIP or GitHub integration)
3. Port any Stitch components to React if needed, OR use the HTML/JS Stitch exports directly with Vite
4. All post-Stitch hand-coding listed in Section 11.2 of Frontend Scheme doc

**Stitch ↔ Vite bridge:** If Stitch exports plain HTML+JS, embed it inside a React `dangerouslySetInnerHTML` wrapper temporarily, then refactor into proper components during Phase 3 of build.

---

### 1.8 Complete `package.json`

```json
{
  "name": "captain-cool-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .js,.jsx"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1",
    "zustand": "^4.5.2",
    "immer": "^10.0.4",
    "clsx": "^2.1.1",
    "lucide-react": "^0.383.0",
    "date-fns": "^3.6.0",
    "firebase": "^10.12.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.34.2",
    "eslint-plugin-react-hooks": "^4.6.2",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "vite": "^5.2.11"
  }
}
```

---

## 2. BACKEND LAYER

### 2.1 Runtime & Framework

| Package | Version | Purpose |
|---|---|---|
| Python | 3.11.9 | Runtime (3.11 required for ADK) |
| fastapi | 0.111.0 | ASGI web framework |
| uvicorn[standard] | 0.29.0 | ASGI server (dev) |
| gunicorn | 22.0.0 | Production WSGI/ASGI wrapper |
| pydantic | 2.7.1 | Data validation (bundled with FastAPI) |
| python-dotenv | 1.0.1 | .env file loading |
| python-multipart | 0.0.9 | Form data parsing |

---

### 2.2 Google AI / ADK Stack

| Package | Version | Purpose |
|---|---|---|
| google-adk | 0.5.0+ | Multi-agent orchestration framework |
| google-genai | 0.8.0+ | Official Gemini Python SDK |
| google-cloud-aiplatform | 1.58.0 | Vertex AI (optional hosting) |

**Critical install commands:**
```bash
pip install google-adk
pip install google-genai
# Verify ADK is installed correctly
python -c "from google.adk.agents import Agent; print('ADK OK')"
```

**ADK vs raw google-genai:** Use ADK for agent orchestration, multi-agent communication, and tool registration. Use raw `google-genai` only for low-level config (API key, model params).

---

### 2.3 HTTP Clients & Data Tools

| Package | Version | Purpose |
|---|---|---|
| httpx | 0.27.0 | Async HTTP client (cricket API calls) |
| httpx[http2] | 0.27.0 | HTTP/2 support |
| aiohttp | 3.9.5 | Async HTTP (alternative for streaming) |
| beautifulsoup4 | 4.12.3 | HTML parsing (Cricbuzz fallback scraper) |
| lxml | 5.2.2 | Fast XML/HTML parser (bs4 backend) |

---

### 2.4 Firebase / Database

| Package | Version | Purpose |
|---|---|---|
| firebase-admin | 6.5.0 | Server-side Firestore access |

**Firestore Collections:**
```
/sessions/{session_id}
  - created_at: timestamp
  - match_state: object
  - status: 'idle' | 'complete' | 'error'
  - fact_sheet: object
  - debate_rounds: array
  - final_decision: object
  - commentary: string
  - confidence_score: float
  - win_prob_before: float
  - win_prob_after: float

/sessions/{session_id}/history/{over_key}
  - over: int
  - decision: string
  - reasoning: string
  - timestamp: timestamp
```

---

### 2.5 Async & Performance

| Package | Version | Purpose |
|---|---|---|
| anyio | 4.4.0 | Async compatibility layer |
| asyncio | stdlib | Async runtime |
| sse-starlette | 2.1.0 | Server-Sent Events for FastAPI |

**`sse-starlette` for streaming debate output:**
```python
from sse_starlette.sse import EventSourceResponse
import asyncio

@app.post("/api/analyze/stream")
async def analyze_stream(match_state: MatchStateRequest):
    async def event_generator():
        async for event in orchestrator.run_debate(match_state):
            yield {
                "event": event["type"],
                "data": json.dumps(event["data"])
            }
    return EventSourceResponse(event_generator())
```

---

### 2.6 Utility Packages

| Package | Version | Purpose |
|---|---|---|
| pydantic-settings | 2.3.0 | Settings management from env |
| structlog | 24.1.0 | Structured logging (ADK trace-friendly) |
| tenacity | 8.4.1 | Retry logic for API calls |
| cachetools | 5.3.3 | In-memory caching (win prob calcs) |
| python-jose | 3.3.0 | JWT handling for session tokens |
| ruff | 0.4.9 | Linting + formatting |

---

### 2.7 Complete `requirements.txt`

```
# ── Core Web Framework ─────────────────────────────────────────
fastapi==0.111.0
uvicorn[standard]==0.29.0
gunicorn==22.0.0
python-multipart==0.0.9
sse-starlette==2.1.0

# ── Google AI Stack ────────────────────────────────────────────
google-adk>=0.5.0
google-genai>=0.8.0
google-cloud-aiplatform==1.58.0

# ── Firebase / Database ────────────────────────────────────────
firebase-admin==6.5.0

# ── HTTP Clients ───────────────────────────────────────────────
httpx[http2]==0.27.0
aiohttp==3.9.5

# ── HTML/Scraping ──────────────────────────────────────────────
beautifulsoup4==4.12.3
lxml==5.2.2

# ── Data & Validation ──────────────────────────────────────────
pydantic==2.7.1
pydantic-settings==2.3.0
python-dotenv==1.0.1

# ── Utilities ──────────────────────────────────────────────────
structlog==24.1.0
tenacity==8.4.1
cachetools==5.3.3
python-jose[cryptography]==3.3.0
anyio==4.4.0

# ── Dev/Lint ───────────────────────────────────────────────────
ruff==0.4.9
```

---

## 3. GOOGLE AI STACK — DEEP SPEC

### 3.1 Models

| Agent | Model ID | Reason |
|---|---|---|
| Stats Analyst | `gemini-2.5-flash-preview-04-17` | Speed + tool calling. Flash is 5x cheaper. |
| Strategist | `gemini-2.5-pro-preview-05-06` | Deep reasoning, extended thinking ON |
| Devil's Advocate | `gemini-2.5-pro-preview-05-06` | Needs same depth as Strategist |
| Commentator | `gemini-2.5-flash-preview-04-17` | Output formatting only; Flash sufficient |

**Model config per agent:**
```python
# Stats Analyst — fast, tool-focused
STATS_CONFIG = {
    "model": "gemini-2.5-flash-preview-04-17",
    "temperature": 0.1,    # Low — factual outputs only
    "max_output_tokens": 2048,
    "top_p": 0.95,
}

# Strategist — deep reasoning, some creativity
STRATEGIST_CONFIG = {
    "model": "gemini-2.5-pro-preview-05-06",
    "temperature": 0.7,    # Mid — creative but grounded
    "max_output_tokens": 4096,
    "top_p": 0.95,
    "thinking_config": {   # Gemini 2.5 extended thinking
        "thinking_budget": 8192
    }
}

# Devil's Advocate — adversarial, needs divergent thinking
DEVIL_CONFIG = {
    "model": "gemini-2.5-pro-preview-05-06",
    "temperature": 0.9,    # High — generate strong counter-arguments
    "max_output_tokens": 4096,
    "top_p": 0.97,
}

# Commentator — broadcast language output
COMMENTATOR_CONFIG = {
    "model": "gemini-2.5-flash-preview-04-17",
    "temperature": 0.8,    # Some flair
    "max_output_tokens": 2048,
}
```

---

### 3.2 ADK Agent Definitions

```python
# backend/agents/stats_analyst.py
from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool
from backend.tools.cricket_api import fetch_live_scorecard
from backend.tools.weather import get_weather_dew
from backend.tools.win_probability import calculate_win_probability
from backend.tools.matchup import get_player_matchup
from backend.prompts import STATS_ANALYST_PROMPT

stats_analyst = LlmAgent(
    name="stats_analyst",
    model="gemini-2.5-flash-preview-04-17",
    instruction=STATS_ANALYST_PROMPT,
    tools=[
        FunctionTool(fetch_live_scorecard),
        FunctionTool(get_weather_dew),
        FunctionTool(calculate_win_probability),
        FunctionTool(get_player_matchup),
    ],
    generate_content_config={
        "temperature": 0.1,
        "max_output_tokens": 2048,
    }
)
```

```python
# backend/agents/strategist.py
from google.adk.agents import LlmAgent
from backend.prompts import STRATEGIST_PROMPT

strategist = LlmAgent(
    name="strategist",
    model="gemini-2.5-pro-preview-05-06",
    instruction=STRATEGIST_PROMPT,
    tools=[],
    generate_content_config={
        "temperature": 0.7,
        "max_output_tokens": 4096,
        "thinking_config": {"thinking_budget": 8192}
    }
)
```

```python
# backend/agents/devils_advocate.py
from google.adk.agents import LlmAgent
from backend.prompts import DEVILS_ADVOCATE_PROMPT

devils_advocate = LlmAgent(
    name="devils_advocate",
    model="gemini-2.5-pro-preview-05-06",
    instruction=DEVILS_ADVOCATE_PROMPT,
    tools=[],
    generate_content_config={
        "temperature": 0.9,
        "max_output_tokens": 4096,
    }
)
```

```python
# backend/agents/commentator.py
from google.adk.agents import LlmAgent
from backend.prompts import COMMENTATOR_PROMPT

commentator = LlmAgent(
    name="commentator",
    model="gemini-2.5-flash-preview-04-17",
    instruction=COMMENTATOR_PROMPT,
    tools=[],
    generate_content_config={
        "temperature": 0.8,
        "max_output_tokens": 2048,
    }
)
```

---

### 3.3 ADK Orchestrator (Multi-Turn Debate Loop)

```python
# backend/orchestrator.py
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
import asyncio, uuid, json

class DebateOrchestrator:

    def __init__(self):
        self.session_service = InMemorySessionService()
        self.APP_NAME = "captain_cool"

    async def run_debate(self, match_state: dict):
        """Generator: yields SSE events as debate progresses."""

        session_id = str(uuid.uuid4())
        session = self.session_service.create_session(
            app_name=self.APP_NAME,
            user_id="match_session",
            session_id=session_id
        )

        # ── PHASE 1: Stats Analyst ──────────────────────────────────
        yield {"type": "agent_start", "agent": "stats_analyst", "data": {}}

        stats_runner = Runner(
            agent=stats_analyst,
            app_name=self.APP_NAME,
            session_service=self.session_service
        )
        fact_sheet = None
        async for event in stats_runner.run_async(
            user_id="match_session",
            session_id=session_id,
            new_message={"role": "user", "parts": [{"text": json.dumps(match_state)}]}
        ):
            if event.is_final_response():
                fact_sheet = event.content.parts[0].text
                yield {"type": "tool_result", "agent": "stats_analyst", "data": fact_sheet}

        # ── PHASE 2: Debate Rounds (max 2) ─────────────────────────
        strategist_proposal = None
        for round_num in range(1, 3):

            # Strategist turn
            yield {"type": "agent_start", "agent": "strategist", "data": {"round": round_num}}
            strategist_input = f"FACT SHEET:\n{fact_sheet}\n\nPREVIOUS DEBATE:\n{strategist_proposal or 'None (Round 1)'}"

            strat_runner = Runner(agent=strategist, app_name=self.APP_NAME,
                                  session_service=self.session_service)
            async for event in strat_runner.run_async(
                user_id="match_session", session_id=session_id,
                new_message={"role": "user", "parts": [{"text": strategist_input}]}
            ):
                if event.content:
                    for part in event.content.parts:
                        if hasattr(part, 'text') and part.text:
                            yield {"type": "agent_token", "agent": "strategist", "data": part.text}
                if event.is_final_response():
                    strategist_proposal = event.content.parts[0].text

            # Devil's Advocate turn
            yield {"type": "agent_start", "agent": "devils_advocate", "data": {"round": round_num}}
            devil_input = f"STRATEGIST PROPOSAL:\n{strategist_proposal}"

            devil_runner = Runner(agent=devils_advocate, app_name=self.APP_NAME,
                                  session_service=self.session_service)
            devil_response = None
            async for event in devil_runner.run_async(
                user_id="match_session", session_id=session_id,
                new_message={"role": "user", "parts": [{"text": devil_input}]}
            ):
                if event.content:
                    for part in event.content.parts:
                        if hasattr(part, 'text') and part.text:
                            yield {"type": "agent_token", "agent": "devils_advocate", "data": part.text}
                if event.is_final_response():
                    devil_response = event.content.parts[0].text

            yield {
                "type": "debate_round",
                "data": {
                    "round": round_num,
                    "strategist": strategist_proposal,
                    "devil": devil_response
                }
            }

            # Check if devil conceded — break early
            if "CONCEDE" in (devil_response or "").upper() or "AGREE" in (devil_response or "").upper():
                break

        # ── PHASE 3: Final lock-in & Commentary ────────────────────
        yield {"type": "agent_start", "agent": "commentator", "data": {}}

        commentary_input = f"""
FINAL DECISION: {strategist_proposal}
FACT SHEET: {fact_sheet}
DEBATE TRANSCRIPT: [Full debate above]
FORMAT: Cricket broadcast commentary.
"""
        comm_runner = Runner(agent=commentator, app_name=self.APP_NAME,
                             session_service=self.session_service)
        final_commentary = ""
        async for event in comm_runner.run_async(
            user_id="match_session", session_id=session_id,
            new_message={"role": "user", "parts": [{"text": commentary_input}]}
        ):
            if event.content:
                for part in event.content.parts:
                    if hasattr(part, 'text') and part.text:
                        yield {"type": "agent_token", "agent": "commentator", "data": part.text}
                        final_commentary += part.text
            if event.is_final_response():
                yield {"type": "commentary", "data": final_commentary}

        yield {"type": "session_complete", "data": {"session_id": session_id}}
```

---

### 3.4 Gemini Function Calling Schema

```python
# backend/tools/definitions.py
from google.genai import types

TOOLS_SCHEMA = types.Tool(
    function_declarations=[
        types.FunctionDeclaration(
            name="fetch_live_scorecard",
            description="Fetch live IPL match scorecard. Returns current score, wickets, over, batting/bowling lineups.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "match_id": types.Schema(
                        type=types.Type.STRING,
                        description="Sportmonks or Cricbuzz match ID"
                    ),
                    "source": types.Schema(
                        type=types.Type.STRING,
                        enum=["sportmonks", "cricbuzz", "mock"],
                        description="Data source to use"
                    )
                },
                required=["match_id"]
            )
        ),
        types.FunctionDeclaration(
            name="calculate_win_probability",
            description="Calculate T20 win probability. Returns probability 0.0-1.0 for batting team.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "innings": types.Schema(type=types.Type.INTEGER, description="1 or 2"),
                    "balls_remaining": types.Schema(type=types.Type.INTEGER),
                    "runs_required": types.Schema(type=types.Type.INTEGER, description="0 for 1st innings"),
                    "wickets_in_hand": types.Schema(type=types.Type.INTEGER),
                    "current_score": types.Schema(type=types.Type.INTEGER),
                    "pitch_factor": types.Schema(type=types.Type.NUMBER, description="0.7 (turning) to 1.2 (flat)"),
                    "dew_factor": types.Schema(type=types.Type.BOOLEAN, description="Is dew affecting play?"),
                    "venue": types.Schema(type=types.Type.STRING, description="Ground name for historical baseline"),
                },
                required=["innings", "balls_remaining", "wickets_in_hand", "current_score"]
            )
        ),
        types.FunctionDeclaration(
            name="get_player_matchup",
            description="Get T20 head-to-head stats: batter vs bowler. Returns SR, avg, dismissals.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "batter_name": types.Schema(type=types.Type.STRING),
                    "bowler_name": types.Schema(type=types.Type.STRING),
                    "phase": types.Schema(
                        type=types.Type.STRING,
                        enum=["powerplay", "middle", "death"],
                        description="Phase of match"
                    ),
                    "tournament": types.Schema(type=types.Type.STRING, description="e.g. IPL 2024")
                },
                required=["batter_name", "bowler_name"]
            )
        ),
        types.FunctionDeclaration(
            name="get_weather_dew",
            description="Get current weather and dew probability at the venue.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "venue": types.Schema(type=types.Type.STRING, description="Stadium name + city"),
                    "match_time_local": types.Schema(type=types.Type.STRING, description="ISO8601 datetime")
                },
                required=["venue"]
            )
        ),
    ]
)
```

---

### 3.5 Gemini Context Caching (Multi-Over Memory)

```python
# backend/memory/context_cache.py
from google import genai
from google.genai import types
import datetime

client = genai.Client()

def create_match_cache(match_context: str, ttl_minutes: int = 30) -> str:
    """Create a cached context for the current match. Returns cache name."""

    cache = client.caches.create(
        model="gemini-2.5-flash-preview-04-17",
        config=types.CreateCachedContentConfig(
            system_instruction="You are a cricket statistics database. This is the running match context.",
            contents=[match_context],
            ttl=datetime.timedelta(minutes=ttl_minutes),
            display_name="captain_cool_match_context"
        )
    )
    return cache.name  # Save this ID in Firestore per session

def get_cached_client(cache_name: str):
    """Get a model instance using an existing cache."""
    return client.models.generate_content(
        model="gemini-2.5-flash-preview-04-17",
        cached_content=cache_name,
        contents="Update: what are the latest stats?"
    )
```

**When to cache:** After the first Stats Analyst call, cache the fact-sheet + match context. All subsequent rounds (Strategist, Devil's Advocate) receive this cache, reducing token cost by ~70% per round.

---

### 3.6 Gemini URL Context Tool (Cricbuzz Scrape)

```python
# backend/tools/cricket_api.py
from google import genai
from google.genai import types

client = genai.Client()

async def scrape_cricbuzz_url(url: str) -> dict:
    """Use Gemini's URL context tool to scrape live Cricbuzz match data."""

    response = client.models.generate_content(
        model="gemini-2.5-flash-preview-04-17",
        contents=types.Content(
            parts=[
                types.Part(file_data=types.FileData(file_uri=url)),
                types.Part(text="""
Extract the following from this cricket scorecard page.
Return ONLY valid JSON with these fields:
{
  "innings": int, "over": float, "score": int, "wickets": int,
  "target": int | null, "batting_team": string, "bowling_team": string,
  "striker": string, "non_striker": string, "last_bowler": string,
  "required_run_rate": float | null, "run_rate": float
}
No markdown, no explanation, JSON only.
""")
            ]
        )
    )
    return json.loads(response.text)
```

---

## 4. EXTERNAL APIs & DATA LAYER

### 4.1 Cricket Data APIs

#### Primary: Sportmonks Cricket API v2
```
Base URL:     https://cricket.sportmonks.com/api/v2.0
Auth:         ?api_token={SPORTMONKS_API_KEY}
Free Tier:    500 req/day — sufficient for hackathon demo

Key Endpoints:
  GET /fixtures?filter[status]=started          → Live matches
  GET /fixtures/{match_id}?include=batting,bowling,scoreboards
  GET /fixtures/{match_id}/scoreboards
  GET /players/{player_id}                      → Player profile
```

#### Fallback: cricapi.com (free tier)
```
Base URL:     https://api.cricapi.com/v1
Auth:         ?apikey={CRICAPI_KEY}
Free Tier:    100 req/day

Key Endpoints:
  GET /currentMatches?apikey=KEY
  GET /match_info?apikey=KEY&id={match_id}
```

#### Fallback 2: Mock JSON
```python
# backend/tools/mock_data.py
MOCK_SCORECARD = {
    "match_id": "demo_001",
    "innings": 2,
    "over": 16.2,
    "score": 134,
    "wickets": 4,
    "target": 178,
    "rrr": 11.2,
    "batting_team": "MI",
    "bowling_team": "CSK",
    "striker": {"name": "Hardik Pandya", "runs": 34, "balls": 22, "sr": 154.5},
    "non_striker": {"name": "Tim David", "runs": 8, "balls": 5, "sr": 160.0},
    "bowlers": [
        {"name": "Deepak Chahar", "overs": 3, "runs": 28, "wickets": 1},
        {"name": "Pathirana", "overs": 2, "runs": 19, "wickets": 2},
    ],
    "pitch": "two_paced",
    "dew": "heavy",
    "venue": "Wankhede"
}
```

**API Selection Logic:**
```python
async def fetch_live_scorecard(match_id: str, source: str = "auto") -> dict:
    if source == "mock":
        return MOCK_SCORECARD
    try:
        return await _sportmonks_fetch(match_id)
    except Exception:
        try:
            return await _cricapi_fetch(match_id)
        except Exception:
            return MOCK_SCORECARD  # Never fail the demo
```

---

### 4.2 Weather API (OpenWeatherMap)

```
Base URL:   https://api.openweathermap.org/data/2.5
Auth:       ?appid={OPENWEATHERMAP_KEY}
Free Tier:  1,000 req/day

Endpoint Used:
  GET /weather?q={city_name}&appid={KEY}

Dew factor derived from:
  - humidity > 80% AND temp < 25°C → heavy dew likely
  - humidity 60-80% → moderate dew
  - humidity < 60% → no dew
```

```python
# backend/tools/weather.py
import httpx

IPL_VENUE_CITIES = {
    "Wankhede Stadium, Mumbai": "Mumbai",
    "Eden Gardens, Kolkata": "Kolkata",
    "M. A. Chidambaram Stadium, Chennai": "Chennai",
    "M. Chinnaswamy Stadium, Bengaluru": "Bangalore",
    "Arun Jaitley Stadium, Delhi": "Delhi",
    # ... full list in constants/venues.py
}

async def get_weather_dew(venue: str, match_time_local: str = None) -> dict:
    city = IPL_VENUE_CITIES.get(venue, venue.split(",")[-1].strip())
    url = f"https://api.openweathermap.org/data/2.5/weather"

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params={
            "q": city, "appid": settings.OPENWEATHERMAP_KEY, "units": "metric"
        })
        data = response.json()

    humidity = data["main"]["humidity"]
    temp = data["main"]["temp"]
    dew_factor = "heavy" if (humidity > 80 and temp < 25) else \
                 "moderate" if humidity > 60 else "none"

    return {
        "venue": venue, "city": city,
        "humidity": humidity, "temp_c": temp,
        "dew_factor": dew_factor,
        "wind_kmh": round(data["wind"]["speed"] * 3.6, 1),
        "conditions": data["weather"][0]["description"]
    }
```

---

### 4.3 Win Probability Calculator (Custom)

```python
# backend/tools/win_probability.py
# DLS-inspired T20 win probability model
# Based on historical IPL scoring patterns

import math
from functools import lru_cache

# Resources available: (balls_remaining, wickets_in_hand) → avg_score_achievable
# Derived from IPL 2019-2024 match data patterns
T20_RESOURCE_TABLE = {
    (120, 10): 1.00, (60, 10): 0.67, (30, 10): 0.43,
    (120, 7): 0.83, (60, 7): 0.54, (30, 7): 0.34,
    (120, 5): 0.62, (60, 5): 0.40, (30, 5): 0.25,
    (120, 3): 0.35, (60, 3): 0.23, (30, 3): 0.14,
    # Interpolate for values in between
}

PITCH_FACTOR = {"flat": 1.15, "two_paced": 1.00, "turning": 0.85}
DEW_FACTOR = {"heavy": 1.10, "moderate": 1.04, "none": 1.00}
VENUE_BASELINE = {
    "Wankhede": 175, "Eden Gardens": 168, "Chinnaswamy": 185,
    "Wankhede Stadium, Mumbai": 175,  # match the venue string format
}

def calculate_win_probability(
    innings: int,
    balls_remaining: int,
    wickets_in_hand: int,
    current_score: int,
    runs_required: int = 0,
    pitch_factor: float = 1.0,
    dew_factor: bool = False,
    venue: str = "generic"
) -> dict:

    if innings == 1:
        # 1st innings: project final score, return team advantage
        resource_pct = _interpolate_resources(balls_remaining, wickets_in_hand)
        baseline = VENUE_BASELINE.get(venue, 170)
        projected_final = current_score + (baseline * resource_pct * pitch_factor)
        win_prob = min(0.95, max(0.05, 0.5 + (projected_final - 165) / 80))
        return {
            "innings": 1,
            "projected_score": round(projected_final),
            "batting_team_advantage": round(win_prob, 3),
            "resource_remaining_pct": round(resource_pct * 100, 1)
        }
    else:
        # 2nd innings: chase situation
        if runs_required <= 0:
            return {"innings": 2, "win_probability": 1.0, "result": "already won"}

        dew_mult = 1.08 if dew_factor else 1.00
        effective_rr = runs_required / (balls_remaining / 6)
        achievable_rr = _max_achievable_rr(balls_remaining, wickets_in_hand)
        achievable_rr *= pitch_factor * dew_mult

        ratio = achievable_rr / max(effective_rr, 0.1)
        win_prob = 1 / (1 + math.exp(-3.5 * (ratio - 1)))
        win_prob = min(0.97, max(0.03, win_prob))

        return {
            "innings": 2,
            "win_probability": round(win_prob, 3),
            "required_run_rate": round(effective_rr, 2),
            "achievable_run_rate": round(achievable_rr, 2),
            "difficulty": "easy" if win_prob > 0.7 else "tight" if win_prob > 0.4 else "hard"
        }

def _interpolate_resources(balls: int, wickets: int) -> float:
    closest = min(T20_RESOURCE_TABLE.keys(),
                  key=lambda k: abs(k[0]-balls) + abs(k[1]-wickets)*10)
    return T20_RESOURCE_TABLE[closest]

def _max_achievable_rr(balls: int, wickets: int) -> float:
    resource_pct = _interpolate_resources(balls, wickets)
    return resource_pct * 14.5  # IPL max scoring rate ceiling
```

---

## 5. DATABASE — FIREBASE FIRESTORE

### 5.1 Setup

```python
# backend/database/firebase_config.py
import firebase_admin
from firebase_admin import credentials, firestore

def init_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate("firebase-service-account.json")
        firebase_admin.initialize_app(cred)
    return firestore.client()

db = init_firebase()
```

### 5.2 Session Operations

```python
# backend/database/sessions.py
from backend.database.firebase_config import db
from google.cloud.firestore import SERVER_TIMESTAMP

async def create_session(session_id: str, match_state: dict) -> str:
    doc_ref = db.collection("sessions").document(session_id)
    doc_ref.set({
        "created_at": SERVER_TIMESTAMP,
        "match_state": match_state,
        "status": "processing",
    })
    return session_id

async def update_session(session_id: str, data: dict):
    db.collection("sessions").document(session_id).update(data)

async def save_over_decision(session_id: str, over: int, decision: dict):
    db.collection("sessions").document(session_id) \
      .collection("history").document(f"over_{over:02d}").set({
        **decision, "timestamp": SERVER_TIMESTAMP
    })

async def get_session_history(session_id: str) -> list:
    docs = db.collection("sessions").document(session_id) \
              .collection("history").order_by("timestamp").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]
```

### 5.3 Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow read: if true;   // Public read for demo
      allow write: if false; // Backend-only writes (service account)

      match /history/{overId} {
        allow read: if true;
      }
    }
  }
}
```

---

## 6. HOSTING & DEPLOYMENT

### 6.1 Backend — Cloud Run

**`Dockerfile`:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    gcc libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application
COPY backend/ ./backend/
COPY firebase-service-account.json .

# Runtime
EXPOSE 8080
CMD ["gunicorn", "backend.main:app", \
     "--workers", "1", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8080", \
     "--timeout", "120"]
```

**Deploy commands:**
```bash
# Build and push to Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev
docker build -t captain-cool-api .
docker tag captain-cool-api us-central1-docker.pkg.dev/{PROJECT_ID}/captain-cool/api:latest
docker push us-central1-docker.pkg.dev/{PROJECT_ID}/captain-cool/api:latest

# Deploy to Cloud Run
gcloud run deploy captain-cool-api \
  --image us-central1-docker.pkg.dev/{PROJECT_ID}/captain-cool/api:latest \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 120 \
  --set-env-vars "GEMINI_API_KEY=${GEMINI_API_KEY},SPORTMONKS_KEY=${SPORTMONKS_KEY}"
```

### 6.2 Frontend — Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools
firebase login

# Initialize
firebase init hosting
# Select: existing project, public dir = dist, SPA = yes

# Build and deploy
npm run build
firebase deploy --only hosting
```

**`firebase.json`:**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "**/*.js",
        "headers": [{ "key": "Cache-Control", "value": "max-age=31536000" }]
      }
    ]
  }
}
```

---

## 7. ENVIRONMENT VARIABLES

### 7.1 `.env.example` (Backend)

```bash
# ── Google AI ──────────────────────────────────────────────────
GEMINI_API_KEY=AIzaSy...                  # From aistudio.google.com
GOOGLE_CLOUD_PROJECT=captain-cool-prod

# ── Cricket Data APIs ──────────────────────────────────────────
SPORTMONKS_API_KEY=your_sportmonks_key    # sportmonks.com
CRICAPI_KEY=your_cricapi_key              # cricapi.com
USE_MOCK_DATA=false                       # Set true for offline demo

# ── Weather ────────────────────────────────────────────────────
OPENWEATHERMAP_KEY=your_owm_key           # openweathermap.org

# ── Firebase ───────────────────────────────────────────────────
FIREBASE_PROJECT_ID=captain-cool-prod
GOOGLE_APPLICATION_CREDENTIALS=firebase-service-account.json

# ── Server ─────────────────────────────────────────────────────
PORT=8000
ENV=development                           # development | production
CORS_ORIGINS=http://localhost:3000,https://captain-cool.web.app

# ── Limits ─────────────────────────────────────────────────────
MAX_DEBATE_ROUNDS=2
DEBATE_TIMEOUT_SECONDS=45
GEMINI_CACHE_TTL_MINUTES=30
```

### 7.2 Frontend `.env.example`

```bash
VITE_API_BASE_URL=http://localhost:8000   # Dev: local, Prod: Cloud Run URL
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_PROJECT_ID=captain-cool-prod
VITE_FIREBASE_APP_ID=1:...
VITE_ENABLE_VOICE=false                  # Stretch feature flag
```

---

## 8. FASTAPI SERVER STRUCTURE

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.routes import analyze, scrape, sessions, health
from backend.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Captain Cool API starting...")
    yield
    print("Captain Cool API shutting down.")

app = FastAPI(
    title="Captain Cool API",
    description="Multi-agent IPL tactical strategist powered by Google Gemini",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api")
app.include_router(scrape.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(health.router, prefix="/api")
```

### API Routes Summary

| Route | Method | Body | Response |
|---|---|---|---|
| `/api/analyze/stream` | POST | `MatchStateRequest` | SSE stream of debate events |
| `/api/analyze` | POST | `MatchStateRequest` | Full JSON (non-streaming fallback) |
| `/api/scrape` | POST | `{"url": "cricbuzz_url"}` | `MatchStateRequest` JSON |
| `/api/session/{id}` | GET | — | Session + debate transcript |
| `/api/session/{id}/history` | GET | — | Over-by-over decision log |
| `/api/health` | GET | — | `{"status": "ok", "model": "gemini-2.5-pro"}` |

### Pydantic Request Models

```python
# backend/models.py
from pydantic import BaseModel
from typing import Optional, List

class BowlerEntry(BaseModel):
    name: str
    overs_used: float

class BatterEntry(BaseModel):
    name: str
    runs: Optional[int] = 0
    balls: Optional[int] = 0

class MatchStateRequest(BaseModel):
    innings: int                      # 1 or 2
    over: int                         # 1-20
    ball: int                         # 0-5
    score: int
    wickets: int
    target: Optional[int] = None      # Only for innings 2
    batting_team: str                 # e.g. "MI"
    bowling_team: str                 # e.g. "CSK"
    striker: BatterEntry
    non_striker: BatterEntry
    bowlers: List[BowlerEntry]
    pitch: str = "flat"               # flat | two_paced | turning
    dew: str = "none"                 # none | moderate | heavy
    venue: str = "Wankhede"
    impact_player_available: bool = True
    strategic_timeout_used: bool = False
    phase: str = "middle"             # powerplay | middle | death
    session_id: Optional[str] = None  # For continuing a match session
    cricbuzz_url: Optional[str] = None  # Stretch: auto-fill from URL
```

---

## 9. DEVELOPMENT TOOLING

### 9.1 Google Antigravity
- **Primary dev environment** for the 3-hour build session
- All commits made through Antigravity must be reflected in `.antigravity/` folder
- Judges check for Antigravity traces in the repository
- Use Antigravity's built-in Gemini code gen for agent boilerplate

### 9.2 Google AI Studio
- Use for prompt prototyping BEFORE writing Python code
- Test each agent's system prompt with sample match inputs
- Share prompt links publicly — include in dev.to blog
- Use AI Studio's streaming preview to validate response quality

### 9.3 Local Development Flow

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Fill in API keys
uvicorn backend.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev               # http://localhost:3000
```

### 9.4 Testing the Debate Loop (CLI First)

Before wiring to FastAPI, test the ADK orchestrator directly:
```bash
python -c "
import asyncio
from backend.orchestrator import DebateOrchestrator
from backend.models import MatchStateRequest

match = MatchStateRequest(
    innings=2, over=16, ball=2,
    score=134, wickets=4, target=178,
    batting_team='MI', bowling_team='CSK',
    striker={'name': 'Hardik Pandya', 'runs': 34, 'balls': 22},
    non_striker={'name': 'Tim David', 'runs': 8, 'balls': 5},
    bowlers=[{'name': 'Pathirana', 'overs_used': 2}, {'name': 'Chahar', 'overs_used': 3}],
    pitch='two_paced', dew='heavy', venue='Wankhede', phase='death'
)

orch = DebateOrchestrator()

async def test():
    async for event in orch.run_debate(match.dict()):
        print(f'[{event[\"type\"]}]', str(event.get('data', ''))[:100])

asyncio.run(test())
"
```

---

## 10. REPOSITORY STRUCTURE (COMPLETE)

```
captain-cool/
│
├── .antigravity/                    # MANDATORY — Antigravity session traces
│   ├── session_001.json
│   ├── session_002.json
│   └── agent_traces/
│       ├── trace_stats_analyst.json
│       └── trace_debate_loop.json
│
├── backend/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── stats_analyst.py         # LlmAgent definition
│   │   ├── strategist.py
│   │   ├── devils_advocate.py
│   │   └── commentator.py
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── cricket_api.py           # Sportmonks + fallback
│   │   ├── win_probability.py       # Custom DLS model
│   │   ├── weather.py               # OpenWeatherMap
│   │   ├── matchup.py               # Player head-to-head
│   │   ├── definitions.py           # Gemini FunctionDeclaration schemas
│   │   └── mock_data.py             # Demo fallback data
│   ├── database/
│   │   ├── __init__.py
│   │   ├── firebase_config.py
│   │   └── sessions.py
│   ├── memory/
│   │   ├── __init__.py
│   │   └── context_cache.py         # Gemini context caching
│   ├── prompts/
│   │   ├── stats_analyst.txt
│   │   ├── strategist.txt
│   │   ├── devils_advocate.txt
│   │   └── commentator.txt
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── analyze.py               # /api/analyze/stream
│   │   ├── scrape.py                # /api/scrape
│   │   ├── sessions.py              # /api/session
│   │   └── health.py
│   ├── __init__.py
│   ├── config.py                    # Pydantic settings
│   ├── models.py                    # Pydantic request/response models
│   ├── main.py                      # FastAPI app
│   └── orchestrator.py              # ADK debate loop
│
├── frontend/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── ScoreboardStrip/
│   │   │   │   └── index.jsx
│   │   │   ├── MatchInputForm/
│   │   │   │   ├── index.jsx
│   │   │   │   ├── BowlerTable.jsx
│   │   │   │   └── PillToggle.jsx
│   │   │   ├── AgentCard/
│   │   │   │   └── index.jsx
│   │   │   ├── DebateTheater/
│   │   │   │   └── index.jsx
│   │   │   ├── CaptainCallCard/
│   │   │   │   └── index.jsx
│   │   │   ├── WinProbGauge/
│   │   │   │   └── index.jsx
│   │   │   └── shared/
│   │   │       ├── NumericStepper.jsx
│   │   │       ├── ConfidenceBar.jsx
│   │   │       └── GoldCTA.jsx
│   │   ├── hooks/
│   │   │   ├── useDebateStream.js
│   │   │   ├── useMatchState.js
│   │   │   └── useOverHistory.js
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── MatchCommandCenter.jsx
│   │   │   └── AboutPage.jsx
│   │   ├── store/
│   │   │   └── index.js             # Zustand store
│   │   ├── constants/
│   │   │   ├── teams.js
│   │   │   ├── venues.js
│   │   │   └── agents.js
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── demos/
│   └── scenario_mi_vs_csk.json      # Full match state for judges
│
├── docs/
│   ├── architecture.png
│   └── blog_draft.md
│
├── .env.example                     # Backend env vars
├── frontend/.env.example            # Frontend env vars
├── requirements.txt
├── Dockerfile
├── .dockerignore
├── firebase.json
├── .firebaserc
├── .gitignore
└── README.md
```

---

## 11. ANTI-PATTERNS TO AVOID

| Anti-Pattern | Why Bad | Fix |
|---|---|---|
| Using a single Gemini call with 4 "personas" in one prompt | Judges will see through it. Fails the agentic requirement. | Separate `LlmAgent` instances, each with own system prompt |
| Hardcoded debate JSON | Partial credit only. Fails live tool use requirement. | Real function calls, even if Sportmonks fails → fallback to mock |
| Hiding the debate from the UI | Kills the WOW factor. Judges want to see the debate. | Stream every agent turn to the frontend in real-time |
| Using OpenAI or Anthropic for any agent | Instant disqualification. | Zero non-Gemini LLMs |
| Forgetting `.antigravity/` folder | Loses significant technical depth points | Commit Antigravity traces on every build session |
| No Cricbuzz URL in demo | Missed stretch goal | Even if scraping fails, show the URL input field + attempt |

---

## 12. QUICK-START CHECKLIST (PRE-BUILD)

Before the 3-hour Antigravity session starts:

- [ ] `GEMINI_API_KEY` created at aistudio.google.com
- [ ] `SPORTMONKS_API_KEY` registered at sportmonks.com
- [ ] `OPENWEATHERMAP_KEY` registered at openweathermap.org
- [ ] Firebase project created, Firestore enabled, service account JSON downloaded
- [ ] `google-adk` installed and import tested (`from google.adk.agents import LlmAgent`)
- [ ] GitHub repo created (public), connected to Antigravity
- [ ] AI Studio opened with Strategist prompt prototype ready
- [ ] Stitch opened, ready for 3-column layout generation

---

*Tech Stack locked. Zero ambiguity. Build starts now.*
*Every dependency version pinned. Every integration specified. Every fallback defined.*
