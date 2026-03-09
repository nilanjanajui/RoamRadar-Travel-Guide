# RoamRadar Travel Dashboard

## Overview

RoamRadar is a modern, responsive travel dashboard designed to help users explore destinations, check current weather, discover attractions, save favorites, and plan trips with AI assistance. The app features dark/light mode toggling, dynamic weather updates, and interactive maps using Leaflet.

## Features

### 🌤 Current Weather

* Fetches real-time weather for any searched city.
* Displays temperature, wind speed, and direction.
* Smooth transition between static default weather and live API data.

### 🏛 Recommended Attractions

* Dynamically generates attraction cards based on city search.
* Each card contains an image, description, type badge, and favorite button.
* Click a card to open a modal with a carousel of images and a Leaflet map.

### ❤️ Favorites System

* Users can save cities to favorites.
* Favorites persist across sessions using `localStorage`.
* Clicking a favorite reloads its data.

### 🌙 Dark/Light Mode

* Toggle between dark and light themes using DaisyUI.
* Theme preference is saved in `localStorage`.

### 📝 Trip Journal

* Users can add notes about their trips.
* Supports multiple entries with a text area interface.

### 🔍 Autocomplete Search

* Type a city name to get live suggestions using OpenStreetMap Nominatim API.
* Select a suggestion to instantly load weather and attractions.

### 🗺 Interactive Maps

* Leaflet maps for each attraction in a modal.
* Zoom and marker popup included.

## Tech Stack

* **Frontend:** HTML, Tailwind CSS, DaisyUI, Font Awesome
* **JS Libraries:** Leaflet, Fetch API
* **APIs:** Open-Meteo (weather), OpenStreetMap Nominatim (city search)
* **Storage:** `localStorage` for favorites and theme preferences

## File Structure

```
RoamRadar/
│   index.html
│   script/
│       app.js
│   assets/
│       images/
```

## Setup & Usage

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/roamradar.git
   ```
2. Open `index.html` in your browser.
3. Search for a city, view weather and attractions.
4. Save favorites, toggle dark/light mode, and explore trip planning features.

## Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`
3. Make changes and commit: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Open a pull request.

## License

MIT License © 2026 RoamRadar Team

## Screenshots

*(Add screenshots of your app here)*

---

Made with ❤️ using Tailwind CSS and DaisyUI.
