from fastapi import FastAPI, Request, HTTPException
from fastapi import FastAPI, Request, Header
import requests
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"


def get_coordinates(city):
    response = requests.get(GEOCODING_URL, params={
                            "name": city, "count": 1}, timeout=10)
    data = response.json()
    results = data.get("results")
    if not results:
        return None
    place = results[0]
    return {
        "name": place["name"],
        "latitude": place["latitude"],
        "longitude": place["longitude"],
    }


def get_weather(latitude, longitude, current="temperature_2m,weather_code,wind_speed_10m"):
    response = requests.get(
        FORECAST_URL,
        params={
            "latitude": latitude,
            "longitude": longitude,
            "current": current,
            "timezone": "auto",
        },
        timeout=10
    )
    data = response.json()
    return data["current"]


@app.get("/api/health")
def status():
    return {"status": "ok"}


@app.get("/api/weather")
def weather(city: str):
    try:
        place = get_coordinates(city)
        if place is None:
            raise HTTPException(status_code=404, detail="City not found")

        current = get_weather(place["latitude"], place["longitude"])
    except requests.RequestException:
        raise HTTPException(
            status_code=502, detail="Weather service unavailable")

    return {
        "city": place["name"],
        "temperature": current["temperature_2m"],
        "wind_speed": current["wind_speed_10m"],
        "weather_code": current["weather_code"],
        "time": current["time"],
    }


app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def index():
    return FileResponse("static/index.html")
