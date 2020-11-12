const express = require("express");
const mongoose = require("mongoose");
const expressEjsLayout = require("express-ejs-layouts");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require('passport');
const secret = 't68jTY&62s59!vx'
const app = express();
//Injecting passport strategy
const useStrategy = require('./config/passport');
useStrategy(passport);

// Rewrite as async func
// MongoDB connection
mongoose
  .connect("mongodb://localhost/logins", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to database"))
  .catch((err) => console.log("Failed to connect to database: " + err));
// Ejs
app.set("view engine", "ejs");
app.use(expressEjsLayout);

app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: secret, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
//Flash
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
})

// Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

const server = app.listen(3000);
console.log("Starting app");

// Handling shutdown
process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
// Active connections
let connections = [];
server.on("connection", (connection) => {
  connections.push(connection);
  connection.on(
    "close",
    () => (connections = connections.filter((curr) => curr !== connection))
  );
});

function shutDown() {
  console.log("Received kill signal, shutting down gracefully");
  server.close(() => {
    console.log("Closed out remaining connections");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("Could not close connections in time, exiting forcefully");
    process.exit(1);
  }, 10000);
}

module.exports = app;