require("dotenv").config();
const express = require("express");
const path = require("path");

const connection = require("./utils/sql_db");

const authRoute = require("./routes/authRoute");
const exerciseRoute = require("./routes/exerciseRoute");
const statistcsRoute = require("./routes/statisticsRoute");
const goalsRoute = require("./routes/goalsRoute");
const goalsHistoryRoute = require("./routes/goalsHistoryRoute");

const init_tables = {
  exercises_table: `CREATE TABLE IF NOT EXISTS exercises(
    id INT auto_increment primary key,
      user_id INT,
      date TIMESTAMP NOT NULL,
      title VARCHAR(255),
      seconds INT,
      last_update TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );`,
  users_table: `CREATE TABLE IF NOT EXISTS USERS(id INT auto_increment primary key, username VARCHAR(100) NOT NULL);`,
};

// Connection to mysql
connection.connect((err) => {
  if (err) {
    console.log("error while connection to mysql" + err.stack);
    return;
  }
  console.log("Connected as id" + connection.threadId);
});

// Init tables
connection.query(init_tables.users_table, [], (err, results) => {
  if (err) throw err;
});
connection.query(init_tables.exercises_table, [], (err, results) => {
  if (err) throw err;
});

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json({ extended: false }));
app.use("/api/auth", authRoute);
app.use("/api/exercise", exerciseRoute);
app.use("/api/statistics", statistcsRoute);
app.use("/api/goals", goalsRoute);
app.use("/api/goalshistory", goalsHistoryRoute);

app.use(express.static(__dirname + "/dist"));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server is up and running");
});
