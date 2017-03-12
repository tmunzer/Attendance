var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
    console.info("\x1b[32minfo\x1b[0m:",req.user);
    res.render('home', {title: 'Attendance'});

});

module.exports = router;
