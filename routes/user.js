const router = require("express").Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const auth = require("../middleware/auth");

const User = require("../models/User");

router.post("/register", async (req, res) => {
  let { email, password, confirmPassword, displayName } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (!email || !password || !confirmPassword) {
      return res
        .status(400)
        .send({ error: "not all mandatory fields have been completed" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .msg({ error: "password must be at least 6 characters long" });
    }
    if (password !== confirmPassword) {
      return res.status(400).send({ error: "password confirm does not match" });
    }
    if (userExists) {
      return res.status(400).send({ msg: "invalid credentials" });
    }
    if (!displayName) displayName = email;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      displayName,
    });

    const savedUser = await newUser.save();

    res.json(savedUser);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/login", async (req, res) => {
  let { email, password } = req.body;

  try {
    if (!email || !password)
      return res.status(400).send({ error: "please complete both fields" });

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({ error: "invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send({ error: "invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({
      token,
      user: {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.delete("/delete", auth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user);
    res.json(deletedUser);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.post("/tokenisvalid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");

    if (!token) {
      return res.status(401).send({ error: "no token, not authorised" });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    if (!verified) {
      return res.json(false);
    }

    const user = await User.findById(verified.id);

    if (!user) {
      return res.json(false);
    }

    return res.json(true);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
