'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session')
const passport = require('passport')
const { ObjectId } = require('mongodb')
const mongo = require('mongodb').MongoClient

const app = express();

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine','pug')
app.set('views','./views/pug')

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure:false }
}))
app.use(passport.initialize())
app.use(passport.session())


mongo.connect(process.env.MONGO_URI,{ useUnifiedTopology: true }, (err, db) => {
  if(err){
    console.log("database error" + err)
  }else{
    console.log("database connected")
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log('Listening on port ' + PORT);
    });

    app.route('/').get((req, res) => {
      res.render('index',{ title: 'Hello', message: 'Please log in' })
    });
    
    passport.serializeUser((user, done )=> {
      done(null, user._id)
    })
    
    passport.deserializeUser((userId, done) => {
      db.collection('users'.findOne(
        {id: new ObjectId(userId)},
        (err, doc) => {
          done(null, doc)
        }
      ))
    })


  }
})