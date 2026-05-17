"""
Weather tool — OpenWeatherMap integration for live dew/weather data
"""
import os
import httpx
from typing import Optional

OPENWEATHER_KEY = os.getenv("OPENWEATHERMAP_KEY")

# Venue → city/lat-lon mapping for IPL stadiums
VENUE_COORDS = {
    "Wankhede Stadium, Mumbai":                        {"q": "Mumbai,IN",    "lat": 18.9388, "lon": 72.8258},
    "M. A. Chidambaram Stadium, Chennai":              {"q": "Chennai,IN",   "lat": 13.0629, "lon": 80.2793},
    "Eden Gardens, Kolkata":                           {"q": "Kolkata,IN",   "lat": 22.5645, "lon": 88.3433},
    "M. Chinnaswamy Stadium, Bengaluru":               {"q": "Bengaluru,IN", "lat": 12.9792, "lon": 77.5996},
    "Arun Jaitley Stadium, Delhi":                     {"q": "Delhi,IN",     "lat": 28.6389, "lon": 77.2090},
    "Rajiv Gandhi International Stadium, Hyderabad":   {"q": "Hyderabad,IN", "lat": 17.4062, "lon": 78.5480},
    "Narendra Modi Stadium, Ahmedabad":                {"q": "Ahmedabad,IN", "lat": 23.0898, "lon": 72.5975},
    "Sawai Mansingh Stadium, Jaipur":                  {"q": "Jaipur,IN",    "lat": 26.8929, "lon": 75.8069},
    "Punjab Cricket Association Stadium, Mohali":      {"q": "Mohali,IN",    "lat": 30.7046, "lon": 76.7179},
    "BRSABV Ekana Cricket Stadium, Lucknow":           {"q": "Lucknow,IN",   "lat": 26.8467, "lon": 80.9462},
}


async def get_weather_dew(venue: str, hour: int = 20) -> dict:
    """
    Fetch live weather for an IPL venue and assess dew likelihood.
    Falls back to reasonable defaults if API unavailable.
    """
    if not OPENWEATHER_KEY:
        return _mock_weather(venue)

    coords = VENUE_COORDS.get(venue)
    if not coords:
        return _mock_weather(venue)

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={
                    "lat": coords["lat"],
                    "lon": coords["lon"],
                    "appid": OPENWEATHER_KEY,
                    "units": "metric",
                }
            )
            if resp.status_code != 200:
                return _mock_weather(venue)

            data = resp.json()
            return _parse_weather(data, venue)

    except Exception as e:
        print(f"Weather API error: {e}")
        return _mock_weather(venue)


def _parse_weather(data: dict, venue: str) -> dict:
    """Parse OWM response into cricket-relevant weather report."""
    temp      = data.get("main", {}).get("temp", 28)
    humidity  = data.get("main", {}).get("humidity", 70)
    wind_kph  = round(data.get("wind", {}).get("speed", 3) * 3.6, 1)
    desc      = data.get("weather", [{}])[0].get("description", "clear sky")
    city      = data.get("name", venue.split(",")[0])

    # Dew assessment: humidity > 80% at evening = likely heavy dew
    if humidity >= 85:
        dew_level = "heavy"
        dew_impact = "Significant dew expected. Ball will become slippery after over 15. Seam bowlers severely affected. Batting team has advantage."
    elif humidity >= 70:
        dew_level = "light"
        dew_impact = "Mild dew likely in death overs. Slight advantage to batting team. Spinners may lose grip."
    else:
        dew_level = "none"
        dew_impact = "Dry conditions. No dew impact. All bowling types equally effective."

    return {
        "venue":       venue,
        "city":        city,
        "temperature": f"{temp:.1f}°C",
        "humidity":    f"{humidity}%",
        "wind":        f"{wind_kph} km/h",
        "conditions":  desc,
        "dew_level":   dew_level,
        "dew_impact":  dew_impact,
        "source":      "OpenWeatherMap (live)",
    }


def _mock_weather(venue: str) -> dict:
    """Fallback mock weather data."""
    city = venue.split(",")[0]
    return {
        "venue":       venue,
        "city":        city,
        "temperature": "28.0°C",
        "humidity":    "82%",
        "wind":        "12.0 km/h",
        "conditions":  "partly cloudy",
        "dew_level":   "heavy",
        "dew_impact":  "Heavy dew expected post over 14. Ball will become difficult to grip. Strong batting advantage.",
        "source":      "mock (API unavailable)",
    }
