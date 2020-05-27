const router = require('express').Router();

const connection = require('../utils/sql_db');

router.post('/', async (req, res) => {
  const {user_id, date, title, seconds, exercise_id} = req.body;
  // To take date YYYY-dd-mm from
  const insert_exercise = (user_id, date, title, seconds) => {
    const q = 'INSERT INTO exercises(user_id, date, title, seconds) VALUES (?, FROM_UNIXTIME(?), ?, ?)';
    return new Promise((resolve, reject) => {
      connection.query(q, [user_id, date, title, seconds], (err, results) => {
        if (err) reject(err)
        resolve(results.insertId);     
      });
    });
  };

  const find_exercise = (date, title) => {
    // 
    const q = 'SELECT * FROM exercises WHERE date >= DATE_FORMAT(FROM_UNIXTIME(?), "%Y-%m-%d") AND date < DATE_FORMAT(FROM_UNIXTIME(?), "%Y-%m-%d") + INTERVAL 1 DAY AND title=?';
    const q_byId = 'SELECT * FROM exercises WHERE id=?';

    if (exercise_id) {
      return new Promise((resolve, reject) => {
        connection.query(q_byId, [exercise_id], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });
    }

    return new Promise((resolve, reject) => {
      connection.query(q, [date, date, title], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  const update_exercise = (exercise_id, title, seconds) => {
    const q = 'UPDATE exercises SET title=?, seconds=? WHERE id=?';
    return new Promise((resolve, reject) => {
      connection.query(q, [title, seconds, exercise_id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  try {
    // When exercise newly created it's exercise_id = null THEN Insert into DB And Return inserted_id
    // and assing to this exercises
    // When saving this exercises next time it's already has id property
    if (!exercise_id) {
      const inserted_result = await insert_exercise(user_id, date, title, seconds);
      return res.status(201).json({exercise_id: inserted_result, msg: 'You ve instered exercise'});
    }
    const found_exercise = await find_exercise(date, title);   
    await update_exercise(found_exercise[0].id, title, seconds);
    // Returns id. need to assing it to exercise instance
    return res.status(201).json({exercise_id: found_exercise[0].id});
  } catch (err) {
    return res.status(500).send('Server Error. Db Error on inserting exercise');
  }
});

router.get('/getexercise', async (req, res) => {
  const user_id = parseInt(req.query.user_id);
  const date = parseInt(req.query.date);

  const exercises_per_day = (user_id, date) => {
    const q = 'SELECT * FROM exercises WHERE date >= DATE_FORMAT(FROM_UNIXTIME(?), "%Y-%m-%d") AND date < DATE_FORMAT(FROM_UNIXTIME(?), "%Y-%m-%d") + INTERVAL 1 DAY AND user_id=?';
    return new Promise((resolve, reject) => {
      connection.query(q, [date, date, user_id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      })
    })
  }

  try {
    const exercises = await exercises_per_day(user_id, date);
    return res.status(200).json({ exercises });
  } catch (err) {
    return res.status(500).send('Server Error. Db Error on Selecting Exercises Per Day');
  }
});

router.delete('/', async (req, res) => {
  const exercise_id = parseInt(req.query.exercise_id);
  const q = 'DELETE FROM exercises WHERE id=?'
  connection.query(q, [exercise_id], (err, results) => {
    if (err) {
      return res.status(500).send('Failed To Delete Resource');
    }
    return res.status(204).send('Resource Deleted Successfully');
  });
});

module.exports = router;