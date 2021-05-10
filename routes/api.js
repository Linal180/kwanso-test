const express = require("express");
const bcrypt = require("bcrypt");
const authGuard = require("../helpers/auth-guard");
const assignToken = require("../helpers/jwt-helper");

const router = express.Router();

global.users = [];
global.tasks = [];

/**
 * Login user
 */
router.post("/login", async function (req, res) {
  try {
    const { email, password } = req.body;
    if (!email && !password) {
      return res.status(403).send({
        message: "Invalid params",
      });
    }

    const user = users.find((user) => user.email === email);
    if (!user) {
      return res.status(403).send({
        message: "Invalid email and password combination.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, user.salt);

    if (hashedPassword === user.password) {
      const token = assignToken({ email: user.email, id: user.id });
      res.status(200).send({
        jwt: token,
      });
    } else {
      return res.status(403).send({
        message: "Invalid email and password combination.",
      });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * Register User
 */
router.post("/register", async function (req, res, next) {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const user = users.find((user) => user.email === email);

      if (user) {
        return res.status(403).send({
          message: "User is already registered with this email.",
        });
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      const _user = { email, password: hash, salt, id: Date.now() };
      users.push(_user);
      return res.status(200).send({
        user: {
          email: _user.email,
          id: _user.id,
        },
      });
    } else {
      return res.status(403).send({
        message: "Invalid params",
      });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * Loggedin user data
 */
router.get("/user", authGuard, async function (req, res) {
  try {
    const { email } = req.user;
    const user = users.find((user) => user.email == email);
    res.status(200).send({
      user: {
        email: user.email,
        id: user.id,
      },
    });
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * list all tasks
 */
router.get("/list-tasks", authGuard, async function (req, res) {
  return res.status(200).send({
    tasks,
  });
});

/**
 * Create task
 */
router.post("/create-task", authGuard, async function (req, res) {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(403).send({
        message: "Invalid params",
      });
    }
    const task = { name, id: Date.now() };
    tasks.push(task);
    return res.status(200).send({
      task: { ...task },
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
