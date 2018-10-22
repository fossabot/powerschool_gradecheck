/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Alert, Navigator, NativeModules} from 'react-native';
import { Button, COLOR, ThemeContext, getTheme } from 'react-native-material-ui';
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

        var gradestable = $('body').find('#tblgrades')
        console.log(gradestable)

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
      </ThemeContext.Provider>
    );
  }
}

const styles = StyleSheet.create({
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
