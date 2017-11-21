const compose = require('koa-compose')
const morgan = require('koa-morgan')
const logger = require('../logs/cfg')

async function responseTime (ctx, next) {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
}

async function response (ctx, next) {
  ctx.body = 'Hello World'
}

const all = compose([
  morgan('combined', { 'stream': logger.stream }),
  responseTime,
  response
])

module.exports = all
