const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { auth } = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET;
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");

// Route pour créer un compte
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;


  if (!checkBody(req.body, ["username", "email", "password"])) {

    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields." });
  }

const emailRegexValidation = /^\S+@\S+\.\S+$/;
  const passwordRegexValidation =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

if (!emailRegexValidation.test(email)) {
    return res
      .status(400)
      .json({ result: false, error: "Please enter a valid email." });
  }
  if (!passwordRegexValidation.test(password)) {
    return res.status(500).json({
      result: false,
      error:
        "Please enter Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.",
    });
  }


  User.findOne({
    email: email 
    // { $regex: new RegExp(username, "i") }
  }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(password, 10);

      const newUser = new User({
        username,
        password: hash,
        email,
      });

      newUser.save().then((data) => {
        const token = jwt.sign(
          {
            id: data.id,
            email: data?.email,
          },

          JWT_SECRET,
          {
            expiresIn: "24h",
          }
        );

        res
          .cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
          })
          .status(201)
          .json({
            result: true,
            data,
            message: "Inscription réussie",
          });
      });
    } else {
      // User already exists in database
      // res.json({ result: false, error: "User already exists !" });
      res.status(400).json({ result: false, error: "User already exists !" });
    }
  });
});

// Route pour la connexion
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!checkBody(req.body, ["email", "password"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields." });
  }

  
const emailRegexValidation = /^\S+@\S+\.\S+$/;
  const passwordRegexValidation =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

if (!emailRegexValidation.test(email)) {
    return res
      .status(400)
      .json({ result: false, error: "Please enter a valid email." });
  }
  if (!passwordRegexValidation.test(password)) {
    return res.status(500).json({
      result: false,
      error:
        "Please enter Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.",
    });
  }


  User.findOne(
    { email: req.body.email }
  ).then((data) => {

    if (data && bcrypt.compareSync(password, data.password)) {
      const token = jwt.sign(
        {
          id: data?.id,
          role: data?.role,
          email: data?.email,
        },

        JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({
        result: true,
        data,
        message: "User connected",
      });
    } else {
      res.json({ result: false, error: "Utilisateur introuvable" });
    }
  });
});

// Route pour la déconnexion
router.post("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.json({ result: true });
});


module.exports = router;
