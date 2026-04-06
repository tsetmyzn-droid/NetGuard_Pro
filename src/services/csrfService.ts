import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'your-secret'; // Ensure to use a secure secret

// Generate CSRF token
export const generateCsrfToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

// Middleware to set CSRF token
export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
    res.locals.csrfToken = generateCsrfToken();
    next();
};

// Validate CSRF token
export const validateCsrfToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['csrf-token'] as string;
    if (!token || token !== res.locals.csrfToken) {
        return res.status(403).send('Invalid CSRF Token');
    }
    next();
};
