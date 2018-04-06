
// // Return grades + gpa
// async function check(user, pass){
//   var grades;

//   var formData = {
//     'Account': user,
//     'pw': pass
//   };

//   await new Promise((r,j) => {
//     makeRequest(r,j, formData);
//   }).then((result) => {
//     grades = parseGrades(result.Request);
//     console.log(grades);
//   }).catch((err) => {
//     console.error(err);
//   });

// }

// function makeRequest(resolve, reject, formData){
//   request.post({
//     url: 'https://ps.seattleschools.org/',
//     formData: formData
//   }, (err, res) => {
//     if (err){
//       reject(err);
//     }
//     else {
//       resolve(res);
//     }

//   });

// }

// function parseGrades(grades){
//   return grades;
// }




function check(username, password) {
  const rp = require('request-promise');
  const cheerio = require('cheerio');
  const tough = require('tough-cookie');

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
    //method: 'POST',
    uri: 'https://ps.seattleschools.org/public/home.html',
    headers: { 'User-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3180.0 Safari/537.36'},
    transform: function (body) {
      // console.log(body);
      return cheerio.load(body);
    },
    form: {
      pw: password,
      Account: username,
      submit: 'submit'
    },
    simple: false, 
    resolveWithFullResponse: true
  };

  rp(originOptions)
    .then(($) => {
      // console.log($.html());
      // gradeOptions.pstoken = ($('#pstoken').text());
      // gradeOptions.contextData = ($('#contextData').text());
      // gradeOptions.dbpw = ($('#dbpw').text());
      console.log($('#LoginForm').find('#pw').html());
      console.log($('body').html());

      // Get grades
      // rp(gradeOptions)
      //   .then(($) => {

      //   })
      //   .catch((err) => {
      //     console.log(err);

    })
    .catch((err) => {
          console.log(err);
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
