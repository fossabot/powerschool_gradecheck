const rp = require('request-promise');
const cheerio = require('cheerio');
const tough = require('tough-cookie');
const colors = require('colors');

/** Login and download grades
 * @param {string} username - sps_username for user
 * @param {string} password - unhashed password for user
 */
function check(username, password) {

  // Easy creation of the cookie - see tough-cookie docs for details
  let cookie = new tough.Cookie({
    key: "some_key",
    value: "some_value",
    domain: 'ps.seattleschools.org',
    httpOnly: false,
    maxAge: 31536000
  });

  // Put cookie in an jar which can be used across multiple requests
  var cookiejar = rp.jar();
  // ...all requests to https://api.mydomain.com will include the cookie
  cookiejar.setCookie(cookie, 'https://ps.seattleschools.org');


  const originOptions = {
    // method: 'POST',
    uri: 'https://ps.seattleschools.org/public/home.html',
    headers: {
      'User-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3180.0 Safari/537.36'
    },
    transform: function (body) {
      return cheerio.load(body);
    },
    simple: false,
    resolveWithFullResponse: true,
    jar: cookiejar
  };

  function redirectOn302(body, response, resolveWithFullResponse) {
    if (response.statusCode === 302) {
      // Set the new url (this is the options object)
      originOptions.url = 'https://PS.SeattleSchools.org/guardian/home.html';
      return rp(originOptions);
    } else {
      return resolveWithFullResponse ? response : body;
    }
  }

  rp(originOptions)
    .then(($) => {
      var gradeOptions = {
        method: 'POST',
        uri: 'https://ps.seattleschools.org/guardian/home.html',
        headers: {
          'Host': 'ps.seattleschools.org',
          'Connection': 'keep-alive',
          'Content-Length': 444,
          'Cache-Control': 'max-age=0',
          'Origin': 'https://ps.seattleschools.org',
          'Upgrade-Insecure-Requests': 1,
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3251.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Referer': 'https://ps.seattleschools.org/public/home.html',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        form: {
          pstoken: '',
          contextData: '',
          dbpw: '',
          translator_username: '',
          translator_password: '',
          translator_ldappassword: '',
          returnUrl: '',
          serviceName: 'PS Parent Portal',
          serviceTicket: '',
          pcasServerUrl: '/',
          credentialType: 'User Id and Password Credential',
          ldappassword: '',
          account: '',
          pw: '',
          translatorpw: ''
        },
        transform: redirectOn302,
        json: true,
        jar: originOptions.jar,
        simple: false,
        resolveWithFullResponse: true
      };

      console.log('Bypassing SPS Security Systems...');

      // SPS "Security mesaures"
      formValues = []

      $('body').find('#LoginForm').children().each(function (i, elem) {
        formValues[i] = $(this).val();
      })

      gradeOptions.form.pstoken = formValues[0]

      gradeOptions.form.contextData = formValues[1]

      gradeOptions.form.dbpw = formValues[2]

      gradeOptions.form.pcasServerUrl = '/'; // Always '/'

      gradeOptions.form.account = username;
      gradeOptions.form.ldappassword = password;
      // Assign username/password from our app

      console.log('HASHING PASSWORD to match RSA Standard.');
      require('./md5').doPCASLogin(gradeOptions.form, formValues[1]);

      gradeOptions.form.ldappassword = password;
      // Assign username/password from our app

      afterEncrypt();

      function afterEncrypt() {
        console.log('Decrypting PowerSchool API Token.');
        getGrades(gradeOptions);
      }


    })
    .catch((err) => {
      console.log(err);
    });
}

// Get grades
function getGrades(options) {
  rp(options)
    .then(($) => {
      console.log($);
      // console.log($.read());
      console.log('Access Granted.'.bgGreen);

    }).catch((err) => {
      console.log(err);
      console.error('Access Denied.'.bgRed);

    });
}



module.exports = {
  check
};

// var  gradeOptions = {
//   method: 'POST',
//   uri: 'https://ps.seattleschools.org/guardian/home.html',
//   headers: { 'Host': 'ps.seattleschools.org', 'Connection': 'keep-alive', 'Content-Length': 448, 'Cache-Control': 'max-age=0', 'Origin': 'https://ps.seattleschools.org', 'Upgrade-Insecure-Requests': 1, 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3251.0 Safari/537.36', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8', 'Referer': 'https://ps.seattleschools.org/public/home.html', 'Accept-Encoding': 'gzip, deflate, br', 'Accept-Language': 'en-US,en;q=0.9', },
//   data: {
//     pstoken: '400024662BDyeW9daOpkpx4qlXq68FKJ8CJac4gi2',
//     contextData: '',
//     dbpw: '8d45eeb8d7f192c522f7e4f6ce2a6924',
//     translator_username: '',
//     translator_password: '',
//     translator_ldappassword: '',
//     returnUrl: '',
//     serviceName: 'PS Parent Portal',
//     serviceTicket: '',
//     pcasServerUrl: '/',
//     credentialType: 'User Id and Password Credential',
//     ldappassword: password,
//     Account: username,
//     pw: '9a135bc413b98ae45e304f991a500649',
//     translatorpw:''
//   },
//   transform: function (body) {
//     return cheerio.load(body);
//   },
//   jar: cookiejar,
//   // simple: false, 
//   resolveWithFullResponse: true
// };