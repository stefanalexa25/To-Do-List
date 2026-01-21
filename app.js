const express = require("express");
const app = express();
const session = require("express-session");
const cors = require("cors");
const routes = require("./routes");

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

app.use(
  session({
    secret: "fastidious",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/api",routes);

module.exports = app;