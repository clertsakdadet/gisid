const uploader = {}
const multer = require('koa-multer')
const fs = require('fs-extra')
const crypto = require('crypto')
const path = require('path')
const errorCode = require('../config/msgConfig.json')
const AppError = require('../utils/errors/appError')
const utils = require('../utils/utils')
const config = require('../config/appConfig')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dir = path.join(utils.getRootPath(), config.path.upload, '/temp')
    fs.ensureDir(dir, err => {
      cb(err, dir)
    })
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(10, (err, buf) => {
      if (err) cb(err, null)
      else cb(null, buf.toString('hex') + path.extname(file.originalname).toLowerCase())
    })
  }
})

uploader.upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: function (req, file, cb) {
    let ext = path.extname(file.originalname).toLowerCase()
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') cb(null, true)
    else return cb(new AppError('file type isn\'t supported', errorCode.UnprocessableEntity))
  }
})

module.exports = uploader
