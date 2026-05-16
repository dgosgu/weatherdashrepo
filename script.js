const apiKey = "d86185ad7183835af0bf3351cf1a7f9a";
const BARLOVENTO = [18.474611640654814, -66.29507660865785];

fetch(`https://api.openweathermap.org/data/2.5/weather?q=Dorado&units=imperial&appid=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    const windKnots = Math.round(data.wind.speed * 0.869);

    document.getElementById("city").textContent = data.name;
    document.getElementById("temp").textContent = Math.round(data.main.temp) + "°F";
    document.getElementById("wind").textContent = "Wind: " + windKnots + " knots";
    document.getElementById("desc").textContent = data.weather[0].description;

    document.getElementById("kiteMeter").style.background = getKiteColor(windKnots);
    document.getElementById("surfMeter").style.background = getSurfColor(windKnots);
  });

const map = L.map("map").setView(BARLOVENTO, 13.3);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

const spots = [
  { name: "GoodWinds", coords: [18.474611640654814,-66.29507660865785]},
  { name: "Goyu / TV Station", coords: [18.47845809395691,-66.2766605615616]},
  { name: "Ollo 13 / Breñas", coords: [18.477883166606762,-66.30981266498567]}
];

spots.forEach(spot => {
  L.marker(spot.coords)
    .addTo(map)
    .bindPopup(`<b>${spot.name}</b><br>${spot.coords[0]}, ${spot.coords[1]}`);
});

// click map to get coordinates
map.on("click", function(e) {
  alert("Lat: " + e.latlng.lat + "\nLng: " + e.latlng.lng);
});

// location button
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
    return "#22c55e"; // green
  } else if (windKnots >= 10 && windKnots < 16) {
    return "#eab308"; // yellow
  } else if (windKnots > 25 && windKnots <= 32) {
    return "#eab308"; // yellow
  } else if (windKnots > 32) {
    return "#ad005fff"; // red
  } else {
    return "#ef4444"; // red
  }
}

function getSurfColor(windKnots) {
  if (windKnots <= 6) {
    return "#22c55e"; // green
  } else if (windKnots <= 12) {
    return "#eab308"; // yellow
  } else {
    return "#ef4444"; // red
  }
}