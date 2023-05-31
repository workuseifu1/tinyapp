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

app.post("/urls", (req, res) => {
  const shortUrls = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortUrls] = longURL;
  res.redirect(`/urls/${shortUrls}`);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});
 app.post("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;  
  const userInput = req.body.longURL; 
  urlDatabase[shortUrl] = userInput;
  res.redirect(`/urls`);
 });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});