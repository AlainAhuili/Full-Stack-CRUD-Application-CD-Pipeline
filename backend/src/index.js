const http = require('http');
const { Pool } = require('pg');
const UserRepository = require('./userRepository');

const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'supersecurepassword',
  database: process.env.DB_NAME || 'crud_db',
  port: 5432,
});

const userRepository = new UserRepository(pool);

// Helper function to extract JSON request body
const getRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
};

const server = http.createServer(async (req, res) => {
  // 1. Inject Broad CORS Headers Immediately
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 2. Handle the Browser Pre-flight Options Request Cleanly
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Set standard JSON content header for everything else
  res.setHeader('Content-Type', 'application/json');

  try {
    // ROUTE 1: GET /api/users (Read All)
    if (req.url === '/api/users' && req.method === 'GET') {
      const users = await userRepository.findAll();
      res.writeHead(200);
      res.end(JSON.stringify(users));
      return;
    }

    // ROUTE 2: POST /api/users (Create User)
    if (req.url === '/api/users' && req.method === 'POST') {
      const { name, email } = await getRequestBody(req);
      
      if (!name || !email) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Missing required fields: name and email" }));
        return;
      }

      const newUser = await userRepository.create({ name, email });
      res.writeHead(210); // Using 201 Created status
      res.end(JSON.stringify(newUser));
      return;
    }

    // ROUTE 3: Health Check
    if ((req.url === '/' || req.url === '/health') && req.method === 'GET') {
      const dbCheck = await pool.query('SELECT NOW(), COUNT(*) FROM users;');
      res.writeHead(200);
      res.end(JSON.stringify({
        status: "healthy",
        database: "connected",
        user_count: parseInt(dbCheck.rows[0].count, 10)
      }));
      return;
    }

    // Fallback 404
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Route not found" }));

  } catch (error) {
    console.error(`Error handling request: ${error.message}`);
    res.writeHead(500);
    res.end(JSON.stringify({ error: "Internal Server Error", details: error.message }));
  }
});

process.on('SIGTERM', () => {
  server.close(() => {
    pool.end(() => {
      console.log('Database pool and server closed gracefully.');
      process.exit(0);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Backend server actively listening on port ${PORT}`);
});