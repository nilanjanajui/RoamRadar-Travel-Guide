# RoamRadar - Travel Guide

## Overview

RoamRadar is a responsive travel dashboard designed to help users explore destinations, check current weather, discover attractions, save favorites, and plan trips with AI assistance. It supports dark/light mode toggling, dynamic weather updates, and interactive maps powered by Leaflet. The app is built using Tailwind CSS, DaisyUI, Font Awesome, DOM manipulation, JavaScript core concepts, ES6, API fetching, and is fully mobile responsive.

## Features

### 🌤 Current Weather

* Fetches real-time weather for any searched city using Open-Meteo API.
* Displays temperature, wind speed, and direction.
* Smooth transition between static default weather and live API data.

### 🏛 Recommended Attractions

* Dynamically generates attraction cards based on city search.
* Each card includes an image, description, type badge, and favorite button.
* Clicking a card opens a modal with a carousel of images and a Leaflet map.

### ❤️ Favorites System

* Users can save cities to favorites.
* Favorites persist across sessions using localStorage.
* Clicking a favorite reloads its data.

### 🌙 Dark/Light Mode

* Toggle between dark and light themes using DaisyUI.
* Theme preference is saved in localStorage.

### 📝 Trip Journal

* Users can add notes about their trips.
* Supports multiple entries with a text area interface.

### 🔍 Autocomplete Search

* Type a city name to get live suggestions using OpenStreetMap Nominatim API.
* Selecting a suggestion instantly loads weather and attractions.

### 🗺 Interactive Maps

* Leaflet maps display each attraction in a modal.
* Maps include zoom controls and marker popups.

## Future Implementation

### 🤖 AI Assistance

* Personalized trip recommendations based on user preferences and past searches.
* Automated itinerary planning and optimization.
* AI-powered insights on attractions, weather, and local events.

## Tech Stack

* **Frontend:** HTML, Tailwind CSS, DaisyUI, Font Awesome
* **JavaScript Libraries:** Leaflet, Fetch API
* **APIs:** Open-Meteo (weather), OpenStreetMap Nominatim (city search)
* **Storage:** localStorage for favorites and theme preferences
* **Core JS Concepts:** DOM manipulation, ES6 features, event listeners, API fetching
* **Responsive Design:** Fully mobile responsive layout using Tailwind CSS

## File Structure

```
RoamRadar/
│   index.html
│   script/
│       app.js
│   style/
│       style.css
│   tailwind.init.css
```

### Setup & Usage

1. Clone the repository:

```
git clone https://github.com/nilanjanajui/RoamRadar-Travel-Guide.git
```

2. Open `index.html` in your browser.
3. Search for a city, view weather and attractions.
4. Save favorites, toggle dark/light mode, and explore trip journal features.

### Live Demo

Check out the live demo here: [https://roamradar.netlify.app/](https://roamradar.netlify.app/)



