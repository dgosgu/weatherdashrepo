export default async function handler(req, res) {
  const key = process.env.STADIAMAPS_API_KEY;

  res.status(200).json({
    url: `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png?api_key=${key}`
  });
}