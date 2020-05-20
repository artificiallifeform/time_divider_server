require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const connection = mysql.createConnection()
const mongoConnect = require('./utils/db').mongoConnect;

const authRoute = require('./routes/authRoute');
const exerciseRoute = require('./routes/exerciseRoute');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json({ extended: false }));
app.use('/auth', authRoute);
app.use('/exercise', exerciseRoute);

const PORT = process.env.PORT;
mongoConnect(() => {
  app.listen(PORT, () => {
    console.log('Server up and running');
  });
})

// mongo "mongodb+srv://cluster0-renrv.mongodb.net/test"  --username egor2
