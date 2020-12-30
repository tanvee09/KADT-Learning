const LocalStrategy = require("passport-local").Strategy;
const {User} = require('./models/userModel.js');
const bcrypt = require("bcrypt");

function initialize(passport) {
  console.log("Initialized");

  const authenticateUser = (email, password, done) => {
        console.log(email);
        User.findOne({email: email}, function(err, userFound){
            if (err)
            {
                // errors = "Error Occured In The Database";
                // console.log(err);
                // return res.redirect("/login");
                return done(null, false, {
                    message: "Error Occured In The Database"
                });
            }
            else if (userFound)
            {
                bcrypt.compare(password, userFound.password, function(err1, result){
                    if (err1)
                    {
                        // errors = "Error Occured In The Database";
                        // console.log(err1);
                        // return res.redirect("/login");
                        return done(null, false, {
                            message: "Error Occured In The Database"
                        });
                    }
                   
                    if (result) {
                        return done(null, userFound);
                    } else {
                        return done(null, false, { message: "Password is incorrect" });
                    }
                });
            }
            else
            {
                return done(null, false, {
                    message: "No user with that email address."
                });
            }
        });
  };

  

  passport.use(
    'users',
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      authenticateUser
    )
  );


  passport.serializeUser((user, done) => done(null, { email: user.email}));

  passport.deserializeUser((obj, done) => {
    // pool.query(`SELECT * FROM users WHERE id = $1`, [obj.id], (err, results) => {
    //   if (err) {
    //     return done(err);
    //   }
    //   console.log(`ID is ${results.rows[0].id}`);
    //   return done(null, results.rows[0]);
    // });
    User.findOne({email: obj.email}, function(err, userFound){
        if (err) {
            return done(err);
        } else {
            // console.log(`Email is ${userFound.email}`);
            return done(null, userFound);
        }
    });
        
  });

}

module.exports = initialize;