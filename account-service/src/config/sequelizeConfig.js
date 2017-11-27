module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'gismin',
    password: process.env.DB_PASSWORD || 'xYaXB3fDyUAN2hHnLJcj',
    database: 'acc_db',
    host: process.env.DB_HOSTNAME || 'localhost',
    port: process.env.DB_PORT || 5455,
    dialect: 'postgres'
  },
  production: {
    username: process.env.DB_USERNAME || 'gismin',
    password: process.env.DB_PASSWORD || 'xYaXB3fDyUAN2hHnLJcj',
    database: 'acc_db',
    host: process.env.DB_HOSTNAME || 'localhost',
    port: process.env.DB_PORT || 5455,
    dialect: 'postgres'
  },
  test: {
    username: process.env.DB_USERNAME || 'gismin',
    password: process.env.DB_PASSWORD || 'xYaXB3fDyUAN2hHnLJcj',
    database: 'acc_db_test',
    host: process.env.DB_HOSTNAME || 'localhost',
    port: process.env.DB_PORT || 5455,
    dialect: 'postgres'
  }
}
