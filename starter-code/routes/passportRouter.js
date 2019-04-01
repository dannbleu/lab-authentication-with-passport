const express        = require("express");
const passportRouter = express.Router();
const User = require("../models/User");
const passport = require("passport");
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

passportRouter.get('/signup', (req, res) => {
  res.render('passport/signup');
});

passportRouter.post('/signup', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === ""){
    res.render("auth/signup", {message: "Add username and password"});
    return;
  }

  User.findOne({username})
  .then(user => {
    if (user !== null){
      res.render("auth/signup", {message: "The username is already in use"});
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      password: hashPass
    });

    newUser.save((err) => {
      if (err){
        res.render("auth/signup", {message: "something went wrong"});
      } else{
        res.redirect("/");
      }
    });
  })
  .catch(error => {
    next(error)
  })
});

passportRouter.get('/login', (req, res) => {
  res.render('passport/login')
});

passportRouter.post('/login', passport.authenticate('local', {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));

const ensureLogin = require("connect-ensure-login");
passportRouter.get("/private-page", ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render("passport/private", { user: req.user });
});

module.exports = passportRouter;