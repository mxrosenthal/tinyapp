const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urls_show', templateVars);
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//POST
app.post('/urls', (req, res) => {
  //updating the database with the new key: value
  //a.kda
  urlDatabase[generateRandomString()] = req.body.longURL;
  // console.log('urlDatabase: ', urlDatabase);
  res.send('Ok'); // Respond with 'Ok' (we will replace this)
});

app.post('/urls/:shortURL/delete', (req, res) => {
  // console.log('req.params.shortURL: ', req.params.shortURL);
  // console.log('res.params.shortURL: ', res.params.shortURL);
  // console.log(urlDatabase);
  let shorty = req.params.shortURL;
  console.log('shorty: ', shorty);
  let URL = urlDatabase[shorty];
  delete urlDatabase[shorty];
  console.log(urlDatabase);
  // res.send(`URL: ${URL} was deleted.`);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.round(Math.pow(36, 6 + 1) - Math.random() * Math.pow(36, 6))
    .toString(36)
    .slice(1);
}

// console.log(generateRandomString());
// console.log(generateRandomString());
// console.log(generateRandomString());
// console.log(generateRandomString());
