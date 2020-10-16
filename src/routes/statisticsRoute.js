const router = require("express").Router();

const connection = require("../utils/sql_db");

router.get("/exercises", async (req, res) => {
  const user_id = parseInt(req.query.user_id);
  const q =
    "SELECT title FROM exercises WHERE user_id=? GROUP BY title ORDER BY title";

  const get_exercises = (user_id) => {
    return new Promise((resolve, reject) => {
      connection.query(q, [user_id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  };

  try {
    const response = await get_exercises(user_id);
    return res.status(200).json({ exercises: response });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error. Failed fetch user's exercises");
  }
});

router.get("/", async (req, res) => {
  const user_id = parseInt(req.query.user_id);
  const title = req.query.title;
  const date = req.query.date;

  const get_statistics = (user_id, title) => {
    let q = `
      SELECT title, date, seconds FROM exercises WHERE user_id=? AND title=? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) ORDER BY date
    `;

    return new Promise((resolve, reject) => {
      connection.query(q, [user_id, title], (err, results) => {
        if (err) {
          console.log("Error from statistics/", err);
          reject(err);
        }
        resolve(results);
      });
    });
  };

  const get_total = (user_id, title) => {
    let q = `
      SELECT SUM(seconds) as total FROM exercises WHERE user_id=? AND title=? GROUP BY title;
    `;

    return new Promise((resolve, reject) => {
      connection.query(q, [user_id, title], (err, results) => {
        if (err) {
          console.log("Error from statistics/ in Get Total Func", err);
          reject(err);
        }
        resolve(results);
      });
    });
  };

  try {
    const response_stat = await get_statistics(user_id, title);
    const response_time = await get_total(user_id, title);
    console.log(response_stat, response_time);
    return res
      .status(200)
      .json({ stats: response_stat, total_time: response_time[0] });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send("Server Error. Something went wrong with fetching time intervals");
  }
});

module.exports = router;
