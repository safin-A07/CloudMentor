const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const redis = require('redis');
const { RedisStore } = require('connect-redis');
const path = require('path');
const winston = require('winston'); // For logging
const multer = require('multer'); // For file uploads
require('dotenv').config();

const app = express();
const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

// Logger Setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

// Multer Setup for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new RedisStore({ client: redisClient }),
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Logging Middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// EJS Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB Connection
require('./config/db');

// Routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const tutorRoutes = require('./routes/tutor');
const adminRoutes = require('./routes/admin');

app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/student', studentRoutes);
app.use('/tutor', tutorRoutes);
app.use('/admin', adminRoutes);

// File Upload Route for Profile Pictures
app.post('/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        user.profilePicture = `/uploads/${req.file.filename}`;
        await user.save();
        req.session.user = user;
        res.redirect(req.headers.referer || '/');
    } catch (err) {
        logger.error('Profile picture upload failed', err);
        res.status(500).send('Error uploading profile picture');
    }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).render('error', { message: 'Something went wrong!', user: req.session.user || null });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});