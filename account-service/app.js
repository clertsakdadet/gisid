const Koa = require('koa')
const helmet = require('koa-helmet')
const app = new Koa()

app.use(helmet())
app.use(require('./src/middlewares/all'))

app.listen(3000)
