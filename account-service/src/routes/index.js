'use strict'

const fs = require('fs')
const path = require('path')
const router = require('koa-router')()
const basename = path.basename(__filename)

fs
  .readdirSync(__dirname)
  .filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
  })
  .forEach(function (file) {
    let route = require(path.join(__dirname, file))
    router.use(route.routes(), route.allowedMethods())
  })

module.exports = router
