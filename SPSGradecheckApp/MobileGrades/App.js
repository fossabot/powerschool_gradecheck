/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Alert, Navigator, NativeModules, ViewPagerAndroid, ActivityIndicator, ScrollView} from 'react-native';
import { createSwitchNavigator, createStackNavigator, createDrawerNavigator} from 'react-navigation';
import { Button, COLOR, ThemeContext, getTheme, Card, Toolbar, Drawer, Avatar, Icon, Dialog, DialogDefaultActions, ActionButton, Checkbox } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import cheerio from 'cheerio-without-node-native';
import md5 from './md5.js';
import * as Keychain from 'react-native-keychain';
import TouchID from 'react-native-touch-id';


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
var Grades = {
  Semester: [],
};
var savecred = true;
var hascreds = false;

type Props = {};

// Sign in page
export class SignInScreen extends React.Component {
  static navigationOptions = { title: 'Logout', header: null };
  loginBiomectrics() {
    TouchID.isSupported()
    .then(biometryType => {
      TouchID.authenticate('Authenticate with fingerprint') // Show the Touch ID prompt
      .then(async (success) => {
        // Touch ID authentication was successful!
        // Handle the successs case now
        // Retreive the credentials
        try {
          const credentials = await Keychain.getGenericPassword();
          if (credentials) {
            username = credentials.username;
            password = credentials.password;
            this.login();
          }
        } catch (error) {

        }
      })
      .catch(error => {
        // Touch ID Authentication failed (or there was an error)!
        // Also triggered if the user cancels the Touch ID prompt
        // On iOS and some Android versions, `error.message` will tell you what went wrong
      });
    })
    .catch(error => {
      // User's device does not support Touch ID (or Face ID)
      // This case is also triggered if users have not enabled Touch ID on their device
    });
  }
  login() {
    if (savecred == true) {
      Keychain.setGenericPassword(username, password);
      hascreds = true;
    }
    this.props.navigation.navigate('AuthLoading');
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
        var tableLetter = []; 
        var tableLetter2 = []; 

        tablechildren = [];
        $('#tblgrades').children().map(function(i, e) {
          tablechildren.push($(this).find('td:nth-child(12)').text())
        })
        console.log('Table Children', tablechildren[3])

        $('body').find('#tblgrades').children().map(function(i, e) {
              table[i] = $(this).find('.bold').text()
              tableLetter[i] = $(this).find('.bold').text();
              tableLetter2[i] = $(this).find('.bold').text();
              try {
                table[i] = table[i].match(/\d+/g).map(Number);
                tableLetter[i] = tableLetter[i].map(String)
                tableLetter2[i] = tableLetter2[i].map(String)

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

        tableLetter2 = tableLetter2.splice(9, 15);

        Grades.Semester = table.map((grade, i) => {
          if (tableLetter === undefined && tableLetter2 === undefined) {
            return (<View key={grade[0]} style={styles.gradeView}><Card><Text styl={styles.gradeViewText}>Couldn't get grades! Please try logging in again</Text></Card></View>);
          }
          if (tableLetter2[i] === undefined) {
            tableLetter2[i] = 'n/a'
          }
          var colorMyGrades = {
            color: '#70FE70'
          }
          if (grade[0] > 89) {
            console.log(89)
            colorMyGrades.color = '#70FE70'
          } else if (grade[0] > 79 && grade[0] < 90) {
            console.log(79)
            colorMyGrades.color = '#70C1FE'
          } else if (grade[0] > 69 && grade[0] < 80) {
            console.log(69)
            colorMyGrades.color = '#DFAF2A'
          } else if (grade[0] > 59 && grade[0] < 70) {
            console.log(59)
            colorMyGrades.color = '#FE7701'
          } else if (grade[0] > 49 && grade[0] < 60) {
            console.log(49)
            colorMyGrades.color = '#FE0101'
          }
          return (<View key={grade[0]} style={styles.gradeView}><Card><View style={styles.gradeClassView}><Text styl={styles.classText}>{i-2}. {tablechildren[i]}</Text></View><Text style={[styles.gradeViewText]}>1st Semester: </Text><Text style={[styles.gradeViewText, colorMyGrades]}>{tableLetter[i]}</Text><Text style={[styles.gradeViewText]}>2nd Semester: </Text><Text style={[styles.gradeViewText, colorMyGrades]}>{tableLetter2[i]}</Text></Card></View>);
        });
        Grades.Semester.splice(0 , 3)
        Grades.Semester = Grades.Semester.splice(0 , 6)

        // Navigate to Home page
        this.props.navigation.navigate('App');

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
              secureTextEntry={true} 
              label='SPS Password'
              value=''
              onChangeText={ (pw) => {password = pw; }}
            />
            <Button style={{ container: { width: '100%', height: 55, borderRadius: 85, marginTop: 30 }, text: { fontSize: 18 } }} raised primary text="Login" onPress={this.login.bind(this)} />
            <Button disabled={!hascreds} style={{ container: { backgroundColor: '#47ba24', width: '100%', height: 55, borderRadius: 85, marginTop: 30 }, text: { fontSize: 18 } }} icon="fingerprint" raised primary text="Fingerprint" onPress={this.loginBiomectrics.bind(this)} />
          </View>
        </View>
      </ThemeContext.Provider>
    );
  }
}

// Loading screen between Auth page and Home Page
export class AuthLoadingScreen extends React.Component {
  static navigationOptions = { 
    drawerLabel: 'Grades',
    drawerIcon: ({ tintColor }) => (
      <Icon name="person"/>
    ),
  };
  render() {
    return (
      <ThemeContext.Provider value={getTheme(uiTheme)}>
        <View style={styles.container}>
          <Text style={styles.title}>Logging in...</Text>
          <View style={styles.contentContainer}>
            <ActivityIndicator size="large" />
          </View>
        </View>
      </ThemeContext.Provider>
    )
  }
}

// First page the user sees when logged in
export class HomeScreen extends React.Component {
  static navigationOptions = { title: 'Grades', header: null };
  render() {
    return (
      <ThemeContext.Provider value={getTheme(uiTheme)}>
          <Toolbar
            centerElement="Grades"
            leftElement="menu"
            onLeftElementPress={() => this.props.navigation.toggleDrawer()}
          />
        <ScrollView>
          <View style={styles.container}>
                {Grades.Semester}
          </View>
        </ScrollView>
      </ThemeContext.Provider>
    )
  }
}

const AppStack = createDrawerNavigator({
   Home: {
     screen: HomeScreen
    }, 
   SignIn: {
     screen: SignInScreen
    },
}, 
{
  cardStyle: { backgroundColor: '#F5FCFF' },
},);
const AuthStack = createStackNavigator({ SignIn: SignInScreen }, {
  headerMode: 'screen',
  cardStyle: { backgroundColor: '#F5FCFF' },
},);

export default createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'Auth',
  },
);

const styles = StyleSheet.create({
  dcontainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  loginContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  viewPager: {
    flex: 1
  },
  pageStyle: {
    alignItems: 'center',
    padding: 20,
  },
  gradeClassView: { 
    padding: 20,
  },
  gradeView: {
    fontSize: 20,
    padding: 10,
    paddingHorizontal: 10,
  },
  classText: {
    fontSize: 10,
    padding: 30,
  },
  gradeViewText: {
    fontSize: 20,
    padding: 10,
  },
  navDrawer: {
    position: "absolute",
    left: 0,
    width: '80%',
  },
  container: {
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
    paddingHorizontal: 20,
    marginTop: 35,
  },
  title: {
    fontSize: 35,
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
