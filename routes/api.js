var express = require('express');
var router = express.Router();
var ACS = require(appRoot + "/bin/aerohive/api/main");
var User = require(appRoot + "/bin/models/acsUser");
var Session = require(appRoot + "/bin/models/acsSession");
var Client = require(appRoot + "/bin/models/acsClient");
var events = require('events');

router.post("/timeline/all", function (req, res, next) {
    var startTime = new Date(req.body.startTime);
    var endTime = new Date(req.body.endTime);
    var reqId = req.body.reqId;
    var duration = endTime - startTime;
    var timeUnit;
    var userCount = [];
    var i = 0;
    var done = 0;
    var turns = 0;
    // set the TimeUnit depending on the duration to fit the ACS API constraints
    if (duration <= 86400000) timeUnit = 1 * 60 * 1000; // when day > 1 minute
    else if (duration <= 604800000) timeUnit = 10 * 60 * 1000; // when week > 10 minutes
    else if (duration <= 2674800000) timeUnit = 1 * 60 * 60 * 1000; // when month > 1 hour
    else timeUnit = 8 * 60 * 60 * 1000; // else > 8 hours
    turns = parseInt((duration / timeUnit).toFixed(0));
    while (startTime <= endTime) {
        Session.distinct("user_id", {
            $and: [
                {start: {$lte: new Date(startTime.getTime() + timeUnit)}},
                {
                    $or: [
                        {end: 0},
                        {end: {$gte: startTime }}
                    ]
                }
            ]
        })
            .exec(function (err, data) {
                done++;
                if (err) logger.error(err);
                else userCount[this.i] = {time: this.time, userCount: data.length};
                if (done == turns+1) res.json({data: userCount, reqId: reqId});
            }.bind({i: i, time: startTime}));
        i++;
        startTime = new Date(startTime.getTime() + timeUnit);
    }
});
router.post("/user/list", function (req, res, next) {
    var startTime = new Date(req.body.startTime);
    var endTime = new Date(req.body.endTime);
    var reqId = req.body.reqId;
    var users = {};
    var done = 0;
    var turns = -1;
    var ee = new events.EventEmitter();
    ACS.monitor.clients(vpcUrl, accessToken, ownerId, function(err, acsData){
        if (err) res.json(err);
        else {
            Session
                .find({
                    $and: [
                        {start: {$lt: endTime}},
                        {
                            $or: [
                                {end: 0},
                                {end: {$gt: startTime}}
                            ]
                        }]
                })
                .exec(function (err, sessions) {
                    turns = sessions.length * 2;
                    sessions.forEach(function(session){
                        if (users.hasOwnProperty(session.user_id)) ee.emit("done");
                        else {
                            users[session.user_id] = {userName: "", clients: {}};
                            User.findOne({_id: session.user_id}, function(err, user){
                                users[this.user_id].userName = user.userNameAnonymized;
                                for (var i = 0; i < acsData.length; i++) {
                                    if (acsData[i].userName == user.userName) users[this.user_id].status = true;
                                }
                                ee.emit("done")
                            }.bind({user_id: session.user_id}));

                        }
                        if (users[session.user_id].hasOwnProperty(session.client_id)) ee.emit("done");
                        else {
                            users[session.user_id].clients[session.client_id] = {hostName: "", os: "", macAddress: ""};
                            Client.findOne({_id: session.client_id}, function(err, client){
                                users[this.user_id].clients[this.client_id].hostName = client.hostNameAnonymized;
                                users[this.user_id].clients[this.client_id].os = client.os;
                                users[this.user_id].clients[this.client_id].macAddress = client.macAddressAnonymized;
                                for (var i = 0; i < acsData.length; i++) {
                                    if (acsData[i].hostName == client.hostName)
                                        users[this.user_id].clients[this.client_id].status = {
                                            "clientHealth": acsData[i].clientHealth,
                                            "applicationHealth": acsData[i].applicationHealth,
                                            "networkHealth": acsData[i].networkHealth,
                                            "radioHealth": acsData[i].radioHealth
                                        };
                                }
                                ee.emit("done")
                            }.bind({user_id: session.user_id, client_id: session.client_id}));
                        }
                    })
                });
        }
    });

    ee.on("done", function(){
        done ++;
        if (done == turns) {
            res.json({users: users, reqId: reqId});
        }
    })
});
module.exports = router;
