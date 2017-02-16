var apiRequest = require(appRoot + "/bin/aerohive/api/req").apiRequest;
var Device = require(appRoot + "/bin/aerohive/models/device.js");


module.exports = function (vpcUrl, accessToken, ownerId, callback) {

    var path = '/xapi/v1/monitor/clients?ownerId=' + ownerId;

    // send the API request
    apiRequest(vpcUrl, accessToken, path, function (err, result) {
        if (err){
            callback(err, result);
        }
        else if (result){
            callback(null, result);
        } else {
            callback(null, []);
        }

    })
};