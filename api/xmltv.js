export default async function handler(req, res) {
  const { username, password } = req.query;
  const url = `http://b3.dinott.com/xmltv.php?username=${username}&password=${password}`;
  try {
    const r = await fetch(url);
    const xml = await r.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(xml);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch EPG' });
  }
}
