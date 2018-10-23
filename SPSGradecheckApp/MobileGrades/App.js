/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Alert, Navigator, NativeModules, ViewPagerAndroid} from 'react-native';
import { Button, COLOR, ThemeContext, getTheme, Card } from 'react-native-material-ui';
import Icon from 'react-native-vector-icons/Ionicons';
import { TextField } from 'react-native-material-textfield';
import Spinner from 'react-native-loading-spinner-overlay';
import cheerio from 'cheerio-without-node-native';
import md5 from './md5.js';

const uiTheme = {
  palette: {
    primaryColor: COLOR.blue500,
  },
  toolbar: {
    container: {
      height: 50,
    },
  },
};

var username = '';
var password = '';
var loginpage = '';
var isLoading = false;
var SemesterGrades;

type Props = {};

export default class App extends Component<Props> {
  state = {
    spinner: false
  };
  login() {
    // Turn on spinner
    this.setState({
      spinner: !this.state.spinner
    });
  
    // Get login page
    fetch('https://ps.seattleschools.org/public/home.html', {
      credentials: "same-origin"
  
    })
    .then((response) => response.text())
    .then((responseHTML) => {
  
      const $ = cheerio.load(responseHTML); 

      var formValues = [];
      $('body').find('#LoginForm').children().each(function (i, elem) {
        formValues[i] = $(this).val();
      })

      console.log(formValues);

      var form = {
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
          ldappassword: password,
          account: username,
          pw: '',
          translatorpw: ''
        }
      console.log(formValues[1])
      md5script = new md5;
      md5script.doPCASLogin(form, 'formValues[1]')
      form.pstoken = formValues[0]
      form.contextData = formValues[1]
      form.ldappassword = password;
      console.log(form)
      
      var formData = new FormData();

      for ( var key in form ) {
        formData.append(key, form[key]);
      }

      // Send Login Details
      fetch('https://ps.seattleschools.org/guardian/home.html', {
        credentials: "same-origin",
        method: 'POST',
        body: formData
    
      })
      .then((response1) => response1.text())
      .then((responseHTML1) => {
        const $ = cheerio.load(responseHTML1); 

        var table = []; 
        $('body').find('#tblgrades').children().map(function(i, e) {
              table[i] = $(this).find('.bold').text();
              try {
                table[i] = table[i].match(/\d+/g).map(Number);

                var uniqueLetters = [];
                var nonUniqueLetters = [];
                table[i].split('').filter(function(letter) {
                  if(uniqueLetters.indexOf(letter) == -1) {
                    uniqueLetters.push(letter);
                  } else {
                    nonUniqueLetters.push(letter);
                  }
                });
                
                var result = uniqueLetters.filter(function(ltr) {
                  if(nonUniqueLetters.indexOf(ltr) == -1) {
                    return ltr;
                  }
                });

                table[i] = result.join('')
              } catch {

              }
        })
        console.log(table[3]);

        SemesterGrades = table.map((grade) => <View key={grade[0]} style={styles.gradeView}><Card><Text style={styles.gradeViewText}>{grade[0]}</Text></Card></View>)
        SemesterGrades.splice(0 , 3)


        // Turn off spinner
        this.setState({
          spinner: !this.state.spinner
        });
      }).catch((error) =>{
        console.error(error);
      });
    
    })
    .catch((error) =>{
      console.error(error);
    });
  }
  render() {
    return (
      <ThemeContext.Provider value={getTheme(uiTheme)}>
      <ViewPagerAndroid
        style={styles.viewPager}
        initialPage={0}>
        <View style={styles.pageStyle} key="1">
        <View style={styles.container}>
          <Text style={styles.title}>Mobile Grades</Text>
          <View style={styles.contentContainer}>
            <TextField
              label='SPS Username'
              value=''
              onChangeText={ (us) => {username = us; }}
            />
            <TextField
              label='SPS Password'
              value=''
              onChangeText={ (pw) => {password = pw; }}
            />
            <Button style={{ container: { height: 40, borderRadius: 85, marginTop: 30 }, text: { fontSize: 20 } }} raised primary text="Login" onPress={this.login.bind(this)} />
            <Spinner
            visible={this.state.spinner}
            textContent={'Logging in...'}
            textStyle={styles.spinnerTextStyle}
            />
          </View>
        </View>
          <Text>Created by Nathan Laha</Text>
        </View>
        <View style={styles.pageStyle} key="2">
          {SemesterGrades}
          <View>
            <Text>If data is not up to date, please log in again.</Text>
          </View>
        </View>
      </ViewPagerAndroid>
      </ThemeContext.Provider>
    );
  }
}

const styles = StyleSheet.create({
  viewPager: {
    flex: 1
  },
  pageStyle: {
    alignItems: 'center',
    padding: 20,
  },
  gradeView: {
    fontSize: 20,
    padding: 20,
  },
  gradeViewText: {
    fontSize: 20,
    padding: 20,
  },
  spinnerTextStyle: {
    color: '#FFF'
  },
  container: {
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 40,
    marginTop: 62,
    textAlign: 'center',
    margin: 10,
  },
  contentContainer: {
    marginTop: 92,
    textAlign: 'center',
    margin: 30,
    fontSize: 30,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
