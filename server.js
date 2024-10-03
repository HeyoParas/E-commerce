const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require('express-session');

const app = express();

// Set ejs files
app.set("view engine", "ejs");

// Set path for serving static files at client side
const filepath = path.join(__dirname, "public");
console.log("filepath :", filepath);

// Use static files at client side
app.use(express.static(filepath));

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret : 'my-session-secret',
  resave : false, 
  saveUninitialized : false,
  name : 'sessionId',
  cookie:{
    secure:false,
    httpOnly:true,
    maxAge:1000*60*60
  }
}));


app.use((req, res, next) => {
  console.log("request.method :", req.method);
  console.log("request.url :", req.url);
  next();
});


const indexRoutes = require('./routes/indexRoutes.js');
app.use('/', indexRoutes);

app.listen(3000, () => console.log("server start running at port 3000"));
