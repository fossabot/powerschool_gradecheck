const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var username, pw;

rl.question('What is your SPS Username?\n', (answer) => {
  // TODO: Log the answer in a database
  if (answer != ""){
    username = answer;
    cb();
  }
  else {
    console.log('Your really bad at this.');
  }
}
);

function cb(){
  rl.question('What is your SPS password?\n', (answer) => {
    // TODO: Log the answer in a database
    pw = answer;
    rl.close();
    run();
  });
}

function run(){
  console.log('Hacking!');
  require('./gradecheck').check(username, pw);
}
