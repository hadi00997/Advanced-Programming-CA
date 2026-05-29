import mysql from 'mysql2';

export const connectDB = () => {
    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    connection.connect((err) => {
        if (err) {
            console.error('Database connection failed:', err);
            process.exit(1);
        }
        console.log('Database connected successfully');
    });

    return connection;
};
