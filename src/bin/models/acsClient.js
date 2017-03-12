var crypto = require('crypto');
var mongoose = require('mongoose');
var User  = require(appRoot + "/bin/models/acsUser");
var Session = require(appRoot + "/bin/models/acsSession");

function randomVal (){
    return crypto.randomBytes(Math.ceil(6/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,6);   // return required number of characters
}

function hostnameMd5(){
    return "STA-"+randomVal();
}
function macAddressMd5(){
    return "MAC-"+randomVal();
}
var ClientSchema = new mongoose.Schema({
    acsId: {type: Number, required: true},
    user_id: {type: mongoose.Schema.ObjectId, ref: "User"},
    hostName: {type: String},
    hostNameAnonymized: {type: String, set: hostnameMd5},
    os: String,
    macAddress: {type: String, required: true},
    macAddressAnonymized: {type: String, required: true, set: macAddressMd5},
    session_ids: [{type: mongoose.Schema.ObjectId, ref: "Session"}],
    created_at    : { type: Date },
    updated_at    : { type: Date }
});

var Client = mongoose.model('Client', ClientSchema);
// Pre save
ClientSchema.pre('save', function(next) {
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

module.exports = Client;
