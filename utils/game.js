const eventEmitter = require('../utils/events');

const rooms = {}
const GUESSES = 3;
const QUESTIONS = 5;

const generateRoomCode = () => {
  let code = '';

  for(let i = 0; i < 4; i++) {
    code += String.fromCharCode(65 + Math.floor(Math.random() * 26))
  }

  return code
}

const create = (creator) => {
  let tries = 0;

  while (tries < 100) {
    tries += 1;
    const code = generateRoomCode();

    if (code in rooms) {
      continue;
    }

    rooms[code] = {
      inProgress: false,
      queen: creator,
      players: {
        [creator]: {
          score: 0,
          guesses: GUESSES,
          questions: QUESTIONS,
        }
      }
    }

    return code;
  }
}

const isValidRoom = (room) => room in rooms;
const isInProgress = (room) => rooms[room].inProgress;

const addPlayer = (room, player) => {
  if(isValidRoom(room) && !(player in rooms[room].players)){
    rooms[room].players[player] = {
      score: 0,
      guesses: GUESSES,
      questions: QUESTIONS,
    };
  }
}

const setPlayerConnection = (room, player, connected = true) => {
  if (!rooms[room]?.players[player]){
    return;
  }

  rooms[room].players[player].connected = connected;

  if(!connected && !rooms[room].inProgress){
    delete rooms[room].players[player];
  }

  const allDisconnected = Object.values(rooms[room].players).reduce((i, j) => i && !j.connected, true);

  if (allDisconnected) {
    delete rooms[room];
  }
}

const getState = (room) => rooms[room];

const startGame = (room) => {
  rooms[room].inProgress = true;
  Object.keys(rooms[room].players).forEach((p) => {
    rooms[room].players[p].score = 0;
  })
  rooms[room].turn = 0;
  rooms[room].guesser = 1;
  rooms[room].playersPosition = shuffle(Object.keys(rooms[room].players));
  rooms[room].questions = [];
  eventEmitter.emit('update', room);
};

const shuffle = (arr) => {
  let currentIndex = arr.length, randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [arr[currentIndex], arr[randomIndex]] = [
      arr[randomIndex], arr[currentIndex]];
  }

  return arr;
}

const isRoomAdmin = (room, player) => rooms[room]?.queen === player;

const setWord = (room, word, category) => {
  rooms[room].word = word;
  rooms[room].category = category;
  eventEmitter.emit('update', room);
}

const askQuestion = (room, player, question) => {
  rooms[room].question = question;
  rooms[room].questionPlayer = player;
  rooms[room].players[player].questions -= 1;
  eventEmitter.emit('update', room);
}

const nextGuesser = (room) => {
  rooms[room].guesser += 1;
  rooms[room].guesser %= Object.keys(rooms[room].players).length;
  if(rooms[room].guesser === rooms[room].turn){
    nextGuesser(room);
    return
  }

  const guesser = rooms[room].playersPosition[rooms[room].guesser];
  if(rooms[room].players[guesser].guesses <= 0){
    nextGuesser(room);
  }
}

const nextTurn = (room) => {
  Object.keys(rooms[room].players).forEach((p) => {
    rooms[room].players[p].guesses = GUESSES;
    rooms[room].players[p].questions = QUESTIONS;
  })
  rooms[room].turn = (rooms[room].turn + 1) % Object.keys(rooms[room].players).length;
  rooms[room].guesser = (rooms[room].turn + 1) % Object.keys(rooms[room].players).length;
  rooms[room].word = null;
  rooms[room].category = null;
  rooms[room].isGuessed = false;
  rooms[room].questions = [];
  if(rooms[room].turn === 0){
    rooms[room].inProgress = false;
  }
}

const answer = (room, answer) => {
  rooms[room].questions.push({
    question: rooms[room].question,
    answer,
    player: rooms[room].questionPlayer,
    type: 'question',
  });
  rooms[room].question = null;
  rooms[room].questionPlayer = null;
  nextGuesser(room);
  eventEmitter.emit('update', room);
}

const guess = (room, player, guess) => {
  if(rooms[room].word === guess.toLowerCase()){
    rooms[room].questions.push({
      question: guess,
      answer: true,
      player,
      type: 'guess',
    });
    rooms[room].isGuessed = true;
    setTimeout(() => {
      rooms[room].players[player].score += 1
      nextTurn(room);
      eventEmitter.emit('update', room);
    }, 10000);
  }
  else {
    rooms[room].questions.push({
      question: guess,
      answer: false,
      player,
      type: 'guess',
    });
    rooms[room].players[player].guesses -= 1;
    if(anyGuessesLeft(room)){
      nextGuesser(room);
    }
    else {
      rooms[room].isGuessed = true;
      setTimeout(() => {
        nextTurn(room);
        eventEmitter.emit('update', room);
      }, 10000);
    }
  }

  eventEmitter.emit('update', room);
}

const anyGuessesLeft = (room) => {
  return Object.keys(rooms[room].players).filter(player => player !== rooms[room].playersPosition[rooms[room].turn]).reduce((i, j) => i || (rooms[room].players[j].guesses > 0), false);
}

module.exports = {
  create,
  rooms,
  isValidRoom,
  addPlayer,
  getState,
  setPlayerConnection,
  startGame,
  isRoomAdmin,
  setWord,
  askQuestion,
  answer,
  guess,
  isInProgress,
}