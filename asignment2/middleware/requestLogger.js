const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '..', 'requests.log');

function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${req.method} ${req.originalUrl}`;

  console.log(logEntry);
  fs.appendFile(logFilePath, `${logEntry}\n`, (err) => {
    if (err) {
      console.error('Failed to write request log:', err.message);
    }
  });

  next();
}

module.exports = requestLogger;
