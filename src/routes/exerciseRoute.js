const router = require("express").Router();

const connection = require("../utils/sql_db");

router.post("/", async (req, res) => {
  const { user_id, date, title, seconds, exercise_id, last_update } = req.body;
  // To take date YYYY-dd-mm from
  const insert_exercise = (user_id, date, title, seconds) => {
    const q =
      "INSERT INTO exercises(user_id, date, title, seconds) VALUES (?, FROM_UNIXTIME(?), ?, ?)";
    return new Promise((resolve, reject) => {
      connection.query(q, [user_id, date, title, seconds], (err, results) => {
        if (err) reject(err);
        resolve(results.insertId);
      });
    });
  };

  const find_exercise = (date, title) => {
    const q =
      'SELECT * FROM exercises WHERE date >= DATE_FORMAT(FROM_UNIXTIME(?), "%Y-%m-%d") AND date < DATE_FORMAT(FROM_UNIXTIME(?), "%Y-%m-%d") + INTERVAL 1 DAY AND title=?';
    const q_byId = "SELECT * FROM exercises WHERE id=?";

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
  };

  const update_exercise = (exercise_id, title, seconds, last_update) => {
    const q =
      "UPDATE exercises SET title=?, seconds=?, last_update=FROM_UNIXTIME(?) WHERE id=?";
    return new Promise((resolve, reject) => {
      connection.query(
        q,
        [title, seconds, last_update, exercise_id],
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });
  };

  const find_goal = (last_update, user_id, title) => {
    const goal_q =
      "SELECT id, time_spent, goal_time, title, expiration FROM goals WHERE expiration > FROM_UNIXTIME(?) AND user_id=? AND title=? AND expired = 0";
    return new Promise((resolve, reject) => {
      connection.query(
        goal_q,
        [last_update, user_id, title],
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });
  };

  const update_goal = (goal_id, seconds, expired = 0) => {
    const q = "UPDATE goals SET time_spent=time_spent+?, expired=? WHERE id=?";

    return new Promise((resolve, reject) => {
      connection.query(q, [seconds, expired, goal_id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  };

  try {
    // When exercise newly created it's exercise_id = null THEN Insert into DB And Return inserted_id
    // and assing to this exercises
    // When saving this exercises next time it's already has id property
    const found_goal = await find_goal(last_update, user_id, title);
    if (!exercise_id) {
      const inserted_result = await insert_exercise(
        user_id,
        date,
        title,
        seconds
      );

      if (found_goal.length > 0) {
        for (let goal of found_goal) {
          await update_goal(goal.id, seconds);
        }
      }

      return res.status(201).json({
        exercise_id: inserted_result,
        msg: "You ve inserted exercise",
      });
    }
    const found_exercise = await find_exercise(date, title);

    if (found_goal.length > 0) {
      const prev_state = found_exercise[0].seconds;
      const difference = seconds - prev_state;

      // found_goal is array of all mathcing goals
      // if arr.len > 0 add to time_spent of goals table difference between to saves
      for (let goal of found_goal) {
        if (goal.time_spent + difference > goal.goal_time) {
          // If saved amount of exercise greater then goal's seconds, then
          // set time_spent to goal_time
          // Third argument is Expired. When 1 it means no more updates of this goal
          await update_goal(goal.id, goal.goal_time - goal.time_spent, 1);
        } else {
          await update_goal(goal.id, difference);
        }
      }
    }

    await update_exercise(found_exercise[0].id, title, seconds, last_update);
    // Returns id. need to assing it to exercise instance
    return res.status(201).json({
      exercise_id: found_exercise[0].id,
    });
  } catch (err) {
    return res.status(500).send("Server Error. Db Error on inserting exercise");
  }
});

router.get("/getexercise", async (req, res) => {
  const user_id = parseInt(req.query.user_id);
  const date = parseInt(req.query.date);

  const exercises_per_day = (user_id, date) => {
    const q =
      'SELECT * FROM exercises WHERE date >= DATE_FORMAT(FROM_UNIXTIME(?), "%Y-%m-%d") AND date < DATE_FORMAT(FROM_UNIXTIME(?), "%Y-%m-%d") + INTERVAL 1 DAY AND user_id=?';
    return new Promise((resolve, reject) => {
      connection.query(q, [date, date, user_id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  };

  try {
    const exercises = await exercises_per_day(user_id, date);
    return res.status(200).json({ exercises });
  } catch (err) {
    return res
      .status(500)
      .send("Server Error. Db Error on Selecting Exercises Per Day");
  }
});

router.delete("/", async (req, res) => {
  const exercise_id = parseInt(req.query.exercise_id);
  const q = "DELETE FROM exercises WHERE id=?";
  connection.query(q, [exercise_id], (err, results) => {
    if (err) {
      return res.status(500).send("Failed To Delete Resource");
    }
    return res.status(204).send("Resource Deleted Successfully");
  });
});

router.get("/exercisetitles", async (req, res) => {
  const user_id = parseInt(req.query.user_id);
  const val = req.query.val;

  const get_titles = (user_id, val) => {
    let q =
      "SELECT title, user_id FROM exercises WHERE user_id=? AND title LIKE ? GROUP BY title";
    if (!val) {
      q =
        "SELECT title, user_id, COUNT(*) as times FROM exercises GROUP BY title ORDER BY times DESC LIMIT 5";
    }
    return new Promise((resolve, reject) => {
      connection.query(q, [user_id, `%${val}%`], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  };

  try {
    const response = await get_titles(user_id, val);
    return res.status(200).json({ titles: response });
  } catch (error) {
    return res
      .status(500)
      .send("Server Error. Something wrong with fetching titles");
  }
});

module.exports = router;
