import { connectDB } from '../db/config.js';

// Create a new order
export const createOrder = async (req, res) => {
    const { user_id, product_id, quantities, total_price } = req.body;
    const connection = connectDB();

    const sql = `INSERT INTO orders (user_id, product_id, quantities, total_price) VALUES (?, ?, ?, ?)`;
    connection.query(sql, [user_id, product_id, quantities, total_price], (err, result) => {
        if (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, message: err.message }));
        }
        res.statusCode = 201;
        res.end(JSON.stringify({ success: true, message: 'Order created successfully' }));
    });
};

// Get all orders
export const getAllOrders = async (req, res) => {
    const connection = connectDB();
    const sql = `SELECT * FROM orders`;

    connection.query(sql, (err, result) => {
        if (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, message: err.message }));
        }
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, data: result }));
    });
};

// Get single order by ID
export const getOrderById = async (req, res) => {
    const { id } = req.params;
    const connection = connectDB();

    const sql = `SELECT * FROM orders WHERE id = ?`;
    connection.query(sql, [id], (err, result) => {
        if (err || result.length === 0) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ success: false, message: 'Order not found' }));
        }
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, data: result[0] }));
    });
};

// Update order
export const updateOrder = async (req, res) => {
    const { id } = req.params;
    const { user_id, product_id, quantities, total_price } = req.body;
    const connection = connectDB();

    const sql = `UPDATE orders SET user_id = ?, product_id = ?, quantities = ?, total_price = ? WHERE id = ?`;
    connection.query(sql, [user_id, product_id, quantities, total_price, id], (err, result) => {
        if (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, message: err.message }));
        }
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, message: 'Order updated successfully' }));
    });
};

// Delete order
export const deleteOrder = async (req, res) => {
    const { id } = req.params;
    const connection = connectDB();

    const sql = `DELETE FROM orders WHERE id = ?`;
    connection.query(sql, [id], (err, result) => {
        if (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, message: err.message }));
        }
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, message: 'Order deleted successfully' }));
    });
};

// Get all orders for the authenticated user
export const getUserOrders = async (req, res) => {
    const userId = req.user.id;

    const connection = connectDB();

    try {
        const sql = 'SELECT orders.id, orders.product_id, orders.quantities, orders.total_price, orders.order_date, products.name AS product_name FROM orders JOIN products ON orders.product_id = products.id WHERE orders.user_id = ?';
        connection.query(sql, [userId], (err, result) => {
            if (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({ success: false, message: err.message }));
            }

            if (result.length === 0) {
                res.statusCode = 404;
                return res.end(JSON.stringify({ success: false, message: 'No orders found for this user' }));
            }

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: result }));
        });
    } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ success: false, message: error.message }));
    }
};