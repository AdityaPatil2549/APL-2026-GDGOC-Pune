# 🏏 CAPTAIN COOL — Product Requirements Document
### Multi-Agent IPL Match Strategist · Google Gemini Hackathon
**Version:** 1.0 · **Author:** Team Synapsters · **Status:** ACTIVE

---

## 0. EXECUTIVE SNAPSHOT

| Field | Value |
|---|---|
| Product Name | Captain Cool |
| Tagline | *"The AI captain that debates before it decides."* |
| Build Window | 3 hours (Antigravity vibe-coding session) |
| Frontend | Google Stitch (UI prototyping) |
| Dev IDE | Google Antigravity |
| Core Stack | Gemini 2.5 Pro + ADK (Python) + Firebase + Stitch |
| Submission | Public GitHub + dev.to blog |
| Scoring Target | 900+ / 1000 |

---

## 1. PROBLEM STATEMENT

Cricket captaincy is the highest-stakes real-time decision engine in team sport. A captain processes live ball data, bowler fatigue, pitch behavior, matchups, momentum, and crowd psychology simultaneously — and commits in under 20 seconds.

No existing AI tool simulates this multi-variable, adversarial, real-time reasoning in cricket language.

**Captain Cool fills this gap** — a multi-agent Gemini system where specialized agents debate tactics and deliver decisions the way Dhoni, Rohit, or Hardik would.

---

## 2. GOALS & SUCCESS METRICS

### Primary Goals (Hackathon Scope)
| Goal | Metric |
|---|---|
| Deliver a working multi-agent system | ≥3 named, distinct Gemini agents collaborating |
| Real tool call inside at least one agent | Live cricket API fetch OR Gemini function calling |
| Multi-turn debate loop visible in UI | Strategist → Devil's Advocate → Revised Decision |
| Cricket-language output, not ML jargon | "Bowl Bumrah wide of off-stump, not the yorker — he's averaging 9 RPO in last 3 overs" |
| Full Gemini stack compliance | Zero non-Gemini LLMs in the chain |

### Stretch Goals
| Goal | Priority |
|---|---|
| Cricbuzz URL scraping via Gemini URL context tool | HIGH |
| Confidence score + counterfactual | HIGH |
| Voice output (Web Speech API + Gemini Live) | MEDIUM |
| Memory across overs (Gemini context caching) | MEDIUM |
| Multimodal: pitch image → Gemini vision analysis | LOW |

---

## 3. USER PERSONAS

### Primary: The Cricket Nerd (Power User)
- Watches IPL with a notepad, second-guesses every decision
- Inputs full match state, wants deep reasoning
- Cares about *why* the agent debated, not just the answer

### Secondary: Casual Fan
- Pastes a Cricbuzz URL, wants the agent to figure out the rest
- Wants a quick verdict in plain English
- Bonus if there's voice output

### Judge Persona (Hackathon Evaluator)
- Checks: Is this genuinely agentic? Is the debate real? Is Gemini used correctly?
- Wants to see ADK traces, agent system prompts, AI Studio links
- Will clone the repo and run it

---

## 4. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAPTAIN COOL SYSTEM                      │
│                                                                 │
│  ┌──────────────┐    ┌───────────────────────────────────────┐  │
│  │   STITCH UI  │    │         ADK ORCHESTRATOR              │  │
│  │              │───▶│  (Python · google-adk · FastAPI)      │  │
│  │  Match State │    │                                       │  │
│  │  Input Form  │    │  ┌──────────┐  ┌───────────────────┐  │  │
│  │              │    │  │  AGENT 1 │  │     AGENT 2       │  │  │
│  │  Debate Log  │    │  │  Stats   │  │   Strategist      │  │  │
│  │  Panel       │    │  │  Analyst │  │   (Gemini 2.5P)   │  │  │
│  │              │    │  │ (2.5F)   │  │                   │  │  │
│  │  Final       │    │  └────┬─────┘  └────────┬──────────┘  │  │
│  │  Verdict     │    │       │                 │             │  │
│  │  Card        │◀──│  ┌────▼─────┐  ┌────────▼──────────┐  │  │
│  │              │    │  │  AGENT 3 │  │     AGENT 4       │  │  │
│  │  Voice Out   │    │  │  Devil's │  │   Commentator     │  │  │
│  └──────────────┘    │  │ Advocate │  │   (Cricket Lang)  │  │  │
│                      │  │ (2.5P)   │  │   (2.5F)          │  │  │
│                      │  └──────────┘  └───────────────────┘  │  │
│                      │                                       │  │
│                      │  ┌────────────────────────────────┐   │  │
│                      │  │        TOOL LAYER              │   │  │
│                      │  │  • Cricbuzz/Sportmonks API     │   │  │
│                      │  │  • Win Probability Calculator  │   │  │
│                      │  │  • Weather/Dew API             │   │  │
│                      │  │  • Gemini URL Context Tool     │   │  │
│                      │  └────────────────────────────────┘   │  │
│                      └───────────────────────────────────────┘  │
│                                                                 │
│  Firebase Hosting · Firestore (session state) · Cloud Run      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. AGENT SPECIFICATIONS

### AGENT 1 — Stats Analyst (`stats_analyst`)
**Model:** `gemini-2.5-flash` (fast, cheap, tool-calling)
**Role:** Fetch and synthesize real data before strategy begins.

**System Prompt Skeleton:**
```
You are a cricket statistician with access to live match data tools.
Your ONLY job is to call available tools, fetch current match stats,
and return a structured JSON fact-sheet. Do NOT make tactical recommendations.
Return: batter_stats, bowler_stats, pitch_report, weather, win_probability.
Be factual. Be fast. Never hallucinate statistics.
```

**Tools owned:**
- `fetch_live_scorecard(match_id)` — Cricbuzz/Sportmonks API
- `get_weather_dew(venue, time)` — OpenWeatherMap or wttr.in
- `calculate_win_probability(innings, score, wickets, balls_remaining, target)` — custom function
- `get_player_matchup(batter_id, bowler_id, conditions)` — historical head-to-head

**Output:** Structured JSON fact-sheet passed to Strategist.

---

### AGENT 2 — Strategist (`strategist`)
**Model:** `gemini-2.5-pro` (deep reasoning)
**Role:** Make the tactical call using the fact-sheet.

**System Prompt Skeleton:**
```
You are the captain of an IPL team with 15 years of T20 experience.
You receive a structured fact-sheet from the Stats Analyst.
Propose ONE specific tactical decision for the next over/event.
Format: [Decision] + [Cricket reasoning, 3-5 sentences] + [Win probability impact estimate].
Think like Dhoni: calm, data-backed, unconventional when necessary.
Do not hedge. Commit to one decision.
```

**Input:** Stats Analyst JSON fact-sheet
**Output:** Tactical proposal passed to Devil's Advocate

---

### AGENT 3 — Devil's Advocate (`devils_advocate`)
**Model:** `gemini-2.5-pro`
**Role:** Challenge the Strategist's proposal with the strongest counter-argument.

**System Prompt Skeleton:**
```
You are the assistant coach who always disagrees in the dugout.
You receive the Strategist's proposal. Your job: find the BEST
counter-argument. Challenge assumptions, cite stats if available,
propose an alternative. Be specific, not generic.
You are NOT trying to win an argument — you are pressure-testing the strategy.
End with: [Alternative Decision] + [Risk it avoids].
```

**Multi-turn loop:**
1. Strategist proposes
2. Devil's Advocate challenges
3. Strategist revises OR defends with new reasoning
4. Final lock-in after 2 rounds max

---

### AGENT 4 — Match Commentator (`commentator`)
**Model:** `gemini-2.5-flash`
**Role:** Translate the final locked decision into cricket broadcast language.

**System Prompt Skeleton:**
```
You are a former IPL captain turned Sky Sports analyst.
You receive the final locked decision and the debate transcript.
Your job: write the final output in cricket commentary style.
Include: the decision, the key reasoning in cricket language,
what the dissenting view was, and why it was overruled.
Tone: authoritative, colorful, specific. No ML terms. No "AI" references.
Example tone: "Rohit's gone back to Bumrah with the field up — that leggie
is wasted against a left-handed pinch-hitter on a dew-affected surface."
```

---

## 6. MULTI-TURN DEBATE LOOP (MANDATORY FLOW)

```
INPUT: Match State
    │
    ▼
[Stats Analyst] → Calls tools → Returns fact-sheet JSON
    │
    ▼
[Strategist Round 1] → Proposes decision
    │
    ▼
[Devil's Advocate Round 1] → Challenges proposal
    │
    ▼
[Strategist Round 2] → Defends OR revises decision
    │
    ▼
[Devil's Advocate Round 2] → Accepts OR final objection
    │
    ▼
[LOCK-IN: Final Decision]
    │
    ▼
[Commentator] → Formats output in cricket language
    │
    ▼
OUTPUT: Verdict Card + Debate Transcript + Confidence Score
```

**This loop is shown live in the UI.** User sees each agent "thinking" in real-time (streaming).

---

## 7. DATA MODEL

### Match State Input (User provides this)
```json
{
  "innings": 2,
  "over": 16,
  "ball": 2,
  "score": "134/4",
  "target": 178,
  "required_run_rate": 11.2,
  "batting_team": "MI",
  "bowling_team": "CSK",
  "batter_strike": { "name": "Hardik Pandya", "runs": 34, "balls": 22 },
  "batter_non_strike": { "name": "Tim David", "runs": 8, "balls": 5 },
  "bowlers": [
    { "name": "Deepak Chahar", "overs_used": 3 },
    { "name": "Tushar Deshpande", "overs_used": 3 },
    { "name": "Jadeja", "overs_used": 2 },
    { "name": "Matheesha Pathirana", "overs_used": 2 }
  ],
  "pitch": "two-paced",
  "dew_factor": "heavy",
  "venue": "Wankhede",
  "impact_player_available": true,
  "strategic_timeout_used": false,
  "phase": "death"
}
```

### Agent Output Schema
```json
{
  "session_id": "uuid",
  "timestamp": "ISO8601",
  "fact_sheet": { ... },
  "debate": [
    {
      "round": 1,
      "strategist_proposal": "Bowl Pathirana — death specialist, full yorkers",
      "strategist_reasoning": "...",
      "devils_counter": "Hardik has 180 SR against right-arm pace in death...",
      "devils_alternative": "Bowl Jadeja — left-arm angle neutralizes Hardik's strength"
    },
    {
      "round": 2,
      "strategist_defense": "Dew negates spin completely at Wankhede by over 15...",
      "devils_acceptance": "Concede — dew data overrides matchup argument"
    }
  ],
  "final_decision": {
    "action": "Bowl Pathirana over 17",
    "field_setup": "Deep fine leg, third man up, mid-off saving one",
    "reasoning_cricket": "...",
    "win_probability_before": 0.38,
    "win_probability_after_decision": 0.51,
    "confidence_score": 0.82,
    "counterfactual": "If Jadeja bowled instead: win prob drops to 0.31 due to dew"
  },
  "commentary_output": "Dhoni's made the call — Pathirana gets the ball..."
}
```

---

## 8. FRONTEND SPEC (STITCH)

### Screens

#### Screen 1: Match State Input
- **Layout:** Single-page form, split into 3 columns
  - Left: Match context (innings, over, score, target)
  - Centre: Players on field (batters, bowler in attack)
  - Right: Conditions (pitch, dew, venue, phase)
- **Quick-fill:** Paste Cricbuzz URL → Auto-populate via Gemini URL scraping
- **CTA:** "Ask the Captain" button

#### Screen 2: Live Debate Theater
- **Layout:** Real-time streaming panel showing agent debate
- **Visual:** 4 named agent cards, each with icon and color
  - Stats Analyst (blue) — tool calls shown
  - Strategist (green) — proposal bubbles
  - Devil's Advocate (red) — challenge bubbles
  - Commentator (gold) — final formatting
- **Animation:** Each agent "activates" with a pulse when speaking
- **This is the WOW factor for judges**

#### Screen 3: Verdict Card
- **Layout:** Premium card design
  - Header: Decision in bold cricket language
  - Body: Commentator output (broadcast style)
  - Sidebar: Win probability gauge (before vs after)
  - Footer: Confidence score + counterfactual insight
  - "What the dissent said" collapsible section
- **Share button:** Copy verdict text for social

#### Design Language
- **Theme:** Dark (stadium night match feel) — deep navy, IPL gold, neon green accents
- **Typography:** Display font (bold, slab-serif) + clean mono for stats
- **No generic purple gradients**
- **Cricket scoreboard aesthetic** — tabular, precise, authoritative

---

## 9. BACKEND SPEC

### Tech Stack
```
Language:    Python 3.11+
Framework:   FastAPI (API server) + ADK (agent orchestration)
LLM:         google-genai (Gemini 2.5 Pro + Flash)
Agents:      google-adk (Agent Development Kit)
DB:          Firestore (session state, over-by-over memory)
Hosting:     Cloud Run (containerized FastAPI) + Firebase Hosting (Stitch frontend)
Caching:     Gemini context caching (for multi-over memory)
Tools:       Gemini function calling schema (defined per agent)
```

### ADK Agent Setup Pattern
```python
from google.adk.agents import Agent
from google.adk.tools import FunctionTool

stats_analyst = Agent(
    name="stats_analyst",
    model="gemini-2.5-flash",
    system_prompt=STATS_ANALYST_PROMPT,
    tools=[fetch_live_scorecard, get_weather_dew, calculate_win_probability]
)

strategist = Agent(
    name="strategist",
    model="gemini-2.5-pro",
    system_prompt=STRATEGIST_PROMPT,
    tools=[]  # receives context only
)

devils_advocate = Agent(
    name="devils_advocate",
    model="gemini-2.5-pro",
    system_prompt=DEVILS_ADVOCATE_PROMPT,
    tools=[]
)

commentator = Agent(
    name="commentator",
    model="gemini-2.5-flash",
    system_prompt=COMMENTATOR_PROMPT,
    tools=[]
)
```

### API Endpoints
| Endpoint | Method | Description |
|---|---|---|
| `/api/analyze` | POST | Takes match state JSON, returns full debate + verdict |
| `/api/scrape` | POST | Takes Cricbuzz URL, returns structured match state |
| `/api/session/{id}` | GET | Fetch session history (over-by-over memory) |
| `/api/health` | GET | System health check |

---

## 10. TOOL DEFINITIONS (GEMINI FUNCTION CALLING)

```python
tools = [
    {
        "name": "fetch_live_scorecard",
        "description": "Fetch live IPL scorecard from Cricbuzz or Sportmonks API",
        "parameters": {
            "type": "object",
            "properties": {
                "match_id": {"type": "string", "description": "Cricbuzz match ID"},
            },
            "required": ["match_id"]
        }
    },
    {
        "name": "calculate_win_probability",
        "description": "Calculate T20 win probability using DLS-style model",
        "parameters": {
            "type": "object",
            "properties": {
                "innings": {"type": "integer"},
                "balls_remaining": {"type": "integer"},
                "runs_required": {"type": "integer"},
                "wickets_in_hand": {"type": "integer"},
                "pitch_factor": {"type": "number", "description": "0.7 (turning) to 1.2 (flat)"},
                "dew_factor": {"type": "boolean"}
            },
            "required": ["innings", "balls_remaining", "runs_required", "wickets_in_hand"]
        }
    },
    {
        "name": "get_player_matchup",
        "description": "Get historical T20 head-to-head stats between batter and bowler",
        "parameters": {
            "type": "object",
            "properties": {
                "batter_name": {"type": "string"},
                "bowler_name": {"type": "string"},
                "phase": {"type": "string", "enum": ["powerplay", "middle", "death"]}
            },
            "required": ["batter_name", "bowler_name"]
        }
    }
]
```

---

## 11. 3-HOUR BUILD TIMELINE (ANTIGRAVITY SESSION)

| Time Block | Focus | Deliverable |
|---|---|---|
| 0:00–0:20 | Project scaffolding | Repo init, ADK setup, env config, API keys |
| 0:20–0:50 | Agent system prompts | All 4 agent prompts written + tested in AI Studio |
| 0:50–1:20 | Tool layer | Win probability function + Cricbuzz/mock data fetch |
| 1:20–1:50 | ADK orchestration | Debate loop working end-to-end in Python CLI |
| 1:50–2:20 | FastAPI server | `/api/analyze` endpoint streaming agent outputs |
| 2:20–2:50 | Stitch frontend | Input form + Debate Theater + Verdict Card |
| 2:50–3:00 | Polish + Record demo | README, screenshots, AI Studio links |

**Anti-drift rule:** If any block exceeds 5 min overtime — cut scope, not quality. Commentator agent is last cut.

---

## 12. REPOSITORY STRUCTURE

```
captain-cool/
├── .antigravity/              # Antigravity traces (MANDATORY for judges)
│   ├── session_001.json
│   └── agent_traces/
├── backend/
│   ├── agents/
│   │   ├── stats_analyst.py
│   │   ├── strategist.py
│   │   ├── devils_advocate.py
│   │   └── commentator.py
│   ├── tools/
│   │   ├── cricket_api.py
│   │   ├── win_probability.py
│   │   └── weather.py
│   ├── orchestrator.py        # ADK multi-agent loop
│   ├── main.py                # FastAPI server
│   └── prompts/               # All system prompts as .txt files
│       ├── stats_analyst.txt
│       ├── strategist.txt
│       ├── devils_advocate.txt
│       └── commentator.txt
├── frontend/                  # Stitch export / HTML
│   ├── index.html
│   ├── debate.html
│   └── verdict.html
├── demos/
│   └── scenario_mi_vs_csk.json  # Sample match state for judges
├── docs/
│   ├── architecture.png       # System diagram
│   └── blog_draft.md          # dev.to blog content
├── .env.example
├── requirements.txt
├── Dockerfile
└── README.md
```

---

## 13. BLOG / DOCUMENTATION REQUIREMENTS

The `dev.to` blog must cover (this is 250/1000 points):

1. **Architecture diagram** — exact copy of Section 4 diagram above
2. **Each agent's system prompt** — pasted verbatim with explanation of design choices
3. **AI Studio prompt link** — share prototype links for Strategist + Devil's Advocate
4. **One full match scenario walkthrough** — MI vs CSK, over 16, with screenshots of:
   - Input form filled
   - Live debate theater (all 4 agents active)
   - Final verdict card with win probability
5. **What surprised you** — one genuine insight from the build

---

## 14. RISK REGISTER

| Risk | Likelihood | Mitigation |
|---|---|---|
| Cricbuzz API rate-limited or blocked | HIGH | Fallback: Gemini URL context tool to scrape directly + mock JSON for demo |
| ADK multi-agent loop too slow (>30s) | MEDIUM | Parallel agent calls where possible; Flash for lightweight agents |
| Stitch frontend export compatibility | MEDIUM | Keep frontend in plain HTML/CSS as fallback |
| Gemini 2.5 Pro quota exhaustion in 3h | LOW | Use Flash for debate rounds; Pro only for final decision |
| Agent debate loops infinitely | LOW | Hard cap: 2 rounds max; timeout at 45s |

---

## 15. SCORING PROJECTION

| Category | Max | Projected | Notes |
|---|---|---|---|
| Relevance | 250 | 230 | Real captain-decision framing, not chatbot |
| Technical Depth | 250 | 240 | ADK + function calling + live tool use |
| Innovation & Agentic Design | 250 | 235 | Visible debate loop, counterfactual, confidence score |
| Documentation & Blog | 250 | 220 | Full architecture + prompts + walkthrough |
| **TOTAL** | **1000** | **925** | **Target: Top 3** |

---

## 16. DEFINITION OF DONE (HACKATHON SUBMISSION)

- [ ] 4 named agents, each with distinct system prompt, running on Gemini
- [ ] At least 1 live tool call (cricket API or win probability function)
- [ ] Multi-turn debate loop (2 rounds) visible in UI
- [ ] Final output in cricket commentary language
- [ ] `.antigravity/` folder with session traces in repo
- [ ] `demos/scenario_mi_vs_csk.json` included
- [ ] AI Studio prompt links in blog
- [ ] `README.md` with setup instructions + architecture diagram
- [ ] dev.to blog published and linked in repo

---

*PRD locked. Build starts now. Ship fast. Win loud.*
