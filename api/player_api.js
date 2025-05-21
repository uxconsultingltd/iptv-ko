export default async function handler(req, res) {
  const { username, password, action } = req.query;

  const url = `http://b3.dinott.com/player_api.php?username=${username}&password=${password}&action=${action}`;

  try {
    const response = await fetch(url);
    const json = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(json);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch IPTV data' });
  }
}
