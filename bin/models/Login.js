var mongoose = require('mongoose');
var bCrypt = require('bcrypt');

function cryptPassword (password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

function capitalize (val){
    if (typeof val !== 'string') val = '';
    return val.charAt(0).toUpperCase() + val.substring(1);
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

var LoginSchema = new mongoose.Schema({
    name: {
        first: {type: String, set: capitalize, trim: true, default: ""},
        last: {type: String, set: capitalize, trim: true, default: ""}
    },
    email: {type: String, required: true, unique: true, validator: validateEmail},
    password: {type: String, required: true, set: cryptPassword},
    enabled: Boolean,
    lastLogin: Date,
    comment: String,
    created_at    : { type: Date },
    updated_at    : { type: Date }
});

var Login = mongoose.model('Login', LoginSchema);

Login.newLogin = function(email, password, callback){
    this.findOne({email: email})
        .exec(function(err, user){
        if (err) callback(err, null);
        else if  (!user) callback(null, false);
        else if (user.enabled && bCrypt.compareSync(password, user.password)){ //cryptPassword(password) == user.password){
            user.lastLogin = new Date();
            user.save();
            callback(null, user);
        }
        else callback(null, false);
    })
};
Login.findByEmail = function(email, callback){
    this.findOne({email: email}, callback);
};
Login.findById = function(id, callback){
    this.findOne({_id: id}, callback);
};

// Pre save
LoginSchema.pre('save', function(next) {
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

module.exports = Login;