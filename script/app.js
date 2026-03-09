// ------------------------------
// GLOBAL CONSTANTS
// ------------------------------
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// ------------------------------
// DOM ELEMENTS
// ------------------------------
const searchInput = document.querySelector('input[type="text"]');
const weatherTitle = document.querySelector('.card.bg-primary .card-body h2');
const weatherTempStatic = document.querySelector('#weather-temp-static');
const weatherTempLive = document.querySelector('#weather-temp-live');
const weatherDescStatic = document.querySelector('#weather-desc-static');
const weatherDescLive = document.querySelector('#weather-desc-live');
const attractionsGrid = document.querySelector('.grid.md\\:grid-cols-3.gap-4');
const favoritesList = document.querySelector('.favorites-container') || document.createElement('div');

// ------------------------------
// MODAL
// ------------------------------
const modal = document.createElement('div');
modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden";
modal.innerHTML = `
<div class="bg-base-100 rounded-xl max-w-xl w-full p-4 relative">
    <button class="absolute top-2 right-2 text-xl font-bold">&times;</button>
    <h3 class="font-bold text-lg mb-2" id="modal-title"></h3>
    <div id="carousel" class="relative overflow-hidden h-64 mb-3 rounded-lg"></div>
    <p class="mb-3" id="modal-description"></p>
    <div id="modal-map" class="w-full h-64 rounded-lg"></div>
</div>
`;
document.body.appendChild(modal);
const modalTitle = modal.querySelector("#modal-title");
const modalDesc = modal.querySelector("#modal-description");
const modalMapDiv = modal.querySelector("#modal-map");
const carouselDiv = modal.querySelector("#carousel");
modal.querySelector("button").addEventListener("click", () => modal.classList.add("hidden"));

// ------------------------------
// AUTOCOMPLETE
// ------------------------------
const suggestionBox = document.createElement('ul');
suggestionBox.className = "absolute bg-base-100 shadow-lg rounded-md w-full max-h-60 overflow-auto z-50";
searchInput.parentElement.style.position = "relative";
searchInput.parentElement.appendChild(suggestionBox);
let debounceTimeout;

searchInput.addEventListener('input', e => {
    const query = e.target.value.trim();
    clearTimeout(debounceTimeout);
    if (!query) { suggestionBox.innerHTML = ''; return; }

    debounceTimeout = setTimeout(() => fetchCitySuggestions(query), 300);
});

async function fetchCitySuggestions(query) {
    try {
        const res = await fetch(`${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`);
        const data = await res.json();
        suggestionBox.innerHTML = '';

        data.forEach(city => {
            const li = document.createElement("li");
            li.className = "p-2 hover:bg-base-200 cursor-pointer text-sm";
            li.textContent = city.display_name;

            li.addEventListener("click", () => {
                searchInput.value = city.display_name;
                suggestionBox.innerHTML = '';
                handleSearch({
                    lat: parseFloat(city.lat),
                    lon: parseFloat(city.lon),
                    name: city.display_name
                });
            });

            suggestionBox.appendChild(li);
        });
    } catch (error) { console.error("Autocomplete failed:", error); }
}

document.addEventListener('click', e => {
    if (!searchInput.parentElement.contains(e.target)) suggestionBox.innerHTML = '';
});

// ------------------------------
// SEARCH CONTROLLER
// ------------------------------
async function handleSearch(cityObj) {
    const { name, lat, lon } = cityObj;
    await fetchWeather(lat, lon, name);
    fetchAttractions(name, lat, lon);
}

// ------------------------------
// WEATHER
// ------------------------------
async function fetchWeather(lat, lon, displayName) {
    try {
        const res = await fetch(`${WEATHER_URL}?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        const current = data.current_weather;
        const units = data.current_weather_units || {};
        const temperatureUnit = units.temperature || "";
        const windUnit = units.windspeed || "";

        weatherTitle.textContent = displayName;

        weatherTempLive.textContent = `${current.temperature.toFixed(1)} ${temperatureUnit}`.trim();
        weatherDescLive.textContent = `${current.windspeed.toFixed(1)} ${windUnit} | ${current.winddirection}deg`;

        weatherTempStatic.classList.add("hidden");
        weatherDescStatic.classList.add("hidden");
        weatherTempLive.classList.remove("hidden");
        weatherDescLive.classList.remove("hidden");
    } catch (err) {
        console.error("Weather fetch failed:", err);
        weatherTitle.textContent = displayName;

        weatherTempStatic.classList.remove("hidden");
        weatherDescStatic.classList.remove("hidden");
        weatherTempLive.classList.add("hidden");
        weatherDescLive.classList.add("hidden");
    }
}

// ------------------------------
// ATTRACTIONS
// ------------------------------
function fetchAttractions(city, lat, lon) {
    const types = ["Sight", "Nature", "Cultural"];
    const attractions = types.map((type, i) => ({
        name: `${city} ${type} Spot`,
        images: [
            `https://source.unsplash.com/400x300/?${encodeURIComponent(city)},${encodeURIComponent(type)},1`,
            `https://source.unsplash.com/400x300/?${encodeURIComponent(city)},${encodeURIComponent(type)},2`,
            `https://source.unsplash.com/400x300/?${encodeURIComponent(city)},${encodeURIComponent(type)},3`
        ],
        description: `Discover the ${type.toLowerCase()} of ${city}.`,
        type,
        lat: lat + i * 0.01,
        lon: lon + i * 0.01
    }));

    renderAttractions(attractions);
}

function renderAttractions(list) {
    attractionsGrid.innerHTML = '';

    list.forEach(att => {
        const card = document.createElement("div");
        card.className = "card bg-base-100 shadow cursor-pointer";

        card.innerHTML = `
        <figure><img src="${att.images[0]}" alt="${att.name}"></figure>
        <div class="card-body p-4">
        <h3 class="font-semibold">${att.name}</h3>
        <p class="text-xs opacity-70">${att.description}</p>
        <div class="flex justify-between items-center mt-2">
            <span class="badge badge-sm">${att.type}</span>
            <i class="fa-regular fa-heart favorite-btn cursor-pointer"></i>
        </div>
        </div>
    `;

        // Favorite
        card.querySelector(".favorite-btn").addEventListener("click", e => {
            e.stopPropagation();
            toggleFavorite(att.name);
            card.querySelector(".favorite-btn").classList.toggle("text-red-500");
        });

        // Modal on click
        card.addEventListener("click", () => showAttractionModal(att));

        attractionsGrid.appendChild(card);
    });
}

// ------------------------------
// MODAL + LEAFLET MAP + CAROUSEL
// ------------------------------
function showAttractionModal(att) {
    modalTitle.textContent = att.name;
    modalDesc.textContent = att.description;

    // Carousel
    carouselDiv.innerHTML = '';
    att.images.forEach((img, i) => {
        const imgEl = document.createElement("img");
        imgEl.src = img;
        imgEl.className = `absolute top-0 left-0 w-full h-64 object-cover transition-opacity duration-500 ${i === 0 ? 'opacity-100' : 'opacity-0'}`;
        carouselDiv.appendChild(imgEl);
    });

    let index = 0;
    setInterval(() => {
        const imgs = carouselDiv.querySelectorAll("img");
        imgs.forEach((img, i) => img.style.opacity = i === index ? '1' : '0');
        index = (index + 1) % att.images.length;
    }, 3000);

    // Leaflet map
    modalMapDiv.innerHTML = '';
    const map = L.map(modalMapDiv).setView([att.lat, att.lon], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    L.marker([att.lat, att.lon]).addTo(map).bindPopup(att.name).openPopup();

    modal.classList.remove("hidden");
}

// ------------------------------
// FAVORITES
// ------------------------------
function getFavorites() { return JSON.parse(localStorage.getItem("roamRadarFavorites") || "[]"); }
function saveFavorites(list) { localStorage.setItem("roamRadarFavorites", JSON.stringify(list)); }

function toggleFavorite(name) {
    const favs = getFavorites();
    if (favs.includes(name)) saveFavorites(favs.filter(c => c !== name));
    else { favs.push(name); saveFavorites(favs); }
    renderFavorites();
}

function renderFavorites() {
    const favs = getFavorites();
    favoritesList.innerHTML = '';
    if (favs.length === 0) favoritesList.innerHTML = `<p class="text-xs opacity-70">No favorites yet.</p>`;
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
// INITIALIZE
// ------------------------------
function init() { renderFavorites(); }
init();