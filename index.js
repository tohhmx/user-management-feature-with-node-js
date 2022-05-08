const express = require('express');
const session = require('express-session');
const mysql = require("mysql");
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
var UserNameIsLoggedIn = ""

dotenv.config({ path: './.env'});

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

db.connect( (error) => {
    if(error) {
        console.log(error)
    } else {
        console.log("MYSQL Connected Successful")
    }
})

// Inititalize the app and add middleware
app.set('view engine', 'pug'); // Setup the pug
app.use(bodyParser.urlencoded({extended: true})); // Setup the body parser to handle form submits
app.use(session({secret: 'super-secret'})); // Session setup

/** Handle login display and form submit */
app.get('/login', (req, res) => {
  if (req.session.isLoggedIn === true) {
    return res.redirect('/');
  }
  res.render('login', {error: false});
});

app.post('/login', (req, res) => {
  var username = req.body.username;
  UserNameIsLoggedIn = username;
  var password = req.body.password;

  db.query("SELECT * FROM accounts WHERE username = ? AND password = ?",[username, password], (error,results,fields) => {
  if (results.length > 0) {
    req.session.isLoggedIn = true;
    res.redirect(req.query.redirect_url ? req.query.redirect_url : '/');
  } else {
    res.render('login', {error: 'Username or password is incorrect'});
  }
  })
});

/** Handle logout function */
app.get('/logout', (req, res) => {
  req.session.isLoggedIn = false;
  res.redirect('/');
});

/** Simulated bank functionality */
app.get('/', (req, res) => {
  res.render('index', {isLoggedIn: req.session.isLoggedIn});
});

app.get('/balance', (req, res) => {
  if (req.session.isLoggedIn === true) {
    res.send('Your account balance is $1234.52');
  } else {
    res.redirect('/login?redirect_url=/balance');
  }
});

app.get('/account', (req, res) => {
  if (req.session.isLoggedIn === true) {
    res.send('Your account number is ACL9D42294');
  } else {
    res.redirect('/login?redirect_url=/account');
  }
});

app.get('/userDetails', (req, res) => {
  var userDetails = [];

  db.query('SELECT * FROM accounts WHERE username = ?',[UserNameIsLoggedIn], (err, result, fields) => {
    if (req.session.isLoggedIn === true && result.length==1) {
        var user = {
          'id':result[0].id,
          'username':result[0].username,
          'password':result[0].password,
          'email':result[0].email
        }

        userDetails.push(user);

      res.render('userDetails', {"userDetails": userDetails});

    } else {
      res.redirect('/login?redirect_url=/userDetails');
    }
  });
});


app.get('/contact', (req, res) => {
  res.send('Our address : 321 Main Street, Beverly Hills.');
});

/** App listening on port */
app.listen(port, () => {
  console.log(`MyBank app listening at http://localhost:${port}`);
});