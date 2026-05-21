export function errorMiddleware(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  return res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
}

