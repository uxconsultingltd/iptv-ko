export default async function handler(req, res) {
  const { username, password, action = 'player_api' } = req.query;
  const url = `http://b3.dinott.com/player_api.php?username=${username}&password=${password}&action=${action}`;
  try {
    const r = await fetch(url);
    const data = await r.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data from IPTV server' });
  }
}
