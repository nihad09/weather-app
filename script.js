const cities = {
  london: { temp: 15, condition: "Cloudy", humidity: 65, wind: 12 },
  paris: { temp: 18, condition: "Sunny", humidity: 55, wind: 8 },
  tokyo: { temp: 22, condition: "Rainy", humidity: 75, wind: 15 },
  sydney: { temp: 25, condition: "Sunny", humidity: 50, wind: 7 },
};

let searchHistory = [];
const MAX_HISTORY = 5;

const conditions = ["Sunny", "Cloudy", "Rainy", "Snowy"];

async function fetchWeatherData(city) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const cityData = cities[city.toLowerCase()];
      if (cityData) {
        resolve({
          city: city,
          temperature: cityData.temp,
          condition: cityData.condition,
          humidity: cityData.humidity,
          windSpeed: cityData.wind,
          feelsLike: cityData.temp + Math.floor(Math.random() * 6) - 3,
        });
      } else {
        reject(`Weather data not found for ${city}`);
      }
    }, Math.random() * 2000 + 500);
  });
}

async function fetchForecastData(city) {
  const baseWeather = await fetchWeatherData(city);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const forecast = [];

      for (let i = 1; i <= 5; i++) {
        forecast.push({
          temperature:
            baseWeather.temperature + Math.floor(Math.random() * 10) - 5,
          condition: conditions[Math.floor(Math.random() * 4)],
          //   day: bugun + (i * gun)
          day: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        });
      }
      resolve(forecast);
    }, Math.random() * 1000 + 300);
  });
}

async function searchWeather() {
  const city = document.getElementById("city-input").value.trim();

  if (!city) {
    showError("Please enter a city name");
    return;
  }

  try {
    showLoading(true);
    hideError();
    hideWeatherDisplaly();

    const [weatherData, forecastData] = await Promise.all([
      fetchWeatherData(city),
      fetchForecastData(city),
    ]);
    displayWeatherData(weatherData, forecastData);
    addToSearchHistory(city);
  } catch (error) {
    showError(error);
  } finally {
    showLoading(false);
  }
}

function showLoading(show) {
  document.getElementById("loading-indicator").style.display = show
    ? "block"
    : "none";
}

function hideError() {
  document.getElementById("error-message").style.display = "none";
}

function hideWeatherDisplaly() {
  document.getElementById("weather-display").style.display = "none";
}

function showError(message) {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";

  setTimeout(() => {
    hideError();
  }, 3000);
}

function displayWeatherData(weather, forecast) {
  // 1. Show weather display
  document.getElementById("weather-display").style.display = "block";

  // 2. Update current weather
  document.getElementById("city-name").textContent = weather.city;
  document.getElementById(
    "temperature"
  ).textContent = `${weather.temperature}℃`;
  document.getElementById("condition").textContent = weather.condition;
  document.getElementById("humidity").textContent = `${weather.humidity}%`;
  document.getElementById(
    "wind-speed"
  ).textContent = `${weather.windSpeed} km/h`;
  document.getElementById("feels-like").textContent = `${weather.feelsLike}℃`;

  // 3. Update forecast
  const forecastGrid = document.getElementById("forecast-grid");
  forecastGrid.innerHTML = "";

  forecast.forEach((day) => {
    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
        <div class="forecast-day">${day.day}</div>
        <div class="forecast-temp">${day.temperature}</div>
        <div class="forecast-condition">${day.condition}</div>    
    `;
    forecastGrid.appendChild(card);
  });

  document.getElementById("weather-display").scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
}

function addToSearchHistory(city) {
  searchHistory = searchHistory.filter(
    (item) => item.toLowerCase() !== city.toLowerCase()
  );

  searchHistory.unshift(city);

  if (searchHistory.length > MAX_HISTORY) {
    searchHistory = searchHistory.slice(0, MAX_HISTORY);
  }

  saveSearchHistory();
  displaySearchHistory();
}

function displaySearchHistory() {
  const historyContainer = document.getElementById("search-history");

  if (searchHistory.length === 0) {
    historyContainer.innerHTML =
      '<div class="empty-state"> No recent searches yet. Search for a city to get started! </div>';
    return;
  }
  historyContainer.innerHTML = "";

  searchHistory.forEach((city) => {
    const item = document.createElement("div");
    item.className = "history-item";
    item.textContent = city;
    item.onclick = () => {
      document.getElementById("city-input").value = city;
      searchWeather();
    };

    historyContainer.appendChild(item);
  });
}

function saveSearchHistory() {
  localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHistory));
}

function loadSearchHistory() {
  const saved = localStorage.getItem("weatherSearchHistory");
  if (saved) {
    searchHistory = JSON.parse(saved);
    displaySearchHistory();
  }
}

// TODO HW 1
async function comparePopularCities() {
 try {
    showLoading(true);
    hideError();

    const cityNames = Object.keys(cities);

    const weatherPromises = cityNames.map((city) => fetchWeatherData(city));
    const weatherDataArray = await Promise.all(weatherPromises);

    displayCityComparison(weatherDataArray);
  } catch (error) {
    showError("Failed to compare cities: " + error);
  } finally {
    showLoading(false);
  }
}
// TODO HW 2
function displayCityComparison(weatherDataArray) {
 const comparisonContainer = document.getElementById("city-comparison");
  comparisonContainer.innerHTML = "";

  weatherDataArray.forEach((weather) => {
    const card = document.createElement("div");
    card.className = "comparison-card";
    card.innerHTML = `
      <h3>${weather.city}</h3>
      <p>Temperature: ${weather.temperature}℃</p>
      <p>Condition: ${weather.condition}</p>
      <p>Humidity: ${weather.humidity}%</p>
      <p>Wind: ${weather.windSpeed} km/h</p>
      <p>Feels Like: ${weather.feelsLike}℃</p>
    `;
    comparisonContainer.appendChild(card);
  });


  comparisonContainer.style.display = "block";
  comparisonContainer.scrollIntoView({ behavior: "smooth" });
}


// Event Listeners
document.getElementById("search-btn").addEventListener("click", searchWeather);

document.addEventListener("DOMContentLoaded", () => {
  loadSearchHistory();

  document.getElementById("compare-btn").addEventListener("click", comparePopularCities);

  // auto saerfch for default citty on firs laod
});

document.getElementById("city-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchWeather();
  }
});