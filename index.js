const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var username, pw;

rl.question('What is your SPS Username?\n', (answer) => {
// TODO: Log the answer in a database
  username = answer;
  cb();
});

function cb(){
rl.question('What is your SPS password?\n', (answer) => {
// TODO: Log the answer in a database
  pw = answer;
  run();
});
}

function run(){
  console.log('Running!');
  require('./gradecheck').check(username, pw);
}
