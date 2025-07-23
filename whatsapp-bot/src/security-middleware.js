const Joi = require('joi');
const { body, validationResult } = require('express-validator');

class SecurityMiddleware {
    constructor() {
        this.validationSchemas = {
            poll: Joi.object({
                question: Joi.string().max(500).required(),
                options: Joi.array().items(Joi.string().max(100)).min(2).max(10).required(),
                groupId: Joi.string().pattern(/^\d+@g\.us$/).required(),
                type: Joi.string().valid('availability', 'food', 'host', 'custom').required()
            }),
            
            gameResult: Joi.object({
                date: Joi.string().pattern(/^\d{2}\/\d{2}\/\d{4}$/).required(),
                winners: Joi.string().max(200).required(),
                split: Joi.boolean().default(false),
                notes: Joi.string().max(500).allow(''),
                player1: Joi.string().max(50).allow(''),
                player2: Joi.string().max(50).allow(''),
                player3: Joi.string().max(50).allow(''),
                player4: Joi.string().max(50).allow(''),
                player5: Joi.string().max(50).allow(''),
                player6: Joi.string().max(50).allow(''),
                player7: Joi.string().max(50).allow(''),
                player8: Joi.string().max(50).allow('')
            }),
            
            phoneNumber: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required()
        };
    }

    // Input validation middleware
    validatePoll() {
        return [
            body('question').trim().isLength({ min: 1, max: 500 }).escape(),
            body('options').isArray({ min: 2, max: 10 }),
            body('options.*').trim().isLength({ min: 1, max: 100 }).escape(),
            body('groupId').matches(/^\d+@g\.us$/),
            body('type').isIn(['availability', 'food', 'host', 'custom']),
            this.handleValidationErrors
        ];
    }

    validateGameResult() {
        return [
            body('gameData.date').matches(/^\d{2}\/\d{2}\/\d{4}$/),
            body('gameData.winners').trim().isLength({ min: 1, max: 200 }).escape(),
            body('gameData.split').isBoolean(),
            body('gameData.notes').optional().trim().isLength({ max: 500 }).escape(),
            body('gameData.player1').optional().trim().isLength({ max: 50 }).escape(),
            body('gameData.player2').optional().trim().isLength({ max: 50 }).escape(),
            body('gameData.player3').optional().trim().isLength({ max: 50 }).escape(),
            body('gameData.player4').optional().trim().isLength({ max: 50 }).escape(),
            body('gameData.player5').optional().trim().isLength({ max: 50 }).escape(),
            body('gameData.player6').optional().trim().isLength({ max: 50 }).escape(),
            body('gameData.player7').optional().trim().isLength({ max: 50 }).escape(),
            body('gameData.player8').optional().trim().isLength({ max: 50 }).escape(),
            this.handleValidationErrors
        ];
    }

    validatePhoneNumber() {
        return [
            body('phone').matches(/^\+[1-9]\d{1,14}$/),
            this.handleValidationErrors
        ];
    }

    // Handle validation errors
    handleValidationErrors(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        next();
    }

    // JWT token validation
    validateToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return { valid: true, decoded };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    // Rate limiting configuration
    getRateLimitConfig() {
        return {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
            max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
            message: 'Too many requests from this IP',
            standardHeaders: true,
            legacyHeaders: false
        };
    }

    // Input sanitization
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    }

    // Phone number validation
    validatePhoneNumberFormat(phone) {
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        return phoneRegex.test(phone);
    }

    // Group ID validation
    validateGroupId(groupId) {
        const groupRegex = /^\d+@g\.us$/;
        return groupRegex.test(groupId);
    }

    // Date validation
    validateDate(date) {
        const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!dateRegex.test(date)) return false;
        
        const [day, month, year] = date.split('/').map(Number);
        const dateObj = new Date(year, month - 1, day);
        
        return dateObj.getDate() === day &&
               dateObj.getMonth() === month - 1 &&
               dateObj.getFullYear() === year;
    }

    // SQL injection prevention
    sanitizeSQL(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/['";\\]/g, '') // Remove SQL special characters
            .replace(/--/g, '') // Remove SQL comments
            .replace(/\/\*/g, '') // Remove SQL block comments
            .replace(/\*\//g, '');
    }

    // XSS prevention
    preventXSS(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    // Log security events
    logSecurityEvent(event, details) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event,
            details,
            ip: details.ip || 'unknown',
            userAgent: details.userAgent || 'unknown'
        };
        
        console.log('🔒 Security Event:', logEntry);
        
        // In production, you might want to log to a file or external service
        if (process.env.NODE_ENV === 'production') {
            // Add production logging here
        }
    }

    // Check for suspicious activity
    detectSuspiciousActivity(req) {
        const suspicious = [];
        
        // Check for unusual user agents
        const userAgent = req.get('User-Agent') || '';
        if (!userAgent || userAgent.length < 10) {
            suspicious.push('Empty or suspicious user agent');
        }
        
        // Check for unusual request patterns
        if (req.body && Object.keys(req.body).length > 50) {
            suspicious.push('Too many request parameters');
        }
        
        // Check for SQL injection attempts
        const bodyString = JSON.stringify(req.body);
        if (bodyString.includes('SELECT') || bodyString.includes('INSERT') || 
            bodyString.includes('UPDATE') || bodyString.includes('DELETE')) {
            suspicious.push('Potential SQL injection attempt');
        }
        
        return suspicious;
    }
}

module.exports = SecurityMiddleware; 