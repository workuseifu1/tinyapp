const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const bcrypt = require("bcryptjs");
const PORT = 8080;


// generate a string of 6 alphanumeric characters
function generateRandomString() {
  var uid = ("000000" + ((Math.random() * Math.pow(36, 6)) | 0).toString(36)).slice(-6);

  return uid;

}

// finding  a user in the users object
const userLookUp = function (email) {
  let userObj = null;
  for (let user in users) {
    if (users[user].email === email) {
      userObj = user;
    }
  }
  return userObj;
}



// Middlewares API
app.use(cookieParser())
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
//a function which returns URLs for where the userID is equal to the id of current loged in user
const urlsForUser = function (id) {
  
  let urls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urls[key] = { userID: id, longURL: urlDatabase[key].longURL };
    }
  }
  return urls;
};

// fillter users by email

const getUserByEmail = (email, users) => {
  
  for (let userID in users){
    if(users[userID].email === email) {
      return users[userID];
    } 
  } return null;
};

app.get("/", (req, res) => {
  const user = req.body.id;
  if (user) {
    res.redirect("/urls");
  }
  res.redirect("login");
});

app.get("/urls", (req, res) => {
  const userRandomID = req.cookies['user_id'];
  const urlDatabase = urlsForUser(userRandomID)
  
  const templateVars = {
    user: users[userRandomID],
    userID: req.cookies["user_id"],
    urls: urlDatabase
  };

  if (!userRandomID) {
    res.status(400).send('<p>Please Login</p>');
  }
  res.render("urls_index", templateVars);
});
//create new longURl by generation shortURL
app.get("/urls/new", (req, res) => {
  const userRandomID = req.cookies['user_id']
  const templateVars = {
    user: users[userRandomID],
    user_id: req.cookies["user_id"]
  }
  if (userRandomID) {
    const templateVars = {
      user: users[userRandomID],
      user_id: req.cookies["user_id"]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  if (!longURL) {
    res.status(403).send("No URL with that ID exists.")
    } else {
  res.redirect(longURL);
 }
});
// handle new longURl by generation shortURL
app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  const userRandomID = req.cookies['user_id'];
  const longURL = req.body.longURL;
  
  
  let newObj = { longURL: longURL, userID:  userRandomID };

  if (!userRandomID) {
    return res.status(403).send('<p>You must login first </p>');
  }
  if (longURL) {
    
    urlDatabase[shortUrl] = newObj;
    
    res.redirect(`/urls/${shortUrl}`);
  } else {
    res.status(403).send('<p>Invalid</p>');
  }
});

app.get("/urls/:id", (req, res) => {
  const userRandomID = req.cookies['user_id'];
  const shortURL = req.params.id;
  let key = urlDatabase[shortURL];
  if (urlsForUser(userRandomID) === {}) {
    return res.status(403).send('<p>Please login</p>')
  }
  if (!key) {
    return res.status(404).send(`<p>No URl with that Id exists </p>`)
  }
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[userRandomID]
  };
  return res.render("urls_show", templateVars);
});
// remove existing url
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  

  const url = urlDatabase[id];
  const userRandomID = req.cookies['user_id'];
  const user = users[userRandomID];
  if (!user) {
    return res.status(403).send('<p> Request to delete URL denied</p>');
  }
  if (userRandomID !== urlDatabase[id].userID) {
    return res.status(403).send('<p>Request to delete URL denied</p>')
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});
//Update longURL
app.post("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const userRandomID = req.cookies['user_id'];
  const  longURL  = req.body.longURL;
  if (urlsForUser("user_id") === {}) {
    res.redirect("/urls");
  } else if (urlDatabase[shortUrl].userID === urlsForUser("user_id")) {
    urlDatabase[shortUrl].longURL = longURL;
    res.redirect("/urls/");
  } else {
    res.redirect("/urls");
  }
});

//user login

app.get("/login", (req, res) => {
  let userID = req.cookies['user_id'];
  res.render("login", {user: users[userID]});
});

//summit login form and assign cookie value to user_id
app.post("/login", (req, res) => {
  let {email, password} = req.body;
  let userObject = getUserByEmail(email,users);
  const hashedPassword = bcrypt.hashSync(userObject.password, 10);
  if (!email || !password) {
    res.status(400).end('<p>You must provide an email and a passWord </p>')
  }  
  if (!userObject) {
    res.status(403).end('<p>user with that e-mail cannot be found</p>')
  }
  if (!bcrypt.compareSync(password, hashedPassword)) {
    res.status(403).end('<p>Wrong password</p>')
  } else {
    res.cookie("user_id", userObject.id);
  res.redirect("/urls");
  }  
});

//clear user_id cookie and redirect back to the urls
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//Register form

app.get("/register", (req, res) => {
  const templateVars = { user: null }
  res.render("register", templateVars);
});

//handle register form submistion

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) {
    res.status(400).end('<p> Both email and password must be included in registration</p>');
  }

  if (userLookUp(email)) {
    res.status(400).end('<p> A user with this email already exists</p>');
  }

  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: email,
    password: hashedPassword
  };
  
  res.cookie("user_id", userID);
  res.redirect("/urls")
});

// endpoint responds for login form template

app.get("/login", (req, res) => {
  const templateVars = { user: null }
  res.render("login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
