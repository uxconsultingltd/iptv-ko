export default async function handler(req, res) {
  const { id } = req.query;
  const url = `http://b3.dinott.com/live/cbfa4abc2f/2da068dcfb39/${id}.m3u8`;

  try {
    const response = await fetch(url);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/vnd.apple.mpegurl');
    response.body.pipe(res);
  } catch (err) {
    res.status(500).send('Stream proxy failed');
  }
}
