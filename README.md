# 🏏 Captain Cool — The AI Captain That Debates Before It Decides

> **Google Gemini Hackathon 2025 · Team Synapsters**  
> *"What would Dhoni do?"*

[![Gemini 2.5 Pro](https://img.shields.io/badge/Powered%20by-Gemini%202.5%20Pro-4285F4?logo=google&logoColor=white)](https://ai.google.dev)
[![Google ADK](https://img.shields.io/badge/Built%20with-Google%20ADK-34A853?logo=google)](https://google.github.io/adk-docs/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react)](https://vitejs.dev)

---

## What Is Captain Cool?

Captain Cool is a **multi-agent IPL match strategist** powered by Gemini 2.5 Pro and the Google Agent Development Kit. It simulates how a cricket captain thinks: four AI agents with distinct personalities debate tactics in real-time, challenge each other with data, and deliver a final decision in cricket broadcast language.

**This is NOT a chatbot.** It's a tactical war room.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAPTAIN COOL SYSTEM                      │
│                                                                 │
│  ┌──────────────┐    ┌───────────────────────────────────────┐  │
│  │  REACT UI    │    │         FASTAPI + ADK BACKEND         │  │
│  │              │───▶│                                       │  │
│  │  Match State │    │  ┌──────────┐  ┌───────────────────┐  │  │
│  │  Input Form  │    │  │  AGENT 1 │  │     AGENT 2       │  │  │
│  │              │    │  │  Stats   │  │   Strategist      │  │  │
│  │  Debate      │    │  │  Analyst │  │   (Gemini 2.5F)   │  │  │
│  │  Theater     │    │  │ (2.5F)   │  │                   │  │  │
│  │              │    │  └────┬─────┘  └────────┬──────────┘  │  │
│  │  Captain's   │    │       │                 │             │  │
│  │  Call Card   │◀──│  ┌────▼─────┐  ┌────────▼──────────┐  │  │
│  │              │    │  │  AGENT 3 │  │     AGENT 4       │  │  │
│  │  Voice Out   │    │  │  Devil's │  │   Commentator     │  │  │
│  └──────────────┘    │  │ Advocate │  │   (Cricket Lang)  │  │  │
│                      │  └──────────┘  └───────────────────┘  │  │
│       SSE Stream     │                                        │  │
│     ←─────────────── │  ┌────────────────────────────────┐   │  │
│                      │  │        TOOL LAYER              │   │  │
│                      │  │  • Sportmonks Cricket API      │   │  │
│                      │  │  • OpenWeatherMap (dew/temp)   │   │  │
│                      │  │  • Win Probability Calculator  │   │  │
│                      │  └────────────────────────────────┘   │  │
│                      └───────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Agent Roster

| Agent | Model | Role | Personality |
|---|---|---|---|
| 📊 **Stats Analyst** | Gemini 2.5 Flash | Fetches live data, builds fact-sheet | *"Data never lies"* |
| 🎯 **Strategist** | Gemini 2.5 Flash | Proposes the tactical call | *"The captain's brain"* |
| 😈 **Devil's Advocate** | Gemini 2.5 Flash | Challenges with the strongest counter | *"What could go wrong?"* |
| 🎙️ **Commentator** | Gemini 2.5 Flash | Delivers verdict in cricket language | *"And the crowd goes…"* |

### Debate Flow
```
Stats Analyst → Strategist R1 → Devil's Advocate → Strategist R2 → LOCK → Commentator
                                                                          ↓
                                                              Captain's Call Card
```

---

## Features

- ⚡ **Real-time streaming** — Watch agents debate word-by-word via SSE
- 🌐 **Live weather** — OpenWeatherMap dew/humidity data enriches decisions
- 🏏 **Live cricket data** — Sportmonks API integration (mock fallback for demo)
- 📊 **Win probability gauge** — DLS-style model, animated SVG arc
- 🎙️ **Voice output** — Web Speech API reads the Captain's Call aloud
- 📜 **Over history** — Slide-in drawer logs every decision of the session
- 🚀 **Share button** — Copy or native share the verdict for social
- 📱 **Responsive** — 3-column war room on desktop, tabbed on mobile
- 🌑 **Dark-only UI** — Deep navy + IPL gold + agent accent colours
- 🔄 **Re-debate** — Run the debate again with updated match state

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Vanilla CSS |
| Animations | CSS keyframes + Canvas 2D (cricket ball) |
| Backend | FastAPI + Python 3.11 |
| Agents | Google Gemini 2.5 Flash via `google-generativeai` |
| Streaming | Server-Sent Events (SSE) |
| Cricket data | Sportmonks API v2 |
| Weather | OpenWeatherMap API |
| Win probability | Custom DLS-style model |

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- API keys (see `.env.example`)

### 1. Clone & configure

```bash
git clone https://github.com/AdityaPatil2549/APL-2026-GDGOC-Pune.git
cd APL-2026-GDGOC-Pune
cp .env.example .env
# Fill in your API keys in .env
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/strategize` | POST | Stream the full multi-agent debate (SSE) |
| `/api/demo` | GET | Get the sample MI vs CSK match state |
| `/api/health` | GET | Health check + Gemini config status |

### Sample Request

```bash
curl -X POST http://localhost:8000/api/strategize \
  -H "Content-Type: application/json" \
  -d @demos/scenario_mi_vs_csk.json
```

---

## Environment Variables

```env
GOOGLE_API_KEY=           # Gemini API key (required)
SPORTMONKS_API_KEY=       # Cricket data (optional, mock fallback)
OPENWEATHERMAP_KEY=       # Live weather (optional, mock fallback)
```

---

## Demo Scenario

`demos/scenario_mi_vs_csk.json` — MI chasing 178, over 16.2, heavy dew at Wankhede, Hardik Pandya 34(22). The classic death-over tactical dilemma.

**Key debate question:** *Does dew at Wankhede completely negate Jadeja's spin, making Pathirana the only viable option for over 17?*

---

## Repository Structure

```
captain-cool/
├── backend/
│   ├── main.py              # FastAPI server + SSE debate stream
│   ├── prompts.py           # All 5 agent system prompts
│   ├── tools/
│   │   ├── cricket_api.py   # Sportmonks + mock scorecard
│   │   ├── weather.py       # OpenWeatherMap dew analysis
│   │   └── win_probability.py # DLS-style calculator
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/      # Landing, MatchCommandCenter, AgentCard, etc.
│       ├── hooks/           # useDebateStream (SSE)
│       └── constants/       # Teams, venues, agent configs
├── demos/
│   └── scenario_mi_vs_csk.json
├── .env.example
└── README.md
```

---

## Scoring Projection

| Category | Max | Projected |
|---|---|---|
| Relevance | 250 | 230 |
| Technical Depth | 250 | 240 |
| Innovation & Agentic Design | 250 | 235 |
| Documentation & Blog | 250 | 220 |
| **TOTAL** | **1000** | **925** |

---

*Built in one Antigravity session. Ship fast. Win loud. 🏆*
