const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 3001;

app.get('/api/player_api', async (req, res) => {
  const { username, password, action } = req.query;
  const url = `http://b3.dinott.com/player_api.php?username=${username}&password=${password}&action=${action}`;
  const response = await fetch(url);
  const json = await response.json();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(json);
});

app.get('/api/stream-proxy/*', async (req, res) => {
  const path = req.params[0];
  const url = `http://b3.dinott.com/${path}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'VLC' },
  });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
  response.body.pipe(res);
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
