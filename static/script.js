const themeToggle = document.getElementById("theme-toggle");

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
    try {
        localStorage.setItem("theme", theme);
    } catch (e) { }
}

let saved = null;
try {
    saved = localStorage.getItem("theme");
} catch (e) { }

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(saved || (prefersDark ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
});

const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const message = document.getElementById("message");
const resultCard = document.getElementById("result");

const WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with hail",
};

function describeWeather(code) {
    return WEATHER_CODES[code] || "Unknown conditions";
}

function showWeather(data) {
    document.getElementById("city-name").textContent = data.city;
    document.getElementById("condition").textContent = describeWeather(data.weather_code);
    document.getElementById("temperature").textContent = `${data.temperature}°C`;
    document.getElementById("wind").textContent = `Wind: ${data.wind_speed} km/h`;
    document.getElementById("time").textContent = `Updated: ${data.time.replace("T", " ")}`;
    resultCard.classList.remove("hidden");
}
let latestRequest = 0;

async function loadWeather(city) {
    const requestId = ++latestRequest;
    message.textContent = "Loading...";
    resultCard.classList.add("hidden");

    try {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        if (requestId !== latestRequest) return;

        if (!response.ok) {
            message.textContent =
                response.status === 404
                    ? "City not found. Check the spelling and try again."
                    : "Something went wrong. Please try again.";
            return;
        }

        const data = await response.json();
        if (requestId !== latestRequest) return;

        message.textContent = "";
        showWeather(data);
    } catch (error) {
        if (requestId !== latestRequest) return;
        message.textContent = "Could not reach the server. Check your connection.";
    }
}
async function loadWeather(city) {
    message.textContent = "Loading...";
    resultCard.classList.add("hidden");

    try {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);

        if (!response.ok) {
            message.textContent =
                response.status === 404
                    ? "City not found. Check the spelling and try again."
                    : "Something went wrong. Please try again.";
            return;
        }

        const data = await response.json();
        message.textContent = "";
        showWeather(data);
    } catch (error) {
        message.textContent = "Could not reach the server. Check your connection.";
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        loadWeather(city);
    }
});