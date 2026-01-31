export default function errorHandler(err, req, res, next) {
  console.error('[Error]', err);

  // Validation errors
  if (err.statusCode === 400) {
    return res.status(400).json({
      message: err.message || 'Bad request',
      errors: err.errors || [],
    });
  }

  // Authentication errors
  if (err.statusCode === 401 || err.message === 'Unauthorized') {
    return res.status(401).json({ message: err.message || 'Unauthorized' });
  }

  // Authorization errors
  if (err.statusCode === 403 || err.message === 'Forbidden') {
    return res.status(403).json({ message: err.message || 'Forbidden' });
  }

  // Not found errors
  if (err.statusCode === 404 || err.message === 'Not found') {
    return res.status(404).json({ message: err.message || 'Resource not found' });
  }

  // Database errors
  if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED')) {
    return res.status(503).json({ message: 'Database connection failed' });
  }

  // Default 500 error
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
