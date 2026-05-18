export default async function handler(req, res) {
  const { layer, z, x, y } = req.query;

  const allowedLayers = {
    temp: "temp_new",
    wind: "wind_new",
    clouds: "clouds_new",
    precip: "precipitation_new"
  };

  if (!allowedLayers[layer]) {
    return res.status(400).send("Invalid layer");
  }

  const url =
    `https://tile.openweathermap.org/map/${allowedLayers[layer]}/${z}/${x}/${y}.png` +
    `?appid=${process.env.OPENWEATHER_API_KEY}`;

  const response = await fetch(url);

  res.setHeader("Content-Type", "image/png");

  const buffer = await response.arrayBuffer();

  res.send(Buffer.from(buffer));
}