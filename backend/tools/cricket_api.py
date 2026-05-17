"""
Cricket API — Sportmonks integration + mock fallback
"""
import os
import json
import httpx

SPORTMONKS_KEY = os.getenv("SPORTMONKS_API_KEY")
SPORTMONKS_BASE = "https://cricket.sportmonks.com/api/v2.0"

# ── Mock data ──────────────────────────────────────────────────────────────────
MOCK_SCORECARD = {
    "match": "MI vs CSK, IPL 2024, Match 42",
    "innings": 2,
    "batting_team": "MI",
    "bowling_team": "CSK",
    "score": "134/4",
    "overs": "16.2",
    "target": 178,
    "required_run_rate": 11.2,
    "venue": "Wankhede Stadium, Mumbai",
    "pitch": "two-paced",
    "dew": "heavy",
    "batters": [
        {"name": "Hardik Pandya", "runs": 34, "balls": 22, "sr": 154.5, "fours": 3, "sixes": 2},
        {"name": "Tim David",     "runs": 8,  "balls": 5,  "sr": 160.0, "fours": 1, "sixes": 0},
    ],
    "bowlers": [
        {"name": "Deepak Chahar",       "overs": 3, "runs": 28, "wickets": 1, "economy": 9.3},
        {"name": "Tushar Deshpande",    "overs": 3, "runs": 32, "wickets": 1, "economy": 10.7},
        {"name": "Jadeja",              "overs": 2, "runs": 14, "wickets": 1, "economy": 7.0},
        {"name": "Matheesha Pathirana", "overs": 2, "runs": 18, "wickets": 1, "economy": 9.0},
    ],
    "key_matchup": "Hardik Pandya vs Pathirana: 12 balls faced, 8 runs (SR 66), dismissed 2x. Pathirana's yorkers are Hardik's weakness.",
    "head_to_head": {
        "Hardik vs Deepak Chahar": {"balls": 18, "runs": 32, "SR": 177, "dismissals": 1},
        "Hardik vs Pathirana":     {"balls": 12, "runs": 8,  "SR": 66,  "dismissals": 2},
        "Tim David vs Jadeja":     {"balls": 8,  "runs": 14, "SR": 175, "dismissals": 0},
    }
}

MOCK_PLAYER_STATS = {
    "Hardik Pandya":        {"death_SR": 165, "vs_pace_death": 170, "vs_spin_death": 148},
    "Tim David":            {"death_SR": 190, "vs_pace_death": 185, "vs_spin_death": 195},
    "Bumrah":               {"death_economy": 7.8,  "yorker_pct": 0.45},
    "Pathirana":            {"death_economy": 8.1,  "yorker_pct": 0.52},
    "Deepak Chahar":        {"death_economy": 9.3,  "yorker_pct": 0.22},
    "Jadeja":               {"death_economy": 8.8,  "spin_effectiveness_dew": 0.4},
    "Tushar Deshpande":     {"death_economy": 10.7, "yorker_pct": 0.30},
    "Matheesha Pathirana":  {"death_economy": 8.1,  "yorker_pct": 0.52},
}


async def fetch_live_scorecard(match_id: str) -> dict:
    """Fetch live scorecard from Sportmonks. Falls back to mock."""
    if not SPORTMONKS_KEY or match_id.startswith("demo"):
        return MOCK_SCORECARD

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(
                f"{SPORTMONKS_BASE}/fixtures/{match_id}",
                params={
                    "api_token": SPORTMONKS_KEY,
                    "include": "batting,bowling,scoreboards,venue",
                }
            )
            if resp.status_code == 200:
                raw = resp.json().get("data", {})
                return _parse_sportmonks(raw)
    except Exception as e:
        print(f"Sportmonks error: {e}")

    return MOCK_SCORECARD


def _parse_sportmonks(raw: dict) -> dict:
    """Parse Sportmonks fixture response into our schema."""
    # Graceful extraction — fall back to mock values if fields missing
    try:
        scoreboards = raw.get("scoreboards", {}).get("data", [])
        batting = raw.get("batting", {}).get("data", [])
        bowling = raw.get("bowling", {}).get("data", [])

        score_str = "—"
        target    = None
        for sb in scoreboards:
            if sb.get("type") == "total":
                score_str = f"{sb.get('runs', 0)}/{sb.get('wickets', 0)}"
                target    = sb.get("target_score")

        batters = [
            {
                "name": b.get("player", {}).get("fullname", "Batter"),
                "runs": b.get("score", 0),
                "balls": b.get("ball", 0),
                "sr": round((b.get("score", 0) / max(b.get("ball", 1), 1)) * 100, 1),
                "fours": b.get("four_x", 0),
                "sixes": b.get("six_x", 0),
            }
            for b in batting[:2]
        ] or MOCK_SCORECARD["batters"]

        bowlers = [
            {
                "name": b.get("player", {}).get("fullname", "Bowler"),
                "overs": b.get("overs", 0),
                "runs":  b.get("runs", 0),
                "wickets": b.get("wickets", 0),
                "economy": round(b.get("rate", 0), 1),
            }
            for b in bowling[:5]
        ] or MOCK_SCORECARD["bowlers"]

        return {
            **MOCK_SCORECARD,
            "score":    score_str,
            "target":   target or MOCK_SCORECARD["target"],
            "batters":  batters,
            "bowlers":  bowlers,
            "source":   "Sportmonks (live)",
        }
    except Exception:
        return MOCK_SCORECARD


async def get_player_matchup(batter_name: str, bowler_name: str, phase: str = "death") -> dict:
    """Return historical head-to-head stats (mock — extend with Sportmonks player API)."""
    key = f"{batter_name} vs {bowler_name}"
    hth = MOCK_SCORECARD["head_to_head"].get(key)
    if hth:
        return {"matchup": key, "phase": phase, **hth}
    return {
        "matchup": key, "phase": phase,
        "note": "No historical data — using career averages",
        "batter_death_sr": MOCK_PLAYER_STATS.get(batter_name, {}).get("death_SR", 140),
        "bowler_death_eco": MOCK_PLAYER_STATS.get(bowler_name, {}).get("death_economy", 9.0),
    }


def build_fact_sheet(match_state: dict, win_prob: float, weather: dict = None) -> str:
    """Build structured fact-sheet string passed to the Strategist."""
    ms = match_state
    scorecard = MOCK_SCORECARD

    balls_rem = (20 - ms.get("over", 16)) * 6 - ms.get("ball", 2)
    runs_req  = (ms.get("target", 178) or 178) - ms.get("score", 134)
    rrr = round(runs_req / (balls_rem / 6), 2) if balls_rem > 0 else 99.9

    w = weather or {}
    lines = [
        f"=== FACT SHEET: {ms.get('battingTeam','?')} vs {ms.get('bowlingTeam','?')} ===",
        f"Innings: {ms.get('innings',2)} | Over: {ms.get('over',16)}.{ms.get('ball',2)} | Score: {ms.get('score',134)}/{ms.get('wickets',4)}",
        f"Target: {ms.get('target',178)} | Need: {runs_req} off {balls_rem} balls | RRR: {rrr}",
        f"Venue: {ms.get('venue','Wankhede')} | Pitch: {ms.get('pitchType','two-paced')} | Dew: {ms.get('dewFactor','heavy')}",
        "",
        "LIVE WEATHER (OpenWeatherMap):",
        f"  Temp: {w.get('temperature','28°C')} | Humidity: {w.get('humidity','82%')} | Wind: {w.get('wind','12 km/h')}",
        f"  Conditions: {w.get('conditions','partly cloudy')}",
        f"  Dew assessment: {w.get('dew_level','heavy').upper()} — {w.get('dew_impact','')}",
        "",
        f"Win probability (batting team): {int(win_prob*100)}%",
        "",
        "BATTERS AT CREASE:",
    ]
    for b in scorecard["batters"]:
        lines.append(f"  {b['name']}: {b['runs']} off {b['balls']} (SR {b['sr']}, {b['fours']}x4, {b['sixes']}x6)")

    lines += ["", "BOWLER STATUS:"]
    for bwl in ms.get("bowlers", scorecard["bowlers"]):
        name = bwl.get("name", "?")
        used = bwl.get("oversUsed", bwl.get("overs", 0))
        left = 4 - used
        stats = MOCK_PLAYER_STATS.get(name, {})
        eco   = stats.get("death_economy", "—")
        yp    = f", yorker%: {int(stats['yorker_pct']*100)}%" if "yorker_pct" in stats else ""
        lines.append(f"  {name}: {used}/4 overs | {left} left | death eco: {eco}{yp}")

    lines += ["", "KEY MATCHUP:", f"  {scorecard['key_matchup']}", "", "HEAD-TO-HEAD:"]
    for k, v in scorecard["head_to_head"].items():
        lines.append(f"  {k}: {v['runs']} runs / {v['balls']} balls (SR {v['SR']}, out {v['dismissals']}x)")

    if ms.get("impactPlayerAvailable"):
        lines += ["", "⭐ IMPACT PLAYER AVAILABLE — can be deployed as a bowling or batting sub."]

    return "\n".join(lines)
