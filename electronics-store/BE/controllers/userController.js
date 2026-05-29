import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '../db/config.js';
import validator from 'validator';


// Register a new user
export const registerUser = async (req, res) => {
    const { name, email, password, role = 'customer' } = req.body;

    // === Form Validation ===
    if (!name || !email || !password) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, message: 'All fields are required' }));
    }

    if (!validator.isEmail(email)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, message: 'Invalid email format' }));
    }

    if (!validator.isLength(password, { min: 6 })) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, message: 'Password must be at least 6 characters long' }));
    }

    const connection = connectDB();

    try {
        connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({ success: false, message: err.message }));
            }

            if (results.length > 0) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ success: false, message: 'Email already registered' }));
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
            connection.query(sql, [name, email, hashedPassword, role], (err, result) => {
                if (err) {
                    res.statusCode = 500;
                    return res.end(JSON.stringify({ success: false, message: err.message }));
                }

                const userId = result.insertId;
                const token = jwt.sign({ id: userId, email, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

                res.statusCode = 201;
                res.end(JSON.stringify({ success: true, message: 'User registered successfully', token }));
            });
        });
    } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ success: false, message: error.message }));
    }
};

// Login user and generate JWT token
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const connection = connectDB();
    try {
        const sql = 'SELECT * FROM users WHERE email = ?';
        connection.query(sql, [email], async (err, result) => {
            if (err || result.length === 0) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ success: false, message: 'User not found' }));
            }

            const user = result[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                res.statusCode = 401;
                return res.end(JSON.stringify({ success: false, message: 'Invalid credentials' }));
            }

            // Create JWT Token
            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN,
            });
            delete user.password;
            // Set cookie with token
            res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax; Domain=localhost`);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: user, token: token }));
        });
    } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ success: false, message: error.message }));
    }
};

// All users for admin
export const allUsers = async (req, res) => {
    const connection = connectDB();

    try {
        const sql = 'SELECT id, name, email, role FROM users';
        connection.query(sql, async (err, result) => {
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: result }));
        });
    } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ success: false, message: error.message }));
    }
};

// Update user profile (including password if provided)
export const updateUserProfile = async (req, res) => {
    console.log('-->', req.body)
    const { name, email, password, id, role } = req.body;

    const connection = connectDB();

    try {
        // Check if the password is provided, if so hash it
        let updatedPassword = null;
        if (password) {
            updatedPassword = await bcrypt.hash(password, 10);
        }

        // SQL query to update the user profile
        let sql = 'UPDATE users SET name = ?, email = ?, role = ?';
        const params = [name, email, role];

        if (updatedPassword) {
            sql += ', password = ?';
            params.push(updatedPassword);
        }

        sql += ' WHERE id = ?';
        params.push(id);

        connection.query(sql, params, (err, result) => {
            if (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({ success: false, message: err.message }));
            }

            if (result.affectedRows === 0) {
                res.statusCode = 404;
                return res.end(JSON.stringify({ success: false, message: 'User not found' }));
            }

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, message: 'User profile updated successfully' }));
        });
    } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ success: false, message: error.message }));
    }
};