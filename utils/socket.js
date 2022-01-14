const { decode } = require('jsonwebtoken');
const auth = require('./auth');
const game = require('./game');

const authMiddleware = (socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token){
    auth.validate(socket.handshake.query.token, (err, decoded) => {
      if (err){
        return next(new Error('Authentication error'));
      }
      if(!decoded.room || !(decoded.room in game.rooms) || decoded.room !== socket.handshake.query.code){
        return next(new Error('Authentication error'));
      }
      if(!(decoded.player in game.rooms[decoded.room].players)){
        return next(new Error('Authentication error'));
      }
      socket.data = decoded;
      next();
    });
  }
  else {
    next(new Error('Authentication error'));
  }
}

module.exports = {
  authMiddleware
}