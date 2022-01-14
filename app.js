const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require('cors');
var bodyParser = require('body-parser');

const port = process.env.PORT || 4001;
const index = require("./routes");
const words = require("./routes/words");
const socketUtils = require('./utils/socket');
const auth = require('./utils/auth');
const game = require('./utils/game');
const eventEmitter = require('./utils/events');

const app = express();
app.use(cors(auth.corsConfig))
app.use(bodyParser.json());
app.use(index);
app.use(words);

const server = http.createServer(app);

// initialize websocket
const io = socketIo(server, {  cors: auth.corsConfig });

io.use(socketUtils.authMiddleware)
.on('connection', (socket) => {
    const { room, player } = socket.data;

    if(room){
      socket.join(room);
      game.setPlayerConnection(room, player, true);
      triggerUpdate(room);
    }

    socket.on('disconnect', () => {
      game.setPlayerConnection(room, player, false);
      triggerUpdate(room);
    })
})

// trigger game updates
const triggerUpdate = (room) => {
  io.to(room).emit('update', game.getState(room))
}
eventEmitter.on('update', triggerUpdate);

server.listen(port, () => console.log(`Listening on port ${port}`));