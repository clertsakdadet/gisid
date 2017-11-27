const winston = require('winston')
winston.emitErrs = true

const config = require('../../config/appConfig')
require('winston-daily-rotate-file')

const transport = new (winston.transports.DailyRotateFile)(config.getLogConfig('requestLogConfig'))
const logger = new winston.Logger({
  transports: [
    transport,
    new winston.transports.Console({
      level: 'info',
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
