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

  User.findOne({
    email: { $regex: new RegExp(username, "i") },
  }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(password, 10);

      const newUser = new User({
        username,
        password: hash,
        email
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
          .json({
            result: true,
            data,
          });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: "User already exists !" });
    }
  });
});

// Route pour la connexion
router.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  if (!checkBody(req.body, ["username", "password"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields." });
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
