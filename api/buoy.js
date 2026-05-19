export default async function handler(req, res) {
  const station = req.query.station || "41053";

  const url = `https://www.ndbc.noaa.gov/data/realtime2/${station}.txt`;

  const response = await fetch(url);
  const text = await response.text();

  const lines = text
    .split("\n")
    .filter(line => line.trim() !== "");

  const headers = lines[0]
    .replace("#", "")
    .trim()
    .split(/\s+/);

  const units = lines[1]
    .replace("#", "")
    .trim()
    .split(/\s+/);

  const latest = lines[2]
    .trim()
    .split(/\s+/);

  const data = {};

  headers.forEach((header, index) => {
    data[header] = latest[index];
  });

  res.status(200).json({
    station,
    units,
    raw: data,
    parsed: {
      time: `${data.YY}-${data.MM}-${data.DD} ${data.hh}:${data.mm} UTC`,
      windDirection: Number(data.WDIR),
      windSpeedMps: Number(data.WSPD),
      windGustMps: Number(data.GST),
      waveHeightMeters: Number(data.WVHT),
      dominantPeriod: Number(data.DPD),
      averagePeriod: Number(data.APD),
      meanWaveDirection: Number(data.MWD),
      pressure: Number(data.PRES),
      airTempC: Number(data.ATMP),
      waterTempC: Number(data.WTMP)
    }
  });
}