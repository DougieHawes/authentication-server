require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const app = express();

const mongoUri = process.env.MONGODB_URI;
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.listen(port, console.log(`express app running on port:${port}`));

mongoose.connect(
  mongoUri,
  { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
  console.log("mongo connected")
);

app.use("/users", require("./routes/user"));
