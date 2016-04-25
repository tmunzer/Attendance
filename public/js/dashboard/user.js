function init() {
    updateTimeline();
}

function updateCharts() {

    showLoading("tableClients");

    var reqId = new Date().getTime();

    $.ajax({
        method: 'POST',
        url: '/api/user/' + userId + '/clients',
        data: {
            reqId: reqId
        }
    }).done(function (data) {
        var htmlString, client;
        if (data.error) displayModal("API", data.error);
        else {
            $('#userName').text(data.user.userName);
            htmlString =
                "<table class='table table-condensed' id='clients'>" +
                "<thead>" +
                "<tr>" +
                "<th>Status</th>" +
                "<th>Hostname</th>" +
                "<th>Mac Address</th>" +
                "<th>OS</th>" +
                "</tr>" +
                "<tbody>";
            for (var key in data.user.client_ids) {
                client = data.user.client_ids[key];
                htmlString +=
                    "<tr>";
                if (!client.status)
                    htmlString +=
                        '<td>' +
                        '<span class="fa-stack fa-lg tm" title="' + client.hostName + ' is currently not connected">' +
                        '<i class="fa fa-circle fa-stack-2x" style="color: #aca5a3"></i>' +
                        '<i class="fa fa-wifi fa-stack-1x fa-inverse" style="color: white"></i>' +
                        '</span>' +
                        '</td>';
                else {
                    var color;
                    var healthString =
                        client.hostName + ' is currently connected <br>' +
                        'Health: ' + client.status.clientHealth + '<br>' +
                        'Application Health: ' +
                        '<span style=\'color:' + getHealthColor(client.status.applicationHealth) + '\'>' + client.status.applicationHealth + '</span><br>' +
                        'Network Health: <span style=\'color:' + getHealthColor(client.status.networkHealth) + '\'>' + client.status.networkHealth + '</span><br>' +
                        'Radio Health: <span style=\'color:' + getHealthColor(client.status.radioHealth) + '\'>' + client.status.radioHealth + '</span>';
                    if (client.status.clientHealth == "100") {
                        color = "#75D064";
                    }
                    else if (client.status.clientHealth >= "50") {
                        color = "rgb(255, 207, 92)";
                    }
                    else {
                        color = "#d04d49";
                    }
                    htmlString +=
                        '<td>' +
                        '<span class="fa-stack fa-lg tm" title="' + healthString + '">' +
                        '<i class="fa fa-circle fa-stack-2x" style="color: ' + color + '"></i>' +
                        '<i class="fa fa-wifi fa-stack-1x" style="color: white"></i>' +
                        '</span>' +
                        '</td>';
                }
                htmlString +=
                    "<td>" + client.hostName + "</td>" +
                    "<td>" + client.macAddress + "</td>" +
                    "<td>" + client.os + "</td>" +
                    "</tr>";
            }
            htmlString +=
                "</tbody>" +
                "<thead>" +
                "</table>" +
                "</td>" +
                "</tr>";
            $("#tableClientsData").html(htmlString);
            showData("tableClients");
        }
        $("#clients").find("span[title]").tooltips();
    });
}

function getHealthColor(health) {
    if (health == '100') return "#75D064";
    else if (health >= '50') return "rgb(255, 207, 92)";
    else return "#d04d49";
}