const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// express-mongo-sanitize is not compatible with Express 5 (req.query is read-only)
// We use a lightweight custom sanitizer instead
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ── Connect to Database ──────────────────────────────────────────────────────
connectDB();

const app = express();

// ── Security Middleware ──────────────────────────────────────────────────────

// Set security-related HTTP headers
app.use(helmet());

// Enable CORS
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// Rate limiting — max 100 requests per 15 minutes per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again in 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again later.',
    },
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// ── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // reject large payloads
app.use(express.urlencoded({ extended: false }));

// Sanitize req.body against NoSQL injection (strip keys starting with $ or .)
const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach((key) => {
            if (key.startsWith('$') || key.includes('.')) {
                delete obj[key];
            } else {
                sanitize(obj[key]);
            }
        });
    }
};
app.use((req, _res, next) => {
    if (req.body) sanitize(req.body);
    next();
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/posts', require('./routes/postRoutes'));
app.use('/api/v1/categories', require('./routes/categoryRoutes'));

// ── Root & Health ─────────────────────────────────────────────────────────────
const apiInfo = {
    success: true,
    message: '📝 Blog REST API',
    version: 'v1',
    baseUrl: '/api/v1',
    endpoints: {
        auth: {
            register: 'POST   /api/v1/auth/register',
            login: 'POST   /api/v1/auth/login',
            logout: 'POST   /api/v1/auth/logout',
            profile: 'GET    /api/v1/auth/me',
            updateMe: 'PUT    /api/v1/auth/me',
        },
        posts: {
            list: 'GET    /api/v1/posts',
            get: 'GET    /api/v1/posts/:id',
            create: 'POST   /api/v1/posts',
            update: 'PUT    /api/v1/posts/:id',
            delete: 'DELETE /api/v1/posts/:id',
            like: 'POST   /api/v1/posts/:id/like',
        },
        comments: {
            list: 'GET    /api/v1/posts/:postId/comments',
            create: 'POST   /api/v1/posts/:postId/comments',
            update: 'PUT    /api/v1/posts/:postId/comments/:id',
            delete: 'DELETE /api/v1/posts/:postId/comments/:id',
        },
        categories: {
            list: 'GET    /api/v1/categories',
            get: 'GET    /api/v1/categories/:id',
            create: 'POST   /api/v1/categories  [admin]',
            update: 'PUT    /api/v1/categories/:id  [admin]',
            delete: 'DELETE /api/v1/categories/:id  [admin]',
        },
        health: 'GET    /api/v1/health',
    },
};

app.get('/', (req, res) => res.status(200).json(apiInfo));

app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Blog API is running ✅',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});


// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   API Base    : http://localhost:${PORT}/api/v1\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err.message);
    server.close(() => process.exit(1));
});

module.exports = app;
