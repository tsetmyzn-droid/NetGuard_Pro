// src/middleware/inputValidator.ts

import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Middleware for validating router IP addresses, credentials, and API parameters
export const inputValidator = [
    body('ip').isIP().withMessage('Invalid IP address'),
    body('username').isString().notEmpty().withMessage('Username cannot be empty'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('apiParam').optional().isAlphanumeric().withMessage('API parameter must be alphanumeric'),

    // Custom error handler
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
