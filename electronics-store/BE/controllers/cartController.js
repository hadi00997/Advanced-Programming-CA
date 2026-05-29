import { connectDB } from '../db/config.js';

// Get all cart items for user
export const getCartItems = (req, res) => {
    const connection = connectDB();
    const userId = req.user.id;

    const sql = `SELECT c.id, p.name, p.price, c.quantity, (p.price * c.quantity) AS total
                 FROM cart c JOIN products p ON c.product_id = p.id
                 WHERE c.user_id = ?`;

    connection.query(sql, [userId], (err, result) => {
        if (err) return res.end(JSON.stringify({ success: false, message: err.message }));
        res.end(JSON.stringify({ success: true, data: result }));
    });
};

// Add item to cart (or update quantity)
export const addToCart = (req, res) => {
    const { product_id, quantity = 1 } = req.body;
    const userId = req.user.id;

    const connection = connectDB();

    const checkSql = `SELECT * FROM cart WHERE user_id = ? AND product_id = ?`;
    connection.query(checkSql, [userId, product_id], (err, rows) => {
        if (rows.length > 0) {
            const updateSql = `UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?`;
            connection.query(updateSql, [quantity, userId, product_id], err => {
                if (err) return res.end(JSON.stringify({ success: false, message: err.message }));
                res.end(JSON.stringify({ success: true, message: 'Cart updated' }));
            });
        } else {
            const insertSql = `INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)`;
            connection.query(insertSql, [userId, product_id, quantity], err => {
                if (err) return res.end(JSON.stringify({ success: false, message: err.message }));
                res.end(JSON.stringify({ success: true, message: 'Item added to cart' }));
            });
        }
    });
};

// Update quantity of cart item
export const updateCartItem = (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const connection = connectDB();

    const sql = `UPDATE cart SET quantity = ? WHERE id = ?`;
    connection.query(sql, [quantity, id], err => {
        if (err) return res.end(JSON.stringify({ success: false, message: err.message }));
        res.end(JSON.stringify({ success: true, message: 'Quantity updated' }));
    });
};

// Remove item from cart
export const removeCartItem = (req, res) => {
    const { id } = req.params;
    const connection = connectDB();

    const sql = `DELETE FROM cart WHERE id = ?`;
    connection.query(sql, [id], (err, result) => {
        if (err) return res.end(JSON.stringify({ success: false, message: err.message }));
        if (result.affectedRows === 0) {
            return res.end(JSON.stringify({ success: false, message: 'No item found with this ID' }));
        }
        res.end(JSON.stringify({ success: true, message: 'Item removed from cart' }));
    });
};

// Clear entire cart for user
export const clearCart = (req, res) => {
    const connection = connectDB();
    const userId = req.user.id;
    console.log('first', userId)
    const sql = `DELETE FROM cart WHERE user_id = ?`;
    connection.query(sql, [userId], err => {
        if (err) return res.end(JSON.stringify({ success: false, message: err.message }));
        res.end(JSON.stringify({ success: true, message: 'Cart cleared' }));
    });
};
