const apiKey = "d86185ad7183835af0bf3351cf1a7f9a";

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

const map = L.map("map").setView(locations["Dorado"].coords, 13.3);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

const spots = [
  { name: "GoodWinds", coords: [18.474611640654814, -66.29507660865785] },
  { name: "Goyu / TV Station", coords: [18.47845809395691, -66.2766605615616] },
  { name: "Ollo 13 / Breñas", coords: [18.477883166606762, -66.30981266498567] }
];

spots.forEach(spot => {
  L.marker(spot.coords)
    .addTo(map)
    .bindPopup(`<b>${spot.name}</b><br>${spot.coords[0]}, ${spot.coords[1]}`);
});

function loadWeather(locationName) {
  const location = locations[locationName];

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location.query}&units=imperial&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      const windKnots = Math.round(data.wind.speed * 0.869);

      document.getElementById("city").textContent = locationName;
      document.getElementById("temp").textContent = Math.round(data.main.temp) + "°F";
      document.getElementById("wind").textContent = "Wind: " + windKnots + " knots";
      document.getElementById("desc").textContent = data.weather[0].description;

      document.getElementById("kiteMeter").style.background = getKiteColor(windKnots);
      document.getElementById("surfMeter").style.background = getSurfColor(windKnots);

      map.setView(location.coords, 13.3);
    });
}

document.getElementById("locationSelect").addEventListener("change", function() {
  loadWeather(this.value);
});

document.getElementById("favoriteBtn").addEventListener("click", function() {
  this.textContent = this.textContent === "☆" ? "★" : "☆";
});

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
  if (windKnots >= 16 && windKnots <= 25) {
    return "#22c55e";
  } else if (windKnots >= 10 && windKnots < 16) {
    return "#eab308";
  } else if (windKnots > 25 && windKnots <= 32) {
    return "#eab308";
  } else if (windKnots > 32) {
    return "#ad005f";
  } else {
    return "#ef4444";
  }
}

function getSurfColor(windKnots) {
  if (windKnots <= 6) {
    return "#22c55e";
  } else if (windKnots <= 12) {
    return "#eab308";
  } else {
    return "#ef4444";
  }
}

loadWeather("Dorado");