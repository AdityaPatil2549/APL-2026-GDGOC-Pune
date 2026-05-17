"""
Win Probability Calculator — DLS-style T20 model
Returns batting team's probability of winning (0.0 – 1.0)
"""
import math


def calculate_win_probability(
    innings: int,
    balls_remaining: int,
    runs_required: int,
    wickets_in_hand: int,
    pitch_factor: float = 1.0,   # 0.7 (turning) to 1.2 (flat)
    dew_factor: bool = False,
) -> float:
    """
    Simplified T20 win probability model.
    Based on required run rate, wickets in hand, and conditions.
    """
    if innings == 1:
        return 0.5  # first innings: neutral

    if balls_remaining <= 0 or wickets_in_hand <= 0:
        return 0.0 if runs_required > 0 else 1.0

    if runs_required <= 0:
        return 1.0

    overs_remaining = balls_remaining / 6
    rrr = runs_required / overs_remaining

    # Base win probability from RRR (sigmoid curve)
    # At RRR=6: ~85% chance. At RRR=12: ~25%. At RRR=15+: ~8%
    base_prob = 1 / (1 + math.exp(0.55 * (rrr - 9.0)))

    # Wicket adjustment: each wicket lost reduces probability
    # 10 wickets in hand = no penalty. 5 left = -15%. 2 left = -35%
    wicket_factor = 0.5 + 0.05 * wickets_in_hand  # 0.55 to 1.0

    # Pitch factor (batting difficulty)
    # Turning pitch = harder to bat → lower prob
    # Flat pitch → higher prob
    pitch_adj = 0.85 + 0.15 * pitch_factor  # ~0.7–1.0

    # Dew: helps batting team in 2nd innings (easier to bat, harder to grip)
    dew_boost = 1.08 if dew_factor else 1.0

    raw = base_prob * wicket_factor * pitch_adj * dew_boost
    return round(max(0.02, min(0.98, raw)), 2)


def win_prob_description(prob: float) -> str:
    if prob >= 0.75: return "strong favourite"
    if prob >= 0.55: return "slight advantage"
    if prob >= 0.45: return "evenly poised"
    if prob >= 0.30: return "slight underdog"
    return "significant underdog"
