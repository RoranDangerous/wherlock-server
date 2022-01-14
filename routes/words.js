const express = require('express');
const router = express.Router();
const words = require('../utils/words');
const game = require('../utils/game');

router.get('/words', (_, res) => {
  res.status(200).send(words.getChoices());
})

router.post('/word/set', (req, res) => {
  const { code, word, category } = req.body;
  game.setWord(code, word, category);
  res.sendStatus(200);
})

router.post('/word/ask', (req, res) => {
  const { code, name, question } = req.body;
  game.askQuestion(code, name, question);
  res.sendStatus(200);
})

router.post('/word/answer', (req, res) => {
  const { code, answer } = req.body;
  game.answer(code, answer);
  res.sendStatus(200);
})

router.post('/word/guess', (req, res) => {
  const { code, name, guess } = req.body;
  game.guess(code, name, guess);
  res.sendStatus(200);
})

module.exports = router;