import http from 'http';
import { parse } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

import { registerUser, loginUser, allUsers, updateUserProfile } from './controllers/userController.js';
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from './controllers/productController.js';
import {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    getUserOrders
} from './controllers/orderControllers.js';
import { authenticate } from './middleware/authMiddleware.js';
import { addToCart, clearCart, getCartItems, removeCartItem, updateCartItem } from './controllers/cartController.js';

const PORT = process.env.PORT || 5000;

const corsOptions = {
    origin: process.env.FRONT_END_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

const server = http.createServer((req, res) => {
    cors(corsOptions)(req, res, () => {
        const url = parse(req.url, true);
        const method = req.method;

        res.setHeader('Access-Control-Allow-Origin', process.env.FRONT_END_URL);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Content-Type', 'application/json');

        // Users
        if (url.pathname === '/api/users/register' && method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk;
            });
            req.on('end', () => {
                const { name, email, password, role = "customer" } = JSON.parse(body);
                registerUser({ body: { name, email, password, role } }, res);
            });
        } else if (url.pathname === '/api/users/login' && method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk;
            });
            req.on('end', () => {
                const { email, password } = JSON.parse(body);
                loginUser({ body: { email, password } }, res);
            });
        } else if (url.pathname === '/api/users/' && method === 'GET') {
            authenticate(req, res, () => {
                allUsers(req, res);
            });
        } else if (url.pathname === '/api/users/profile' && method === 'PUT') {
            authenticate(req, res, () => {
                let body = '';
                req.on('data', chunk => {
                    body += chunk;
                });
                req.on('end', () => {
                    const { name, email, password, id, role } = JSON.parse(body);
                    updateUserProfile({ body: { name, email, password, id, role } }, res);
                });
            });



        }

        // Products
        else if (url.pathname === '/api/products' && method === 'POST') {
            authenticate(req, res, () => {
                let body = '';
                req.on('data', chunk => {
                    body += chunk;
                });
                req.on('end', () => {
                    const { name, description, price, image_url, stock, category } = JSON.parse(body);
                    createProduct({ body: { name, description, price, image_url, stock, category } }, res);
                });
            });
        } else if (url.pathname === '/api/products' && method === 'GET') {
            authenticate(req, res, () => {
                getAllProducts(req, res);
            });
        } else if (url.pathname.match(/^\/api\/products\/\d+$/) && method === 'GET') {
            const productId = url.pathname.split('/')[3];
            authenticate(req, res, () => {
                getProductById({ params: { id: productId } }, res);
            });
        } else if (url.pathname.match(/^\/api\/products\/\d+$/) && method === 'PUT') {
            const productId = url.pathname.split('/')[3];
            let body = '';
            req.on('data', chunk => {
                body += chunk;
            });
            req.on('end', () => {
                const { name, description, price, image_url, stock, category } = JSON.parse(body);
                authenticate(req, res, () => {
                    updateProduct({ params: { id: productId }, body: { name, description, price, image_url, stock, category } }, res);
                });
            });
        } else if (url.pathname.match(/^\/api\/products\/\d+$/) && method === 'DELETE') {
            const productId = url.pathname.split('/')[3];
            authenticate(req, res, () => {
                deleteProduct({ params: { id: productId } }, res);
            });
        }
        // Order
        else if (url.pathname === '/api/orders' && method === 'POST') {
            authenticate(req, res, () => {
                let body = '';
                req.on('data', chunk => {
                    body += chunk;
                });
                req.on('end', () => {
                    const { user_id, product_id, quantities, total_price } = JSON.parse(body);
                    createOrder({ body: { user_id, product_id, quantities, total_price } }, res);
                });
            });
        } else if (url.pathname === '/api/orders' && method === 'GET') {
            authenticate(req, res, () => {
                getAllOrders(req, res);
            });
        } else if (url.pathname.match(/^\/api\/orders\/\d+$/) && method === 'GET') {
            const orderId = url.pathname.split('/')[3];
            authenticate(req, res, () => {
                getOrderById({ params: { id: orderId } }, res);
            });
        } else if (url.pathname.match(/^\/api\/orders\/\d+$/) && method === 'PUT') {
            const orderId = url.pathname.split('/')[3];
            let body = '';
            req.on('data', chunk => {
                body += chunk;
            });
            req.on('end', () => {
                const { user_id, product_id, quantities, total_price } = JSON.parse(body);
                authenticate(req, res, () => {
                    updateOrder({ params: { id: orderId }, body: { user_id, product_id, quantities, total_price } }, res);
                });
            });
        } else if (url.pathname.match(/^\/api\/orders\/\d+$/) && method === 'DELETE') {
            const orderId = url.pathname.split('/')[3];
            authenticate(req, res, () => {
                deleteOrder({ params: { id: orderId } }, res);
            });
        } else if (url.pathname === '/api/orders/user' && method === 'GET') {
            authenticate(req, res, () => {
                getUserOrders(req, res);
            });
        }
        else if (url.pathname === '/api/cart/' && method === 'GET') {
            authenticate(req, res, () => getCartItems(req, res));
        } else if (url.pathname === '/api/cart/' && method === 'POST') {
            authenticate(req, res, () => {
                let body = '';
                req.on('data', chunk => (body += chunk));
                req.on('end', () => {
                    req.body = JSON.parse(body);
                    addToCart(req, res);
                });
            });
        }
        else if (url.pathname.startsWith('/api/cart/') && method === 'PUT') {
            authenticate(req, res, () => {
                const id = url.pathname.split('/')[3];
                let body = '';
                req.on('data', chunk => (body += chunk));
                req.on('end', () => {
                    req.body = JSON.parse(body);
                    req.params = { id };
                    updateCartItem(req, res);
                });
            });
        } else if (url.pathname.includes('/api/cart/delete-one') && method === 'DELETE') {
            authenticate(req, res, () => {
                const id = url.pathname.split('/')[3];
                req.params = { id };
                removeCartItem(req, res);
            });
        }

        else if (url.pathname === '/api/cart/clear/' && method === 'DELETE') {
            authenticate(req, res, () => clearCart(req, res));
        } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ success: false, message: 'End Point Not Found' }));
        }
    })
});



server.listen(PORT, () => {
    console.log(`Server running at port:${PORT}`);
});