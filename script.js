const locations = {
  "GoodWinds": { query: "Dorado,PR", coords: [18.474611640654814, -66.29507660865785] },
  "Goyu": { query: "Dorado,PR", coords: [18.47845809395691, -66.2766605615616] },
  "Ollo 13": { query: "Dorado,PR", coords: [18.477883166606762, -66.30981266498567] },
  "Vega Baja": { query: "Vega Baja,PR", coords: [18.4886, -66.3977] },
  "Isla Verde": { query: "Carolina,PR", coords: [18.4436, -66.0197] },
  "Ocean Park": { query: "San Juan,PR", coords: [18.4525, -66.0474] },
  "Pine Grove": { query: "Carolina,PR", coords: [18.4439, -66.0138] },
  "Escambron": { query: "San Juan,PR", coords: [18.4671, -66.0887] },
  "Luquillo": { query: "Luquillo,PR", coords: [18.3808, -65.7202] },
  "Fajardo": { query: "Fajardo,PR", coords: [18.3258, -65.6524] },
  "Seven Seas": { query: "Fajardo,PR", coords: [18.3685, -65.6367] },
  "Rincon": { query: "Rincon,PR", coords: [18.3402, -67.2499] },
  "Domes": { query: "Rincon,PR", coords: [18.3657, -67.2706] },
  "Maria's": { query: "Rincon,PR", coords: [18.3569, -67.2684] },
  "Sandy Beach": { query: "Rincon,PR", coords: [18.3712, -67.2546] },
  "Jobos": { query: "Isabela,PR", coords: [18.5121, -67.0765] },
  "La Parguera": { query: "Lajas,PR", coords: [17.9745, -67.0466] }
};

const map = L.map("map").setView(locations["GoodWinds"].coords, 13.3);

let noaaRadarLayer = null;
let windArrowLayer = L.layerGroup();
let heatCircleLayer = L.layerGroup();

let lastWeatherData = null;
let lastLocationCoords = locations["GoodWinds"].coords;

let fallbackLoaded = false;

fetch("/api/mapstyle")
  .then(res => res.json())
  .then(data => {
    const layer = L.tileLayer(data.url, {
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> ' +
        '&copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> ' +
        '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
    });

    layer.on("tileerror", function() {
      if (fallbackLoaded) return;
      fallbackLoaded = true;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 20,
        attribution: "&copy; OpenStreetMap contributors &copy; CARTO"
      }).addTo(map);
    });

    layer.addTo(map);
  });

document.getElementById("noaaRadarBtn").addEventListener("click", function() {
  if (noaaRadarLayer) {
    map.removeLayer(noaaRadarLayer);
    noaaRadarLayer = null;
    this.textContent = "NOAA Radar";
    return;
  }

  noaaRadarLayer = L.tileLayer(
    "https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity/MapServer/tile/{z}/{y}/{x}",
    {
      opacity: 0.65,
      zIndex: 600,
      maxZoom: 20,
      attribution: "NOAA / NWS Radar"
    }
  ).addTo(map);

  this.textContent = "NOAA Radar On";
});

document.getElementById("windArrowsBtn").addEventListener("click", function() {
  if (map.hasLayer(windArrowLayer)) {
    map.removeLayer(windArrowLayer);
    this.textContent = "Wind";
    return;
  }

  drawWindArrows();
  windArrowLayer.addTo(map);
  this.textContent = "Wind On";
});

function drawWindArrows() {
  windArrowLayer.clearLayers();

  if (!lastWeatherData) return;

  const windDeg = lastWeatherData.wind.deg ?? 0;
  const center = lastLocationCoords;
  const bounds = map.getBounds();

  const north = bounds.getNorth();
  const south = bounds.getSouth();
  const east = bounds.getEast();
  const west = bounds.getWest();

  const rows = 7;
  const cols = 9;
  const maxDistanceKm = 18;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lat = south + ((north - south) * r) / (rows - 1);
      const lng = west + ((east - west) * c) / (cols - 1);

      const distance = getDistanceKm(center[0], center[1], lat, lng);
      if (distance > maxDistanceKm) continue;

      const variation = Math.sin(lat * 20) * 8 + Math.cos(lng * 20) * 8;
      const adjustedWindDeg = windDeg + variation;

      const icon = L.divIcon({
        html: `<div class="wind-arrow" style="transform: rotate(${adjustedWindDeg}deg)">↑</div>`,
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([lat, lng], { icon }).addTo(windArrowLayer);
    }
  }
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

document.getElementById("heatCircleBtn").addEventListener("click", function() {
  if (map.hasLayer(heatCircleLayer)) {
    map.removeLayer(heatCircleLayer);
    this.textContent = "Heat";
    return;
  }

  drawHeatCircle();
  heatCircleLayer.addTo(map);
  this.textContent = "Heat On";
});

function drawHeatCircle() {
  heatCircleLayer.clearLayers();

  if (!lastWeatherData) return;

  const temp = lastWeatherData.main.temp;
  const center = lastLocationCoords;

  let color = "rgba(34, 197, 94, 0.22)";

  if (temp >= 90) {
    color = "rgba(220, 38, 38, 0.25)";
  } else if (temp >= 85) {
    color = "rgba(249, 115, 22, 0.25)";
  } else if (temp >= 80) {
    color = "rgba(234, 179, 8, 0.25)";
  }

  L.circle(center, {
    radius: 8000,
    color: color,
    fillColor: color,
    fillOpacity: 0.45,
    weight: 0
  }).addTo(heatCircleLayer);
}

map.on("moveend zoomend", function() {
  if (map.hasLayer(windArrowLayer)) {
    drawWindArrows();
  }

  if (map.hasLayer(heatCircleLayer)) {
    drawHeatCircle();
  }
});

Object.entries(locations).forEach(([name, spot]) => {
  L.marker(spot.coords)
    .addTo(map)
    .bindPopup(`<b>${name}</b><br>${spot.coords[0]}, ${spot.coords[1]}`);
});

function loadWeather(locationName) {
  const location = locations[locationName];
  const lat = location.coords[0];
  const lng = location.coords[1];

  fetch(`/api/weather?query=${encodeURIComponent(location.query)}`)
    .then(res => res.json())
    .then(data => {
      const windKnots = Math.round(data.wind.speed * 0.869);

      lastWeatherData = data;
      lastLocationCoords = location.coords;

      document.getElementById("city").textContent = locationName;
      document.getElementById("temp").textContent = Math.round(data.main.temp) + "°F";
      document.getElementById("wind").textContent = "Wind: " + windKnots + " knots";
      document.getElementById("desc").textContent = data.weather[0].description;
      document.getElementById("kiteMeter").style.background = getKiteColor(windKnots);

      map.setView(location.coords, 13.3);

      loadMarineData(lat, lng);
      loadAlerts(lat, lng);
      loadTideData(lat, lng);

      if (map.hasLayer(windArrowLayer)) drawWindArrows();
      if (map.hasLayer(heatCircleLayer)) drawHeatCircle();
    });
}

function loadMarineData(lat, lng) {
  const cacheKey = `marine-${lat}-${lng}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const parsed = JSON.parse(cached);
    const age = Date.now() - parsed.timestamp;
    const thirtyMinutes = 1000 * 60 * 30;

    if (age < thirtyMinutes) {
      applyMarineData(parsed.data);
      return;
    }
  }

  fetch(`/api/marine?lat=${lat}&lng=${lng}`)
    .then(res => res.json())
    .then(data => {
      if (!data.hours || !data.hours.length) {
        document.getElementById("surfMeter").style.background = "#6b7280";
        return;
      }

      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: data
      }));

      applyMarineData(data);
    })
    .catch(() => {
      document.getElementById("surfMeter").style.background = "#6b7280";
    });
}

function applyMarineData(data) {
  const current = data.hours[0];

  const waveHeightMeters =
    current.waveHeight?.noaa ??
    current.waveHeight?.sg ??
    current.swellHeight?.noaa ??
    current.swellHeight?.sg ??
    0;

  const swellPeriod =
    current.swellPeriod?.noaa ??
    current.swellPeriod?.sg ??
    0;

  const waveHeightFeet = waveHeightMeters * 3.281;

  document.getElementById("surfMeter").style.background =
    getSurfColor(waveHeightFeet, swellPeriod);

  document.getElementById("desc").textContent +=
    ` | Waves: ${waveHeightFeet.toFixed(1)} ft | Period: ${Math.round(swellPeriod)}s`;

  const currentLocation = document.getElementById("city").textContent;
  const currentWindText = document.getElementById("wind").textContent;
  const windKnots = parseInt(currentWindText.replace(/\D/g, ""));

  updateSpotIntelligence(
    currentLocation,
    windKnots,
    waveHeightFeet,
    swellPeriod
  );

  updateBestSpotToday();
}

document.getElementById("locationSelect").addEventListener("change", function() {
  loadWeather(this.value);
});

document.getElementById("favoriteBtn").addEventListener("click", function() {
  this.textContent = this.textContent === "☆" ? "★" : "☆";
});

function updateBestSpotToday() {
  let bestSurf = null;

  Object.entries(locations).forEach(([name, location]) => {
    const cacheKey = `marine-${location.coords[0]}-${location.coords[1]}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return;

    const data = JSON.parse(cached).data;
    const current = data.hours?.[0];

    if (!current) return;

    const waveHeightMeters =
      current.waveHeight?.noaa ??
      current.waveHeight?.sg ??
      current.swellHeight?.noaa ??
      current.swellHeight?.sg ??
      0;

    const swellPeriod =
      current.swellPeriod?.noaa ??
      current.swellPeriod?.sg ??
      0;

    const waveHeightFeet = waveHeightMeters * 3.281;
    const surfScore = waveHeightFeet * 10 + swellPeriod;

    if (!bestSurf || surfScore > bestSurf.score) {
      bestSurf = { name, score: surfScore };
    }
  });

  document.getElementById("bestSurfSpot").textContent =
    bestSurf ? `Surf: ${bestSurf.name}` : "Surf: not enough cached data";

  document.getElementById("bestKiteSpot").textContent =
    "Kite: coming next";
}

map.on("click", function(e) {
  alert("Lat: " + e.latlng.lat + "\nLng: " + e.latlng.lng);
});

const locateControl = L.control({ position: "topright" });

locateControl.onAdd = function() {
  const button = L.DomUtil.create("button", "locate-btn");
  button.innerHTML = "📍";
  button.title = "Find my location";

  L.DomEvent.disableClickPropagation(button);

  button.onclick = function() {
    map.locate({ setView: true, maxZoom: 16 });
  };

  return button;
};

locateControl.addTo(map);

map.on("locationfound", function(e) {
  L.marker(e.latlng)
    .addTo(map)
    .bindPopup("You are here")
    .openPopup();
});

function getKiteColor(windKnots) {
  if (windKnots >= 16 && windKnots <= 25) return "#22c55e";
  if (windKnots >= 10 && windKnots < 16) return "#eab308";
  if (windKnots > 25 && windKnots <= 32) return "#eab308";
  if (windKnots > 32) return "#ad005f";
  return "#ef4444";
}

function getSurfColor(waveHeightFeet, swellPeriod) {
  if (waveHeightFeet >= 3 && waveHeightFeet <= 8 && swellPeriod >= 9) return "#22c55e";
  if (waveHeightFeet >= 2 && swellPeriod >= 6) return "#eab308";
  if (waveHeightFeet > 8) return "#ad005f";
  return "#ef4444";
}

new ResizeObserver(() => {
  map.invalidateSize();
}).observe(document.querySelector(".map-card"));

document.getElementById("resizeMapBtn").addEventListener("click", function() {
  const mapCard = document.querySelector(".map-card");

  mapCard.classList.toggle("expanded");

  this.textContent = mapCard.classList.contains("expanded")
    ? "Shrink"
    : "Expand";

  setTimeout(() => {
    map.invalidateSize();
  }, 250);
});

const sortable = new Sortable(document.querySelector(".page"), {
  animation: 200,
  ghostClass: "sortable-ghost",
  chosenClass: "sortable-chosen",
  dragClass: "sortable-drag",
  disabled: window.innerWidth <= 700,

  onEnd: function() {
    setTimeout(() => {
      map.invalidateSize();
    }, 250);
  }
});

window.addEventListener("resize", function() {
  sortable.option("disabled", window.innerWidth <= 700);

  setTimeout(() => {
    map.invalidateSize();
  }, 250);
});

function updateSpotIntelligence(locationName, windKnots, waveHeightFeet, swellPeriod) {
  let bestFor = "Beach day";
  let warning = "None";
  let summary = "Mixed conditions.";

  if (windKnots >= 16 && windKnots <= 25) {
    bestFor = "Kiteboarding";
    summary = "Solid kite wind.";
  } else if (waveHeightFeet >= 3 && swellPeriod >= 9) {
    bestFor = "Surfing";
    summary = "Good surf potential.";
  } else if (windKnots < 10 && waveHeightFeet < 2) {
    bestFor = "Swimming / relaxing";
    summary = "Calmer beach conditions.";
  }

  if (windKnots > 32) {
    warning = "Strong wind. Be careful.";
  } else if (waveHeightFeet > 8) {
    warning = "Heavy surf.";
  }

  document.getElementById("spotBestFor").textContent = `Best for: ${bestFor}`;
  document.getElementById("spotWarning").textContent = `Warning: ${warning}`;
  document.getElementById("spotSummary").textContent = `Summary: ${summary}`;
}

function loadAlerts(lat, lng) {
  fetch(`/api/alerts?lat=${lat}&lng=${lng}`)
    .then(res => res.json())
    .then(data => {
      const alerts = data.features || [];

      if (!alerts.length) {
        document.getElementById("alertsText").textContent = "No active alerts.";
        return;
      }

      const first = alerts[0].properties;
      document.getElementById("alertsText").textContent =
        `${first.event}: ${first.headline}`;
    })
    .catch(() => {
      document.getElementById("alertsText").textContent = "Alerts unavailable.";
    });
}

function loadTideData(lat, lng) {
  fetch(`/api/tide?lat=${lat}&lng=${lng}`)
    .then(res => res.json())
    .then(data => {
      const tide = data.data?.[0];

      if (!tide) {
        document.getElementById("nextTide").textContent = "Next tide: unavailable";
        return;
      }

      const tideDate = new Date(tide.time);

      document.getElementById("nextTide").textContent = `Next tide: ${tide.type}`;
      document.getElementById("tideTime").textContent =
        `Time: ${tideDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    })
    .catch(() => {
      document.getElementById("nextTide").textContent = "Next tide: unavailable";
    });
}

loadWeather("GoodWinds");