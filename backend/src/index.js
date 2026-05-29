const http = require('http');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;

// Initialize the PostgreSQL Connection Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'supersecurepassword',
  database: process.env.DB_NAME || 'crud_db',
  port: 5432,
});

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  // Simple Health Check Endpoint that probes the DB
  if (req.url === '/' || req.url === '/health') {
    try {
      // Query the system to check connectivity and look at our migrated table
      const dbCheck = await pool.query('SELECT NOW(), COUNT(*) FROM users;');
      
      res.writeHead(200);
      res.end(JSON.stringify({
        status: "healthy",
        database: "connected",
        timestamp: dbCheck.rows[0].now,
        user_count: parseInt(dbCheck.rows[0].count, 10),
        message: "Hello from the live 3-Tier CRUD Architecture!"
      }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({
        status: "unhealthy",
        database: "disconnected",
        error: error.message
      }));
    }
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not Found" }));
  }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  server.close(() => {
    pool.end(() => {
      console.log('Database pool and server closed.');
      process.exit(0);
    });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Backend server actively listening on port ${PORT}`);
});