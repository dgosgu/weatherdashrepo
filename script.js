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

const beachIcon = L.divIcon({
  html: "🌊",
  className: "beach-icon",
  iconSize: [35, 35],
  iconAnchor: [17, 17]
});

L.marker(BARLOVENTO, { icon: beachIcon })
  .addTo(map)
  .bindPopup("<b>Barlovento Beach</b><br>Dorado Beach")
  .openPopup();

const spots = [
  { name: "Barlovento / GoodWinds", coords: [18.4769, -66.2796], emoji: "🌊" },
  { name: "Dorado Beach", coords: [18.4729, -66.2781], emoji: "🏖️" },
  { name: "Playa Sardinera", coords: [18.4715, -66.2725], emoji: "📍" }
];

spots.forEach(spot => {
  const icon = L.divIcon({
    html: spot.emoji,
    className: "beach-icon",
    iconSize: [35, 35],
    iconAnchor: [17, 17]
  });

  L.marker(spot.coords, { icon })
    .addTo(map)
    .bindPopup(`<b>${spot.name}</b>`);
});