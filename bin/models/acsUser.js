var crypto = require('crypto');
var mongoose = require('mongoose');
var Device = require(appRoot + "/bin/models/acsClient");

function randomVal (){
    return crypto.randomBytes(Math.ceil(6/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,6);   // return required number of characters
}

function anonymize(val){
    return "USER-" + randomVal();
}

var UserSchema = new mongoose.Schema({
    userName: {type: String, required: true},
    userNameAnonymized: {type: String, set: anonymize, required: true},
    client_ids: [{type: mongoose.Schema.ObjectId, ref: "Client"}],
    created_at    : { type: Date },
    updated_at    : { type: Date }
});

var User = mongoose.model('User', UserSchema);
// Pre save
UserSchema.pre('save', function(next) {
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

module.exports = User;
