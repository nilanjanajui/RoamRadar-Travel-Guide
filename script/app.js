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


// ------------------------------
// STORAGE HELPERS
// ------------------------------
function getFavorites() {
    return JSON.parse(localStorage.getItem("roamRadarFavorites") || "[]");
}

function saveFavorites(list) {
    localStorage.setItem("roamRadarFavorites", JSON.stringify(list));
}

function getTheme() {
    return localStorage.getItem("roamRadarTheme") || "light";
}

function saveTheme(theme) {
    localStorage.setItem("roamRadarTheme", theme);
}

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
let modalMapInstance = null;
let carouselIntervalId = null;

function closeModal() {
    modal.classList.add("hidden");

    if (carouselIntervalId) {
        clearInterval(carouselIntervalId);
        carouselIntervalId = null;
    }

    if (modalMapInstance) {
        modalMapInstance.remove();
        modalMapInstance = null;
    }
}

modal.querySelector("button").addEventListener("click", closeModal);

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


function fetchAttractions(city, lat, lon) {
    const types = ["Sight", "Nature", "Cultural"];
    const attractions = types.map((type, i) => ({
        name: `${city} ${type} Spot`,
        images: [
            `https://picsum.photos/seed/${encodeURIComponent(`${city}-${type}-1`)}/800/600`,
            `https://picsum.photos/seed/${encodeURIComponent(`${city}-${type}-2`)}/800/600`,
            `https://picsum.photos/seed/${encodeURIComponent(`${city}-${type}-3`)}/800/600`
        ],
        description: `Discover the ${type.toLowerCase()} of ${city}.`,
        type,
        lat: lat + i * 0.01,
        lon: lon + i * 0.01
    }));

    renderAttractions(attractions);
}

function renderAttractions(list) {
    // make sure to select the container where cards go
    const container = document.querySelector('#attractions-grid + .grid');
    container.innerHTML = '';

    list.forEach(att => {
        const card = document.createElement("div");
        card.className = "card bg-base-100 shadow cursor-pointer";
        const isFavorite = getFavorites().includes(att.name);
        const fallbackImage = `https://picsum.photos/seed/${encodeURIComponent(`${att.name}-fallback`)}/800/600`;

        card.innerHTML = `
            <figure>
                <img src="${att.images[0]}" alt="${att.name}" class="w-full h-40 object-cover rounded-t-lg">
            </figure>
            <div class="card-body p-4">
                <h3 class="font-semibold">${att.name}</h3>
                <p class="text-xs opacity-70">${att.description}</p>
                <div class="flex justify-between items-center mt-2">
                    <span class="badge badge-sm">${att.type}</span>
                    <i class="fa-regular fa-heart favorite-btn cursor-pointer ${isFavorite ? 'text-red-500' : ''}"></i>
                </div>
            </div>
        `;

        // favorite toggle
        card.querySelector(".favorite-btn").addEventListener("click", e => {
            e.stopPropagation();
            toggleFavorite(att.name);
            card.querySelector(".favorite-btn").classList.toggle("text-red-500");
        });

        // Recover if a remote image fails to load.
        const cardImage = card.querySelector("img");
        cardImage.addEventListener("error", () => {
            cardImage.src = fallbackImage;
        }, { once: true });

        // modal click
        card.addEventListener("click", () => showAttractionModal(att));

        container.appendChild(card);
    });
}

function bindStaticAttractionFavoriteButtons() {
    const cards = document.querySelectorAll('#attractions-grid + .grid .card');
    cards.forEach(card => {
        const title = card.querySelector('h3')?.textContent?.trim();
        const heart = card.querySelector('i.fa-heart');
        if (!title || !heart) return;

        if (getFavorites().includes(title)) {
            heart.classList.add('text-red-500');
        }

        heart.classList.add('favorite-btn', 'cursor-pointer');
        heart.addEventListener('click', e => {
            e.stopPropagation();
            toggleFavorite(title);
            heart.classList.toggle('text-red-500');
        });
    });
}

// ------------------------------
// FAVORITES SYSTEM
// ------------------------------
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
    const container = document.querySelector('#favorites-container .space-y-3');
    container.innerHTML = '';

    if (favs.length === 0) {
        container.innerHTML = `<p class="text-xs opacity-70">No favorites yet.</p>`;
    }

    favs.forEach(city => {
        const div = document.createElement("div");
        div.className = "flex justify-between items-center cursor-pointer hover:bg-base-200 p-1 rounded";

        div.innerHTML = `
            <p class="font-medium text-sm">${city}</p>
            <i class="fa-solid fa-heart text-red-500 cursor-pointer"></i>
        `;

        // Click on heart toggles favorite
        div.querySelector("i").addEventListener("click", e => {
            e.stopPropagation();
            toggleFavorite(city);
        });

        // Click on city reloads data
        div.querySelector("p").addEventListener("click", () => {
            searchInput.value = city;
            // Geocode and run an actual search for this favorite city.
            fetch(`${NOMINATIM_URL}?q=${encodeURIComponent(city)}&format=json&limit=1`)
                .then(res => res.json())
                .then(data => {
                    if (!data.length) return;
                    handleSearch({
                        lat: parseFloat(data[0].lat),
                        lon: parseFloat(data[0].lon),
                        name: data[0].display_name || city
                    });
                })
                .catch(err => console.error("Favorite city lookup failed:", err));
        });

        container.appendChild(div);
    });
}

// Initialize favorites on page load
renderFavorites();

// ------------------------------
// MODAL + LEAFLET MAP + CAROUSEL
// ------------------------------
function showAttractionModal(att) {
    // Ensure previous resources are cleared before creating new modal content.
    if (carouselIntervalId) {
        clearInterval(carouselIntervalId);
        carouselIntervalId = null;
    }
    if (modalMapInstance) {
        modalMapInstance.remove();
        modalMapInstance = null;
    }

    modalTitle.textContent = att.name;
    modalDesc.textContent = att.description;

    // Carousel
    carouselDiv.innerHTML = '';
    const fallbackImage = `https://picsum.photos/seed/${encodeURIComponent(`${att.name}-modal-fallback`)}/800/600`;
    att.images.forEach((img, i) => {
        const imgEl = document.createElement("img");
        imgEl.src = img;
        imgEl.className = `absolute top-0 left-0 w-full h-64 object-cover transition-opacity duration-500 ${i === 0 ? 'opacity-100' : 'opacity-0'}`;
        imgEl.addEventListener("error", () => {
            imgEl.src = fallbackImage;
        }, { once: true });
        carouselDiv.appendChild(imgEl);
    });

    let index = 0;
    carouselIntervalId = setInterval(() => {
        const imgs = carouselDiv.querySelectorAll("img");
        imgs.forEach((img, i) => img.style.opacity = i === index ? '1' : '0');
        index = (index + 1) % att.images.length;
    }, 3000);

    // Leaflet map
    modalMapDiv.innerHTML = '';
    modalMapInstance = L.map(modalMapDiv).setView([att.lat, att.lon], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(modalMapInstance);
    L.marker([att.lat, att.lon]).addTo(modalMapInstance).bindPopup(att.name).openPopup();

    modal.classList.remove("hidden");
}

// ------------------------------
// INITIALIZE
// ------------------------------
function init() { renderFavorites(); }
init();
bindStaticAttractionFavoriteButtons();

// ------------------------------
// DARK / LIGHT MODE
// ------------------------------
const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem("roamRadarTheme");
if (savedTheme) root.setAttribute("data-theme", savedTheme);

// Toggle theme
themeToggle.addEventListener("click", () => {
    const currentTheme = root.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    root.setAttribute("data-theme", newTheme);
    localStorage.setItem("roamRadarTheme", newTheme);

    // optional: toggle icon
    themeToggle.innerHTML = newTheme === "dark"
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
});