const databases = require("./databases");
// fillter users by email

const getUserByEmail = (email, users) => {
  for (let userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return null;
};

// generate a string of 6 alphanumeric characters
function generateRandomString() {
  var userid = (
    "000000" + ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
  ).slice(-6);
  return userid;
}

//a function which returns URLs for where the userID is equal to the id of current loged in user
const urlsForUser = function (id) {
  const urls = {};
  const urlDatabase = databases.urlDatabase;
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urls[key] = { userID: id, longURL: urlDatabase[key].longURL };
    }
  }
  return urls;
};
module.exports = { getUserByEmail, generateRandomString, urlsForUser };
