import http from 'node:http';

const port = Number(process.env.PORT || 3000);

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'play-skeezers-v3' }));
    return;
  }

  res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('play-skeezers-v3 scaffold is running');
});

server.listen(port, () => {
  console.log(`play-skeezers-v3 listening on :${port}`);
});
