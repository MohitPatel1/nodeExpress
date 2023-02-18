module.exports = (app, db, passport, bodyParser, bcrypt, http) => {
  
      app.route('/').get((req, res) => {
        res.render('index',{title:'Home page',message:'Please log in', showLogin: true, showRegistration: true, showSocialAuth: true})
      });
      
      app.route("/login").post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
        res.redirect("/profile");
      });

      app.route('/auth/github').get(passport.authenticate('github'))

      app.route('/auth/github/callback').get(passport.authenticate('github' , { failureRedirect: '/'}), (req, res) => {
        req.session.user_id = req.user.id
        res.redirect('profile')
      })
  
      function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
          return next();
        }
        res.redirect('/');
      };
  
      app.route('/profile').get(ensureAuthenticated, (req,res) => {
        res.render(process.cwd() + '/views/pug/profile', {username: req.user.username });
      });
      
      app.route('/chat').get(ensureAuthenticated, (req,res) => {
        res.render(process.cwd() + '/views/pug/chat', {user: req.user });
      });

      app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/')
      })
  
      app.route('/register').post(
        bodyParser.urlencoded({extended: false}),
        (req, res, next) => {
        db.collection('users').findOne(
          {username: req.body.username},
          (err, user) => {
            if(!err && user){
              res.redirect('/')
            }
          }
        );
          const hash = bcrypt.hashSync(req.body.password, 12);
          db.collection('users').insertOne(
             {
               username: req.body.username,
               password: hash
             },
            (err, createdUser) => {
              if(!err && createdUser){
                next();
              }
            }
          )
        }
      );
  
      passport.authenticate('local', {failureRedirect: '/'}),
        (req, res) => {
          res.redirect('/profile')
        }
      
  
      app.use((req, res) => {
        res.status(404)
        .type('text')
        .send('Not Found')
      })
}