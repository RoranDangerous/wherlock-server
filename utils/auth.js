const jwt = require('jsonwebtoken');

const SECRET_KEY = Math.random().toString(36).substring(2);

const getToken = (room, player) => jwt.sign({ room, player }, SECRET_KEY);
const validate = (token, callback) => jwt.verify(token, SECRET_KEY, callback);

const corsConfig = {
  origin: 'http://wherlock.iroman.ca',
  methods: ['GET', 'POST']
}

module.exports = {
  getToken,
  validate,
  corsConfig,
}
