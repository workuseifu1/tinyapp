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
  const newUrlDatabase = longURL;
  urlDatabase[shortUrls] =newUrlDatabase;
  res.redirect("/urls");
  
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});