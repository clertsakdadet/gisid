const utils = {}
const errorCode = require('../config/msgConfig.json')
const path = require('path')

utils.getRootPath = () => {
  return path.dirname(require.main.filename || process.mainModule.filename)
}

utils.getRandomIntInclusive = (min, max) => {
  // The maximum is inclusive and the minimum is inclusive
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

utils.trackError = (err, file, fnName) => {
  if (err) {
    !err.fnTrack && (err.fnTrack = [])
    !err.fileTrack && (err.fileTrack = [])
    err.fileTrack.push(file)
    err.fnTrack.push(fnName)
  }
}

utils.normalizeEmail = (email) => {
  if (!email) return null
  let rawParts = email.split('@')
  let domain = rawParts.pop()
  let user = rawParts.join('@')
  let parts = [user, domain]
  parts[1] = parts[1].toLowerCase()

  // remove sub-address
  parts[0] = parts[0].split('+')[0]
  if (parts[1] === 'gmail.com' || parts[1] === 'googlemail.com') {
    // Gmail ignores the dots
    parts[0] = parts[0].replace(/\./g, '')
  }
  return parts.join('@')
}

utils.addAvatarToProfile = (provider, url, profile) => {
  if (!profile || !url) return
  if (!profile.avatars) profile.avatars = {}
  profile.avatars[provider] = url
  if (!profile.picture) profile.picture = url
}

utils.isSpecialError = err => {
  if (err && err.code) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return !0
    }
  }
  return !1
}

utils.parseSpecialErrorCode = err => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    err.status = errorCode.UnprocessableEntity
  }
}

module.exports = utils
