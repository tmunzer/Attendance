var https = require('https');
var ApiConf = require(appRoot + "/config");


module.exports.apiRequest = function (vpcUrl, accessToken, path, callback) {

    var result = {};
    result.request = {};
    result.result = {};
    var options = {
        host: vpcUrl,
        port: 443,
        path: path,
        method: 'GET',
        headers: {
            'X-AH-API-CLIENT-SECRET': ApiConf.secret,
            'X-AH-API-CLIENT-ID': ApiConf.clientId,
            'X-AH-API-CLIENT-REDIRECT-URI': ApiConf.redirectUrl,
            'Authorization': "Bearer " + accessToken
        }
    };

    result.request.options = options;
    var req = https.request(options, function (res) {
        result.result.status = res.statusCode;
        console.info('\x1b[34mREQUEST QUERY\x1b[0m:', options.path);
        console.info('\x1b[34mREQUEST STATUS\x1b[0m:',result.result.status);
        result.result.headers = JSON.stringify(res.headers);
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            if (data != '') {
                if (data.length > 400) console.info("\x1b[34mRESPONSE DATA\x1b[0m:", data.substr(0, 400) + '...');
                else console.info("\x1b[34mRESPONSE DATA\x1b[0m:", data);   
                var dataJSON = JSON.parse(data);
                result.data = dataJSON.data;
                result.error = dataJSON.error;
            }
            switch (result.result.status) {
                case 200:
                    callback(null, result.data);
                    break;
                default:
                    console.error("\x1b[31mRESPONSE ERROR\x1b[0m:", JSON.stringify(result.error));
                    callback(result.error, result.data);
                    break;

            }
        });
    });
    req.on('error', function (err) {
        console.error("\x1b[31mREQUEST QUERY\x1b[0m:", options.path);
        console.error("\x1b[31mREQUEST ERROR\x1b[0m:", JSON.stringify(err));
        callback(err, null);
    });


// write data to request body
    req.write('data\n');
    req.end();


};
