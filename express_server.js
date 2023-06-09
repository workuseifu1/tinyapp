const express = require("express");
const app = express();

const cookieSession = require("cookie-session");

// Middlewares API
app.set("view engine", "ejs"); // configuration
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["qazwsx"],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);
const helpers = require("./helpers");
const databases = require("./databases");
const bcrypt = require("bcryptjs");
const PORT = 8080;

const urlDatabase = databases.urlDatabase;
const users = databases.users;

//only Logged in users have access to urls
app.get("/", (req, res) => {
  const user = req.body.id;
  if (user) {
    res.redirect("/urls");
  }
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const urlDatabase = helpers.urlsForUser(userID);
  const templateVars = {
    user: users[userID],
    userID: userID,
    urls: urlDatabase,
  };
  if (!userID) {
    return res.status(400).send("<p>Please Login</p>");
  }
  res.render("urls_index", templateVars);
});
//only logged in users create new longURl by generating shortURL
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    user: users[userID],
    userID: userID,
  };
  if (userID) {
    return res.render("urls_new", templateVars);
  } else {
    return res.redirect("/login");
  }
});

//Only logged in users have access to shorturl and corresponding id
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const key = urlDatabase[shortURL];
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(403).send("<p>Please login</p>");
  }
  if (!key) {
    return res.status(404).send(`<p>No URl with that Id exists </p>`);
  }
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users["user_id"],
  };
  res.render("urls_show", templateVars);
});

//Checks if url for the given id exist redirect to longurl
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (!longURL) {
    res.status(403).send("No URL with that ID exists.");
  } else {
    res.redirect(longURL);
  }
});
// if user is loged in then new longURl by generates shortURL and associates with the user
app.post("/urls", (req, res) => {
  const shortUrl = helpers.generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  const newObj = { longURL: longURL, userID: userID };

  if (!userID) {
    return res.status(403).send("<p>You must login first </p>");
  }
  if (longURL) {
    urlDatabase[shortUrl] = newObj;
    res.redirect(`/urls/${shortUrl}`);
  } else {
    res.status(403).send("<p>Invalid</p>");
  }
});

//only a user can update url for given own id
app.post("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect("/urls");
  } else if (urlDatabase[shortUrl].userID === userID) {
    urlDatabase[shortUrl].longURL = longURL;    
    res.redirect("/urls");
  }
});

// only a user logged in owns the url can delete
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    return res.status(403).send("<p> Request to delete URL denied</p>");
  }
  if (userID !== urlDatabase[id].userID) {
    return res.status(403).send("<p>Request to delete URL denied</p>");
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});

//user login

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    res.redirect("/urls");
  }
  res.render("login", { user: users[userID] });
});

//user register

app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: null };
  if (userID) {
    res.redirect("/urls");
  }
  res.render("register", templateVars);
});

//summit login form and assign cookie value to user_id
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userObject = helpers.getUserByEmail(email, users);
  if (!email || !password) {
    res.status(400).end("<p>You must provide an email and a passWord </p>");
  }
  if (!userObject) {
    res.status(403).end("<p>user with that e-mail cannot be found</p>");
  }
  if (!bcrypt.compareSync(password, userObject.password)) {
    res.status(403).end("<p>Wrong password</p>");
  } else {
    req.session.user_id = userObject.id;
    res.redirect("/urls");
  }
});

//handle register form submistion

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) {
    res
      .status(400)
      .end("<p> Both email and password must be included in registration</p>");
  }

  if (helpers.getUserByEmail(email, users)) {
    res.status(400).end("<p> A user with this email already exists</p>");
  }

  const userRandomID = helpers.generateRandomString();
  users[userRandomID] = {
    id: userRandomID,
    email: email,
    password: hashedPassword,
  };
  req.session.user_id = userRandomID;
  res.redirect("/urls");
});

//clear user_id cookie and redirect back to the urls
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
