module.exports = (app, db, session, passport, ObjectId, LocalStrategy, bcrypt, ) => {

  const GitHubStrategy = require('passport-github').Strategy;
  const dotenv = require('dotenv').config();
    
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        cookie: { secure:false }
      }),passport.initialize(),passport.session());

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

      passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: 'https://nodeExpress.mohitpatel9.repl.co/auth/github/callback'
      },
        function(accessToken, refreshToken, profile, cb) {
          console.log(profile);
          //Database logic here with callback containing your user object
        }
      ));
  
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
              else if(!bcrypt.compareSync(password, user.password)){
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
} 