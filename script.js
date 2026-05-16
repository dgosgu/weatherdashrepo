const locations = {
  "Dorado": {
    query: "Dorado",
    coords: [18.474611640654814, -66.29507660865785]
  },
  "San Juan": {
    query: "San Juan,PR",
    coords: [18.4655, -66.1057]
  },
  "Rincon": {
    query: "Rincon,PR",
    coords: [18.3402, -67.2499]
  },
  "Fajardo": {
    query: "Fajardo,PR",
    coords: [18.3258, -65.6524]
  },
  "Midway, Utah": {
    query: "Midway,US",
    coords: [40.5122, -111.4744]
  }
};

const map = L.map("map").setView(
  locations["Dorado"].coords,
  13.3
);

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

      console.log("Stadia failed — loading CARTO fallback");

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 20,
          attribution:
            "&copy; OpenStreetMap contributors &copy; CARTO"
        }
      ).addTo(map);
    });

    layer.addTo(map);
  });


let radarLayer = null;
let radarOn = false;

function loadRadarLayer() {
  fetch("https://api.rainviewer.com/public/weather-maps.json")
    .then(res => res.json())
    .then(data => {
      const frames = data.radar.past;
      const latestFrame = frames[frames.length - 1];

      const radarUrl =
        data.host +
        latestFrame.path +
        "/256/{z}/{x}/{y}/2/1_1.png";

      radarLayer = L.tileLayer(radarUrl, {
        opacity: 0.65,
        zIndex: 500,
        attribution: "Radar data © RainViewer"
      });

      radarLayer.addTo(map);
      radarOn = true;
    });
}

document.getElementById("radarBtn").addEventListener("click", function() {
  if (radarOn && radarLayer) {
    map.removeLayer(radarLayer);
    radarOn = false;
    this.textContent = "Radar";
  } else {
    loadRadarLayer();
    this.textContent = "Radar On";
  }
});

const spots = [
  {
    name: "GoodWinds",
    coords: [18.474611640654814, -66.29507660865785]
  },
  {
    name: "Goyu / TV Station",
    coords: [18.47845809395691, -66.2766605615616]
  },
  {
    name: "Ollo 13 / Breñas",
    coords: [18.477883166606762, -66.30981266498567]
  }
];

spots.forEach(spot => {

  L.marker(spot.coords)
    .addTo(map)
    .bindPopup(
      `<b>${spot.name}</b><br>${spot.coords[0]}, ${spot.coords[1]}`
    );
});

function loadWeather(locationName) {

  const location = locations[locationName];

  const lat = location.coords[0];
  const lng = location.coords[1];

  fetch(
    `/api/weather?query=${encodeURIComponent(location.query)}`
  )
    .then(res => res.json())
    .then(data => {

      const windKnots =
        Math.round(data.wind.speed * 0.869);

      document.getElementById("city").textContent =
        locationName;

      document.getElementById("temp").textContent =
        Math.round(data.main.temp) + "°F";

      document.getElementById("wind").textContent =
        "Wind: " + windKnots + " knots";

      document.getElementById("desc").textContent =
        data.weather[0].description;

      document.getElementById("kiteMeter").style.background =
        getKiteColor(windKnots);

      map.setView(location.coords, 13.3);

      loadMarineData(lat, lng);
    });
}

function loadMarineData(lat, lng) {
  fetch(`/api/marine?lat=${lat}&lng=${lng}`)
    .then(res => res.json())
    .then(data => {
      console.log("Marine data:", data);

      if (!data.hours || !data.hours.length) {
        console.log("No marine data:", data);
        document.getElementById("surfMeter").style.background = "#6b7280";
        return;
      }

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
    })
    .catch(error => {
      console.log("Marine fetch error:", error);
      document.getElementById("surfMeter").style.background = "#6b7280";
    });
}

document
  .getElementById("locationSelect")
  .addEventListener("change", function() {

    loadWeather(this.value);
  });

document
  .getElementById("favoriteBtn")
  .addEventListener("click", function() {

    this.textContent =
      this.textContent === "☆"
        ? "★"
        : "☆";
  });

map.on("click", function(e) {

  alert(
    "Lat: " +
    e.latlng.lat +
    "\nLng: " +
    e.latlng.lng
  );
});

const locateControl = L.control({
  position: "topright"
});

locateControl.onAdd = function() {

  const button =
    L.DomUtil.create(
      "button",
      "locate-btn"
    );

  button.innerHTML = "📍";

  button.title =
    "Find my location";

  L.DomEvent.disableClickPropagation(button);

  button.onclick = function() {

    map.locate({
      setView: true,
      maxZoom: 16
    });
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

  if (
    windKnots >= 16 &&
    windKnots <= 25
  ) {

    return "#22c55e";

  } else if (
    windKnots >= 10 &&
    windKnots < 16
  ) {

    return "#eab308";

  } else if (
    windKnots > 25 &&
    windKnots <= 32
  ) {

    return "#eab308";

  } else if (
    windKnots > 32
  ) {

    return "#ad005f";

  } else {

    return "#ef4444";
  }
}

function getSurfColor(
  waveHeightFeet,
  swellPeriod
) {

  if (
    waveHeightFeet >= 3 &&
    waveHeightFeet <= 8 &&
    swellPeriod >= 9
  ) {

    return "#22c55e";

  } else if (
    waveHeightFeet >= 2 &&
    swellPeriod >= 6
  ) {

    return "#eab308";

  } else if (
    waveHeightFeet > 8
  ) {

    return "#ad005f";

  } else {

    return "#ef4444";
  }
}

loadWeather("Dorado");