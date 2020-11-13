const router = require("express").Router();
const connection = require("../utils/sql_db");

router.get("/all", async (req, res) => {
  const { user_id } = req.query;

  const goals_exercise_list = (user_id) => {
    const q = "SELECT DISTINCT title FROM goals WHERE user_id=?;";

    return new Promise((resolve, reject) => {
      connection.query(q, [user_id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  };

  try {
    const results = await goals_exercise_list(user_id);
    return res.json(results);
  } catch (error) {
    return res.status(500).send("Error in fetching list of exercises");
  }
});

router.get("/total", async (req, res) => {
  const { user_id } = req.query;

  const q =
    "SELECT COUNT(id) AS length FROM goals WHERE user_id=? AND created_at<= DATE_SUB(CURDATE(), INTERVAL 30 DAY);";
  const total_goals = (user_id) => {
    return new Promise((resolve, reject) => {
      connection.query(q, [user_id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  };
  try {
    const goals_length = await total_goals(user_id);
    return res.status(200).json(goals_length[0].length);
  } catch (error) {
    res.stays(500).send("Error in fetching goals amount > 30 days");
  }
});

router.get("/:offset", async (req, res) => {
  const { offset } = req.params;
  const { user_id } = req.query;

  const get_goals_page = (offset, user_id) => {
    const q =
      "SELECT * FROM goals WHERE user_id=? AND created_at <= DATE_SUB(CURDATE(), INTERVAL 30 DAY) ORDER BY created_at LIMIT ?, 10";

    let ofs = parseInt(offset) - 1;
    return new Promise((resolve, reject) => {
      connection.query(q, [user_id, ofs * 10], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  };

  try {
    const goals_per_page = await get_goals_page(offset, user_id);
    return res.status(200).json(goals_per_page);
  } catch (err) {
    res.status(500).send("Server Error while fetching goal history page");
  }
});

router.get("/", async (req, res) => {
  const { spec, term, user_id } = req.query;

  const fetchGoals = (user_id, search_term, spec) => {
    // Two cases => search_term === timeline THEN specifier will be amount of days
    //           => search_term === exercsises THEN specifier will be a title
    const q1 =
      "SELECT * FROM goals WHERE user_id=? AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY) ORDER BY created_at";

    const q2 =
      "SELECT * FROM goals WHERE user_id=? AND title=? ORDER BY created_at";

    let q = "";

    search_term === "timeline" ? (q = q1) : (q = q2);

    return new Promise((resolve, reject) => {
      connection.query(q, [user_id, spec], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  };

  try {
    const goals = await fetchGoals(user_id, term, spec);
    return res.status(200).json(goals);
  } catch (error) {
    res.status(500).send("Something went wrong in fetching Goals History");
  }
});

module.exports = router;
