const puppeteer = require('puppeteer');
const Spinner = require('cli-spinner').Spinner;
const colors = require('colors');
const Table = require('cli-table2');
const notifier = require('node-notifier');
const time = require('time');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'ps-shell@ps.seattleschools.org:>'.cyan,
  terminal: true
});

/** Login and download grades
 * @param {string} username - sps_username for user
 * @param {string} password - unhashed password for user
 */


// set up the now variable with the current time
var now = new time.Date();
now.setTimezone("America/Los_Angeles");

global.auto = 'off';  
global.gradestable = '';
global.semester = 1;

global.p1 = '';
global.p2 = '';
global.p3 = '';
global.p4 = '';
global.p5 = '';
global.p6 = '';

global.p1e = '';
global.p2e = '';
global.p3e = '';
global.p4e = '';
global.p5e = '';
global.p6e = '';

// starting function
function check(username, password) {

    var LoginSpinner = new Spinner('Loading Login Page... %s');
    LoginSpinner.setSpinnerString('|/-\\');
    LoginSpinner.start();

    async function getFrontPage() {
        // set headless to false for debugging
        const browser = await puppeteer.launch({ignoreHTTPSErrors: true, headless: true});
        const page = await browser.newPage();
        // browse to the source login page
        await page.setViewport({width: 1920, height: 1080})
        await page.goto('https://ps.seattleschools.org/public', { timeout: 30000 });
        // find our username, password and login button elements
        const USERNAME_SELECTOR = '#fieldAccount';
        const PASSWORD_SELECTOR = '#pw';
        const BUTTON_SELECTOR = '#btn-enter';
        LoginSpinner.stop(true);
        console.log('\nLogin Page Loaded\n'.green);
        var ContentSpinner = new Spinner('Loading Grades for ' + username + '... %s');
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
        await page.waitFor('tr.center:nth-child(15) > td:nth-child(18) > a:nth-child(1)');
        ContentSpinner.stop(true);
        console.log('\nGrades Retrieved\n'.green);
        // get grades from the front page and format them
        rl.prompt();

        const result = await page.evaluate(() => {
            // 2nd semester grades
            let S2_P1 = document.querySelector('tr.center:nth-child(5) > td:nth-child(18) > a:nth-child(1)').innerHTML;
            let S2_P2 = document.querySelector('tr.center:nth-child(7) > td:nth-child(18) > a:nth-child(1)').innerHTML;
            let S2_P3 = document.querySelector('tr.center:nth-child(9) > td:nth-child(18) > a:nth-child(1)').innerHTML;
            let S2_P4 = document.querySelector('tr.center:nth-child(11) > td:nth-child(18) > a:nth-child(1)').innerHTML;
            let S2_P5 = document.querySelector('tr.center:nth-child(13) > td:nth-child(18) > a:nth-child(1)').innerHTML;
            let S2_P6 = document.querySelector('tr.center:nth-child(15) > td:nth-child(18) > a:nth-child(1)').innerHTML;
            
            // 1st semester grades
            let S1_P1 = document.querySelector('tr.center:nth-child(4) > td:nth-child(15) > a:nth-child(1)').innerHTML;
            let S1_P2 = document.querySelector('tr.center:nth-child(6) > td:nth-child(15) > a:nth-child(1)').innerHTML;
            let S1_P3 = document.querySelector('tr.center:nth-child(8) > td:nth-child(15) > a:nth-child(1)').innerHTML;
            let S1_P4 = document.querySelector('tr.center:nth-child(10) > td:nth-child(15) > a:nth-child(1)').innerHTML;
            let S1_P5 = document.querySelector('tr.center:nth-child(12) > td:nth-child(15) > a:nth-child(1)').innerHTML;
            let S1_P6 = document.querySelector('tr.center:nth-child(14) > td:nth-child(15) > a:nth-child(1)').innerHTML;

            // 2nd semester raw class info
            let S2_P1C = document.querySelector('tr.center:nth-child(4) > td:nth-child(12)').innerText;
            let S2_P2C = document.querySelector('tr.center:nth-child(6) > td:nth-child(12)').innerText;
            let S2_P3C = document.querySelector('tr.center:nth-child(8) > td:nth-child(12)').innerText;
            let S2_P4C = document.querySelector('tr.center:nth-child(10) > td:nth-child(12)').innerText;
            let S2_P5C = document.querySelector('tr.center:nth-child(12) > td:nth-child(12)').innerText;
            let S2_P6C = document.querySelector('tr.center:nth-child(14) > td:nth-child(12)').innerText;

            // 1st semester raw class info
            let S1_P1C = document.querySelector('tr.center:nth-child(5) > td:nth-child(12)').innerText;
            let S1_P2C = document.querySelector('tr.center:nth-child(7) > td:nth-child(12)').innerText;
            let S1_P3C = document.querySelector('tr.center:nth-child(9) > td:nth-child(12)').innerText;
            let S1_P4C = document.querySelector('tr.center:nth-child(11) > td:nth-child(12)').innerText;
            let S1_P5C = document.querySelector('tr.center:nth-child(13) > td:nth-child(12)').innerText;
            let S1_P6C = document.querySelector('tr.center:nth-child(15) > td:nth-child(12)').innerText;

            // 2nd semster teacher emails
            let S2_P1E = document.querySelector('tr.center:nth-child(5) > td:nth-child(12) > a:nth-child(3)').getAttribute('href');
            let S2_P2E = document.querySelector('tr.center:nth-child(7) > td:nth-child(12) > a:nth-child(3)').getAttribute('href');
            let S2_P3E = document.querySelector('tr.center:nth-child(9) > td:nth-child(12) > a:nth-child(3)').getAttribute('href');
            let S2_P4E = document.querySelector('tr.center:nth-child(11) > td:nth-child(12) > a:nth-child(3)').getAttribute('href');
            let S2_P5E = document.querySelector('tr.center:nth-child(13) > td:nth-child(12) > a:nth-child(3)').getAttribute('href');
            let S2_P6E = document.querySelector('tr.center:nth-child(15) > td:nth-child(12) > a:nth-child(3)').getAttribute('href');

            // 1st semster teacher emails
            let S1_P1E = document.querySelector('tr.center:nth-child(4) > td:nth-child(12) > a:nth-child(3)').getAttribute('href');
            let S1_P2E = document.querySelector('tr.center:nth-child(6) > td:nth-child(12) > a:nth-child(3)').getAttribute('href');
            let S1_P3E = document.querySelector('tr.center:nth-child(8) > td:nth-child(12) > a:nth-child(3)').getAttribute('href');
            let S1_P4E = document.querySelector('tr.center:nth-child(10) > td:nth-child(12) > a:nth-child(3)').getAttribute('href');
            let S1_P5E = document.querySelector('tr.center:nth-child(12) > td:nth-child(12) > a:nth-child(3)').getAttribute('href');
            let S1_P6E = document.querySelector('tr.center:nth-child(14) > td:nth-child(12) > a:nth-child(3)').getAttribute('href');

            // format grades ("L" stands for Letter Grade)
            let S2_P1L = S2_P1.substring(0, 1);
            let S2_P2L = S2_P2.substring(0, 1);
            let S2_P3L = S2_P3.substring(0, 1);
            let S2_P4L = S2_P4.substring(0, 1);
            let S2_P5L = S2_P5.substring(0, 1);
            let S2_P6L = S2_P6.substring(0, 1);

            let S1_P1L = S1_P1.substring(0, 1);
            let S1_P2L = S1_P2.substring(0, 1);
            let S1_P3L = S1_P3.substring(0, 1);
            let S1_P4L = S1_P4.substring(0, 1);
            let S1_P5L = S1_P5.substring(0, 1);
            let S1_P6L = S1_P6.substring(0, 1);

            // format number grades
            S2_P1 = S2_P1.substring(6, 8);
            S2_P2 = S2_P2.substring(6, 8);
            S2_P3 = S2_P3.substring(6, 8);
            S2_P4 = S2_P4.substring(6, 8);
            S2_P5 = S2_P5.substring(5, 7);
            S2_P6 = S2_P6.substring(5, 7);

            S1_P1 = S1_P1.substring(6, 8);
            S1_P2 = S1_P2.substring(5, 8);
            S1_P3 = S1_P3.substring(5, 8);
            S1_P4 = S1_P4.substring(6, 8);
            S1_P5 = S1_P5.substring(5, 7);
            S1_P6 = S1_P6.substring(5, 7);

            // take the "mailto:" off of teacher emails
            S2_P1E = S2_P1E.substring(7);
            S2_P2E = S2_P2E.substring(7);
            S2_P3E = S2_P3E.substring(7);
            S2_P4E = S2_P4E.substring(7);
            S2_P5E = S2_P5E.substring(7);
            S2_P6E = S2_P6E.substring(7);

            S1_P1E = S1_P1E.substring(7);
            S1_P2E = S1_P2E.substring(7);
            S1_P3E = S1_P3E.substring(7);
            S1_P4E = S1_P4E.substring(7);
            S1_P5E = S1_P5E.substring(7);
            S1_P6E = S1_P6E.substring(7);

            // put in arrays (not being used at the moment)
            let lettergrades = [];
            lettergrades.push({
                S2_P1L,
                S2_P2L,
                S2_P3L,
                S2_P4L,
                S2_P5L,
                S2_P6L,
                S1_P1L,
                S1_P2L,
                S1_P3L,
                S1_P4L,
                S1_P5L,
                S1_P6L
            });

            // put in arrays (not being used at the moment)
            let numbergrades = [];
            numbergrades.push({
                S2_P1,
                S2_P2,
                S2_P3,
                S2_P4,
                S2_P5,
                S2_P6,
                S1_P1,
                S1_P2,
                S1_P3,
                S1_P4,
                S1_P5,
                S1_P6
            });

            // combine arrays (not being used at the moment)
            let grades = [];
            grades = numbergrades.concat(lettergrades);

            // pack everything into one giant array
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
                    S2_P6C,
                    S2_P1E,
                    S2_P2E,
                    S2_P3E,
                    S2_P4E,
                    S2_P5E,
                    S2_P6E,
                    S1_P1,
                    S1_P2, 
                    S1_P3, 
                    S1_P4, 
                    S1_P5,
                    S1_P6,
                    S1_P1L,
                    S1_P2L,
                    S1_P3L,
                    S1_P4L,
                    S1_P5L,
                    S1_P6L,
                    S1_P1C,
                    S1_P2C,
                    S1_P3C,
                    S1_P4C,
                    S1_P5C,
                    S1_P6C,
                    S1_P1E,
                    S1_P2E,
                    S1_P3E,
                    S1_P4E,
                    S1_P5E,
                    S1_P6E
                ];
            


        }).catch(error => { 
            // console.log('ERROR'.bgRed, error.message); 
            console.log('ERROR: The source is offline'.bgRed); 
        });

        browser.close();
        return result;

    }

    // run the above async function
    getFrontPage().then((value) => {

        // default grade color is green
        var gradecolorP1 = '\x1b[32m';
        var gradecolorP2 = '\x1b[32m';
        var gradecolorP3 = '\x1b[32m';
        var gradecolorP4 = '\x1b[32m';
        var gradecolorP5 = '\x1b[32m';
        var gradecolorP6 = '\x1b[32m';

        // default grade color is green
        var gradecolor2P1 = '\x1b[32m';
        var gradecolor2P2 = '\x1b[32m';
        var gradecolor2P3 = '\x1b[32m';
        var gradecolor2P4 = '\x1b[32m';
        var gradecolor2P5 = '\x1b[32m';
        var gradecolor2P6 = '\x1b[32m';

        // 2nd semester grade colors
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

        // 1st semester grade colors
        if (value[24] < 90){
            gradecolor2P1 = '\x1b[36m';
        }
        if (value[25] < 90){
            gradecolor2P2 = '\x1b[36m';
        }
        if (value[26] < 90){
            gradecolor2P3 = '\x1b[36m';
        }
        if (value[27] < 90){
            gradecolor2P4 = '\x1b[36m';
        }
        if (value[28] < 90){
            gradecolor2P5 = '\x1b[36m';
        }
        if (value[29] < 90){
            gradecolor2P6 = '\x1b[36m';
        }

        if (value[24] < 80){
            gradecolor2P1 = '\x1b[33m';
        }
        if (value[25] < 80){
            gradecolor2P2 = '\x1b[33m';
        }
        if (value[26] < 80){
            gradecolor2P3 = '\x1b[33m';
        }
        if (value[27] < 80){
            gradecolor2P4 = '\x1b[33m';
        }
        if (value[28] < 80){
            gradecolor2P5 = '\x1b[33m';
        }
        if (value[29] < 80){
            gradecolor2P6 = '\x1b[33m';
        }

        if (value[24] < 70){
            gradecolor2P1 = '\x1b[35m';
        }
        if (value[25] < 70){
            gradecolor2P2 = '\x1b[35m';
        }
        if (value[26] < 70){
            gradecolor2P3 = '\x1b[35m';
        }
        if (value[27] < 70){
            gradecolor2P4 = '\x1b[35m';
        }
        if (value[28] < 70){
            gradecolor2P5 = '\x1b[35m';
        }
        if (value[29] < 70){
            gradecolor2P6 = '\x1b[35m';
        }

        if (value[24] < 60){
            gradecolor2P1 = '\x1b[31m';
        }
        if (value[25] < 60){
            gradecolor2P2 = '\x1b[31m';
        }
        if (value[26] < 60){
            gradecolor2P3 = '\x1b[31m';
        }
        if (value[27] < 60){
            gradecolor2P4 = '\x1b[31m';
        }
        if (value[28] < 60){
            gradecolor2P5 = '\x1b[31m';
        }
        if (value[29] < 60){
            gradecolor2P6 = '\x1b[31m';
        }

        // set up tables
        var gradestable1 = new Table();
        var emailtable1 = new Table();
        var gradestable2 = new Table();
        var emailtable2 = new Table();

        // push tables for 2nd semster
        gradestable1.push(
            { 'Period 1': [value[12] ,gradecolorP1 + value[0], gradecolorP1 + value[6]]}
          , { 'Period 2': [value[13] ,gradecolorP2 + value[1], gradecolorP2 + value[7]]}
          , { 'Period 3': [value[14] ,gradecolorP3 + value[2], gradecolorP3 + value[8]]}
          , { 'Period 4': [value[15] ,gradecolorP4 + value[3], gradecolorP4 + value[9]]}
          , { 'Period 5': [value[16] ,gradecolorP5 + value[4], gradecolorP5 + value[10]]}
          , { 'Period 6': [value[17] ,gradecolorP6 + value[5], gradecolorP6 + value[11]]}
        );

        emailtable1.push(
            { 'Period 1': [value[12], value[18]]}
          , { 'Period 2': [value[13], value[19]]}
          , { 'Period 3': [value[14], value[20]]}
          , { 'Period 4': [value[15], value[21]]}
          , { 'Period 5': [value[16], value[22]]}
          , { 'Period 6': [value[17], value[23]]}
        );
        // push tables for 1st semster
        gradestable2.push(
            { 'Period 1': [value[36] ,gradecolorP1 + value[24], gradecolor2P1 + value[30]]}
          , { 'Period 2': [value[37] ,gradecolorP2 + value[25], gradecolor2P2 + value[31]]}
          , { 'Period 3': [value[38] ,gradecolorP3 + value[26], gradecolor2P3 + value[32]]}
          , { 'Period 4': [value[39] ,gradecolorP4 + value[27], gradecolor2P4 + value[33]]}
          , { 'Period 5': [value[40] ,gradecolorP5 + value[28], gradecolor2P5 + value[34]]}
          , { 'Period 6': [value[41] ,gradecolorP6 + value[29], gradecolor2P6 + value[35]]}
        );

        emailtable2.push(
            { 'Period 1': [value[36], value[42]]}
          , { 'Period 2': [value[37], value[43]]}
          , { 'Period 3': [value[38], value[44]]}
          , { 'Period 4': [value[39], value[45]]}
          , { 'Period 5': [value[40], value[46]]}
          , { 'Period 6': [value[41], value[47]]}
        );

        // create a CLI for doing various things in powerschool
        console.log('\n\nYou are now inside the command line interface for the source. Type help for a list of commands.\n\n'.green);
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
                console.log('\ngrades - shows table of grades\nemail - shows teacher emails\ngpa - gets your current gpa\nexit - closes out of the program\nauto <on/off> -i <time (seconds)> - sets the satus of the auto notification and refresh\n'.green);
                rl.prompt();
            break;
            // exit the CLI
            case 'exit':
                console.log('\nGoodbye!\n'.green);
                process.exit(0);
            break;
            // refresh the stored information from the source
            case 'refresh':
                getFrontPage();
                rl.prompt();
            break;
            // show teacher emails
            case 'email':
                email();
                rl.prompt();
            break;
            // turn on automatic refresh and notifications
            case 'auto on':
                global.auto = 'on';
                console.log('\nAuto refresh and notifications are now turned on. Refresh is set to every 30 minutes\n');
                rl.prompt();
                auto();
            break;
            // turn off automatic refresh and notifications
            case 'auto off':
                global.auto = 'off'
                console.log('\nAuto refresh and notifications are now turned off.\n');
                rl.prompt();
            break;
            // turn on automatic refresh and notifications
            case 'auto':
                console.log('\nPlease specify and on or off status, ie. auto o\n');
                rl.prompt();
            break;
            }   
        });

        tgrades();
        temail();
        rl.prompt();
        // transfer grades into their appropriate gloabl variables
        function tgrades () {
            const day = now.toString().substring(8, 10);
            const month = now.toString().substring(4, 7);
            if (now.toString().includes('Sept') || now.toString().includes('Oct') || now.toString().includes('Nov') || now.toString().includes('Dec')) {
                //set grades in global variable
                global.p1 = value[24];
                global.p2 = value[25];
                global.p3 = value[26];
                global.p4 = value[27];
                global.p5 = value[28];
                global.p6 = value[29];
                global.semester = '1';
            } else {
                if (now.toString().includes('Jan') && day >= 30) {
                    //set grades in global variable
                    global.p1 = value[0];
                    global.p2 = value[1];
                    global.p3 = value[2];
                    global.p4 = value[3];
                    global.p5 = value[4];
                    global.p6 = value[5];
                    global.semester = '2';
                } else {
                    if (now.toString().includes('Feb') || now.toString().includes('Mar') || now.toString().includes('Apr') || now.toString().includes('May')) {
                        //set grades in global variable
                        global.p1 = value[0];
                        global.p2 = value[1];
                        global.p3 = value[2];
                        global.p4 = value[3];
                        global.p5 = value[4];
                        global.p6 = value[5];
                        global.semester = '2';
                        
                    } else {
                    }
                }
            }
        }
        // transfer emails into their appropriate gloabl variables
        function temail () {
            if (now.toString().includes('Sept') || now.toString().includes('Oct') || now.toString().includes('Nov') || now.toString().includes('Dec')) {
                    global.p1e = value[42];
                    global.p2e = value[43];
                    global.p3e = value[44];
                    global.p4e = value[45];
                    global.p5e = value[46];
                    global.p6e = value[47];
            } else {
                if (now.toString().includes('Jan') && day >= 30) {
                    global.p1e = value[18];
                    global.p2e = value[19];
                    global.p3e = value[20];
                    global.p4e = value[21];
                    global.p5e = value[22];
                    global.p6e = value[23];
                } else {
                    if (now.toString().includes('Feb') || now.toString().includes('Mar') || now.toString().includes('Apr') || now.toString().includes('May')) {
                        global.p1e = value[18];
                        global.p2e = value[19];
                        global.p3e = value[20];
                        global.p4e = value[21];
                        global.p5e = value[22];
                        global.p6e = value[23];
                    } else {
                    }
                }
            }

        }

        // display grades
        function grades () {
            const day = now.toString().substring(8, 10);
            const month = now.toString().substring(4, 7);

            if (now.toString().includes('Sept') || now.toString().includes('Oct') || now.toString().includes('Nov') || now.toString().includes('Dec')) {
                console.log('\n\n1st Semester Grades:'.bold);
                console.log(gradestable2.toString() + '\n');
                //set grades in global variable
                global.p1 = value[24];
                global.p2 = value[25];
                global.p3 = value[26];
                global.p4 = value[27];
                global.p5 = value[28];
                global.p6 = value[29];
                global.semester = '1';
            } else {
                if (now.toString().includes('Jan') && day >= 30) {
                    console.log('\n\n2nd Semester Grades:'.bold);
                    console.log(gradestable1.toString() + '\n');
                    //set grades in global variable
                    global.p1 = value[0];
                    global.p2 = value[1];
                    global.p3 = value[2];
                    global.p4 = value[3];
                    global.p5 = value[4];
                    global.p6 = value[5];
                    global.semester = '2';
                } else {
                    if (now.toString().includes('Feb') || now.toString().includes('Mar') || now.toString().includes('Apr') || now.toString().includes('May')) {
                        console.log('\n\n2nd Semester Grades:'.bold);
                        console.log(gradestable1.toString() + '\n');
                        //set grades in global variable
                        global.p1 = value[0];
                        global.p2 = value[1];
                        global.p3 = value[2];
                        global.p4 = value[3];
                        global.p5 = value[4];
                        global.p6 = value[5];
                        global.semester = '2';
                        
                    } else {
                            console.log('\n\nIts summer! Yay! :)'.magenta);
                    }
                }
            }

        }
        // display email
        function email () {
            if (now.toString().includes('Sept') || now.toString().includes('Oct') || now.toString().includes('Nov') || now.toString().includes('Dec')) {
                    console.log('\n1st Semester Emails:'.bold);
                    console.log(emailtable2.toString() + '\n');
                    global.p1e = value[42];
                    global.p2e = value[43];
                    global.p3e = value[44];
                    global.p4e = value[45];
                    global.p5e = value[46];
                    global.p6e = value[47];
            } else {
                if (now.toString().includes('Jan') && day >= 30) {
                    console.log('\n2nd Semester Emails:'.bold);
                    console.log(emailtable1.toString() + '\n');
                    global.p1e = value[18];
                    global.p2e = value[19];
                    global.p3e = value[20];
                    global.p4e = value[21];
                    global.p5e = value[22];
                    global.p6e = value[23];
                } else {
                    if (now.toString().includes('Feb') || now.toString().includes('Mar') || now.toString().includes('Apr') || now.toString().includes('May')) {
                        console.log('\n2nd Semester Emails:'.bold);
                        console.log(emailtable1.toString() + '\n');
                        global.p1e = value[18];
                        global.p2e = value[19];
                        global.p3e = value[20];
                        global.p4e = value[21];
                        global.p5e = value[22];
                        global.p6e = value[23];
                    } else {
                            console.log('Its summer! Yay! :)'.magenta);
                    }
                }
            }

        }
        // auto refresh and send notifications
        auto();
        function auto () {
            if (global.auto == 'on') {
                var url = '';
                var start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
                getFrontPage();
                if (global.p1 < 80) {
                    notifier.notify({
                        title: 'Your grades are low!',
                        message: 'Period 1: ' + global.p1 + '%',
                        wait: true,
                        sound: true,
                        closeLabel: 'Dismiss'
                    });
                    notifier.on('click', function(notifierObject, options) {
                        url = 'mailto:' + global.p1e;
                        start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
                        require('child_process').exec(start + ' ' + url);
                    });
                }
                if (global.p2 < 80) {
                    notifier.notify({
                        title: 'Your grades are low!',
                        message: 'Period 2: ' + global.p2 + '%',
                        wait: true,
                        sound: true,
                        closeLabel: 'Dismiss'
                    });
                    notifier.on('click', function(notifierObject, options) {
                        url = 'mailto:' + global.p2e;
                        start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
                        require('child_process').exec(start + ' ' + url);
                    });
                }
                if (global.p3 < 80) {
                    notifier.notify({
                        title: 'Your grades are low!',
                        message: 'Period 3: ' + global.p3 + '%',
                        wait: true,
                        sound: true,
                        closeLabel: 'Dismiss',
                    });
                    notifier.on('click', function(notifierObject, options) {
                        url = 'mailto:' + global.p3e;
                        start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
                        require('child_process').exec(start + ' ' + url);
                    });
                }
                if (global.p4 < 80) {
                    notifier.notify({
                        title: 'Your grades are low!',
                        message: 'Period 4: ' + global.p4 + '%',
                        wait: true,
                        sound: true,
                        closeLabel: 'Dismiss',
                    });
                    notifier.on('click', function(notifierObject, options) {
                        url = 'mailto:' + global.p4e;
                        start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
                        require('child_process').exec(start + ' ' + url);
                    });
                }
                if (global.p5 < 80) {
                    notifier.notify({
                        title: 'Your grades are low!',
                        message: 'Period 5: ' + global.p5 + '%',
                        wait: true,
                        sound: true,
                        closeLabel: 'Dismiss',
                    });
                    notifier.on('click', function(notifierObject, options) {
                        url = 'mailto:' + global.p5e;
                        start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
                        require('child_process').exec(start + ' ' + url);
                    });
                }
                if (global.p6 < 80) {
                    notifier.notify({
                        title: 'Your grades are low!',
                        message: 'Period 6: ' + global.p6 + '%',
                        wait: true,
                        sound: true,
                        closeLabel: 'Dismiss',
                    });
                    notifier.on('click', function(notifierObject, options) {
                        url = 'mailto:' + global.p6e;
                        start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
                        require('child_process').exec(start + ' ' + url);
                    });
                }
                setTimeout(auto, 1800000);
            }
        }

    }).catch(error => { 
        // console.log('ERROR'.bgRed, error.message); 
    });;

}

module.exports = {
    check
  };