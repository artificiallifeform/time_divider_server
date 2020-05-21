const router = require('express').Router();
const connection = require('../utils/sql_db');

router.post('/', async (req, res) => {
  const { username } = req.body;
  const find_user = 'SELECT username FROM users WHERE username=?';
  const insert_user = 'INSERT INTO users(username) VALUES(?)'

  connection.query(find_user, [username] ,(err, results) => {
    if (err) throw err;

    if(results.length > 0) {
      console.log(results);
      return res.status(200).json({ username: results[0].username });
    } 
    
    connection.query(insert_user, [username], (err, results) => {
      if (err) throw err;
      console.log(results);
      return res.status(201).json({ username: username });
    });
  });
});

module.exports = router;