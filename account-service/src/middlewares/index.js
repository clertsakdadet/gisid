'use strict'

module.exports = function (app) {
  let helmet = require('koa-helmet')()
  let compose = require('koa-compose')
  let common = require('./common')
  let bodyParser = require('koa-bodyparser')()
  let morgan = require('koa-morgan')
  let logger = require('../utils/logger/log')
  require('koa-validate')(app)

  app.use(compose([
    helmet,
    common.handleError,
    common.responseTime,
    bodyParser,
    morgan('combined', { 'stream': logger.stream })
  ]))
}
