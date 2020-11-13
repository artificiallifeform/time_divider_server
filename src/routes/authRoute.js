const router = require("express").Router();
const connection = require("../utils/sql_db");

router.post("/", async (req, res) => {
  const { username } = req.body;
  const find_user = "SELECT id, username FROM users WHERE username=?";
  const insert_user = "INSERT INTO users(username) VALUES(?)";

  connection.query(find_user, [username], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      const { username, id } = results[0];
      return res.status(200).json({ username, id });
    }

    connection.query(insert_user, [username], (err, results, fields) => {
      if (err) throw err;
      return res.status(201).json({ username: username, id: results.insertId });
    });
  });
});

module.exports = router;
