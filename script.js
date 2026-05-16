const apiKey = "d86185ad7183835af0bf3351cf1a7f9a";
const BARLOVENTO = [18.4769, -66.2796];

fetch(`https://api.openweathermap.org/data/2.5/weather?q=Dorado&units=imperial&appid=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    document.getElementById("city").textContent = data.name;
    document.getElementById("temp").textContent = Math.round(data.main.temp) + "°F";
    document.getElementById("wind").textContent =
      "Wind: " + Math.round(data.wind.speed * 0.869) + " knots";
    document.getElementById("desc").textContent = data.weather[0].description;
  });

const map = L.map("map").setView(BARLOVENTO, 15);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

const spots = [
  { name: "Barlovento / GoodWinds", coords: [18.4769, -66.2796] },
  { name: "Dorado Beach", coords: [18.4729, -66.2781] },
  { name: "Playa Sardinera", coords: [18.4715, -66.2725] }
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