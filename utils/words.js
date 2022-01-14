const fs = require('fs');

const parseFile = (content) => content.toString().split('\n');
const formatWords = (arr, category) => arr.map((word) => ({
  word,
  category
}))

const animals = parseFile(fs.readFileSync('./words/animals.txt'));
const buildings = parseFile(fs.readFileSync('./words/buildings.txt'));
const foods = parseFile(fs.readFileSync('./words/foods.txt'));
const jobs = parseFile(fs.readFileSync('./words/jobs.txt'));
const sports = parseFile(fs.readFileSync('./words/sports.txt'));

const getWords = () => ([
  ...formatWords(animals, 'Animal'),
  ...formatWords(buildings, 'Building'),
  ...formatWords(foods, 'Food'),
  ...formatWords(jobs, 'Job'),
  ...formatWords(sports, 'Sport')
]);

const getChoices = () => {
  let i = 0;
  let choices = [-1, -1, -1]
  const words = getWords();

  while(i < 3){
    const index = Math.floor(Math.random() * words.length);
    if(choices.indexOf(index) === -1){
      choices[i] = index;
      i += 1
    }
  }

  return choices.map((i) => words[i]);
}

module.exports = {
  getChoices,
}