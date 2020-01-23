const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
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

const urlDatabase = {
  // aaaaaa: { longURL: 'https://www.tsn.ca', userID: 'buttyButtler' },
  // bbbbbb: { longURL: 'https://www.google.ca', userID: 'jim' },
  // cccccc: { longURL: 'https://www.tsn.ca', userID: 'buttyButtler' },
  // dddddd: { longURL: 'https://www.google.ca', userID: 'jim' },
  // wwwwww: { longURL: 'https://www.tsn.ca', userID: 'user2RandomID' },
  // qqqqqq: { longURL: 'https://www.google.ca', userID: 'user2RandomID' },
  // tttttt: { longURL: 'https://www.tsn.ca', userID: 'buttyButtler' },
  // yyyyyy: { longURL: 'https://www.google.ca', userID: 'buttyButtler' }
};

const users = {
  // user2RandomID: {
  //   id: 'user2RandomID',
  //   email: 'user2@example.com',
  //   password: '123'
  // },
  // buttyButtler: {
  //   id: 'buttyButtler',
  //   email: 'handCramp@yahoo.com',
  //   password: '456'
  // }
};

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
  } else {
    res.redirect('/urls');
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
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get('/', (req, res) => {
  const userObj = users[req.session.user_id];
  if (userObj) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }

  // let templateVars = {
  //   user: userObj,
  //   urls: urlDatabase
  // };
  // res.render('urls_index', templateVars);
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

    let user = helpers.getUserFromReq(req);
    if (urlDatabase[shortURL].userID === req.session.user_id) {
      urlDatabase[shortURL].longURL = longURL;
      res.redirect('/urls');
    } else {
      res.send('You do now own this short url.');
    }
  } else {
    res.status(403).redirect('/login');
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
    res.status(403).redirect('/login');
  }
});

//add users logged into a cookie. You can check this cookie in the CDT.
// 1. open chrom dev tools, clear cache if full.
// 2. submit user_id on tinyapp.
// 3. in CDT go to 'application' at the top. then 'cookies' on the left.
//    and the submission should be visible.
app.post('/login', (req, res) => {
  let emailToFind = req.body.email;
  let password = req.body.password;
  let userLoggingIn;

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
    users[userID] = {};

    const password = req.body.password; // found in the req.params object
    const hashedPassword = bcrypt.hashSync(password, 10);
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
