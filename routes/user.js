var express = require('express');
var router = express.Router();
var ACS = require(appRoot + "/bin/aerohive/api/main");
var User = require(appRoot + "/bin/models/acsUser");
var Session = require(appRoot + "/bin/models/acsSession");
var Client = require(appRoot + "/bin/models/acsClient");
var events = require('events');


router.get('/:userId', function (req, res, next) {
    res.render('user', {title: 'Attendance'});
});

module.exports = router;
