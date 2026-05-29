import { connectDB } from '../db/config.js';

// Create a new product
export const createProduct = async (req, res) => {
    const { name, description, price, image_url, stock, category } = req.body;

    const connection = connectDB();

    try {
        const sql = 'INSERT INTO products (name, description, price, image_url, stock, category) VALUES (?, ?, ?, ?, ?, ?)';
        connection.query(sql, [name, description, price, image_url, stock, category], (err, result) => {
            if (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({ success: false, message: err.message }));
            }

            res.statusCode = 201;
            res.end(JSON.stringify({ success: true, message: 'Product created successfully' }));
        });
    } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ success: false, message: error.message }));
    }
};

// Get all products
export const getAllProducts = async (req, res) => {
    const connection = connectDB();

    try {
        const sql = 'SELECT id, name, description, price, image_url, stock, category FROM products';
        connection.query(sql, (err, result) => {
            if (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({ success: false, message: err.message }));
            }

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: result }));
        });
    } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ success: false, message: error.message }));
    }
};

// Get a single product by ID
export const getProductById = async (req, res) => {
    const { id } = req.params;
    const connection = connectDB();

    try {
        const sql = 'SELECT id, name, description, price, image_url, stock, category FROM products WHERE id = ?';
        connection.query(sql, [id], (err, result) => {
            if (err || result.length === 0) {
                res.statusCode = 404;
                return res.end(JSON.stringify({ success: false, message: 'Product not found' }));
            }

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: result[0] }));
        });
    } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ success: false, message: error.message }));
    }
};

// Update product by ID
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, image_url, stock, category } = req.body;

    const connection = connectDB();

    try {
        const sql = 'UPDATE products SET name = ?, description = ?, price = ?, image_url = ?, stock = ?, category = ? WHERE id = ?';
        connection.query(sql, [name, description, price, image_url, stock, category, id], (err, result) => {
            if (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({ success: false, message: err.message }));
            }

            if (result.affectedRows === 0) {
                res.statusCode = 404;
                return res.end(JSON.stringify({ success: false, message: 'Product not found' }));
            }

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, message: 'Product updated successfully' }));
        });
    } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ success: false, message: error.message }));
    }
};

// Delete product by ID
export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const connection = connectDB();

    try {
        const sql = 'DELETE FROM products WHERE id = ?';
        connection.query(sql, [id], (err, result) => {
            if (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({ success: false, message: err.message }));
            }

            if (result.affectedRows === 0) {
                res.statusCode = 404;
                return res.end(JSON.stringify({ success: false, message: 'Product not found' }));
            }

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, message: 'Product deleted successfully' }));
        });
    } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ success: false, message: error.message }));
    }
};
