const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedOutput = 'userRandomID';
    // Write your assert statement here
    console.log(user);

    assert.equal(user.id, expectedOutput);
  });
  it('should return a user object with valid email', function() {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedOutput = {
      id: 'userRandomID',
      email: 'user@example.com',
      password: 'purple-monkey-dinosaur'
    };
    // Write your assert statement here
    console.log(user);

    assert.deepEqual(user, expectedOutput);
  });
  it('should return a undefined when passed a non-existant email', function() {
    const user = getUserByEmail('banana@apple.com', testUsers);
    const expectedOutput = undefined;
    // Write your assert statement here
    console.log(user);

    assert.equal(user, expectedOutput);
  });
});
