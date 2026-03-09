// ------------------------------
// GLOBAL CONSTANTS
// ------------------------------
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// DOM ELEMENTS
const searchInput = document.querySelector('input[type="text"]');
const weatherTitle = document.querySelector('.card.bg-primary .card-body h2');
const weatherTemp = document.querySelector('.card.bg-primary .text-4xl');
const weatherDesc = document.querySelector('.card.bg-primary p.text-sm');
const attractionsGrid = document.querySelector('.grid.md\\:grid-cols-3.gap-4');
const favoritesList = document.querySelector('.favorites-container') || document.createElement('div');

let modalMap;

// ------------------------------
// INITIAL EVENT LISTENERS
// ------------------------------
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) handleSearch(city);
    }
});

// ------------------------------
// MAIN SEARCH CONTROLLER
// ------------------------------
async function handleSearch(city) {
    const cityData = await fetchCityCoordinates(city);
    if (!cityData) return alert("City not found!");

    fetchWeather(cityData);
    fetchCityImage(cityData);
    fetchAttractions(cityData);
}

// ------------------------------
// FETCH CITY COORDINATES
// ------------------------------
async function fetchCityCoordinates(city) {
    try {
        const response = await fetch(`${NOMINATIM_URL}?q=${encodeURIComponent(city)}&format=json&limit=1`);
        const data = await response.json();
        if (!data.length) return null;
        const { lat, lon, display_name } = data[0];
        return { lat: parseFloat(lat), lon: parseFloat(lon), name: display_name };
    } catch (error) {
        console.error("City search failed:", error);
        return null;
    }
}

// ------------------------------
// FETCH WEATHER
// ------------------------------
async function fetchWeather(cityData) {
    try {
        const { lat, lon, name } = cityData;
        const res = await fetch(`${WEATHER_URL}?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        if (!data.current_weather) return;

        weatherTitle.textContent = name;
        weatherTemp.textContent = `${Math.round(data.current_weather.temperature)}°C`;
        weatherDesc.textContent = `Wind: ${data.current_weather.windspeed} km/h`;
    } catch (error) {
        console.error("Weather fetch failed:", error);
    }
}

// ------------------------------
// FETCH CITY IMAGE
// ------------------------------
function fetchCityImage(cityData) {
    const { name } = cityData;
    const url = `https://source.unsplash.com/600x400/?${encodeURIComponent(name)},city`;
    // Set as first attraction image if you like, or update a banner
    // Example: first attraction card
}

// ------------------------------
// FETCH ATTRACTIONS
// ------------------------------
async function fetchAttractions(cityData) {
    try {
        const { lat, lon } = cityData;
        const response = await fetch(`${NOMINATIM_URL}?q=${encodeURIComponent(cityData.name)}&format=json&limit=10`);
        const places = await response.json();

        const attractions = places.map(place => ({
            name: place.display_name,
            img: `https://source.unsplash.com/400x300/?${encodeURIComponent(place.display_name)}`,
            description: place.type || "Interesting place to visit",
            type: place.type || "Sight",
            lat: parseFloat(place.lat),
            lon: parseFloat(place.lon)
        }));

        renderAttractions(attractions);
    } catch (error) {
        console.error("Attractions fetch failed:", error);
    }
}

// ------------------------------
// RENDER ATTRACTIONS
// ------------------------------
function renderAttractions(list) {
    attractionsGrid.innerHTML = "";

    list.forEach((att) => {
        const card = document.createElement("div");
        card.className = "card bg-base-100 shadow cursor-pointer";

        card.innerHTML = `
      <figure><img src="${att.img}" alt="${att.name}"></figure>
      <div class="card-body p-4">
        <h3 class="font-semibold">${att.name}</h3>
        <p class="text-xs opacity-70">${att.description.slice(0, 60)}...</p>
        <div class="flex justify-between items-center mt-2">
          <span class="badge badge-sm">${att.type}</span>
          <i class="fa-regular fa-heart favorite-btn cursor-pointer"></i>
        </div>
      </div>
    `;

        // favorite toggle
        card.querySelector(".favorite-btn").addEventListener("click", (e) => {
            e.stopPropagation(); // prevent modal open
            toggleFavorite(att.name);
            card.querySelector(".favorite-btn").classList.toggle("text-red-500");
        });

        // open modal
        card.addEventListener("click", () => openAttractionModal(att));

        attractionsGrid.appendChild(card);
    });
}

// ------------------------------
// FAVORITES STORAGE / UI
// ------------------------------
function getFavorites() {
    return JSON.parse(localStorage.getItem("roamRadarFavorites") || "[]");
}

function saveFavorites(list) {
    localStorage.setItem("roamRadarFavorites", JSON.stringify(list));
}

function toggleFavorite(name) {
    const favs = getFavorites();
    if (favs.includes(name)) {
        saveFavorites(favs.filter(c => c !== name));
    } else {
        favs.push(name);
        saveFavorites(favs);
    }
    renderFavorites();
}

function renderFavorites() {
    const favs = getFavorites();
    favoritesList.innerHTML = "";

    if (!favs.length) {
        favoritesList.innerHTML = `<p class="text-xs opacity-70">No favorites yet.</p>`;
        return;
    }

    favs.forEach(city => {
        const div = document.createElement("div");
        div.className = "flex justify-between items-center";
        div.innerHTML = `
      <p class="font-medium text-sm">${city}</p>
      <i class="fa-solid fa-heart text-red-500 cursor-pointer"></i>
    `;

        div.querySelector("i").addEventListener("click", () => toggleFavorite(city));
        favoritesList.appendChild(div);
    });
}

// ------------------------------
// MODAL WITH LEAFLET MAP
// ------------------------------
function openAttractionModal(att) {
    document.getElementById("modal-img").src = att.img;
    document.getElementById("modal-title").textContent = att.name;
    document.getElementById("modal-desc").textContent = att.description;
    document.getElementById("modal-type").textContent = att.type;

    document.getElementById("attraction-modal-toggle").checked = true;

    setTimeout(() => {
        const mapContainer = document.getElementById("modal-map");
        mapContainer.innerHTML = "";

        const lat = att.lat || 0;
        const lon = att.lon || 0;

        modalMap = L.map("modal-map").setView([lat, lon], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(modalMap);

        L.marker([lat, lon]).addTo(modalMap)
            .bindPopup(att.name)
            .openPopup();
    }, 100);
}

// ------------------------------
// INITIALIZE
// ------------------------------
function init() {
    renderFavorites();
}

init();