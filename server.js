const express = require('express');
const { json } = require('express/lib/response');
const app = express();
const sign = require('./sign');
const bodyParser = require('body-parser');


app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/",sign.auth);

app.get("/sign",sign.sign);

app.post("/form", (req,res) =>{
  let data = req.body;
  let cpf = data.cpf;
  let code = data.code;
  let fullface = "https://fullfacelab.com/FFWebDocusign/biometria?cpf="+cpf+"&redirecturl=";
  let redirurl = fullface + "https://" + req.get("host")+"/sign?code="+code;
  res.redirect(redirurl);
})

module.exports = app;

