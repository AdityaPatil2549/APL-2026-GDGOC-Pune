"""
Captain Cool — FastAPI Backend
Multi-agent IPL strategist powered by Gemini 2.5 Pro/Flash + Google ADK
"""
import asyncio
import json
import os
import re
import uuid
from typing import AsyncGenerator

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

import google.generativeai as genai

from prompts import (
    STATS_ANALYST_PROMPT,
    STRATEGIST_PROMPT,
    DEVILS_ADVOCATE_PROMPT,
    STRATEGIST_REVISED_PROMPT,
    COMMENTATOR_PROMPT,
)
from tools.cricket_api import build_fact_sheet, fetch_live_scorecard
from tools.weather import get_weather_dew
from tools.win_probability import calculate_win_probability, win_prob_description

load_dotenv()

GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="Captain Cool API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173", "https://*.vercel.app", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic models ────────────────────────────────────────────────────────────

class BowlerState(BaseModel):
    name: str
    oversUsed: int = 0

class MatchStateInput(BaseModel):
    innings: int = 2
    over: int = 16
    ball: int = 2
    battingTeam: str = "MI"
    bowlingTeam: str = "CSK"
    score: int = 134
    wickets: int = 4
    target: int | None = 178
    strikerName: str = "Hardik Pandya"
    nonStrikerName: str = "Tim David"
    bowlers: list[BowlerState] = []
    pitchType: str = "two-paced"
    dewFactor: str = "heavy"
    venue: str = "Wankhede Stadium, Mumbai"
    impactPlayerAvailable: bool = True
    powerplayActive: bool = False
    timeoutUsed: bool = False


# ── SSE helpers ────────────────────────────────────────────────────────────────

def sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


async def stream_gemini(
    model_name: str,
    system_prompt: str,
    user_message: str,
    agent_id: str,
) -> AsyncGenerator[str, None]:
    """Stream a Gemini response token by token, yielding SSE strings."""
    model = genai.GenerativeModel(
        model_name=model_name,
        system_instruction=system_prompt,
    )

    yield sse("agent_start", {"agent": agent_id})

    try:
        response = model.generate_content(
            user_message,
            stream=True,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=600,
            )
        )

        full_text = ""
        for chunk in response:
            token = chunk.text if hasattr(chunk, "text") else ""
            if token:
                full_text += token
                yield sse("agent_token", {"agent": agent_id, "token": token})
                await asyncio.sleep(0.02)  # ~20ms between chunks for streaming feel

        yield sse("agent_complete", {"agent": agent_id, "full_text": full_text})
        return full_text

    except Exception as e:
        yield sse("error", {"message": f"Agent {agent_id} failed: {str(e)}"})
        return ""


# ── Debate orchestrator ────────────────────────────────────────────────────────

async def run_debate(match_state: MatchStateInput) -> AsyncGenerator[str, None]:
    """
    Full 5-step debate pipeline:
    1. Stats Analyst (Flash) — fetch data + build fact-sheet
    2. Strategist (Pro) — propose decision
    3. Devil's Advocate (Pro) — challenge
    4. Strategist Revised (Pro) — defend/revise
    5. Commentator (Flash) — cricket-language wrap
    Then emit captains_call with structured data.
    """
    ms = match_state.dict()
    session_id = str(uuid.uuid4())[:8]

    # ── Step 0: Calculate win probability ─────────────────────────────────────
    balls_remaining = (20 - ms["over"]) * 6 - ms["ball"]
    runs_required   = (ms["target"] or 178) - ms["score"]
    dew_bool        = ms["dewFactor"] == "heavy"
    pitch_factor    = {"flat": 1.15, "two-paced": 0.95, "turning": 0.75}.get(ms["pitchType"], 1.0)

    win_prob_before = calculate_win_probability(
        innings=ms["innings"],
        balls_remaining=balls_remaining,
        runs_required=runs_required,
        wickets_in_hand=10 - ms["wickets"],
        pitch_factor=pitch_factor,
        dew_factor=dew_bool,
    )

    # ── Step 1: Stats Analyst ─────────────────────────────────────────────────
    yield sse("tool_call", {
        "source": "Sportmonks Cricket API",
        "label": f"Fetching live scorecard: {ms['battingTeam']} vs {ms['bowlingTeam']}…",
        "progress": 25,
    })
    await asyncio.sleep(0.4)
    scorecard = await fetch_live_scorecard("demo-match-001")

    yield sse("tool_call", {
        "source": "OpenWeatherMap API",
        "label": f"Fetching live weather for {ms['venue'].split(',')[0]}…",
        "progress": 55,
    })
    weather = await get_weather_dew(ms["venue"])
    # Update dew_bool from live weather if available
    if weather.get("source", "") != "mock (API unavailable)":
        dew_bool = weather.get("dew_level", "none") in ("light", "heavy")

    yield sse("tool_call", {
        "source": "Win Probability Engine",
        "label": "Running DLS-style probability model…",
        "progress": 80,
    })
    await asyncio.sleep(0.2)

    fact_sheet = build_fact_sheet(ms, win_prob_before, weather)

    yield sse("tool_call", {
        "source": "Analysis Complete ✓",
        "label": f"Fact-sheet ready. Dew: {weather.get('dew_level','?').upper()} | Win prob: {int(win_prob_before*100)}%",
        "progress": 100,
    })
    await asyncio.sleep(0.2)

    analyst_message = f"""Match State received. I have run all available tools.
Here is the structured fact-sheet:

{fact_sheet}

Win probability for {ms['battingTeam']}: {int(win_prob_before*100)}% ({win_prob_description(win_prob_before)})
Key finding: Dew factor is {'SIGNIFICANT — will affect grip and swing in later overs' if dew_bool else 'minimal today'}.
Pitch is {ms['pitchType']} — {'batters struggling with variable bounce' if ms['pitchType'] == 'two-paced' else 'conditions noted'}.
"""

    full_texts = {}

    # Stream analyst output
    agent_gen = stream_gemini("gemini-2.5-flash", STATS_ANALYST_PROMPT, analyst_message, "stats_analyst")
    async for chunk in agent_gen:
        yield chunk
        if chunk.startswith("event: agent_complete"):
            data = json.loads(chunk.split("data: ")[1])
            full_texts["stats_analyst"] = data.get("full_text", analyst_message)

    # ── Step 2: Strategist ────────────────────────────────────────────────────
    strategist_input = f"""FACT SHEET FROM STATS ANALYST:
{full_texts.get('stats_analyst', fact_sheet)}

Match context: {ms['innings']}nd innings, over {ms['over']}.{ms['ball']}
{ms['battingTeam']} need {runs_required} runs off {balls_remaining} balls (RRR: {round(runs_required/(balls_remaining/6),1) if balls_remaining > 0 else 'N/A'})
Dew: {ms['dewFactor']} | Pitch: {ms['pitchType']} | Impact player: {'Available' if ms.get('impactPlayerAvailable') else 'Used'}

Make your tactical call for the NEXT over."""

    async for chunk in stream_gemini("gemini-2.5-flash", STRATEGIST_PROMPT, strategist_input, "strategist"):
        yield chunk
        if chunk.startswith("event: agent_complete"):
            data = json.loads(chunk.split("data: ")[1])
            full_texts["strategist"] = data.get("full_text", "")

    # ── Step 3: Devil's Advocate ──────────────────────────────────────────────
    da_input = f"""The Strategist has proposed:

{full_texts.get('strategist', '')}

Full fact-sheet for reference:
{fact_sheet}

Now challenge this. Find the strongest counter-argument."""

    async for chunk in stream_gemini("gemini-2.5-flash", DEVILS_ADVOCATE_PROMPT, da_input, "devils_advocate"):
        yield chunk
        if chunk.startswith("event: agent_complete"):
            data = json.loads(chunk.split("data: ")[1])
            full_texts["devils_advocate"] = data.get("full_text", "")

    # ── Step 4: Strategist Revised ────────────────────────────────────────────
    revised_input = f"""Your original proposal:
{full_texts.get('strategist', '')}

The Devil's Advocate challenged you:
{full_texts.get('devils_advocate', '')}

Full fact-sheet:
{fact_sheet}

Now respond. Defend or revise — then lock in."""

    async for chunk in stream_gemini("gemini-2.5-flash", STRATEGIST_REVISED_PROMPT, revised_input, "strategist_revised"):
        yield chunk
        if chunk.startswith("event: agent_complete"):
            data = json.loads(chunk.split("data: ")[1])
            full_texts["strategist_revised"] = data.get("full_text", "")

    # ── Step 5: Commentator ───────────────────────────────────────────────────
    commentator_input = f"""The debate is complete. Here is the full transcript:

STRATEGIST (Round 1):
{full_texts.get('strategist', '')}

DEVIL'S ADVOCATE:
{full_texts.get('devils_advocate', '')}

STRATEGIST (Final / Revised):
{full_texts.get('strategist_revised', '')}

Match: {ms['battingTeam']} need {runs_required} off {balls_remaining} balls at {ms['venue']}.
Deliver the final verdict in cricket commentary style."""

    async for chunk in stream_gemini("gemini-2.5-flash", COMMENTATOR_PROMPT, commentator_input, "commentator"):
        yield chunk
        if chunk.startswith("event: agent_complete"):
            data = json.loads(chunk.split("data: ")[1])
            full_texts["commentator"] = data.get("full_text", "")

    # ── Step 6: Build Captain's Call structured output ────────────────────────
    revised_text = full_texts.get("strategist_revised", "")

    # Extract decision line
    decision_match = re.search(r'\[DECISION\]:\s*(.+?)(?:\n|$)', revised_text, re.IGNORECASE)
    decision = decision_match.group(1).strip() if decision_match else "See strategist's final call"

    # Estimate win probability after decision (modest boost)
    win_prob_after = min(0.97, win_prob_before + 0.06 + (0.03 * (1 if "defend" in revised_text.lower() else 0.5)))
    win_prob_cf    = max(0.02, win_prob_before - 0.05)  # counterfactual: wrong call

    captains_call_data = {
        "session_id":        session_id,
        "decision":          decision[:120],
        "fieldSetup":        "See full reasoning below",
        "reasoning":         full_texts.get("strategist_revised", "")[:600],
        "commentaryOutput":  full_texts.get("commentator", "")[:500],
        "confidence":        round(min(0.95, win_prob_before + 0.15), 2),
        "winProbBefore":     int(win_prob_before * 100),
        "winProbAfter":      int(win_prob_after * 100),
        "counterfactual":    full_texts.get("devils_advocate", "")[:400],
        "winProbCounterfactual": int(win_prob_cf * 100),
    }

    yield sse("captains_call", captains_call_data)
    yield sse("done", {"session_id": session_id})


# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.post("/api/strategize")
async def strategize(match_state: MatchStateInput):
    """Main endpoint — streams the full multi-agent debate via SSE."""
    return StreamingResponse(
        run_debate(match_state),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        }
    )


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "Captain Cool API", "gemini_configured": bool(GEMINI_API_KEY)}


@app.get("/api/demo")
async def demo():
    """Return the sample MI vs CSK scenario."""
    return {
        "innings": 2, "over": 16, "ball": 2,
        "battingTeam": "MI", "bowlingTeam": "CSK",
        "score": 134, "wickets": 4, "target": 178,
        "strikerName": "Hardik Pandya", "nonStrikerName": "Tim David",
        "pitchType": "two-paced", "dewFactor": "heavy",
        "venue": "Wankhede Stadium, Mumbai",
        "bowlers": [
            {"name": "Deepak Chahar", "oversUsed": 3},
            {"name": "Tushar Deshpande", "oversUsed": 3},
            {"name": "Jadeja", "oversUsed": 2},
            {"name": "Matheesha Pathirana", "oversUsed": 2},
        ],
        "impactPlayerAvailable": True,
    }
