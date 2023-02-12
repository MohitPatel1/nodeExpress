'use strict';
const dotenv = require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const { ObjectId } = require('mongodb')
const mongo = require('mongodb').MongoClient
let bodyParser = require('body-parser')
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
}),passport.initialize(),passport.session());

const uri = 'mongodb+srv://mohit:'+ process.env.PW + '@cluster0.qt5iza6.mongodb.net/fcc?retryWrites=true&w=majority'


mongo.connect(uri, { useUnifiedTopology: true },(err, client) => {
  if(err){
    console.log(err)
  }else{
    let db = client.db('fcc')
    console.log("database error" + err)
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log('Listening on port ' + PORT);
    });

    app.route('/').get((req, res) => {
      res.render('index',{title:'Home page',message:'Please log in', showLogin: true})
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

    let findUserDocument = new LocalStrategy(
      (username, password, done) => {
        db.collection('users').findOne(
          {username : username},
          (err, user) => {
            console.log(`User ${username} attempted to log in.`);
            if(err){
              done(err)
            }
            else if(!user){
              done(null, false)
            }
            else if(user.password !== password){
              done(null, false)
            }
            else{
              done(null, user)
            }
          }
        )
      }
    )
    passport.use(findUserDocument)
    
    // app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }))
    app.route("/login").post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
  res.redirect("/profile");
});

    function ensureAuthenticated(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect('/');
    };
    
    // app.get('/profile', ensureAuthenticated , (req, res) => {
    //   res.render('profile');
    // })
    app.route('/profile').get(ensureAuthenticated, (req,res) => {
    res.render(process.cwd() + '/views/pug/profile');
 });
    
  }
})