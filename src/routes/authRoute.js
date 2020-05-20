const router = require('express').Router();
const getDb = require('../utils/db').getDb;

router.post('/', async (req, res) => {
  const { username } = req.body;
  console.log(username);
  const db = getDb();
  const collection = db.collection('users');

  try {
    const response = await collection.findOne({ username }, { projection: { _id: 0 } });
    if(response) {
      return res.status(200).json({ user: response });
    } else {
      const response2 = await collection.insertOne({ username });
      return res.status(200).json({ user: response2.ops[0] });
    }

  } catch (err) {
    return res.status(500).send('Server Error');
  }
});

module.exports = router;