
export default async function handler(req, res) {
  const { id } = req.query;
  const url = `http://b3.dinott.com/live/cbfa4abc2f/2da068dcfb39/${id}.m3u8`;

  try {
    const response = await fetch(url);
    const stream = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.status(200).send(stream);
  } catch (err) {
    res.status(500).send('Failed to stream');
  }
}
