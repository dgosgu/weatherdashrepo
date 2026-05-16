export default async function handler(req, res) {
  const { query } = req.query;

  const url =
    `https://api.openweathermap.org/data/2.5/weather?q=${query}` +
    `&units=imperial&appid=${process.env.OPENWEATHER_API_KEY}`;

  const response = await fetch(url);

  const data = await response.json();

  res.status(200).json(data);
}