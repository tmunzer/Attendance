

module.exports.configuration = {
    location: require(appRoot + "/bin/aerohive/api/configuration/location")
};

module.exports.monitor = {
    devices: require(appRoot + "/bin/aerohive/api/monitor/devices"),
    clients: require(appRoot + "/bin/aerohive/api/monitor/clients")
};

module.exports.clientlocation = {
    clienttimeseries: require(appRoot + "/bin/aerohive/api/clientlocation/clienttimeseries"),
    clientcount: require(appRoot + "/bin/aerohive/api/clientlocation/clientcount"),
    clientcountWithEE: require(appRoot + "/bin/aerohive/api/clientlocation/clientcount").withEE
};