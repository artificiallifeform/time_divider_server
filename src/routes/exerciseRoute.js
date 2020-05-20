const router = require('express').Router();
const mongodb = require('mongodb');

const getDb = require('../utils/db').getDb;

router.post('/', async (req, res) => {
  const db = getDb();
  const collection = db.collection('options');

  const { username, seconds = 0, value, date } = req.body;

  if(!username) {
    return res.status(401).json({ errMsg: 'You are not authorized. You just need to login' });
  } 

  const response = await collection.findOne(
    { username, date: new Date(date), "optionsPerDay.value": value }
  );

  try {
    if(response) {
      // If <Exercise> Already in Options Array - Update current field
      console.log(value, seconds);
      await collection.updateOne(
        { username, date: new Date(date), "optionsPerDay.value": value },
        { $set: { "optionsPerDay.$.seconds": seconds } }
      );
      return res.status(201).json({ sucMsg: 'Field Was Updated' });
    } else {
      await collection.updateOne(
        { username, date: new Date(date) },
        { $push: { optionsPerDay: { value, seconds, optionId: mongodb.ObjectId() } } },
        { upsert: true }
      );
      return res.status(201).json({ sucMsg: 'Field Was Added' });
    }
    
  } catch (err) {
    res.status(500).send('Server Error');
  }

});

router.post('/getexercise', async (req, res) => {
  const db = getDb();
  const collection = db.collection('options');

  const { username, date } = req.body;
  
  if(!username) return res.status(401).json({ errMsg: 'You need to login to get exercises' });

  try {
    const response = await collection.findOne({ username, date: new Date(date) }, { projection: { optionsPerDay: 1 } });
    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).send('Server Error');
  }
});

module.exports = router;