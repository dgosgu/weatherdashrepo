const apiKey = "d86185ad7183835af0bf3351cf1a7f9a";

fetch(`https://api.openweathermap.org/data/2.5/weather?q=Dorado&units=imperial&appid=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    document.getElementById("city").textContent = data.name;
    document.getElementById("temp").textContent = Math.round(data.main.temp) + "°F";
    document.getElementById("wind").textContent = "Wind: " + Math.round(data.wind.speed * 0.869) + " knots";
    document.getElementById("desc").textContent = data.weather[0].description;
  });

  const map = L.map('map').setView([18.4588, -66.2677], 12);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

L.marker([18.4588, -66.2677])
    .addTo(map)
    .bindPopup('Dorado, Puerto Rico')
    .openPopup();