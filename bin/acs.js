var ACS = require(appRoot + "/bin/aerohive/api/main");
var Client = require(appRoot + "/bin/models/acsClient");
var Session = require(appRoot + "/bin/models/acsSession");
var User = require(appRoot + "/bin/models/acsUser");

var events = require('events');



module.exports = function (vpcUrl, accessToken, ownerId) {
    var eventEmitter = new events.EventEmitter();
    var acsClients = [];
    var date = new Date();
    var done = 0;
    console.log("---- Init ACS open turn : process started ---- " + date);
    Session.find({end: 0}, function (err, sessions) {
        sessions.forEach(function (session) {
            session.update({updated: false}, function (err) {
                done++;
                if (err) console.error("Unable to update session " + session._id);
                if (done == sessions.length) console.log("---- Init ACS open turn : process ended ----");
            });
        })
    });
    ACS.monitor.clients(vpcUrl, accessToken, ownerId, function (err, data) {
        if (err) console.error(err);
        else if (data) {
            acsClients = data;
            eventEmitter.emit("parseUser", 0, acsClients[0]);
        } else console.error("no data");
    });

    eventEmitter
        .on("parseUser", function (index, acsClient) {
            User
                .findOne({"userName": acsClient.userName})
                .populate("client_ids")
                .exec(function (err, user) {
                    if (err) console.error(err);
                    else if (user) {
                        eventEmitter.emit("parseClient", index, acsClient, user);
                    } else {
                        console.info("New User: " + acsClient.userName);
                        User({
                            userName: acsClient.userName,
                            userNameAnonymized: acsClient.userName
                        }).save(function (err, user) {
                            if (err) console.log(err);
                            eventEmitter.emit("parseClient", index, acsClient, user);
                        });
                    }
                });
        })
        .on("parseClient", function (index, acsClient, user) {
            var client = undefined;
            if (user.client_ids) {
                user.client_ids.forEach(function (userDevice) {
                    if (userDevice.acsId == acsClient.clientId) client = userDevice;
                });
            }
            if (client) {
                eventEmitter.emit("parseSession", index, acsClient, user, client);
            }
            else {
                console.info("New Device: " + acsClient.hostName + " - " + acsClient.clientMac);
                Client.create({
                    acsId: acsClient.clientId,
                    user_id: user._id,
                    hostName: acsClient.hostName,
                    hostNameAnonymized: acsClient.hostName,
                    os: acsClient.os,
                    macAddress: acsClient.clientMac,
                    macAddressAnonymized: acsClient.clientMac
                }, function (err, client) {
                    if (err) console.error(err);
                    user.client_ids.push(client._id);
                    user.save();
                    eventEmitter.emit("parseSession", index, acsClient, user, client);
                });
            }
        })

        .on("parseSession", function (index, acsClient, user, client) {
            Session
                .findOne({user_id: user._id, client_id: client._id, end: new Date(0)})
                .exec(function (err, session) {
                    if(err) console.error(err);
                    else {
                        if (session) {
                            session.update({
                                updated: true,
                                usage: acsClient.usage,
                                ipAddress: acsClient.ip,
                                vlan: acsClient.vlan,
                                userProfile: acsClient.userProfile,
                                clientHealth: acsClient.clientHealth,
                                applicationHealth: acsClient.applicationHealth,
                                networkHealth: acsClient.networkHealth,
                                radioHealth: acsClient.radioHealth
                            }, function (err) {
                                if (err) console.error("Unable to update session " + session._id);
                                eventEmitter.emit("parseFinished", index);
                            });
                        }
                        else {
                            console.info("New Session: " + acsClient.ssid + " - " + acsClient.ip);
                            Session.create({
                                user_id: user._id,
                                client_id: client._id,
                                device_id: acsClient.deviceId,
                                start: new Date(acsClient.sessionStart).getTime(),
                                end: 0,
                                ssid: acsClient.ssid,
                                ipAddress: acsClient.ip,
                                vlan: acsClient.vlan,
                                usage: acsClient.usage,
                                userProfile: acsClient.userProfile,
                                clientHealth: acsClient.clientHealth,
                                applicationHealth: acsClient.applicationHealth,
                                networkHealth: acsClient.networkHealth,
                                radioHealth: acsClient.radioHealth,
                                updated: true
                            }, function (err, session) {
                                if (err) console.error(err);
                                else {
                                    client.session_ids.push(session._id);
                                    client.save();
                                }
                                eventEmitter.emit("parseFinished", index);
                            });
                        }
                    }

                })
        })
        .on("parseFinished", function (index) {
            index++;
            if (index == acsClients.length) {
                var done = 0;
                console.log("---- Init ACS close turn : process started ----");
                Session.find({end: 0, updated: false}, function (err, sessions) {
                    if (err) console.error(err);
                    else {
                    sessions.forEach(function (session) {
                        console.log("Session ended: IP " + session.ipAddress + " on SSID " + session.ssid);
                        session.update({end: new Date().getTime()}, function(err){
                            if (err) console.error("Unable to update session " + session._id);
                        });
                        done++;
                    });
                    console.log("---- Init ACS close turn : process ended ----" + date);
                    }
                })
            } else eventEmitter.emit("parseUser", index, acsClients[index]);
        })
};


