var https = require('https');
var devAccount = require("../../../config.js").devAccount;

module.exports.getPermanentToken = function (authCode, redirectUrl, secret, clientId, callback) {
    var options = {
        host: 'cloud.aerohive.com',
        port: 443,
        path: '/services/acct/thirdparty/accesstoken?authCode=' + authCode + '&redirectUri=' + redirectUrl,
        method: 'POST',
        headers: {
            'X-AH-API-CLIENT-SECRET': secret,
            'X-AH-API-CLIENT-ID': clientId,
            'X-AH-API-CLIENT-REDIRECT-URI': redirectUrl
        }
    };

    var req = https.request(options, function (res) {
        console.info('\x1b[34mREQUEST QUERY\x1b[0m:', options.path);
        console.info('\x1b[34mREQUEST STATUS\x1b[0m:', result.result.status);
        res.setEncoding('utf8');
        res.on('data', function (data) {
            callback(data);
        });
    });

    req.on('error', function (err) {
        callback(err);
    });

    // write data to request body
    req.write('data\n');
    req.end();
};

module.exports.refreshToken = function (xapi, callback) {
    var options = {
        host: 'cloud.aerohive.com',
        port: 443,
        path: 'services/oauth2/token?grant_type=refresh_token&refresh_token=' + xapi.refreshToken,
        method: 'POST',
        headers: {
            'Content-Type':'application/x-www-form-urlencoded'
        }
    };
    var body = {
        'client_secret': secret,
        'client_id': clientId,
        'Authorization': 'Basic ' + xapi.accessToken
    }

    var req = https.request(options, function (res) {
        console.info('\x1b[34mREQUEST QUERY\x1b[0m:', options.path);
        console.info('\x1b[34mREQUEST STATUS\x1b[0m:', result.result.status);
        res.setEncoding('utf8');
        res.on('data', function (data) {
            callback(data);
        });
    });

    req.on('error', function (err) {
        callback(err);
    });

    // write data to request body
    req.write(body+'\n');
    req.end();
}
