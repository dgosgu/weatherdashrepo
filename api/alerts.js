export default async function handler(req, res) {
  const { lat, lng } = req.query;

  const url = `https://api.weather.gov/alerts/active?point=${lat},${lng}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "weatherdash/1.0"
    }
  });

  const data = await response.json();

  res.status(200).json(data);
}