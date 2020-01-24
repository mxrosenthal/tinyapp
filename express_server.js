const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const helpers = require('./helpers');

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: 'session',
    secret: 'something',
    maxAge: 24 * 60 * 60 * 1000
  })
);

app.set('view engine', 'ejs');

const urlDatabase = {};

const users = {};

app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;
  const userObj = users[userID];

  //if statement checks whether a user is logged in. The link to
  //this page should be invisible if not logged in, so if someone bypasses
  //it by googling /urls/new they will fail this check and be redirected
  //to the login page.
  if (!userID) {
    res.redirect('/login');
  } else {
    let templateVars = {
      user: userObj
    };
    res.render('urls_new', templateVars);
  }
});

app.get('/login', (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    res.redirect('/urls');
  } else {
    let templateVars = {
      user: null
    };

    res.render('urls_login', templateVars);
  }
});

app.get('/register', (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    res.redirect('/urls');
  } else {
    let templateVars = {
      user: null
    };
    res.render('urls_user', templateVars);
  }
});

// accessed by hitting the edit button.
app.get('/urls/:shortURL', (req, res) => {
  const shortURLExists = urlDatabase[req.params.shortURL];
  if (!req.session.user_id) {
    res.send('Need to log in before you can see links.');
  }

  if (!shortURLExists) {
    res.send('That URL is not in our database.');
  }

  if (shortURLExists.userID !== req.session.user_id) {
    res.send('You do not own that link.');
  }

  //if logged in && the shortURL's ID matches the cookie...
  if (
    req.session.user_id &&
    req.session.user_id === urlDatabase[req.params.shortURL].userID
  ) {
    const userObj = users[req.session.user_id];
    let templateVars = {
      user: userObj,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]
    };

    res.render('urls_show', templateVars);
  }
});

app.get('/urls', (req, res) => {
  const userObj = users[req.session.user_id];
  let templateVars = {
    user: userObj,
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const prefix1 = 'http://';
  const prefix2 = 'https://';

  if (!urlDatabase[shortURL]) {
    res.send('The URL you are trying to access is not in our database.');
  }

  const longURL = urlDatabase[shortURL].longURL;

  if (longURL.includes(prefix1) || longURL.includes(prefix2)) {
    res.redirect(longURL);
  }

  res.send(
    "Need URL to begin with 'http://' or 'https://' for redirect to work."
  );
});

app.get('/', (req, res) => {
  const userObj = users[req.session.user_id];
  if (userObj) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//POST
//generates random str for a given longURL
app.post('/urls', (req, res) => {
  if (req.session.user_id) {
    if (!req.body.longURL) {
      res.redirect('/urls/new');
    }
    const shortURL = helpers.generateRandomString();
    const longURL = req.body.longURL;
    const userId = req.session.user_id;

    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: userId
    };
    res.redirect('/urls');
  } else {
    res.status(403).redirect('/login');
  }
});

//request to change the longURL associated with a given shortURL
app.post('/urls/:shortURL', (req, res) => {
  if (req.session.user_id) {
    const longURL = req.body.longURL;
    const shortURL = req.params.shortURL;

    //Matching the id associated with the short URL to the cookie
    if (urlDatabase[shortURL].userID === req.session.user_id) {
      urlDatabase[shortURL].longURL = longURL;
      res.redirect('/urls');
    } else {
      res.send('You do now own this short url.');
    }
  } else {
    res.redirect('/login');
  }
});

//Delete longURL with it's shortURL key from the database.
app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.session.user_id) {
    let shorty = req.params.shortURL;
    if (urlDatabase[shorty].userID === req.session.user_id) {
      delete urlDatabase[shorty];
      res.redirect('/urls');
    } else {
      res.send('you are not the owner of this account.');
    }
  } else {
    res.send('Can not delete if you are not logged in.');
  }
});

//add user logged in to the cookie.
app.post('/login', (req, res) => {
  let emailToFind = req.body.email;
  let password = req.body.password;

  const person = helpers.getUserByEmail(emailToFind, users);
  if (!person) {
    res.send('Error 403: Email and/or password incorrect.');
  }
  if (bcrypt.compareSync(password, person.password)) {
    req.session.user_id = person.id;
    res.redirect('/urls');
  } else {
    res.send('Error 403: Email and/or password incorrect.');
  }
});

//logging out
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//Registering a new user.
app.post('/register', (req, res) => {
  if (helpers.emailExistsAlready(req.body.email, users)) {
    res.send('Error 400: Email already exists...');
  } else {
    let userID = helpers.generateRandomString();
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);

    users[userID] = {};
    users[userID]['id'] = userID;
    users[userID]['email'] = req.body.email;
    users[userID]['password'] = hashedPassword;

    req.session.user_id = userID;
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
