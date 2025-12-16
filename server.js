// server.js - Complete Render-ready Backend with SQLite
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize SQLite Database
const db = new sqlite3.Database(
    path.join(__dirname, 'database.db'),
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) {
            console.error('❌ Database connection error:', err.message);
        } else {
            console.log('✅ Connected to SQLite database');
            initDatabase();
        }
    }
);

// Initialize database tables
function initDatabase() {
    const sql = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    db.run(sql, (err) => {
        if (err) {
            console.error('❌ Database initialization error:', err.message);
        } else {
            console.log('✅ Database table ready');
        }
    });
}

// Database helper functions
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
};

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ==================== API ENDPOINTS ====================

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: '✅ Authentication API is running!',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        database: 'SQLite'
    });
});

// Get all users (for admin view)
app.get('/api/users', async (req, res) => {
    try {
        const users = await dbAll(
            'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC'
        );
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

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        // Check if user exists
        const existingUser = await dbGet(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save to database
        const result = await dbRun(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        // Get the created user
        const user = await dbGet(
            'SELECT id, name, email FROM users WHERE id = ?',
            [result.id]
        );

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
            user: user
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.message.includes('UNIQUE')) {
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
        const user = await dbGet(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
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

// Protected route example (for future use)
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const user = await dbGet(
            'SELECT id, name, email, created_at FROM users WHERE id = ?',
            [req.user.userId]
        );
        
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

// ==================== PAGE ROUTES ====================

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve dashboard page (NEW)
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Serve view-data page
app.get('/view-data', (req, res) => {
    res.sendFile(path.join(__dirname, 'view-data.html'));
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
    console.log('=========================================');
    console.log('🚀 SERVER STARTED SUCCESSFULLY');
    console.log('=========================================');
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🌍 Live URL: https://auth-live.onrender.com`);
    console.log(`🛜 API: http://localhost:${PORT}/api/test`);
    console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
    console.log(`💾 Database: SQLite (database.db)`);
    console.log(`🔐 JWT Secret: ${JWT_SECRET === 'your-secret-key-change-in-production' ? '⚠️ CHANGE IN PRODUCTION' : '✅ Set from env'}`);
    console.log('=========================================');
    console.log('✅ Ready for deployment to Render.com');
    console.log('✅ Frontend: http://localhost:3000');
    console.log('✅ Dashboard: http://localhost:3000/dashboard.html');
    console.log('✅ View Data: http://localhost:3000/view-data');
    console.log('=========================================');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('❌ Database close error:', err.message);
        } else {
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    });
});