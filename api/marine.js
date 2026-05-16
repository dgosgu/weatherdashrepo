export default async function handler(req, res) {
  const { lat, lng } = req.query;

  const url =
    `https://api.stormglass.io/v2/weather/point?lat=${lat}` +
    `&lng=${lng}&params=waveHeight,swellPeriod,swellHeight`;

  const response = await fetch(url, {
    headers: {
      Authorization: process.env.STORMGLASS_API_KEY
    }
  });

  const data = await response.json();

  res.status(200).json(data);
}