const router = require("express").Router();
const connection = require("../utils/sql_db");

router.post("/", async (req, res) => {
  // time_spent stores <seconds> value
  // goal_time stores <seconds> vale
  const {
    user_id,
    expiration,
    time_spent,
    created_at,
    title,
    goal_time,
  } = req.body;

  const insert_goal = (a, b, c, d, e, f) => {
    const q =
      "INSERT INTO goals(user_id, expiration, time_spent, created_at, title, goal_time) VALUES (?, FROM_UNIXTIME(?), ?, FROM_UNIXTIME(?), ?, ?)";

    return new Promise((resolve, reject) => {
      connection.query(q, [a, b, c, d, e, f], (err, results) => {
        if (err) reject(err);
        resolve(results.insertId);
      });
    });
  };

  try {
    const goal_id = await insert_goal(
      user_id,
      expiration,
      time_spent,
      created_at,
      title,
      goal_time
    );
    console.log(goal_id);
    return res.status(200).json({ goal_id });
  } catch (err) {
    return res
      .status(500)
      .send("Server Error. Something wrong with DB on inserting goal");
  }
});

router.get("/", async (req, res) => {
  const get_goals = (user_id, date) => {
    const q =
      "SELECT title, time_spent, goal_time, expiration FROM goals WHERE user_id=? AND expiration >= FROM_UNIXTIME(?) AND expired = 0";

    return new Promise((resolve, reject) => {
      connection.query(q, [user_id, date], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  };

  const set_expired_status = (user_id, date) => {
    const q =
      "UPDATE goals SET expired=1 WHERE user_id=? AND expiration < FROM_UNIXTIME(?)";

    return new Promise((resolve, reject) => {
      connection.query(q, [user_id, date], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  };

  try {
    const goals = await get_goals(req.query.user_id, req.query.date);
    await set_expired_status(req.query.user_id, req.query.date);
    res.status(200).json({ active_goals: goals });
  } catch (error) {
    res
      .status(500)
      .send("Server Error. Something wrong with DB on fetching goals list");
  }
});

module.exports = router;
