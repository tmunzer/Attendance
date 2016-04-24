function init() {
    updateTimeline();
}

function updateCharts() {

    var chart = $('#timeline').highcharts();
    var endTime = chart.xAxis[1].categories[max];
    var startTime = chart.xAxis[1].categories[min];
    // @TODO: Current API limitation
    if (endTime - startTime <= 2678400000) {

        showLoading("returningClients");
        $("#user_list tbody").empty();
        var reqId = new Date().getTime();
        $.ajax({
            method: 'POST',
            url: '/api/user/list',
            data: {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                reqId: reqId
            }
        }).done(function (data) {
            var htmlString, user, client;
            if (data.error) displayModal("API", data.error);
            else {
                //showData("returningClients");
                //displayWidgetChart("returningClientsChart", "Number of Returning Clients", xAxisData, dataReturningClients);
                for (var key in data.users){
                    user = data.users[key];
                    htmlString =
                        "<tr>";
                    if (user.status)
                        htmlString +=
                            '<td>' +
                            '<span class="fa-stack fa-lg tm" title="'+user.userName+' is currently connected">' +
                            '<i class="fa fa-circle fa-stack-2x" style="color: #75D064"></i>' +
                            '<i class="fa fa-wifi fa-stack-1x fa-inverse" style="color: white"></i>' +
                            '</span>' +
                            '</td>';
                    else
                        htmlString +=
                            '<td>' +
                            '<span class="fa-stack fa-lg tm" title="'+user.userName+' is currently not connected">' +
                            '<i class="fa fa-circle fa-stack-2x" style="color: #aca5a3"></i>' +
                            '<i class="fa fa-wifi fa-stack-1x" style="color: white"></i>' +
                            '</span>' +
                            '</td>';
                    htmlString +=
                        "<td class='userName'><a href='/user/"+key+"'>" + user.userName + "</a></td>" +
                        "<td>" +
                        "<span><a onclick='action(\""+key+"\")'>" + Object.keys(user.clients).length+ " Client(s)</a></span>" +
                        "<table class='table table-condensed' style='display: none;font-size: small;' id='" + key + "'>" +
                        "<thead>" +
                        "<tr>" +
                        "<th>Status</th>" +
                        "<th>Hostname</th>" +
                        "<th>Mac Address</th>" +
                        "<th>OS</th>" +
                        "</tr>" +
                        "<tbody>";
                        for (var key2 in user.clients){
                            client = user.clients[key2];
                            htmlString+=
                                "<tr>";
                            if (!client.status)
                                htmlString +=
                                    '<td>' +
                                    '<span class="fa-stack fa-lg tm" title="'+ client.hostName +' is currently not connected">' +
                                    '<i class="fa fa-circle fa-stack-2x" style="color: #aca5a3"></i>' +
                                    '<i class="fa fa-wifi fa-stack-1x fa-inverse" style="color: white"></i>' +
                                    '</span>' +
                                    '</td>';
                            else {
                                var color;
                                var healthString =
                                    client.hostName+' is currently connected <br>' +
                                    'Health: ' + client.status.clientHealth + '<br>' +
                                    'Application Health: ' +
                                    '<span style=\'color:'+getHealthColor(client.status.applicationHealth)+'\'>' + client.status.applicationHealth + '</span><br>' +
                                    'Network Health: <span style=\'color:'+getHealthColor(client.status.networkHealth)+'\'>' + client.status.networkHealth + '</span><br>' +
                                    'Radio Health: <span style=\'color:'+getHealthColor(client.status.radioHealth)+'\'>' + client.status.radioHealth + '</span>';
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
                                    '<span class="fa-stack fa-lg tm" title="'+healthString+'">' +
                                    '<i class="fa fa-circle fa-stack-2x" style="color: '+color+'"></i>' +
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
                    $("#user_list > tbody:last-child").append(htmlString);
                    console.log(data.users[key]);
                }

            }
            $("#user_list").find("span[title]").tooltips();
        });
    } else {

        showEmpty("returningClients");

    }



    $("#searchUser").on("keyup", function() {
        var value = $(this).val();

        $("table tbody tr").each(function(index) {

                $row = $(this);

                var userName = $row.find("td.userName > a").text();

                if (userName.indexOf(value) >= 0) $(this).show();
                else $(this).hide();
        });
    });
}

function action(key){
    var table = $("#"+key);
    var span = $("#action-"+key);
    if (table.is(":visible")){
        table.fadeOut( "slow", function() {
            span.text("Display");
        });

    } else {
        table.fadeIn( "slow", function() {
            span.text("Hide");
        });

    }
}

function getHealthColor(health){
    if (health == '100') return "#75D064";
    else if (health >= '50') return "rgb(255, 207, 92)";
    else return "#d04d49";
}