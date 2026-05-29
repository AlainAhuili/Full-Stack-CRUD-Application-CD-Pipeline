const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: "healthy",
    message: "Hello from the CD Pipeline Backend Layer!",
    timestamp: new Date()
  }));
});

server.listen(PORT, () => {
  console.log(`Backend server is actively running on port ${PORT}`);
});