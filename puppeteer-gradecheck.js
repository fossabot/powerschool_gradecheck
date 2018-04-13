const puppeteer = require('puppeteer');
const Spinner = require('cli-spinner').Spinner;
const colors = require('colors');
const Table = require('cli-table2');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'ps-shell@ps.seattleschools.org:>'.cyan
});

/** Login and download grades
 * @param {string} username - sps_username for user
 * @param {string} password - unhashed password for user
 */

function check(username, password) {

    var LoginSpinner = new Spinner('Loading Login Page... %s');
    LoginSpinner.setSpinnerString('|/-\\');
    LoginSpinner.start();

    async function getFrontPage() {               // set headless to false for debugging
        const browser = await puppeteer.launch({ignoreHTTPSErrors: true, headless: true});
        const page = await browser.newPage();
        // browse to the source login page
        await page.setViewport({width: 1000, height: 500})
        await page.goto('https://ps.seattleschools.org/public');
        // find our username, password and login button elements
        const USERNAME_SELECTOR = '#fieldAccount';
        const PASSWORD_SELECTOR = '#pw';
        const BUTTON_SELECTOR = '#btn-enter';
        LoginSpinner.stop(true);
        console.log('\nLogin Page Loaded\n'.green);
        var ContentSpinner = new Spinner('Loading Grades... %s');
        ContentSpinner.setSpinnerString('|/-\\');
        ContentSpinner.start();
        // fill out the username
        await page.click(USERNAME_SELECTOR);
        await page.keyboard.type(username);
        // fill out the password
        await page.click(PASSWORD_SELECTOR);
        await page.keyboard.type(password);
        // click the login button
        await page.click(BUTTON_SELECTOR);
        // wait for the page to load. This could be an issue,
        // we need to figure out a way to wait the right amount
        // of time instead of guessing on this.
        await page.waitFor(1*1000);
        ContentSpinner.stop(true);
        console.log('\nGrades Retrieved\n'.green);
        // get grades from the front page and format them
       
        const result = await page.evaluate(() => {
            // 2nd Semester Grades
            let S2_P1 = document.querySelector('tr.center:nth-child(5) > td:nth-child(18) > a:nth-child(1)').innerHTML;
            let S2_P2 = document.querySelector('tr.center:nth-child(7) > td:nth-child(18) > a:nth-child(1)').innerHTML;
            let S2_P3 = document.querySelector('tr.center:nth-child(9) > td:nth-child(18) > a:nth-child(1)').innerHTML;
            let S2_P4 = document.querySelector('tr.center:nth-child(11) > td:nth-child(18) > a:nth-child(1)').innerHTML;
            let S2_P5 = document.querySelector('tr.center:nth-child(13) > td:nth-child(18) > a:nth-child(1)').innerHTML;
            let S2_P6 = document.querySelector('tr.center:nth-child(15) > td:nth-child(18) > a:nth-child(1)').innerHTML;

            // raw class info
            let S2_P1C = document.querySelector('tr.center:nth-child(5) > td:nth-child(12)').innerText;
            let S2_P2C = document.querySelector('tr.center:nth-child(7) > td:nth-child(12)').innerText;
            let S2_P3C = document.querySelector('tr.center:nth-child(9) > td:nth-child(12)').innerText;
            let S2_P4C = document.querySelector('tr.center:nth-child(11) > td:nth-child(12)').innerText;
            let S2_P5C = document.querySelector('tr.center:nth-child(13) > td:nth-child(12)').innerText;
            let S2_P6C = document.querySelector('tr.center:nth-child(15) > td:nth-child(12)').innerText;

            // format grades ("L" stands for Letter Grade)
            let S2_P1L = S2_P1.substring(0, 1);
            let S2_P2L = S2_P2.substring(0, 1);
            let S2_P3L = S2_P3.substring(0, 1);
            let S2_P4L = S2_P4.substring(0, 1);
            let S2_P5L = S2_P5.substring(0, 1);
            let S2_P6L = S2_P6.substring(0, 1);

            // format number grades
            S2_P1 = S2_P1.substring(6, 8);
            S2_P2 = S2_P2.substring(6, 8);
            S2_P3 = S2_P3.substring(6, 8);
            S2_P4 = S2_P4.substring(6, 8);
            S2_P5 = S2_P5.substring(5, 7);
            S2_P6 = S2_P6.substring(5, 7);

            let lettergrades = [];
            lettergrades.push({
                S2_P1L,
                S2_P2L,
                S2_P3L,
                S2_P4L,
                S2_P5L,
                S2_P6L
            });

            let numbergrades = [];
            numbergrades.push({
                S2_P1,
                S2_P2,
                S2_P3,
                S2_P4,
                S2_P5,
                S2_P6
            });

            let grades = [];
            grades = numbergrades.concat(lettergrades);

            return [S2_P1,
                    S2_P2, 
                    S2_P3, 
                    S2_P4, 
                    S2_P5,
                    S2_P6,
                    S2_P1L,
                    S2_P2L,
                    S2_P3L,
                    S2_P4L,
                    S2_P5L,
                    S2_P6L,
                    S2_P1C,
                    S2_P2C,
                    S2_P3C,
                    S2_P4C,
                    S2_P5C,
                    S2_P6C
                ];
            


        }).catch(error => { 
            // console.log('ERROR'.bgRed, error.message); 
            console.log('ERROR: One of two things happened.\n 1. The username or password was entered incorrectly\n 2. The source is down for maintenence'.bgRed); 
        });

        browser.close();
        return result;

    }

    getFrontPage().then((value) => {

        var gradecolorP1 = '\x1b[32m';
        var gradecolorP2 = '\x1b[32m';
        var gradecolorP3 = '\x1b[32m';
        var gradecolorP4 = '\x1b[32m';
        var gradecolorP5 = '\x1b[32m';
        var gradecolorP6 = '\x1b[32m';

        if (value[0] < 90){
            gradecolorP1 = '\x1b[36m';
        }
        if (value[1] < 90){
            gradecolorP2 = '\x1b[36m';
        }
        if (value[2] < 90){
            gradecolorP3 = '\x1b[36m';
        }
        if (value[3] < 90){
            gradecolorP4 = '\x1b[36m';
        }
        if (value[4] < 90){
            gradecolorP5 = '\x1b[36m';
        }
        if (value[5] < 90){
            gradecolorP6 = '\x1b[36m';
        }

        if (value[0] < 80){
            gradecolorP1 = '\x1b[33m';
        }
        if (value[1] < 80){
            gradecolorP2 = '\x1b[33m';
        }
        if (value[2] < 80){
            gradecolorP3 = '\x1b[33m';
        }
        if (value[3] < 80){
            gradecolorP4 = '\x1b[33m';
        }
        if (value[4] < 80){
            gradecolorP5 = '\x1b[33m';
        }
        if (value[5] < 80){
            gradecolorP6 = '\x1b[33m';
        }

        if (value[0] < 70){
            gradecolorP1 = '\x1b[35m';
        }
        if (value[1] < 70){
            gradecolorP2 = '\x1b[35m';
        }
        if (value[2] < 70){
            gradecolorP3 = '\x1b[35m';
        }
        if (value[3] < 70){
            gradecolorP4 = '\x1b[35m';
        }
        if (value[4] < 70){
            gradecolorP5 = '\x1b[35m';
        }
        if (value[5] < 70){
            gradecolorP6 = '\x1b[35m';
        }

        if (value[0] < 60){
            gradecolorP1 = '\x1b[31m';
        }
        if (value[1] < 60){
            gradecolorP2 = '\x1b[31m';
        }
        if (value[2] < 60){
            gradecolorP3 = '\x1b[31m';
        }
        if (value[3] < 60){
            gradecolorP4 = '\x1b[31m';
        }
        if (value[4] < 60){
            gradecolorP5 = '\x1b[31m';
        }
        if (value[5] < 60){
            gradecolorP6 = '\x1b[31m';
        }

        var table = new Table();


        table.push(
            { 'Period 1': [value[12] ,gradecolorP1 + value[0], gradecolorP1 + value[6]]}
          , { 'Period 2': [value[13] ,gradecolorP2 + value[1], gradecolorP2 + value[7]]}
          , { 'Period 3': [value[14] ,gradecolorP3 + value[2], gradecolorP3 + value[8]]}
          , { 'Period 4': [value[15] ,gradecolorP4 + value[3], gradecolorP4 + value[9]]}
          , { 'Period 5': [value[16] ,gradecolorP5 + value[4], gradecolorP5 + value[10]]}
          , { 'Period 6': [value[17] ,gradecolorP6 + value[5], gradecolorP6 + value[11]]}
        );

        // create a CLI for doing various things in powerschool
        console.log('\nYou are now inside the command line interface for the source. Type help for a list of commands.\n\n'.cyan);
        rl.prompt();
        rl.on('line', (line) => {
            switch (line.trim()) {
            // user entered uknown command
            default:
            console.log(`'${line.trim()}' is not valid command for the Powerschool Shell, please try again!`.red);
            rl.prompt();
            break;
            // gets the table of grades
            case 'grades':
                grades();
                rl.prompt();
                break;
            // shows help message
            case 'help':
                console.log('\ngrades - shows table of grades\nemail - shows teacher emails\ngpa - gets your current gpa\nexit - closes out of the program\n'.green);
                rl.prompt();
                break;
            // exit the CLI
            case 'exit':
                console.log('\nGoodbye!\n'.green);
                process.exit(0);
                break;
            }
        });

        function grades () {

            console.log('\nGrades:'.bold);
            console.log(table.toString() + '\n');

        }


    }).catch(error => { 
        // console.log('ERROR'.bgRed, error.message); 
    });;

}

module.exports = {
    check
  };