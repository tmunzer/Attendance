var express = require('express');
var router = express.Router();
var User = require(appRoot + "/bin/models/Login");

/* GET home page. */
router.get('/login/', function (req, res, next) {
    User({ email: "tmunzer@aerohive.com", password: "aerohive", enabled: true }).save();
    res.render('login', { title: 'Attendance - Login', message: req.flash("message") });
});
/* Handle Login POST */
router.post('/login/', passport.authenticate('login', {
    successRedirect: '/home/',
    failureRedirect: '/login/',
    failureFlash: true
}));

/* Handle Logout */
router.get('/logout/', function (req, res) {
    console.info("\x1b[32minfo\x1b[0m:", "User " + req.user.username + " is now logged out.");
    req.logout();
    req.session.destroy();
    res.redirect('/login/');
});

router.get("/", function (req, res) {
    res.redirect("/home");
})
module.exports = router;
