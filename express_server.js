const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080;


// generate a string of 6 alphanumeric characters
function generateRandomString() {
  while (true) {
    var uid = ("000000" + ((Math.random() * Math.pow(36, 6)) | 0).toString(36)).slice(-6);

    return uid;
  }
}
// Middlewares API
app.use(cookieParser())
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xvn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    user:users[userRandomID],
    user_id: req.cookies["user_id"],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});
//create new longURl by generation shortURL
app.get("/urls/new", (req, res) => {
  const userRandomID = req.cookies['user_id']
  const templateVars = {
    user:users[userRandomID] ,
    user_id: req.cookies["user_id"]
  } 
  res.render("urls_new", templateVars);
});
// handle new longURl by generation shortURL
app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortUrl] = longURL;
  res.redirect(`/urls/${shortUrl}`);
});

app.get("/urls/:id", (req, res) => {
  const userRandomID = req.cookies['user_id']
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id],user:users[userRandomID] };
  res.render("urls_show", templateVars);
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
  const userInput = req.body.longURL; 
  urlDatabase[shortUrl] = userInput;
  res.redirect(`/urls`);
 });

//summit login form and assign cookie value to username
app.post("/login", (req, res) => {
  let userID = undefined;
  for (let id in users) {
    if (users[id].email === req.body.email ) {
      userID = id;
      break;
    }
  }
  res.cookie("user_id",userID);  
  res.redirect("/urls");
});

//clear user_id cookie and redirect back to the urls
app.post("/logout", (req, res) => {  
  res.clearCookie("user_id");
  res.redirect("/urls");
}); 

//Register form

app.get("/register", (req, res) =>{  
  res.render("register");
});

//handle register form submistion

app.post("/register", (req, res) => {
  const userRandpmID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  users[userRandpmID] =  {
    id: userRandpmID ,
    email: email,
    password: password
  };  
  res.cookie("user_id",userRandpmID);
  res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});