const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
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

app.get("/urls", (req, res) => {  
  const userRandomID = req.cookies['user_id'];  
  const templateVars = {
    user: users[userRandomID],
    user_id: req.cookies["user_id"],
    urls: urlDatabase
  };
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
    res.render("urls_new", templateVars);
  } else {
    res.render("login", templateVars)
  }
});
// handle new longURl by generation shortURL
app.post("/urls", (req, res) => {
  const userRandomID = req.cookies['user_id'];
  if (!userRandomID) {
    return res.send('<p>You must login first </p>')
  } else {
    const shortUrl = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortUrl] = {longURL,userID:userRandomID};

  res.redirect(`/urls/${shortUrl}`);
  }
  
});

app.get("/urls/:id", (req, res) => {
  const userRandomID = req.cookies['user_id'];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[userRandomID] };
  let key = urlDatabase[req.params.id];
  if (!key) {
    return res.send(`<p>Id  by ${templateVars.id} is not in the database </p>`)
  }
  return res.render("urls_show", templateVars);
});
// remove existing url
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});
//Update longURL
app.post("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const userRandomID = req.cookies['user_id'];
  const {longURL} = req.body;
  urlDatabase[shortUrl] = {longURL,userID:userRandomID};
  res.redirect(`/urls`);
});

//summit login form and assign cookie value to user_id
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).end('<p>You must provide an email and a pass </p>')
  }
  let userID = userLookUp(email);
  if (userID === null) {
    res.status(403).end('<p>user with that e-mail cannot be found</p>')
  }
  if (users[userID].password !== password) {
    res.status(403).end('<p>Wrong password</p>')
  }

  res.cookie("user_id", userID);
  res.redirect("/urls");
});

//clear user_id cookie and redirect back to the urls
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
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
  if (!email || !password) {
    res.status(400).end('<p> Both email and password must be included in registration</p>');
  }

  if (userLookUp(email)) {
    res.status(400).end('<p> A user with this email already exists</p>');
  }

  const userRandpmID = generateRandomString();
  users[userRandpmID] = {
    id: userRandpmID,
    email: email,
    password: password
  };
  console.log(users);
  res.cookie("user_id", userRandpmID);
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
