/**
 * Structured request/response logging middleware
 * Logs: response time, HTTP status code, error message, AI provider used, retry attempts
 */

export function requestLogger(req, res, next) {
  const start = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Attach requestId for correlation
  req.requestId = requestId;
  
  // Log request
  const logData = {
    requestId,
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl || req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    contentType: req.headers['content-type'],
    origin: req.headers.origin || 'unknown',
    userAgent: req.headers['user-agent']?.substring(0, 100),
  };

  if (process.env.NODE_ENV === 'development') {
    console.log(`[${requestId}] → ${req.method} ${req.originalUrl || req.path}`);
  }

  // Capture response
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  let responseBody = null;

  res.json = function (body) {
    responseBody = body;
    return originalJson(body);
  };

  res.send = function (body) {
    responseBody = body;
    return originalSend(body);
  };

  // Log on finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    const responseLog = {
      requestId,
      method: req.method,
      path: req.originalUrl || req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    };

    // Add error info if present
    if (res.statusCode >= 400 && responseBody) {
      const body = typeof responseBody === 'string' ? { error: responseBody } : responseBody;
      responseLog.errorType = body.errorType || 'UNKNOWN';
      responseLog.errorMessage = body.error || body.message || null;
    }

    // Add AI provider info if attached to request
    if (req.aiProvider) {
      responseLog.aiProvider = req.aiProvider;
    }
    if (req.retryAttempts !== undefined) {
      responseLog.retryAttempts = req.retryAttempts;
    }

    // In development, log compact format
    if (process.env.NODE_ENV === 'development') {
      const icon = res.statusCode < 400 ? '✅' : res.statusCode < 500 ? '⚠️' : '❌';
      const providerInfo = req.aiProvider ? ` [${req.aiProvider}]` : '';
      const retryInfo = req.retryAttempts ? ` (retries: ${req.retryAttempts})` : '';
      console.log(`[${requestId}] ${icon} ${req.method} ${req.originalUrl || req.path} → ${res.statusCode} (${duration}ms)${providerInfo}${retryInfo}`);
    } else {
      // In production, log structured JSON
      console.log(JSON.stringify(responseLog));
    }
  });

  next();
}

