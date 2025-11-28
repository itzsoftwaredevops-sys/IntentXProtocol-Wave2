/**
 * Security Middleware Configuration
 * Implements security headers, rate limiting, and protective measures
 */

import express, { Express } from 'express'
import cors from 'cors'
import compression from 'compression'

/**
 * Configure all security middleware
 */
export function setupSecurityMiddleware(app: Express): void {
  // 1. Security Headers
  app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY')
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff')
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block')
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // Feature Policy
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()'
    )
    
    next()
  })

  // 2. CORS Configuration
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type'],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200,
  }))

  // 3. Compression
  app.use(compression({
    level: 6,
    threshold: 1024, // Only compress responses > 1KB
  }))

  // 4. Body Parser with Size Limits
  app.use(express.json({
    limit: '10kb', // Prevent large payload attacks
  }))
  app.use(express.urlencoded({
    limit: '10kb',
    extended: true,
  }))

  // 5. Request ID for Logging
  app.use((req, res, next) => {
    req.id = req.get('X-Request-ID') || generateRequestId()
    res.setHeader('X-Request-ID', req.id)
    next()
  })

  // 6. Secure Defaults
  app.disable('x-powered-by')
  app.set('trust proxy', 1) // For Replit
}

/**
 * Rate Limiting Middleware (ready to enable)
 * Call setupRateLimiting(app) in your main server file
 */
export function setupRateLimiting(app: Express): void {
  // Note: Requires 'express-rate-limit' package
  // npm install express-rate-limit
  
  const config = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    skip: (req: any) => {
      // Skip rate limiting for health checks
      return req.path === '/health'
    },
  }

  // Apply to API routes only
  // app.use('/api/', rateLimit(config))
  
  console.log('Rate limiting configuration ready')
  console.log('To enable: uncomment above line after installing express-rate-limit')
}

/**
 * Error Handler Middleware
 * Prevents sensitive information leakage
 */
export function setupErrorHandler(app: Express): void {
  app.use((error: any, req: any, res: any, next: any) => {
    const statusCode = error.statusCode || 500
    
    // Log detailed error (internal only)
    console.error('[Error]', {
      id: req.id,
      path: req.path,
      method: req.method,
      status: statusCode,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })

    // Send generic error to client (no sensitive info)
    const message = statusCode === 500
      ? 'Internal server error'
      : error.message || 'Request failed'

    res.status(statusCode).json({
      error: message,
      requestId: req.id,
      timestamp: new Date().toISOString(),
    })
  })
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validate and sanitize input
 */
export function validateInput(data: any, schema: any): any {
  try {
    return schema.parse(data)
  } catch (error: any) {
    throw new Error(`Validation failed: ${error.message}`)
  }
}

/**
 * Log security-relevant events
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, any>
): void {
  console.log('[SECURITY]', {
    timestamp: new Date().toISOString(),
    event,
    ...details,
  })
}
