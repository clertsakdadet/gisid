const express = require('express')
const session = require('express-session')
const path = require('path')
const app = express()
const bodyParser = require('body-parser')
const request = require('request')
!process.env.NODE_ENV && (process.env.NODE_ENV = 'dev')
const config = process.env.NODE_ENV.trim() === 'production' ? require('./config/config.production') : require('./config/config.dev')
app.use(express.static(path.join(__dirname, '/public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

const sessionOptions = {
  secret: config.session_secret,
  cookie: { maxAge: config.redis.expire * 1000 },
  rolling: true,
  logErrors: true
}

// connect to session server
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session(sessionOptions))

app.use('/demo/login', function checkSession (req, res, next) {
  res.render('login', {
    config: config.services
  })
})

app.post('/demo/oauth', function getContacts (req, res) {
  request.post('http://dev.cdg.co.th/g/auth/login', {form: { account: req.body.username, password: req.body.password }}, function optionalCallback (err, httpResponse, body) {
    if (err) {
      res.body = { success: !1 }
    } else {
      res.json(body)
    }
  })
})

// app.use('/demo/index', function checkSession (req, res, next) {
//   res.render('index', {
//     config: config.services
//   })
// })

app.use('/', function checkSession (req, res, next) {
  res.render('index', {
    config: config.services
  })
  // if (!req.session.user) {
  //   res.render('login', {
  //     config: config.services
  //   })
  // } else {
  //   res.render('profile', {
  //     config: config.services,
  //     session: req.session,
  //     vote: req.session.vote,
  //     // expire: parseInt((req.session.cookie.maxAge / 1000))
  //     expire: config.redis.expire
  //   })
  // }
})

// app.use('/profile', function checkSession (req, res, next) {
//   if (!req.session.user) {
//     res.render('login', {
//       config: config.services
//     })
//   } else {
//     res.render('profile', {
//       config: config.services,
//       session: req.session,
//       vote: req.session.vote,
//       // expire: parseInt((req.session.cookie.maxAge / 1000))
//       expire: config.redis.expire
//     })
//   }
// })

app.listen(7777, function () {
  console.log('READ server listening on ' + 7777)
})
