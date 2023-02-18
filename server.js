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


fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
      console.log('A user has connected');
    });

    auth(app, db, session, passport, ObjectId, LocalStrategy, bcrypt)

    routes(app, db, passport, bodyParser, bcrypt, http)
  }
})