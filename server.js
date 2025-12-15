// server.js - Complete Backend Server
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key-change-this-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (your HTML, CSS, JS)
app.use(express.static(__dirname));

// ==================== API ENDPOINTS ====================

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: '✅ Backend is running!',
        timestamp: new Date().toISOString()
    });
});

// Get all users (for viewing data)
app.get('/api/users', async (req, res) => {
    try {
        const users = await db.getAllUsers();
        res.json({
            success: true,
            count: users.length,
            users: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Register new user
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check password length
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save to database
        const user = await db.addUser(name, email, hashedPassword);

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: '✅ Registration successful!',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Registration error:', error.message);
        
        if (error.message === 'Email already exists') {
            res.status(400).json({ error: 'Email already registered' });
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
});

// Login user
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await db.findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: '✅ Login successful!',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Protected route example
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const user = await db.findUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Token authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log('=========================================');
    console.log('🚀 SERVER STARTED SUCCESSFULLY');
    console.log('=========================================');
    console.log(`📡 API URL: http://localhost:${PORT}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`🛜 Test API: http://localhost:${PORT}/api/test`);
    console.log(`👥 View Users: http://localhost:${PORT}/api/users`);
    console.log('=========================================');
    console.log('✅ Register users through the form');
    console.log('✅ Data will be saved in users.db file');
    console.log('✅ Login anytime with registered email');
    console.log('=========================================');
});