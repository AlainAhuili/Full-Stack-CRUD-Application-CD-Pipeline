const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../services/authService'); // adjust path if needed

// FIX: Change from '/api/auth/register' to just '/register'
router.post('/register', async (req, res) => {
    try {
        // req.body should contain { username, password }
        const result = await registerUser(db, crypto, req.body); 
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// FIX: Change from '/api/auth/login' to just '/login'
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await loginUser(db, crypto, username, password);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

module.exports = router;
