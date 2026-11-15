const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const mainController = require('../controllers/mainController');
const passport = require("passport");
const { ensureAuthenticated, ensureAdmin } = require("../config/passport");

const router = Router();

// GET / homepage
router.get("/", mainController.getAllMessagesIndex);

// GET / Sign-up form view
router.get("/sign-up", mainController.signUpFormGet);

// POST / Sign-up form data submission

// sign up validation middleware before moving toward controller. This basically checks data validity before POST action
const signUpValidation = [
  body("first_name")
    .trim()
    .notEmpty().withMessage("First name is required.")
    .isLength({ max: 50 }).withMessage("First name must be 50 characters or fewer.")
    .isAlpha("en-US", { ignore: " -'" }).withMessage("First name contains invalid characters."),
  body("last_name")
    .trim()
    .notEmpty().withMessage("Last name is required.")
    .isLength({ max: 50 }).withMessage("Last name must be 50 characters or fewer.")
    .isAlpha("en-US", { ignore: " -'" }).withMessage("Last name contains invalid characters."),
  body("email")
    .trim()
    .normalizeEmail()
    .isEmail().withMessage("Enter a valid email address.")
    .isLength({ max: 255 }).withMessage("Email must be 255 characters or fewer."),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long."),
  body("confirmPassword")
    .custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.password) {
        throw new Error("Passwords do not match.");
      }
      return true;
    }),
];

router.post("/sign-up", signUpValidation, mainController.signUpFormPost);

// GET / log out action to redirect to index non-member page
router.get("/log-out", mainController.logOut);

// GET / login view 
router.get("/log-in", mainController.loginFormGet);

// POST / login submission action - passport.authenticate is a middleware same as signupValidation here which belongs before controller shift
router.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
    failureMessage: true,
  })
);

// GET / create message view form
router.get("/new-message", ensureAuthenticated, mainController.newMessageFormGet);

// POST / submit new message action
router.post("/new-message", ensureAuthenticated, mainController.newMessageFormPost);

// GET / enter exclusive private club form view
router.get("/join", ensureAuthenticated, mainController.joinClubFormGet);

// POST / passcode submit action
router.post(
  "/join",
  ensureAuthenticated,
  body("passcode").trim().notEmpty().withMessage("Enter the club passcode."),
  mainController.joinClubFormPost,
);

// POST / delete message by admin
router.post("/messages/:id/delete", ensureAuthenticated, ensureAdmin, mainController.deleteMessage);

module.exports = router;
