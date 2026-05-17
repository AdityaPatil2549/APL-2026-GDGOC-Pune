# 🏏 Captain Cool — Frontend Scheme & Requirements Document
### Multi-Agent IPL Match Strategist | Google Hackathon 2025
**Stack:** Stitch (UI) + Google Antigravity + Gemini 2.5 Pro/Flash  
**Document Version:** 1.0 | Author: Hackathon Team

---

## Table of Contents
1. [Product Vision & Design Philosophy](#1-product-vision--design-philosophy)
2. [Information Architecture](#2-information-architecture)
3. [Page & Screen Inventory](#3-page--screen-inventory)
4. [Screen-by-Screen Breakdown](#4-screen-by-screen-breakdown)
5. [Component Library](#5-component-library)
6. [Design System](#6-design-system)
7. [State Management & Data Flow](#7-state-management--data-flow)
8. [API Contract (Frontend ↔ Backend)](#8-api-contract-frontend--backend)
9. [Agentic UX Patterns](#9-agentic-ux-patterns)
10. [Responsive & Accessibility Requirements](#10-responsive--accessibility-requirements)
11. [Stitch Implementation Notes](#11-stitch-implementation-notes)
12. [Build Order & Priorities](#12-build-order--priorities)

---

## 1. Product Vision & Design Philosophy

### 1.1 What We're Building
Captain Cool is NOT a chatbot with cricket themes. It is a **tactical war room interface** — the kind of screen you'd expect to see in an IPL dugout. The UI must communicate authority, urgency, and analytical depth simultaneously.

### 1.2 Core UX Metaphor
> **The Dugout War Room** — A live tactical dashboard where three agent "advisors" debate in real-time, and the captain (user) observes before issuing the final call.

Think ESPN CricInfo meets Bloomberg Terminal meets NFL Next Gen Stats.

### 1.3 Design Personality
- **Aesthetic:** Dark, premium, data-dense — like a sports analytics platform used by professionals
- **Color Anchor:** Deep navy (#0B1426) base, IPL gold (#F5A623) accent, hot coral (#FF4757) for urgency/dissent
- **Typography:** Bebas Neue (display/scoreboard numbers) + IBM Plex Sans (body/data)
- **Feel:** Confident, live, urgent — micro-animations on every data update; scoreboard digits flip like real scoreboards

### 1.4 What Makes It Unforgettable
The **Agent Debate Theater** — a live panel where you watch three distinct AI personalities argue (with personality, not just text), culminating in a glowing "CAPTAIN'S CALL" card that slides in dramatically.

---

## 2. Information Architecture

```
Captain Cool
│
├── /                         → Landing / Hero (match setup entry point)
├── /match                    → Match Command Center (PRIMARY SCREEN)
│   ├── [left panel]          → Live Match State Input
│   ├── [center panel]        → Agent Debate Theater (live streaming)
│   └── [right panel]         → Captain's Call + History Log
├── /history                  → Past Decisions Log (optional, stretch)
└── /about                    → How it works (architecture explainer)
```

**Single-page feel:** The `/match` route IS the product. Everything else is peripheral. The 3-hour build window means 90% of effort goes into `/match`.

---

## 3. Page & Screen Inventory

| Screen | Priority | Complexity | Stitch Template Hint |
|--------|----------|------------|----------------------|
| Landing / Hero | P1 | Low | Full-screen hero with CTA |
| Match Input Panel | P1 | High | Form with conditional fields |
| Agent Debate Theater | P1 | Very High | Streaming chat + animation |
| Captain's Call Card | P1 | High | Decision reveal card |
| Scoreboard Header | P1 | Medium | Live score strip |
| History Log Drawer | P2 | Medium | Slide-in side panel |
| About / Architecture | P3 | Low | Scrolling explainer |

---

## 4. Screen-by-Screen Breakdown

---

### 4.1 Screen: Landing / Hero

**Purpose:** First impression. Communicates the concept in 5 seconds, drives user to start.

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│  [CAPTAIN COOL logo — animated cricket ball spinning]        │
│                                                              │
│  "What would Dhoni do?"                                      │
│  The AI Captain that thinks like a World Cup winner.         │
│                                                              │
│  [▶ ENTER THE WAR ROOM]    [How it works]                    │
│                                                              │
│  Powered by Gemini 2.5 Pro · Built on Google ADK             │
│                                                              │
│  [Animated background: faint cricket pitch lines in motion]  │
└──────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Animated cricket ball SVG (CSS spin + glow)
- Background: animated radial lines mimicking pitch from aerial view (CSS animation)
- CTA button: Gold fill, bold Bebas Neue, 3D press effect on click
- "Powered by Gemini" badge with Google colors — essential for hackathon scoring
- On CTA click: smooth scroll / route push to `/match`

**Stitch Notes:** Use full-bleed hero template. Override background color to `#0B1426`. Animate via inline `<style>` keyframes.

---

### 4.2 Screen: Match Command Center (PRIMARY)

This is the soul of the application. Three-column layout on desktop, tabbed on mobile.

**Overall Layout (Desktop 1440px):**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SCOREBOARD HEADER STRIP (full width, sticky)                               │
│  MI 142/3 (16.2) vs CSK | Target: 189 | RRR: 11.8 | DEW: Heavy | Wankhede  │
├─────────────────┬───────────────────────────────────┬───────────────────────┤
│  MATCH INPUT    │     AGENT DEBATE THEATER           │  CAPTAIN'S CALL       │
│  PANEL          │                                    │  + HISTORY            │
│  [30% width]    │     [45% width]                    │  [25% width]          │
│                 │                                    │                       │
│  Innings        │  [Stats Analyst]                   │  ╔═══════════════╗    │
│  Over / Ball    │  "Rohit has 0.42 avg vs left-arm   │  ║ CAPTAIN'S    ║    │
│  Score          │   in death since 2023..."          │  ║   CALL  🏏   ║    │
│  Wickets        │                                    │  ╚═══════════════╝    │
│  Batting Team   │  [Strategist]                      │                       │
│  Bowling Team   │  "Bowl Bumrah now. 3 overs left.   │  Decision text...     │
│  Strike Batter  │   He's fresh, pitch is two-paced"  │                       │
│  Non-striker    │                                    │  Confidence: 87%      │
│                 │  [Devil's Advocate]                │                       │
│  [Bowlers]      │  "Wait. Bumrah in over 18 risks    │  Why not X? →         │
│  Bowler A: 3    │   saving nothing for a super over. │                       │
│  Bowler B: 2    │   What if they go deep?"           │  ─────────────────    │
│                 │                                    │  [History Log]        │
│  Pitch: ____    │  [Strategist - Revised]            │  Over 14: Bowl Siraj  │
│  Dew: [toggle]  │  "Concede the point. Use Siraj     │  Over 12: Impact sub  │
│  Venue: ____    │   first, Bumrah for 19-20."        │                       │
│                 │                                    │                       │
│  Impact Player? │  [Commentator - Final Wrap]        │                       │
│  [Y/N toggle]   │  "And the captain's made his call" │                       │
│                 │                                    │                       │
│  [⚡ STRATEGIZE]│                                    │                       │
└─────────────────┴───────────────────────────────────┴───────────────────────┘
```

---

### 4.2.1 Sub-Component: Scoreboard Header Strip

**Always-visible sticky header.** Updates when match state is submitted.

**Fields displayed (horizontal, scoreboard style):**
- Batting Team name + score (digits use flip-counter animation on update)
- Bowling Team name
- Current over (e.g., "16.2")
- Required Run Rate (2nd innings only, shown in red if >12)
- Dew indicator (droplet icon, color-coded)
- Venue name
- Innings number

**Design Details:**
- Background: `#0D1F3C` (slightly lighter than page base)
- Score digits: Bebas Neue 28px, gold (`#F5A623`)
- Separator: thin vertical lines `#1E3A5F`
- Dew droplet: animated shimmer if dew is "heavy"
- RRR badge: green if <8, amber if 8-12, red if >12 (contextual cricket logic baked in)

---

### 4.2.2 Sub-Component: Match Input Panel

**Purpose:** Collect the full match state. Zero typing friction. Smart defaults.

**Input Groups:**

**Group 1: Match Context**
```
Innings         [1st ●] [2nd ○]  ← Radio buttons styled as pill toggles
Over            [  16  ] . Ball [ 2 ]  ← Numeric steppers
Venue           [Wankhede ▾]     ← Searchable dropdown (pre-filled list of IPL venues)
Pitch           [Flat ●][Turning ○][Two-paced ○]  ← 3-way toggle
Dew Factor      [None ●][Light ○][Heavy ○]
```

**Group 2: Scoreboard**
```
Batting Team    [MI ▾]           ← IPL team logos in dropdown
Score           [142] / [3]      ← Score/Wickets inline
Strike Batter   [Text input with autocomplete]
Non-striker     [Text input with autocomplete]
Target          [189]            ← Only shown in 2nd innings
```

**Group 3: Bowling State**
```
[Dynamic table — add up to 5 bowlers]
┌──────────────────┬──────┬─────────────────────────────┐
│ Bowler Name      │ Overs│ Max Allowed (auto-calc)     │
│ [_____________]  │ [3]  │ 1 over remaining            │
│ [+ Add Bowler]   │      │                             │
└──────────────────┴──────┴─────────────────────────────┘
```

**Group 4: Special Flags**
```
Impact Player Available?   [YES ●] [NO ○]
Powerplay active?          [YES ○] [NO ●]   ← auto-calculated from over, but overridable
Strategic Timeout used?    [YES ○] [NO ●]
```

**CTA Button:**
```
[⚡ STRATEGIZE]
```
- Full width of panel
- Gold background, dark text
- On hover: subtle glow pulse animation
- On click: triggers API call, panel locks (dimmed overlay), debate begins

**Design Notes:**
- All inputs: dark card background `#112240`, border `#1E3A5F`, focus ring gold
- No white backgrounds — this is a dark-mode-only interface
- Labels above inputs (not floating — clarity over style here)
- Validation inline (over > 20 → red border + tooltip)

---

### 4.2.3 Sub-Component: Agent Debate Theater

**The hero component.** Where most visual effort goes.

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│  DEBATE THEATER                          [● LIVE]       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📊 STATS ANALYST                                │   │
│  │ Fetching live data from Cricbuzz API...         │   │
│  │ ████████░░ 80%                                  │   │
│  └─────────────────────────────────────────────────┘   │
│  ↓ [streaming text appears word by word]                │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🎯 STRATEGIST                                   │   │
│  │ [appears after Analyst completes]               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 😈 DEVIL'S ADVOCATE                             │   │
│  │ [appears after Strategist's initial proposal]   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🎯 STRATEGIST (Revised)                         │   │
│  │ [revises or defends after DA challenges]        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🎙️ COMMENTATOR                                  │   │
│  │ [Final narrative wrap — color commentary style] │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

**Agent Card Design:**
Each agent has a distinct identity card:

| Agent | Icon | Border Color | Badge Color | Personality Tagline |
|-------|------|-------------|-------------|---------------------|
| Stats Analyst | 📊 | `#3A86FF` | Blue | "Data never lies" |
| Strategist | 🎯 | `#F5A623` | Gold | "The captain's brain" |
| Devil's Advocate | 😈 | `#FF4757` | Coral/Red | "What could go wrong?" |
| Commentator | 🎙️ | `#2ED573` | Green | "And the crowd goes..." |

**Animation Sequence (critical for "agentic" feel):**
1. User clicks STRATEGIZE → panel shows "Agents assembling..." with cricket ball spinner
2. Stats Analyst card slides in from top → typing cursor appears → text streams in word by word
3. After Analyst done: 500ms pause → Strategist card fades in → streams proposal
4. After Strategist: 300ms → Devil's Advocate card shakes in (slight bounce) → challenges
5. After DA: Strategist card re-activates (glows) → "REVISED STANCE" badge appears → revises
6. Commentator swoops in with green glow → wraps up in commentary style
7. Captain's Call card in right panel SLIDES IN from right with golden shimmer

**Text Streaming:**
- Implement word-by-word streaming using SSE (Server-Sent Events) or WebSocket
- Each word fades in with 20ms delay — not character-by-character (too slow) or instant (too boring)
- Typing indicator (3 dots) shows while agent is "thinking" before streaming starts

**Dissent Highlighting:**
- When Devil's Advocate contradicts a Strategist claim, highlight the contested text in both cards with a subtle red underline
- "CHALLENGED ↑" annotation links back to Strategist's original claim

---

### 4.2.4 Sub-Component: Captain's Call Card

**The payoff moment.** Appears in the right panel after all agents complete.

```
╔══════════════════════════════════════╗
║  🏏 CAPTAIN'S CALL                   ║
║                                      ║
║  BOWL BUMRAH — OVER 19               ║
║                                      ║
║  Field: Deep fine leg in, third man  ║
║  out. 5-3-1 split for width.         ║
║                                      ║
║  Reasoning:                          ║
║  "With dew on the outfield and       ║
║  Dhawan struggling vs short-pitch,   ║
║  Bumrah's yorker length becomes      ║
║  unplayable. 3 overs left. Use him." ║
║                                      ║
║  ─────────────────────────────────   ║
║  Confidence Score: ████████░░ 83%   ║
║                                      ║
║  Why not Siraj?                      ║
║  "Siraj's swing evaporates in dew.   ║
║   Save him for a dry Super Over."    ║
║                                      ║
║  Win Probability Impact:             ║
║  Current: 54% → Projected: 61%      ║
║  (if bowled Siraj instead: 49%)      ║
║                                      ║
║  [📋 COPY DECISION] [🔄 RE-DEBATE]   ║
╚══════════════════════════════════════╝
```

**Animation:**
- Card slides in from right (translateX 100% → 0) with spring easing
- Gold border glows for 2 seconds on entry
- Confidence bar fills with animation from 0 to value
- Win probability numbers count up like a ticker

**Color:** Gold border `#F5A623`, dark interior `#0D1F3C`

---

### 4.3 Screen: History Log Drawer

Accessible via a "📜 OVER HISTORY" button. Slides in as a drawer from the bottom (mobile) or right (desktop).

**Per-over entry format:**
```
Over 16 | Decision: Bowl Bumrah | Confidence: 83% | [Expand ↓]
```
Expanded:
- Full Captain's Call text
- Which agent prevailed in the debate
- Timestamp

---

## 5. Component Library

### 5.1 Core Components (Build These First)

| Component | Description | Props |
|-----------|-------------|-------|
| `ScoreboardStrip` | Top header with live match state | `matchState` object |
| `MatchInputForm` | Full match state input panel | `onSubmit(state)` |
| `AgentCard` | Individual agent debate card | `agent`, `message`, `status` |
| `DebateTheater` | Orchestrates all AgentCards | `debateStream`, `status` |
| `CaptainCallCard` | Final decision reveal | `decision`, `confidence`, `counterfactual` |
| `TeamSelector` | IPL team dropdown with logos | `value`, `onChange` |
| `BowlerTable` | Dynamic bowler state table | `bowlers`, `onChange` |
| `ConfidenceBar` | Animated percentage bar | `value`, `color` |
| `WinProbGauge` | Semi-circular probability gauge | `before`, `after` |
| `OverHistoryDrawer` | Slide-in past decisions | `history[]` |
| `PillToggle` | Styled radio pill group | `options`, `value`, `onChange` |
| `NumericStepper` | Over/ball/score stepper | `min`, `max`, `value` |
| `AgentTypingIndicator` | 3-dot typing animation | `agentName` |
| `GoldCTA` | Primary action button | `label`, `loading`, `onClick` |

### 5.2 Utility Components

| Component | Purpose |
|-----------|---------|
| `ScoreboardDigit` | Individual flip-counter digit |
| `DewIndicator` | Animated water droplet badge |
| `RRRBadge` | Color-coded required run rate |
| `ImpactPlayerTag` | "IMPACT PLAYER AVAILABLE" pill |
| `GeminiPoweredBadge` | Attribution badge (hackathon req.) |
| `LivePulseDot` | Animated red dot for "LIVE" status |

---

## 6. Design System

### 6.1 Color Palette

```
Primary Background:     #0B1426   (Deep Navy — main page bg)
Card Background:        #112240   (Slightly lighter — card/panel bg)
Header Background:      #0D1F3C   (Scoreboard strip)
Border:                 #1E3A5F   (Card borders)
Border Focus:           #F5A623   (Gold — active/focused inputs)

Accent Gold:            #F5A623   (Primary CTA, Captain's Call)
Accent Coral:           #FF4757   (Devil's Advocate, danger, urgency)
Accent Blue:            #3A86FF   (Stats Analyst)
Accent Green:           #2ED573   (Commentator, positive delta)

Text Primary:           #E8F4FD   (Near-white — main text)
Text Secondary:         #7BA7C4   (Muted — labels, secondary info)
Text Accent:            #F5A623   (Highlighted/important values)

Score Digit:            #F5A623   (Scoreboard numbers)
RRR Low:                #2ED573   (< 8 runs/over)
RRR Mid:                #FFB347   (8–12 runs/over)
RRR High:               #FF4757   (> 12 runs/over)
```

### 6.2 Typography

```
Display / Scoreboard:   Bebas Neue (Google Fonts)
                        — Scores, Over numbers, Captain's Call header
                        — Sizes: 48px (score), 32px (call header), 24px (labels)

Body / UI:              IBM Plex Sans (Google Fonts)
                        — All prose, inputs, agent debate text
                        — Sizes: 16px (body), 14px (labels), 12px (metadata)

Monospace (stats):      IBM Plex Mono (Google Fonts)
                        — Win probability numbers, confidence scores, API data
```

### 6.3 Spacing Scale

```
4px / 8px / 12px / 16px / 24px / 32px / 48px / 64px
(Use 16px base, 8px grid)
```

### 6.4 Motion Design

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Agent card entry | Slide up + fade | 400ms | cubic-bezier(0.34, 1.56, 0.64, 1) spring |
| Captain's Call reveal | Slide from right | 500ms | ease-out |
| Score digit update | Flip (rotateX) | 300ms | ease-in-out |
| Confidence bar fill | Width expand | 800ms | ease-out |
| CTA hover | Glow pulse | 200ms | ease |
| Devil's Advocate entry | Bounce | 400ms | spring |
| Streaming text | Word fade-in | 20ms/word | linear |
| Gold border glow | Keyframe glow | 2s | ease-in-out |

### 6.5 Border Radius

```
Cards:      12px
Buttons:    8px
Inputs:     8px
Pills:      999px (full round)
Digits:     4px
```

### 6.6 Shadows

```
Card:       0 4px 24px rgba(0, 0, 0, 0.4)
CTA active: 0 0 20px rgba(245, 166, 35, 0.4)   (gold glow)
Agent active: 0 0 16px [agent-color with 0.3 opacity]
```

---

## 7. State Management & Data Flow

### 7.1 Application State Shape

```typescript
interface AppState {
  // Match Input
  matchState: {
    innings: 1 | 2;
    over: number;          // 0–19
    ball: number;          // 1–6
    battingTeam: IPLTeam;
    bowlingTeam: IPLTeam;
    score: number;
    wickets: number;
    target?: number;       // 2nd innings only
    strikerName: string;
    nonStrikerName: string;
    bowlers: BowlerState[];
    pitchType: 'flat' | 'turning' | 'two-paced';
    dewFactor: 'none' | 'light' | 'heavy';
    venue: IPLVenue;
    impactPlayerAvailable: boolean;
    powerplayActive: boolean;
    timeoutUsed: boolean;
  };

  // Debate State
  debate: {
    status: 'idle' | 'running' | 'complete' | 'error';
    agents: {
      statsAnalyst: AgentMessage | null;
      strategist: AgentMessage | null;
      devilsAdvocate: AgentMessage | null;
      strategistRevised: AgentMessage | null;
      commentator: AgentMessage | null;
    };
    currentAgent: AgentName | null;
  };

  // Decision
  captainsCall: {
    decision: string;
    reasoning: string;
    counterfactual: string;
    confidence: number;       // 0–100
    winProbBefore: number;
    winProbAfter: number;
    winProbCounterfactual: number;
  } | null;

  // History
  overHistory: OverDecision[];

  // UI
  ui: {
    drawerOpen: boolean;
    inputLocked: boolean;
  };
}

interface AgentMessage {
  agentName: AgentName;
  content: string;
  status: 'thinking' | 'streaming' | 'complete';
  streamedLength: number;
}

interface BowlerState {
  name: string;
  oversUsed: number;
  maxOvers: number;  // always 4 in T20
}
```

### 7.2 Data Flow Diagram

```
User fills Match Input Form
         │
         ▼
[STRATEGIZE] clicked
         │
         ▼
Frontend sends POST /api/strategize
  { matchState: {...} }
         │
         ▼
Backend orchestrates ADK multi-agent pipeline:
  1. Stats Analyst → Cricbuzz/Sportmonks API call → analysis
  2. Strategist → proposes decision
  3. Devil's Advocate → challenges proposal
  4. Strategist → revised stance
  5. Commentator → narrative wrap
  6. Aggregator → Captain's Call + confidence + win prob
         │
         ▼
Server-Sent Events (SSE) stream back to frontend:
  event: agent_start   { agent: "stats_analyst" }
  event: agent_token   { agent: "stats_analyst", token: "Rohit" }
  event: agent_token   { agent: "stats_analyst", token: " has" }
  ...
  event: agent_complete { agent: "stats_analyst" }
  event: agent_start   { agent: "strategist" }
  ...
  event: captains_call  { decision, reasoning, confidence, winProb... }
  event: done
         │
         ▼
Frontend progressively renders each agent's output
  → AgentCards appear in sequence
  → Text streams word by word
  → CaptainCallCard reveals on captains_call event
```

### 7.3 SSE Event Types

```typescript
type SSEEvent =
  | { type: 'agent_start'; agent: AgentName }
  | { type: 'agent_token'; agent: AgentName; token: string }
  | { type: 'agent_complete'; agent: AgentName }
  | { type: 'captains_call'; data: CaptainsCallData }
  | { type: 'error'; message: string }
  | { type: 'done' }
```

---

## 8. API Contract (Frontend ↔ Backend)

### 8.1 POST /api/strategize

**Request:**
```json
{
  "innings": 2,
  "over": 16,
  "ball": 2,
  "batting_team": "MI",
  "bowling_team": "CSK",
  "score": 142,
  "wickets": 3,
  "target": 189,
  "striker": "Rohit Sharma",
  "non_striker": "Hardik Pandya",
  "bowlers": [
    { "name": "Bumrah", "overs_used": 3 },
    { "name": "Siraj", "overs_used": 2 },
    { "name": "Deepak Chahar", "overs_used": 4 }
  ],
  "pitch_type": "flat",
  "dew_factor": "heavy",
  "venue": "Wankhede",
  "impact_player_available": true,
  "powerplay_active": false,
  "timeout_used": false
}
```

**Response:** SSE stream (Content-Type: text/event-stream)

### 8.2 GET /api/history

Returns array of past `OverDecision` objects for the session.

### 8.3 GET /api/health

Simple ping for frontend connection check.

---

## 9. Agentic UX Patterns

These are critical for the hackathon rubric criterion: **"Is the agent debate genuinely interesting? Roles well-decomposed?"**

### 9.1 Agent Identity Design

Each agent must feel like a *person*, not a label:

| Agent | Visual Identity | Text Style | Quirk |
|-------|----------------|------------|-------|
| Stats Analyst | Blue avatar with bar chart icon | Precise, numerical, cite-heavy | Always leads with a stat or percentage |
| Strategist | Gold avatar with target icon | Decisive, captain-speak, confident | Uses phrases like "We go with...", "The call is..." |
| Devil's Advocate | Red avatar with "?" icon | Provocative, worst-case focused | Opens with "But wait—" or "What if—" |
| Commentator | Green avatar with mic icon | Excited, narrative, fan-facing | Cricket metaphors, crowd energy language |

### 9.2 Debate Tension Visualization

When Devil's Advocate challenges Strategist:
- Both agent cards get connected by a subtle animated line
- Contested point highlighted in both cards
- "CHALLENGED" tag appears on Strategist's card
- When Strategist responds: "REVISED" badge replaces "CHALLENGED"
- If Strategist defends: "DEFENDED ✓" badge

### 9.3 Confidence Signals

- **High confidence (>80%):** Captain's Call card has solid gold border glow
- **Medium confidence (60–80%):** Amber dashed border
- **Low confidence (<60%):** Red dotted border with "UNCERTAIN CONDITIONS" tag

### 9.4 Real Tool Call Visualization

When Stats Analyst makes a live API call:
```
┌──────────────────────────────────────────────────┐
│ 📊 STATS ANALYST                                 │
│ [TOOL CALL] Fetching live data...               │
│ 🔗 Source: Cricbuzz API                          │
│ ████████████░░░░ Retrieving stats for: Bumrah... │
└──────────────────────────────────────────────────┘
```
Show the tool call with a mini progress bar and source attribution. This directly addresses the "real tool call" mandatory requirement and makes it **visible** to judges.

---

## 10. Responsive & Accessibility Requirements

### 10.1 Breakpoints

```
Mobile:  375px–767px     → Single column, tabbed navigation
Tablet:  768px–1199px    → 2-column (input + debate, call below)
Desktop: 1200px+         → Full 3-column layout
```

### 10.2 Mobile Tab Structure

```
[INPUT] [DEBATE] [CALL]
  ← swipeable tabs →
```
- Tab 2 (DEBATE) is active during debate
- Badge on CALL tab when Captain's Call is ready

### 10.3 Accessibility

- All inputs: proper `<label>` elements
- Agent cards: `role="log"` for live updates (ARIA)
- CTA button: `aria-busy="true"` during loading
- Color: never use color as the only differentiator (always add icons/text)
- Font size minimum: 14px for all readable text
- Tab order: logical left-to-right, top-to-bottom

---

## 11. Stitch Implementation Notes

### 11.1 What to Build in Stitch

Stitch is Google's AI-assisted frontend generator. Use it for:

1. **Scaffold the layout** — Describe the 3-column war room layout. Prompt: *"Dark themed 3-column sports analytics dashboard with sticky header, left form panel, center chat/streaming panel, right decision card panel"*

2. **Generate Agent Cards** — Prompt each agent card individually with persona colors

3. **Input Form** — Generate the match input form, then customize field types manually

4. **Scoreboard Strip** — Generate a horizontal data strip with dark background

5. **Captain's Call Card** — Generate as a hero card with prominent title and data fields

### 11.2 What to Hand-Code After Stitch

- SSE streaming integration (fetch + ReadableStream parsing)
- Word-by-word text animation
- Agent card sequencing logic (timing/state machine)
- Score digit flip animation
- Win probability gauge (SVG arc)
- Debate tension visualization (connecting lines, badges)
- All Gemini API integration

### 11.3 Stitch Prompts (Ready to Use)

**Prompt 1: Main Layout**
> "Create a dark-themed sports analytics web app layout called 'Captain Cool'. Dark navy background (#0B1426). Three panels: left panel (30%) with a match data form, center panel (45%) for AI agent debate cards with streaming text, right panel (25%) for a golden 'Captain's Call' decision card. Sticky top header strip showing cricket score data. No white backgrounds anywhere. Gold (#F5A623) as the primary accent color."

**Prompt 2: Agent Debate Card**
> "Create a dark card component for an AI agent named 'Stats Analyst'. Card has a blue (#3A86FF) left border, dark background, avatar with bar chart icon, agent name header with 'Data never lies' tagline, and a streaming text area. Include a 'LIVE' pulse indicator when active."

**Prompt 3: Input Form**
> "Create a match state form with dark inputs on dark background. Fields: innings toggle (1st/2nd pills), over numeric stepper, score input pair (runs/wickets), team selector dropdown, pitch type 3-way toggle (Flat/Turning/Two-paced), dew factor toggle, and a full-width gold gradient Submit button labeled 'STRATEGIZE'."

### 11.4 File Structure (Post-Stitch)

```
/src
  /components
    /ScoreboardStrip
    /MatchInputForm
    /AgentCard
    /DebateTheater
    /CaptainCallCard
    /OverHistoryDrawer
    /shared
      PillToggle.jsx
      NumericStepper.jsx
      ConfidenceBar.jsx
      WinProbGauge.jsx
      GoldCTA.jsx
  /hooks
    useDebateStream.js     ← SSE handling
    useMatchState.js       ← form state
    useOverHistory.js      ← history management
  /constants
    teams.js               ← IPL team data + logos
    venues.js              ← IPL venue list
    agents.js              ← agent config (name, color, icon, tagline)
  /styles
    globals.css            ← CSS variables, animations
  App.jsx
  main.jsx
```

---

## 12. Build Order & Priorities

Given the 3-hour constraint, follow this strict order:

### Phase 1: Skeleton (0–30 min)
- [ ] Stitch: Generate main 3-column layout
- [ ] Stitch: Generate scoreboard header strip
- [ ] Set up CSS variables (color palette, typography)
- [ ] Load Google Fonts (Bebas Neue, IBM Plex Sans)
- [ ] Wire up basic routing (Landing → Match)

### Phase 2: Input & Core UI (30–60 min)
- [ ] Stitch: Generate match input form
- [ ] Hand-implement: BowlerTable (dynamic rows)
- [ ] Hand-implement: PillToggle, NumericStepper
- [ ] Stitch: Generate Agent Cards (all 4 variants)
- [ ] Stitch: Generate Captain's Call card layout

### Phase 3: Agentic Streaming (60–120 min)
- [ ] Implement SSE connection (`useDebateStream` hook)
- [ ] Word-by-word streaming text animation
- [ ] Agent card sequencing state machine (idle → thinking → streaming → complete)
- [ ] Captain's Call reveal animation
- [ ] Tool call progress visualization

### Phase 4: Polish & Stretch (120–180 min)
- [ ] Score digit flip animations
- [ ] Confidence bar + win probability gauge
- [ ] Debate tension visualization (challenged/revised badges)
- [ ] Mobile responsive (tabbed layout)
- [ ] Over history drawer
- [ ] "Powered by Gemini" badge in header
- [ ] Landing page hero

### Must-Have vs Nice-to-Have for Demo

| Feature | Must Have | Nice to Have |
|---------|-----------|--------------|
| 3-column layout | ✅ | |
| All 4 agent cards | ✅ | |
| Streaming text | ✅ | |
| Captain's Call card | ✅ | |
| Match input form | ✅ | |
| Tool call visualization | ✅ | |
| Score flip animation | | ✅ |
| Win probability gauge | | ✅ |
| Voice in/out | | ✅ |
| History drawer | | ✅ |
| Debate tension lines | | ✅ |
| Counterfactual section | ✅ | |

---

## Appendix A: IPL Teams Reference

```javascript
const IPL_TEAMS = [
  { id: 'MI',  name: 'Mumbai Indians',        color: '#005DA0' },
  { id: 'CSK', name: 'Chennai Super Kings',   color: '#FDB913' },
  { id: 'RCB', name: 'Royal Challengers Bengaluru', color: '#EC1C24' },
  { id: 'KKR', name: 'Kolkata Knight Riders', color: '#3A225D' },
  { id: 'DC',  name: 'Delhi Capitals',        color: '#17479E' },
  { id: 'SRH', name: 'Sunrisers Hyderabad',   color: '#FF822A' },
  { id: 'PBKS',name: 'Punjab Kings',          color: '#ED1B24' },
  { id: 'RR',  name: 'Rajasthan Royals',      color: '#2D408B' },
  { id: 'GT',  name: 'Gujarat Titans',        color: '#1C2B5E' },
  { id: 'LSG', name: 'Lucknow Super Giants',  color: '#A72056' },
];
```

## Appendix B: IPL Venues Reference

```javascript
const IPL_VENUES = [
  'Wankhede Stadium, Mumbai',
  'M. A. Chidambaram Stadium, Chennai',
  'Eden Gardens, Kolkata',
  'M. Chinnaswamy Stadium, Bengaluru',
  'Arun Jaitley Stadium, Delhi',
  'Rajiv Gandhi International Stadium, Hyderabad',
  'Narendra Modi Stadium, Ahmedabad',
  'Sawai Mansingh Stadium, Jaipur',
  'Punjab Cricket Association Stadium, Mohali',
  'BRSABV Ekana Cricket Stadium, Lucknow',
];
```

---

*Document end. Total estimated frontend build time: 2.5–3 hours with Stitch + Antigravity.*  
*Backend (ADK multi-agent orchestration) should be built in parallel by a second team member.*
