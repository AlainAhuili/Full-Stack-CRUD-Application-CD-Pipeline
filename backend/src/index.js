const http = require('http');

// Simple runtime in-memory database array to hold items added by the user
let dbItemsCollection = [
    { id: 1, name: "Database Record Cluster Alpha" },
    { id: 2, name: "Automated Core Pipeline Asset" }
];

// Asynchronous Request Body Stream Parser Helper
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
        req.on('error', err => reject(err));
    });
};

// ==========================================
// SERVER CORE LIFECYCLE (MUST BE ASYNC)
// ==========================================
const server = http.createServer(async (req, res) => {
    
    // 1. Inject Global CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 2. Clear out Pre-flight Handshakes Instantly
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    res.setHeader('Content-Type', 'application/json');

    try {
        // ==========================================
        // AUTHENTICATION ENDPOINTS
        // ==========================================

        // ROUTE: POST /api/auth/register
        if (req.url === '/api/auth/register' && req.method === 'POST') {
            let bodyData;
            try {
                bodyData = await getRequestBody(req);
            } catch (err) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: "Invalid JSON payload" }));
                return;
            }

            const { username, password } = bodyData;
            if (!username || !password) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: "Username and password are required" }));
                return;
            }

            res.writeHead(201);
            res.end(JSON.stringify({ success: true, message: "User registered successfully!" }));
            return;
        }

        // ROUTE: POST /api/auth/login
        if (req.url === '/api/auth/login' && req.method === 'POST') {
            let bodyData;
            try {
                bodyData = await getRequestBody(req);
            } catch (err) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: "Invalid JSON payload" }));
                return;
            }

            const { username, password } = bodyData;
            if (!username || !password) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: "Username and password are required" }));
                return;
            }

            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                token: `ey-mock-session-token-for-${username}`
            }));
            return;
        }

        // ==========================================
        // PROTECTED CRUD RESOURCE ENDPOINTS
        // ==========================================

        // ROUTE: GET /api/items (Read entries)
        if (req.url === '/api/items' && req.method === 'GET') {
            res.writeHead(200);
            res.end(JSON.stringify(dbItemsCollection));
            return;
        }

        // ROUTE: POST /api/items (Create entry)
        if (req.url === '/api/items' && req.method === 'POST') {
            let bodyData;
            try {
                bodyData = await getRequestBody(req);
            } catch (err) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: "Invalid JSON payload" }));
                return;
            }

            const { name } = bodyData;
            if (!name) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: "Item name is required" }));
                return;
            }

            const newItem = { id: Date.now(), name };
            dbItemsCollection.push(newItem); // Persist to local runtime array

            res.writeHead(201);
            res.end(JSON.stringify(newItem));
            return;
        }

        // ADDED ROUTE: DELETE /api/items/:id (Remove entry)
        if (req.url.startsWith('/api/items/') && req.method === 'DELETE') {
            // Extract trailing segment and parse numerical representation
            const targetIdStr = req.url.split('/').pop();
            const targetId = parseInt(targetIdStr, 10);

            // Filter collection to drop target item matching ID context
            dbItemsCollection = dbItemsCollection.filter(item => item.id !== targetId);

            res.writeHead(200);
            res.end(JSON.stringify({ success: true, message: `Record ${targetId} successfully cleared from core storage.` }));
            return;
        }

        // Catch-all Fallback for Unmatched Routes inside the try block
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Route not found" }));
        return;

    } catch (error) {
        console.error("Runtime handler crash:", error);
        if (!res.headersSent) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: "Internal Server Error" }));
        }
    }
});

// ==========================================
// PORT BINDING (OUTSIDE CORE WRAPPER)
// ==========================================
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Backend server actively listening on port ${PORT}`);
});
