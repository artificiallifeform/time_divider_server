require("dotenv").config();
const express = require("express");

const connection = require("./utils/sql_db");

const authRoute = require("./routes/authRoute");
const exerciseRoute = require("./routes/exerciseRoute");
const statistcsRoute = require("./routes/statisticsRoute");
const goalsRoute = require("./routes/goalsRoute");

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
app.use("/auth", authRoute);
app.use("/exercise", exerciseRoute);
app.use("/statistics", statistcsRoute);
app.use("/goals", goalsRoute);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server is up and running");
});

// mongo "mongodb+srv://cluster0-renrv.mongodb.net/test"  --username egor2
