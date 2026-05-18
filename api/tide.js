export default async function handler(req, res) {
  const { lat, lng } = req.query;

  const now = new Date();
  const end = new Date();
  end.setDate(now.getDate() + 2);

  const url =
    `https://api.stormglass.io/v2/tide/extremes/point?lat=${lat}` +
    `&lng=${lng}&start=${now.toISOString()}&end=${end.toISOString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: process.env.STORMGLASS_API_KEY
    }
  });

  const data = await response.json();

  res.status(200).json(data);
}