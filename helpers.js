
// fillter users by email

const getUserByEmail = (email, users) => {
  
  for (let userID in users){
    if(users[userID].email === email) {
      return users[userID];
    } 
  } return null;
};

module.exports = {getUserByEmail};