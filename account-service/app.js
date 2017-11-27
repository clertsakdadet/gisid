const Koa = require('koa')
const app = new Koa()
const router = require('./src/routes')
const models = require('./src/models')
const config = require('./src/config/appConfig')
const logger = require('./src/utils/logger/log')

require('./src/middlewares')(app)
app.use(router.routes(), router.allowedMethods())

if (process.env.NODE_ENV === 'test') {
  models.sequelize.sync({force: true}) // drop table and re-create
}

if (!module.parent) {
  let port = config.getPort()
  logger.log('info', config.app.name + ' is listening on port: ' + port)
  app.listen(port)
}
