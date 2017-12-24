module.exports = {
  server_port: process.env.PORT || 8080,
  session_secret: process.env.SESSION_SECRET || 'AF16A159AD7924E3BAE27BB6633FE',
  redis: {
    host: process.env.REDIS_HOST || 'docker.cdg.co.th',
    port: process.env.REDIS_PORT || 6379,
    expire: 60
  },
  services: {
    login_url: process.env.LOGIN_URL || 'docker.cdg.co.th/svc/login',
    logout_url: process.env.LOGOUT_URL || 'docker.cdg.co.th/svc/logout',
    vote_url: process.env.VOTE_URL || 'docker.cdg.co.th/svc/vote'
  }
}
