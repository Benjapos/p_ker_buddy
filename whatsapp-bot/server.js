require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');

// Import modules
const WhatsAppBot = require('./src/whatsapp-bot');
const Database = require('./src/database');
const PollManager = require('./src/poll-manager');
const SecurityMiddleware = require('./src/security-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize components
const db = new Database();
const whatsappBot = new WhatsAppBot();
const pollManager = new PollManager(whatsappBot, db);
const security = new SecurityMiddleware();

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Admin authorization
const requireAdmin = (req, res, next) => {
    const adminPhones = process.env.ADMIN_PHONE_NUMBERS?.split(',') || [];
    if (!adminPhones.includes(req.user.phone)) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication
app.post('/auth/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        
        // Validate input
        if (!phone || !password) {
            return res.status(400).json({ error: 'Phone and password required' });
        }

        // Check if user is admin
        const adminPhones = process.env.ADMIN_PHONE_NUMBERS?.split(',') || [];
        if (!adminPhones.includes(phone)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Generate token
        const token = jwt.sign({ phone }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        res.json({ token, phone });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Poll management (admin only)
app.post('/polls/create', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { question, options, groupId, type } = req.body;
        
        // Validate input
        if (!question || !options || !groupId || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const poll = await pollManager.createPoll(question, options, groupId, type);
        res.json({ success: true, poll });
    } catch (error) {
        console.error('Create poll error:', error);
        res.status(500).json({ error: 'Failed to create poll' });
    }
});

app.get('/polls/results/:pollId', authenticateToken, async (req, res) => {
    try {
        const { pollId } = req.params;
        const results = await pollManager.getPollResults(pollId);
        res.json(results);
    } catch (error) {
        console.error('Get poll results error:', error);
        res.status(500).json({ error: 'Failed to get poll results' });
    }
});

// WhatsApp status
app.get('/whatsapp/status', authenticateToken, async (req, res) => {
    try {
        const status = await whatsappBot.getStatus();
        res.json(status);
    } catch (error) {
        console.error('WhatsApp status error:', error);
        res.status(500).json({ error: 'Failed to get WhatsApp status' });
    }
});

// CSV integration
app.post('/csv/update', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { gameData } = req.body;
        
        // Validate game data
        if (!gameData || !gameData.date || !gameData.winners) {
            return res.status(400).json({ error: 'Invalid game data' });
        }

        // Update CSV file
        await db.updateGameResults(gameData);
        
        res.json({ success: true, message: 'Game results updated' });
    } catch (error) {
        console.error('CSV update error:', error);
        res.status(500).json({ error: 'Failed to update game results' });
    }
});

// Scheduled polls
cron.schedule(process.env.POLL_SCHEDULE_CRON || '0 18 * * 0-4', async () => {
    try {
        console.log('Sending availability poll...');
        await pollManager.sendAvailabilityPoll();
    } catch (error) {
        console.error('Availability poll error:', error);
    }
});

cron.schedule(process.env.FOOD_POLL_SCHEDULE_CRON || '0 12 * * 0-4', async () => {
    try {
        console.log('Sending food poll...');
        await pollManager.sendFoodPoll();
    } catch (error) {
        console.error('Food poll error:', error);
    }
});

cron.schedule(process.env.HOST_POLL_SCHEDULE_CRON || '0 14 * * 0-4', async () => {
    try {
        console.log('Sending host poll...');
        await pollManager.sendHostPoll();
    } catch (error) {
        console.error('Host poll error:', error);
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
    try {
        // Initialize database
        await db.init();
        
        // Initialize WhatsApp bot
        await whatsappBot.init();
        
        app.listen(PORT, () => {
            console.log(`🚀 Secure WhatsApp Bot running on port ${PORT}`);
            console.log(`🔒 Security features: JWT, Rate limiting, CORS, Helmet`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer(); 