require("dotenv").config();
const path = require("node:path");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
require("./config/passport");
const mainRouter = require("./routes/mainRouter");
const pgSession = require('connect-pg-simple')(session);
const pool = require("./models/pool");

const app = express();

// set EJS view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// connect the session to the database
app.use(session({
  store: new pgSession({
    pool,               // Connection pool
    tableName : 'sessions',   
    createTableIfMissing: true
    // Insert connect-pg-simple options here
  }),
  secret: process.env.FOO_COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // equals 1 day
  // Insert express-session options here
}));

app.use(passport.initialize()); //attaches Passport to the request
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// router mount
app.use('/', mainRouter);

// set the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
    if (error) {
        throw error;
    }
    console.log(`Express app listening on port ${PORT}!`);
});
