const passport = require("passport");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const db = require("../models/queries");

passport.use(new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
  try {
    const user = await db.getUserByUsername(email);
    if (!user) return done(null, false, { message: "Incorrect email" });
    if (!await bcrypt.compare(password, user.password_hash)) {
      return done(null, false, { message: "Incorrect password" });
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    done(null, await db.getUserById(id));
  } catch (error) {
    done(error);
  }
});

// The middleware checks whether Passport has authenticated the current request. If yes, the request continues; 
// otherwise, the user is sent to the login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/log-in");
}

function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user?.is_admin === true) {
    return next();
  }

  res.status(403).send("Admin access required");
}
module.exports = {
  ensureAuthenticated,
  ensureAdmin
};
