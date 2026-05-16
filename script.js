const apiKey = "d86185ad7183835af0bf3351cf1a7f9a";

fetch(`https://api.openweathermap.org/data/2.5/weather?q=Dorado&units=imperial&appid=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    document.getElementById("city").textContent = data.name;
    document.getElementById("temp").textContent = Math.round(data.main.temp) + "°F";
    document.getElementById("desc").textContent = data.weather[0].description;
    document.getElementById("wind").textContent = "Wind: " + data.wind.speed * 0.869 + " knots";
  });
