var login = require(appRoot + '/passport/login');
var User = require(appRoot + '/bin/models/Login');

module.exports = function(passport){

    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        //console.log('serializing user: ');
        //console.log(user);
        done(null, {email: user.email, id: user._id});
    });

    passport.deserializeUser(function(user, done) {
        User.findById(user.id, function(err, user) {
            //console.log('deserializing user:',user);
            done(err, user);
        });
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport);

};