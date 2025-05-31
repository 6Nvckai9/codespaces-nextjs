import { igdl } from 'ruhend-scraper'

export default async function handler(req, res) {
  const { url } = req.query
  try {
    const result = await igdl(url)
    res.status(200).json(result)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
