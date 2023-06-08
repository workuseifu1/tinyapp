const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
  assert.equal(user.id, expectedOutput);
  });
  it('should return null when user with no email is provided', () => {
    const user = getUserByEmail('', testUsers)
    const expectedOutput = null;
  assert.isNull(user);
  });
});