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
let bodyParser = require('body-parser');
let bcrypt = require('bcrypt')
let auth = require('./auth')
let routes = require('./routes')
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const passportSocketIo = require('passport.socketio')
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo')(session);
const URI = process.env.MONGO_URI;
const store = new MongoStore({ url: URI });


fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'express.sid',
    secret: process.env.SESSION_SECRET,
    store: store,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
  })
);


app.set('view engine','pug')
app.set('views','./views/pug')


const uri = 'mongodb+srv://mohit:'+ process.env.PW + '@cluster0.qt5iza6.mongodb.net/fcc?retryWrites=true&w=majority'


mongo.connect(uri, { useUnifiedTopology: true },(err, client) => {
  if(err){
    console.log(err)
  }else{
    let db = client.db('fcc')
    console.log("database connected" + err)
    let currentUsers = 0
    
    io.on('connection', socket => {
      ++currentUsers;
      io.emit('user count', currentUsers);
      console.log('user ' + socket.request.user.username + ' connected');
      socket.on('disconnect', () => {
        console.log("A user has discommected")
        --currentUsers;
        io.emit('user count', currentUsers);
        /*anything you want to do on disconnect*/
      });
    });

    auth(app, db, session, passport, ObjectId, LocalStrategy, bcrypt)

    routes(app, db, passport, bodyParser, bcrypt, http)
  }
  function onAuthorizeSuccess(data, accept) {
    console.log('successful connection to socket.io');
  
    accept(null, true);
  }
  
  function onAuthorizeFail(data, message, error, accept) {
    if (error) throw new Error(message);
    console.log('failed connection to socket.io:', message);
    accept(null, false);
  }
})