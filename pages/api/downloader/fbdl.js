import { fbdl } from 'ruhend-scraper';

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  try {
    const result = await fbdl(url);
    const data = result.data;
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
