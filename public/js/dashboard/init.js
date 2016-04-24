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
                        "<tr>" +
                        "<td></td>" +
                        "<td class='userName'><a href='/user/"+key+"'>" + user.userName + "</a></td>" +
                        "<td>" +
                        "<span>" + Object.keys(user.clients).length+ " <a onclick='action(\""+key+"\")'><span id='action-"+key+"'>Display</span> clients</a></span>" +
                        "<table class='table table-condensed' style='display: none;font-size: small;' id='" + key + "'>" +
                        "<thead>" +
                        "<tr>" +
                        "<th>Hostname</th>" +
                        "<th>Mac Address</th>" +
                        "<th>OS</th>" +
                        "</tr>" +
                        "<tbody>";
                        for (var key2 in user.clients){
                            client = user.clients[key2];
                            htmlString+=
                                "<tr>" +
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