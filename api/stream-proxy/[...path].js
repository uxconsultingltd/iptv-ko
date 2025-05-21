
export default async function handler(req, res) {
  const path = req.query.path.join('/');
  const url = `http://b3.dinott.com/${path}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Mobile/15E148 Safari/604.1'
      }
    });

    if (!response.ok) {
      res.status(response.status).send('Error fetching stream');
      return;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    response.body.pipe(res);
  } catch (err) {
    res.status(500).send('Proxy failed');
  }
}
