var mongoose = require('mongoose');
var Device = require(appRoot + "/bin/models/acsClient");
var User  = require(appRoot + "/bin/models/acsUser");


var SessionSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.ObjectId, ref: "User", required: true},
    client_id: {type: mongoose.Schema.ObjectId, ref: "Client", required: true},
    device_id: {type: String, required: true},
    start: {type: Date, required: true},
    end: {type: Date, required: false},
    ssid: String,
    ipAddress: String,
    vlan: String,
    usage: Number,
    userProfile: String,
    clientHealth: Number,
    applicationHealth: Number,
    networkHealth: Number,
    radioHealth: Number,
    updated: Boolean,
    created_at    : { type: Date },
    updated_at    : { type: Date }
});

var Session = mongoose.model('Session', SessionSchema);
// Pre save
SessionSchema.pre('save', function(next) {
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

module.exports = Session;
