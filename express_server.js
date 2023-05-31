const express = require("express");
const app = express();
const PORT = 8080;

// generate a string of 6 alphanumeric characters
function generateRandomString() {
  while (true) {
    var uid = ("000000" + ((Math.random() * Math.pow(36, 6)) | 0).toString(36)).slice(-6);

    return uid;
  }
}

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xvn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
// create new longURl by generation shortURL
app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortUrl] = longURL;
  res.redirect(`/urls/${shortUrl}`);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
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
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});