const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const helpers = require("./helpers");
const bcrypt = require("bcryptjs");
const PORT = 8080;


// Middlewares API
// app.use(cookieParser())
app.set("view engine", "ejs"); // configuration
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['qazwsx'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

//Data

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

//user login

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

// generate a string of 6 alphanumeric characters
function generateRandomString() {
  var uid = ("000000" + ((Math.random() * Math.pow(36, 6)) | 0).toString(36)).slice(-6);

  return uid;

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


app.get("/", (req, res) => {
  const user = req.body.id;
  if (user) {
    res.redirect("/urls");
  }
  res.redirect("login");
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const urlDatabase = urlsForUser(userID);  
  const templateVars = {
    user: users[userID],
    userID: userID,
    urls: urlDatabase
  };
  if (!userID) {
   return res.status(400).send('<p>Please Login</p>');
  }
  res.render("urls_index", templateVars);
});
//create new longURl by generation shortURL
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  // const templateVars = {
  //   user: users[userID],
  //   user_id: req.cookies["user_id"]
  // }
  const templateVars = {
    user: users[userID],
    userID: userID
  };
  if (userID) {
    
    return res.render("urls_new", templateVars);
  } else {
    return res.redirect("/login");
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
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  
  let newObj = { longURL: longURL, userID:  userID };

  if (!userID) {
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
  let shortURL = req.params.id;
  let key = urlDatabase[shortURL];
  let userID = req.session.user_id
  if (!userID) {
    return res.status(403).send('<p>Please login</p>')
  }
  if (!key) {
    return res.status(404).send(`<p>No URl with that Id exists </p>`)
  }
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    // user_id: req.session.user_id,
    // email: req.session.email,
    user: users["user_id"]
  };
   res.render("urls_show", templateVars);
});
// remove existing url
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id];
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    return res.status(403).send('<p> Request to delete URL denied</p>');
  }
  if (userID !== urlDatabase[id].userID) {
    return res.status(403).send('<p>Request to delete URL denied</p>')
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});
//Update longURL
app.post("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;  
  const longURL  = req.body.longURL;
  let userID = req.session.user_id;
  console.log(shortUrl)
  console.log(longURL)
  if (!userID) {
    res.redirect("/urls");
  } else if (urlDatabase[shortUrl].userID === userID) {
    urlDatabase[shortUrl].longURL = longURL;
    res.redirect("/urls/");
  } else {
    res.redirect("/urls");
  }
});

//user login

app.get("/login", (req, res) => {
  let userID = req.session.user_id;
  res.render("login", {user: users[userID]});
});

//summit login form and assign cookie value to user_id
app.post("/login", (req, res) => {
  let {email, password} = req.body;
  let userObject = helpers.getUserByEmail(email,users);
  if (!email || !password) {
    res.status(400).end('<p>You must provide an email and a passWord </p>')
  }  
  if (!userObject) {
    res.status(403).end('<p>user with that e-mail cannot be found</p>')
  }
  if (!bcrypt.compareSync(password, userObject.password)) {
    res.status(403).end('<p>Wrong password</p>')
  } else {
    req.session.user_id = userObject.id;
  res.redirect("/urls");
  }  
});

//clear user_id cookie and redirect back to the urls
app.post("/logout", (req, res) => {
  req.session = null;
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

  if (helpers.getUserByEmail(email,users)) {
    res.status(400).end('<p> A user with this email already exists</p>');
  }

  const userRandomID = generateRandomString();
  users[userRandomID] = {
    id: userRandomID,
    email: email,
    password: hashedPassword
  };
  req.session.user_id = userRandomID;  
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
