const express = require('express');
const router = express.Router();
const game = require('../utils/game');
const auth = require('../utils/auth');

router.get('/', (_, res) => {
  res.status(200).send({ success: true });
})

router.post('/create', (req, res) => {
  const name = req.body.name;
  const code = game.create(name);

  res.status(200).send({ token: auth.getToken(code, name), code })
})

router.post('/join', (req, res) => {
  const room = req.body.room;
  const player = req.body.name;
  const token = req.body.token ?? '';

  if (!game.isValidRoom(room)) {
    res.status(404).send({ error: 'Door is locked! Try going through the window!' });
    return
  }

  if (game.isInProgress(room)) {
    res.status(400).send({ error: 'The game has already started. I guess they didn\'t want to wait for you, eh?' });
    return
  }

  auth.validate(token, (err, decoded) => {
    if (err || decoded.room !== room || decoded.player !== player || !(player in game.rooms[room].players)) {
      if(player in game.rooms[room].players) {
        res.status(400).send({ error: 'Player with this name is already inside. Get a nickname!' });
        return;
      }

      if(Object.keys(game.rooms[room].players).length >= 10){
        res.status(400).send({ error: 'Too many people in there. Seems like you are the least important one.' });
        return
      }

      game.addPlayer(room, player);
    }

    res.send({ token: auth.getToken(room, player) });
  })
});

router.post('/start', (req, res) => {
  const name = req.body.name;
  const room = req.body.code;

  if(game.isRoomAdmin(room, name)){
    game.startGame(room);
  }

  res.sendStatus(200);
});

module.exports = router;