function getUserByEmail(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
}

function getUserFromReq(req) {
  return req.session.user_id;
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

function generateRandomString() {
  return Math.round(Math.pow(36, 6 + 1) - Math.random() * Math.pow(36, 6))
    .toString(36)
    .slice(1);
}

module.exports = {
  getUserByEmail,
  getUserFromReq,
  generateRandomString,
  emailExistsAlready
};
