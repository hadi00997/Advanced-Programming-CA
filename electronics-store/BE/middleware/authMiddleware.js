import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    let token = req.headers['authorization'];
    token = token?.split('Bearer ')[1];
    if (!token) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ sucess: false, message: 'No token provided' }));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.statusCode = 401;
            return res.end(JSON.stringify({ success: false, message: 'Invalid token' }));
        }
        req.user = decoded;
        next();
    });
};