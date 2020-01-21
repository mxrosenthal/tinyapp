const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'ejs');

const urlDatabase = {
  // b2xVn2: 'http://www.lighthouselabs.ca',
  // '9sm5xK': 'http://www.google.com'
};

const activeUsers = {};

// app.get('/login', (req, res) => {
//   res.redirect('/login');
// });

app.get('/urls/new', (req, res) => {
  let templateVars = {
    username: req.cookies['username'],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  // res.render('urls_new', templateVars);
  res.render('urls_new', templateVars);
});

app.get('/login', (req, res) => {
  let templateVars = {
    username: req.cookies['username'],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  // console.log('logging in?');
  // res.render('urls_user', templateVars);
  res.render('urls_user', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    username: req.cookies['username'],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urls_show', templateVars);
});

app.get('/urls', (req, res) => {
  let templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase
  };
  // console.log(templateVars);
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//POST
//generates random str for a given longURL
app.post('/urls', (req, res) => {
  if (
    req.body.longURL === '' ||
    req.body.longURL === [] ||
    req.body.longURL === '[]'
  ) {
    res.redirect('/urls');
    r;
  }
  urlDatabase[generateRandomString()] = req.body.longURL;
  res.redirect('/urls');
});

//request to change the longURL associated with a given shortURL
app.post('/urls/:shortURL', (req, res) => {
  // console.log('req: ', req.params.shortURL);
  const longURL = req.body.longURL;
  // console.log(longURL);
  const shortURL = req.params.shortURL;
  // console.log('Database: ', urlDatabase);
  urlDatabase[shortURL] = longURL;
  // console.log('Database: ', urlDatabase);
  res.redirect('/urls');
});

//Delete longURL with it's shortURL key from the database.
app.post('/urls/:shortURL/delete', (req, res) => {
  let shorty = req.params.shortURL;
  // let URL = urlDatabase[shorty];
  delete urlDatabase[shorty];
  res.redirect('/urls');
});

//add users logged into a cookie. You can check this cookie in the CDT.
// 1. open chrom dev tools, clear cache if full.
// 2. submit username on tinyapp.
// 3. in CDT go to 'application' at the top. then 'cookies' on the left.
//    and the submission should be visible.
app.post('/login', (req, res) => {
  let newUser = req.body.username;
  res.cookie('username', newUser).redirect('/urls');
});

//logging out
app.post('/logout', (req, res) => {
  // let newUser = req.body.username;
  res.clearCookie('username').redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.round(Math.pow(36, 6 + 1) - Math.random() * Math.pow(36, 6))
    .toString(36)
    .slice(1);
}
