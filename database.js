// database.js - SQLite Database Handler
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        // Connect to SQLite database file
        this.db = new sqlite3.Database(path.join(__dirname, 'users.db'));
        this.initDatabase();
    }

    // Initialize database with users table
    initDatabase() {
        const sql = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        this.db.run(sql, (err) => {
            if (err) {
                console.error('❌ Database initialization error:', err.message);
            } else {
                console.log('✅ Database initialized successfully');
            }
        });
    }

    // Add new user
    addUser(name, email, password) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
            this.db.run(sql, [name, email, password], function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        reject(new Error('Email already exists'));
                    } else {
                        reject(err);
                    }
                } else {
                    resolve({
                        id: this.lastID,
                        name: name,
                        email: email
                    });
                }
            });
        });
    }

    // Find user by email
    findUserByEmail(email) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE email = ?`;
            this.db.get(sql, [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // Find user by ID
    findUserById(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT id, name, email, created_at FROM users WHERE id = ?`;
            this.db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // Get all users (for viewing data)
    getAllUsers() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT id, name, email, created_at FROM users ORDER BY created_at DESC`;
            this.db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Close database connection
    close() {
        this.db.close();
    }
}

// Export database instance
module.exports = new Database();