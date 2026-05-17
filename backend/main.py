"""
Captain Cool — FastAPI Backend v2.0
True Gemini Function Calling + Real APIs + Vision + Override + Auto-retry
"""
import asyncio, base64, json, os, re, uuid
from typing import AsyncGenerator

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, File, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import google.generativeai as genai

from prompts import (STATS_ANALYST_PROMPT, STRATEGIST_PROMPT,
                     DEVILS_ADVOCATE_PROMPT, STRATEGIST_REVISED_PROMPT,
                     COMMENTATOR_PROMPT, VISION_EXTRACT_PROMPT)
from tools.cricket_api import build_fact_sheet, fetch_live_scorecard
from tools.weather import get_weather_dew
from tools.win_probability import calculate_win_probability, win_prob_description

load_dotenv()
GEMINI_API_KEY  = os.getenv("GOOGLE_API_KEY")
SPORTMONKS_KEY  = os.getenv("SPORTMONKS_API_KEY")
OPENWEATHER_KEY = os.getenv("OPENWEATHERMAP_KEY")
genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="Captain Cool API", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])


# ── Models ──────────────────────────────────────────────────────────────────────
class BowlerState(BaseModel):
    name: str
    oversUsed: int = 0

class MatchStateInput(BaseModel):
    innings: int = 2;       over: int = 16;           ball: int = 2
    battingTeam: str = "MI"; bowlingTeam: str = "CSK"
    score: int = 134;        wickets: int = 4;          target: int | None = 178
    strikerName: str = "Hardik Pandya"; nonStrikerName: str = "Tim David"
    bowlers: list[BowlerState] = []
    pitchType: str = "two-paced"; dewFactor: str = "heavy"
    venue: str = "Wankhede Stadium, Mumbai"
    impactPlayerAvailable: bool = True; powerplayActive: bool = False
    timeoutUsed: bool = False;  captainOverride: str | None = None


# ── SSE helpers ──────────────────────────────────────────────────────────────────
def sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


async def stream_gemini(model_name, system_prompt, user_message, agent_id,
                         max_retries=3) -> AsyncGenerator[str, None]:
    """Stream Gemini with exponential backoff retry on rate limits."""
    model = genai.GenerativeModel(model_name, system_instruction=system_prompt)
    yield sse("agent_start", {"agent": agent_id})
    for attempt in range(max_retries):
        try:
            response = model.generate_content(
                user_message, stream=True,
                generation_config=genai.types.GenerationConfig(temperature=0.75, max_output_tokens=700))
            full_text = ""
            for chunk in response:
                token = getattr(chunk, "text", "")
                if token:
                    full_text += token
                    yield sse("agent_token", {"agent": agent_id, "token": token})
                    await asyncio.sleep(0.015)
            yield sse("agent_complete", {"agent": agent_id, "full_text": full_text})
            return
        except Exception as e:
            err = str(e)
            if ("429" in err or "503" in err or "quota" in err.lower()) and attempt < max_retries - 1:
                wait = 2 ** attempt
                yield sse("retry", {"agent": agent_id, "attempt": attempt+1, "wait": wait})
                await asyncio.sleep(wait)
            else:
                yield sse("error", {"message": f"{agent_id} failed: {err[:120]}"})
                yield sse("agent_complete", {"agent": agent_id, "full_text": ""})
                return


# ── Gemini Function Calling for Stats Analyst ────────────────────────────────────
TOOLS = [genai.protos.Tool(function_declarations=[
    genai.protos.FunctionDeclaration(
        name="fetch_cricket_scorecard",
        description="Fetch live scorecard with batters, bowlers, score.",
        parameters=genai.protos.Schema(type=genai.protos.Type.OBJECT, properties={
            "batting_team": genai.protos.Schema(type=genai.protos.Type.STRING),
            "bowling_team": genai.protos.Schema(type=genai.protos.Type.STRING),
            "venue":        genai.protos.Schema(type=genai.protos.Type.STRING),
        }, required=["batting_team", "bowling_team"]),
    ),
    genai.protos.FunctionDeclaration(
        name="get_venue_weather",
        description="Get live weather + dew assessment for a cricket venue.",
        parameters=genai.protos.Schema(type=genai.protos.Type.OBJECT, properties={
            "venue": genai.protos.Schema(type=genai.protos.Type.STRING),
        }, required=["venue"]),
    ),
    genai.protos.FunctionDeclaration(
        name="calculate_win_probability",
        description="Calculate batting team win probability (DLS-style).",
        parameters=genai.protos.Schema(type=genai.protos.Type.OBJECT, properties={
            "balls_remaining": genai.protos.Schema(type=genai.protos.Type.INTEGER),
            "runs_required":   genai.protos.Schema(type=genai.protos.Type.INTEGER),
            "wickets_in_hand": genai.protos.Schema(type=genai.protos.Type.INTEGER),
            "pitch_type":      genai.protos.Schema(type=genai.protos.Type.STRING),
            "dew_factor":      genai.protos.Schema(type=genai.protos.Type.BOOLEAN),
        }, required=["balls_remaining", "runs_required", "wickets_in_hand"]),
    ),
    genai.protos.FunctionDeclaration(
        name="get_player_matchup",
        description="Get head-to-head stats between a batter and a bowler.",
        parameters=genai.protos.Schema(type=genai.protos.Type.OBJECT, properties={
            "batter_name": genai.protos.Schema(type=genai.protos.Type.STRING),
            "bowler_name": genai.protos.Schema(type=genai.protos.Type.STRING),
        }, required=["batter_name", "bowler_name"]),
    ),
])]


async def execute_fc(func_name: str, args: dict) -> dict:
    if func_name == "fetch_cricket_scorecard":
        return await fetch_live_scorecard("demo-match-001")
    elif func_name == "get_venue_weather":
        return await get_weather_dew(args.get("venue", "Wankhede Stadium, Mumbai"))
    elif func_name == "calculate_win_probability":
        pm = {"flat": 1.15, "two-paced": 0.95, "turning": 0.75}
        p  = calculate_win_probability(
            innings=2, balls_remaining=args["balls_remaining"],
            runs_required=args["runs_required"], wickets_in_hand=args["wickets_in_hand"],
            pitch_factor=pm.get(args.get("pitch_type","two-paced"), 0.95),
            dew_factor=args.get("dew_factor", False))
        return {"win_probability": p, "description": win_prob_description(p)}
    elif func_name == "get_player_matchup":
        from tools.cricket_api import get_player_matchup
        return await get_player_matchup(args.get("batter_name",""), args.get("bowler_name",""))
    return {"error": f"Unknown function: {func_name}"}


async def run_stats_analyst_fc(ms: dict, balls_rem: int, runs_req: int) -> AsyncGenerator[str, None]:
    """Stats Analyst that autonomously calls tools via Gemini Function Calling."""
    model = genai.GenerativeModel("gemini-2.5-flash", system_instruction=STATS_ANALYST_PROMPT, tools=TOOLS)
    user_msg = (
        f"Build a tactical fact-sheet for: {ms['battingTeam']} vs {ms['bowlingTeam']} "
        f"at {ms['venue']}. Innings {ms['innings']}, over {ms['over']}.{ms['ball']}, "
        f"score {ms['score']}/{ms['wickets']}, target {ms.get('target','N/A')}, "
        f"need {runs_req} off {balls_rem} balls. "
        f"Pitch: {ms['pitchType']}, dew observed: {ms['dewFactor']}. "
        f"Batters: {ms['strikerName']} (striker), {ms['nonStrikerName']}. "
        f"Use your tools to gather live data before writing the fact-sheet."
    )
    yield sse("agent_start", {"agent": "stats_analyst"})
    chat = model.start_chat()
    response = chat.send_message(user_msg, generation_config=genai.types.GenerationConfig(temperature=0.3))
    full_text = ""

    for _ in range(8):  # max tool-call rounds
        fc_parts = [p for p in response.candidates[0].content.parts
                    if hasattr(p, "function_call") and p.function_call.name]
        if not fc_parts:
            for part in response.candidates[0].content.parts:
                if hasattr(part, "text") and part.text:
                    full_text += part.text
            break

        fn_responses = []
        labels = {
            "fetch_cricket_scorecard":   f"🏏 Scorecard: {ms['battingTeam']} vs {ms['bowlingTeam']}",
            "get_venue_weather":         f"🌤️ Weather: {ms['venue'].split(',')[0]}",
            "calculate_win_probability": "📊 Win probability…",
            "get_player_matchup":        "⚔️ Player matchup…",
        }
        for part in fc_parts:
            fc   = part.function_call
            args = dict(fc.args)
            yield sse("tool_call", {"source": fc.name.replace("_"," ").title(),
                                     "label": labels.get(fc.name, fc.name), "progress": 50})
            result = await execute_fc(fc.name, args)
            yield sse("tool_call", {"source": fc.name.replace("_"," ").title(),
                                     "label": labels.get(fc.name, fc.name) + " ✓", "progress": 100})
            fn_responses.append(genai.protos.Part(
                function_response=genai.protos.FunctionResponse(
                    name=fc.name,
                    response={"result": json.dumps(result, default=str)},
                )
            ))

        response = chat.send_message(
            genai.protos.Content(parts=fn_responses, role="function"),
            generation_config=genai.types.GenerationConfig(temperature=0.3, max_output_tokens=800))

    # Stream text word-by-word for natural feel
    words = full_text.split()
    for i in range(0, len(words), 4):
        chunk = " ".join(words[i:i+4]) + " "
        yield sse("agent_token", {"agent": "stats_analyst", "token": chunk})
        await asyncio.sleep(0.035)
    yield sse("agent_complete", {"agent": "stats_analyst", "full_text": full_text})


# ── Scrape URL endpoint ──────────────────────────────────────────────────────────
@app.get("/api/scrape")
async def scrape_match_url(url: str = Query(...)):
    try:
        async with httpx.AsyncClient(timeout=10.0,
            headers={"User-Agent": "Mozilla/5.0"}) as client:
            resp = await client.get(url, follow_redirects=True)
            html = resp.text[:12000]

        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = (
            'Extract match state from this cricket HTML. Return ONLY valid JSON — no markdown.\n'
            'Schema: {"innings":int,"over":int,"ball":int,"battingTeam":"","bowlingTeam":"",'
            '"score":int,"wickets":int,"target":int|null,"strikerName":"","nonStrikerName":"",'
            '"venue":"","pitchType":"flat|two-paced|turning","dewFactor":"none|light|heavy",'
            '"bowlers":[{"name":"","oversUsed":int}],"impactPlayerAvailable":false}\n\n'
            f'HTML:\n{html}'
        )
        raw = re.sub(r"```json\s*|\s*```", "", model.generate_content(prompt).text.strip())
        return {"success": True, "matchState": json.loads(raw)}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ── Screenshot Vision endpoint ───────────────────────────────────────────────────
@app.post("/api/vision-extract")
async def vision_extract(file: UploadFile = File(...)):
    try:
        data      = await file.read()
        b64       = base64.b64encode(data).decode()
        mime      = file.content_type or "image/jpeg"
        model     = genai.GenerativeModel("gemini-2.5-flash")
        response  = model.generate_content([
            {"mime_type": mime, "data": b64},
            VISION_EXTRACT_PROMPT,
        ])
        raw = re.sub(r"```json\s*|\s*```", "", response.text.strip())
        return {"success": True, "matchState": json.loads(raw)}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ── Main debate pipeline ─────────────────────────────────────────────────────────
async def run_debate(match_state: MatchStateInput) -> AsyncGenerator[str, None]:
    ms          = match_state.dict()
    session_id  = str(uuid.uuid4())[:8]
    balls_rem   = (20 - ms["over"]) * 6 - ms["ball"]
    runs_req    = (ms.get("target") or 178) - ms["score"]
    override    = ms.get("captainOverride") or ""
    pitch_map   = {"flat": 1.15, "two-paced": 0.95, "turning": 0.75}
    dew_bool    = ms["dewFactor"] == "heavy"

    win_prob_before = calculate_win_probability(
        innings=ms["innings"], balls_remaining=balls_rem, runs_required=runs_req,
        wickets_in_hand=10 - ms["wickets"],
        pitch_factor=pitch_map.get(ms["pitchType"], 1.0), dew_factor=dew_bool)

    full_texts = {}

    # Step 1: Stats Analyst — True Function Calling
    try:
        async for chunk in run_stats_analyst_fc(ms, balls_rem, runs_req):
            yield chunk
            if chunk.startswith("event: agent_complete"):
                d = json.loads(chunk.split("data: ")[1])
                full_texts["stats_analyst"] = d.get("full_text", "")
    except Exception as e:
        yield sse("retry", {"agent": "stats_analyst", "reason": str(e)[:80], "attempt": 1, "wait": 0})
        weather    = await get_weather_dew(ms["venue"])
        fact_sheet = build_fact_sheet(ms, win_prob_before, weather)
        full_texts["stats_analyst"] = fact_sheet
        yield sse("agent_start",    {"agent": "stats_analyst"})
        yield sse("agent_token",    {"agent": "stats_analyst", "token": fact_sheet})
        yield sse("agent_complete", {"agent": "stats_analyst", "full_text": fact_sheet})

    # Build fact_sheet for reference in later agents
    weather    = await get_weather_dew(ms["venue"])
    fact_sheet = build_fact_sheet(ms, win_prob_before, weather)
    if weather.get("source", "") != "mock (API unavailable)":
        dew_bool = weather.get("dew_level", "none") in ("light", "heavy")

    rrr_str = f"{round(runs_req/(balls_rem/6),1)}" if balls_rem > 0 else "N/A"
    override_note = f'\n\n⚠️ CAPTAIN\'S OVERRIDE: "{override}"\nIncorporate this into your analysis.' if override else ""

    if override:
        yield sse("override_injected", {"message": override})

    # Step 2: Strategist
    s_input = (f"FACT SHEET:\n{full_texts.get('stats_analyst', fact_sheet)}\n\n"
               f"Over {ms['over']}.{ms['ball']} | {ms['battingTeam']} need {runs_req} off {balls_rem} balls (RRR {rrr_str})\n"
               f"Dew: {ms['dewFactor']} | Pitch: {ms['pitchType']} | Impact player: {'Available' if ms.get('impactPlayerAvailable') else 'Used'}"
               f"{override_note}\n\nMake your tactical call for the NEXT over.")
    async for chunk in stream_gemini("gemini-2.5-flash", STRATEGIST_PROMPT, s_input, "strategist"):
        yield chunk
        if chunk.startswith("event: agent_complete"):
            full_texts["strategist"] = json.loads(chunk.split("data: ")[1]).get("full_text", "")

    # Step 3: Devil's Advocate
    da_input = (f"Strategist proposed:\n{full_texts.get('strategist','')}\n\n"
                f"Fact-sheet:\n{fact_sheet}{override_note}\n\nChallenge this.")
    async for chunk in stream_gemini("gemini-2.5-flash", DEVILS_ADVOCATE_PROMPT, da_input, "devils_advocate"):
        yield chunk
        if chunk.startswith("event: agent_complete"):
            full_texts["devils_advocate"] = json.loads(chunk.split("data: ")[1]).get("full_text", "")

    # Step 4: Strategist Revised
    r_input = (f"Your proposal:\n{full_texts.get('strategist','')}\n\n"
               f"Challenge:\n{full_texts.get('devils_advocate','')}\n\n"
               f"Fact-sheet:\n{fact_sheet}{override_note}\n\nDefend or revise — lock in.")
    async for chunk in stream_gemini("gemini-2.5-flash", STRATEGIST_REVISED_PROMPT, r_input, "strategist_revised"):
        yield chunk
        if chunk.startswith("event: agent_complete"):
            full_texts["strategist_revised"] = json.loads(chunk.split("data: ")[1]).get("full_text", "")

    # Step 5: Commentator
    c_input = (f"Debate transcript:\nSTRATEGIST R1: {full_texts.get('strategist','')}\n"
               f"DEVIL'S ADVOCATE: {full_texts.get('devils_advocate','')}\n"
               f"STRATEGIST FINAL: {full_texts.get('strategist_revised','')}\n\n"
               f"Match: {ms['battingTeam']} need {runs_req} off {balls_rem} balls at {ms['venue']}."
               + (f" Captain overrode with: {override}" if override else "")
               + "\n\nDeliver final verdict in cricket commentary style.")
    async for chunk in stream_gemini("gemini-2.5-flash", COMMENTATOR_PROMPT, c_input, "commentator"):
        yield chunk
        if chunk.startswith("event: agent_complete"):
            full_texts["commentator"] = json.loads(chunk.split("data: ")[1]).get("full_text", "")

    # Step 6: Captain's Call
    revised_text  = full_texts.get("strategist_revised", "")
    dm = re.search(r'\[DECISION\]:\s*(.+?)(?:\n|$)', revised_text, re.IGNORECASE)
    decision      = dm.group(1).strip() if dm else "See strategist's final analysis"
    win_prob_after = min(0.97, win_prob_before + 0.08)
    win_prob_cf    = max(0.02, win_prob_before - 0.06)

    yield sse("captains_call", {
        "session_id":            session_id,
        "decision":              decision[:140],
        "stance":                "REVISED" if "revised" in revised_text.lower()[:50] else "DEFENDED",
        "reasoning":             revised_text[:700],
        "commentaryOutput":      full_texts.get("commentator", "")[:600],
        "confidence":            round(min(0.95, win_prob_before + 0.15), 2),
        "winProbBefore":         int(win_prob_before * 100),
        "winProbAfter":          int(win_prob_after * 100),
        "winProbCounterfactual": int(win_prob_cf * 100),
        "counterfactual":        full_texts.get("devils_advocate", "")[:500],
        "captainOverride":       override or None,
        "weatherSummary":        f"{weather.get('temperature','?')} | {weather.get('humidity','?')} | Dew: {weather.get('dew_level','?')}",
    })
    yield sse("done", {"session_id": session_id})


# ── Route wiring ─────────────────────────────────────────────────────────────────
@app.post("/api/strategize")
async def strategize(match_state: MatchStateInput):
    return StreamingResponse(run_debate(match_state), media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"})

@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "2.0.0",
            "gemini": bool(GEMINI_API_KEY), "sportmonks": bool(SPORTMONKS_KEY),
            "openweather": bool(OPENWEATHER_KEY),
            "features": ["function_calling","vision_extract","url_scrape","captain_override","auto_retry"]}

@app.get("/api/demo")
async def demo():
    return {"innings":2,"over":16,"ball":2,"battingTeam":"MI","bowlingTeam":"CSK",
            "score":134,"wickets":4,"target":178,"strikerName":"Hardik Pandya",
            "nonStrikerName":"Tim David","pitchType":"two-paced","dewFactor":"heavy",
            "venue":"Wankhede Stadium, Mumbai",
            "bowlers":[{"name":"Deepak Chahar","oversUsed":3},{"name":"Tushar Deshpande","oversUsed":3},
                       {"name":"Jadeja","oversUsed":2},{"name":"Matheesha Pathirana","oversUsed":2}],
            "impactPlayerAvailable":True}
