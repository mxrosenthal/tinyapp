const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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
  const userID = req.cookies['user_id'];
  const userObj = users[userID];

  //if statement checks whether a user is logged in. The link to
  //this page should be invisible if not logged in, so if someone bypasses
  //it by googling /urls/new they will fail this check and be redirected
  //to the login page.
  if (!userID) {
    res.redirect('/login');
  }

  let templateVars = {
    user: userObj,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };

  res.render('urls_new', templateVars);
});

app.get('/login', (req, res) => {
  const userID = req.cookies['user_id'];
  const userObj = users[userID];

  let templateVars = {
    user: userObj,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };

  res.render('urls_login', templateVars);
});

app.get('/register', (req, res) => {
  const userID = req.cookies['user_id'];
  const userObj = users[userID];

  let templateVars = {
    user: userObj,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };

  res.render('urls_user', templateVars);
});

// accessed by hitting the edit button.
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies['user_id'];
  const userObj = users[userID];
  // console.log(urlDatabase);
  // console.log('req.cookies.user_id: ', req.cookies.user_id);

  // const shorty = req.params.shortURL;
  // console.log('urlDatabase[shorty].userID: ', urlDatabase[shorty].userID);

  // if (urlDatabase[shorty].userID === req.cookies.user_id) {
  let templateVars = {
    user: userObj,
    // urls: urlDatabase
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  // console.log('templateVars.shortURL: ', templateVars.shortURL);
  // console.log('templateVars.longURL.longURL: ', templateVars.longURL.longURL);
  res.render('urls_show', templateVars);
  // }
});

app.get('/urls', (req, res) => {
  const userID = req.cookies['user_id'];
  // console.log('userID: ', userID);
  const userObj = users[userID];

  let templateVars = {
    user: userObj,
    urls: urlDatabase
  };
  // console.log(templateVars);
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/u/:shortURL', (req, res) => {
  // console.log('req.params.shortURL: ', req.params.shortURL);
  // const longURL = urlDatabase[req.params.shortURL].longURL;
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  console.log(longURL);
  // let user = getUserFromReq(req);
  // console.log(user);
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
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userId = req.cookies.user_id;

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userId
  };
  res.redirect('/urls');
});

//request to change the longURL associated with a given shortURL
app.post('/urls/:shortURL', (req, res) => {
  // console.log('hey there');
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  // console.log('longURL: ', longURL);
  // console.log('shortURL: ', shortURL);

  let user = getUserFromReq(req);
  console.log('user: ', user);

  console.log('req.cookies.user_id: ', req.cookies.user_id);
  console.log('urlDatabase[shortURL].userID: ', urlDatabase[shortURL].userID);
  if (urlDatabase[shortURL].userID === req.cookies.user_id) {
    urlDatabase[shortURL].longURL = longURL;
    console.log(urlDatabase);
    res.redirect('/urls');
  } else {
    res.send('Need to be logged in to edit links.');
  }
});

//Delete longURL with it's shortURL key from the database.
app.post('/urls/:shortURL/delete', (req, res) => {
  let shorty = req.params.shortURL;
  // console.log('res.cookie', req.cookies.user_id);

  // console.log(urlDatabase[shorty].userID);

  if (urlDatabase[shorty].userID === req.cookies.user_id) {
    delete urlDatabase[shorty];
    res.redirect('/urls');
  } else {
    res.send('Need to be logged in to delete links.');
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

  const person = getUserByEmail(emailToFind);
  console.log('user: ', person);

  // console.log('password: ', password);
  for (const userID in users) {
    // console.log(userID);
    // // console.log(users);

    // console.log('1:', emailToFind);
    if (users[userID].email === emailToFind) {
      userLoggingIn = users[userID];
    }
  }

  // console.log('i am in the post');
  const user = getUserByEmail(emailToFind);
  // console.log(user);
  if (!userLoggingIn) {
    console.log('bad email');
    //email not registered. redirect to register page
    res.send('Error 403: Email and/or password incorrect.');
  }
  // console.log('there is a user.');

  // const hashedPassword = bcrypt.hashSync(password, 10);
  // console.log('hashedPassword: ', hashedPassword);
  // console.log('userLoggingIn.password: ', userLoggingIn.password);

  // if (userLoggingIn.password === users[userID].password) {
  if (bcrypt.compareSync(password, person.password)) {
    // returns true

    res.cookie('user_id', userLoggingIn.id).redirect('/urls');
  } else {
    console.log('bad password');

    res.send('Error 403: Email and/or password incorrect.');
  }
  // console.log('what the heck');
});

//logging out
app.post('/logout', (req, res) => {
  res.clearCookie('user_id', req.cookies['user_id']).redirect('/urls');
});

//Registering a new user.
app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    redirect('/register');
  }

  if (emailExistsAlready(req.body.email, users)) {
    res.send('Error 400: Email already exists...');
  }

  let userID = generateRandomString();
  users[userID] = {};

  const password = req.body.password; // found in the req.params object
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(hashedPassword);
  users[userID]['id'] = userID;
  users[userID]['email'] = req.body.email;
  users[userID]['password'] = hashedPassword;

  res.cookie('user_id', userID).redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.round(Math.pow(36, 6 + 1) - Math.random() * Math.pow(36, 6))
    .toString(36)
    .slice(1);
}

//should pass in an email str and an obj to check against.
//If that string strictly equals an email in the
//users object, return false.
function emailExistsAlready(newEmail, users) {
  for (const user in users) {
    if (users[user].email === newEmail) {
      return true;
    } else {
      return false;
    }
  }
}

function getUserByEmail(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
}

function getUserFromReq(req) {
  return req.cookies.user_id;
}
