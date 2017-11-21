const winston = require('winston')
winston.emitErrs = true
require('winston-daily-rotate-file')
const transport = new (winston.transports.DailyRotateFile)({
  filename: './logs/all.log',
  datePattern: '/yyyy-MM/dd-',
  prepend: true,
  level: process.env.ENV === 'development' ? 'debug' : 'info',
  handleExceptions: true,
  json: true,
  maxsize: 5242880, // 5MB
  maxFiles: 5,
  createTree: true,
  colorize: false
})

const logger = new winston.Logger({
  transports: [
    transport,
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
})

module.exports = logger
module.exports.stream = {
  write: function (message, encoding) {
    logger.info(message)
  }
}
