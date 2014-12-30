$(document).ready(function () {

    NProgress.configure({ ease: 'ease', speed: 500 });
    NProgress.start();

    $("#contract").on("click", function () {
        $("#infobox").hide();
        $("#showinfo").show();
    });

    $("#showinfo").on("click", function () {
        $("#showinfo").hide();
        $("#infobox").show();
    });

    $(document).tooltip({
        content: function () {
            return $(this).prop('title');
        },
        show: {duration: 200}
    });

    var bridge_counter = 0;

    $.getJSON("parsing/grouped.json", function (report_data) {

        $.each(report_data, function (cc, transports) {

            if (Object.getOwnPropertyNames(transports).length != 0) {

                // for every country

                $("#bridge_results").append("<div class='country " + cc + "'>");
                $("." + cc).append("<h3>" + cc + "</h3>");

                $.each(transports, function (transportName, bridges) {

                    if (Object.getOwnPropertyNames(bridges).length == 0) {
                    } else {

                        // for every transport in the country
                        $("." + cc).append("<div class='transport " + cc + transportName + "'>");
                        var transportNameS = $("." + cc + transportName);
                        transportNameS.append("<h4>" + transportName + "</h4>");
                        transportNameS.append("<div class='transport_summary transport" + cc + transportName + "'>");

                        // Summary data per transport
                        $.getJSON("parsing/summarized.json", function (summary_data) {
                            var summaryForTransport = summary_data[cc][transportName];
                            summaryForTransport.sort(function (a, b) {
                                return new Date(Object.keys(a)) - new Date(Object.keys(b));
                            });

                            // Find missing dates
                            var missing = [];
                            var d = new Date(Object.keys(summaryForTransport[0]));
                            for (k = 1; k < summaryForTransport.length; k++) {
                                do {
                                    var d2 = new Date(d.getFullYear(),
                                        d.getMonth(),
                                        d.getDate() + 1);
                                    if (!summaryForTransport[k].hasOwnProperty(d2.yyyymmdd())) {
                                        var ymd = d2.yyyymmdd();
                                        var o = {};
                                        o[ymd] = 'gray';
                                        missing.push(o);
                                    }
                                    d = d2;
                                } while (!summaryForTransport[k].hasOwnProperty(d.yyyymmdd()));
                            }

                            if (missing.length > 0) {
                                summaryForTransport = summaryForTransport.concat(missing);
                                summaryForTransport.sort(function (a, b) {
                                    return new Date(Object.keys(a)) - new Date(Object.keys(b));
                                });
                            }

                            for (var k = 0; k < summaryForTransport.length; k++) {
                                var color_class = "";
                                var summaryColor = summaryForTransport[k][Object.keys(summaryForTransport[k])];
                                if (summaryColor == "green") {
                                    color_class = "yes";
                                }
                                if (summaryColor == "red") {
                                    color_class = "no";
                                }
                                if (summaryColor == "orange") {
                                    color_class = "maybe";
                                }
                                if (summaryColor == "gray") {
                                    color_class = "no_data";
                                }

                                // Setting labels and classes
                                var datestring = new Date(Object.keys(summaryForTransport[k])).yyyymmdd();
                                var label = "<div class='tooltip_date'>" + new Date(Object.keys(summaryForTransport[k])) + "</div>";
                                var entry = $("<div title='' class='result_item result_entry transportsum" + cc + transportName + " " + color_class + " hClass" + datestring + "_" + cc + transportName + "'></div>");
                                $(".transport" + cc + transportName).append(entry);
                                $(entry).prop('title', label);
                                if (k % 15 == 0) {
                                    $(".transport" + cc + transportName).append("<div style='margin-left:" + k * 5.5 + "px' class='date_indicator'>" + new Date(Object.keys(summaryForTransport[k])).yyyymmdd() + "</div>")
                                }

                            }
                        });
                        transportNameS.append("<h4 class='details_toggler' style='display: inline-block; float: right; font-weight: bold;' id='transportContent" + cc + transportName + "_toggler'>+</h4></div><br />");
                        transportNameS.append("<div class='transport_reports transportContent" + cc + transportName + "'>");
                        $(".transportContent" + cc + transportName).hide();

                        for (var j = 0; j < bridges.length; j++) {

                            $.each(bridges[j], function (key, reports) {

                                // for each bridge of that transport type in the country
                                $(".transportContent" + cc + transportName).append("<div class='bridge_title'>" + key + "</div>");
                                $(".transportContent" + cc + transportName).append("<div class='bridge_result bridge" + bridge_counter + "'>");

                                reports.sort(function (a, b) {
                                    return new Date(a.start_time) - new Date(b.start_time);
                                })


                                for (var i = 0; i < reports.length; i++) {

                                    // for all the reports of each bridge in this country
                                    var date_string = new Date(reports[i].start_time * 1000).yyyymmdd();
                                    var color_class = "";
                                    if (reports[i].status == "ok") {
                                        color_class = "yes";
                                    }
                                    if (reports[i].status == "blocked") {
                                        color_class = "no";
                                    }
                                    if (reports[i].status == "offline") {
                                        color_class = "offline";
                                    }
                                    if (reports[i].status == "inconsistent" || reports[i].status == "invalid") {
                                        color_class = "inconsistent";
                                    }
                                    if (typeof(reports[i].start_time) == "undefined") {
                                        color_class = "probably_no";
                                    }
                                    var label = "<div class='tooltip_date'>" + new Date(reports[i].start_time * 1000) + "</div>";

                                    $.each(reports[i], function (k, v) {
                                        label += "<li>";
                                        label += k + " : " + v;
                                        label += "</li>"
                                    })
                                    var full_url = reports[i].file_url;
                                    var classname = "hClass" + date_string + "_" + cc + transportName;

                                    var entry = $("<div onclick='window.open(\"" + full_url + "\")' title='' class='result_item result_entry " + bridge_counter + " " + color_class + " " + classname + "'></div>");
                                    $(".bridge" + bridge_counter).append(entry);

                                    $(entry).data('label', reports[i]);
                                }

                                bridge_counter += 1;
                            });
                        }
                    }
                    $(".transportContent" + cc + transportName).append("<br /><br /></div>");
                    $("." + cc + transportName).append("</div><div class='hover" + cc + transportName + "'></div>");
                    $("." + cc).append("</div>");

                });
            }

            $("#bridge_results").append("</div>");
        });

        NProgress.done();
        $("#showinfo").show();

        // Expand and contract details
        $("div#bridge_results").find(".country .transport .details_toggler").on("click", function(d){
            var e_id = d.target.id.split("_");
            var div_class = "."+e_id[0];
            if ($(div_class).is(":visible")) {
                $(div_class).hide();
                $(this).text("+");
            } else {
                $(div_class).show();
                $(this).text("-");
            }
        });

    });

});


// Highlighting and showing text on hover
$(this).on("mouseenter", function (d) {
    var classes = d.target.className.split(" ");

    if (d.target.className.indexOf("hClass") > -1) {
        var lastclass = classes[classes.length - 1];
        $('.' + lastclass).css("border", "2px solid orange").css("width", "6px");

        var element = $(d.target).data('label');

        // FIXME: this just to catch errors which happen because
        // different types of things have the 'label' data set...
        if (typeof(element) != "object") {
            console.log("well, whatever, this not it: " + d.target);
            return;
        }

        if (d.target.className.indexOf("transportsum") == -1) {
            $("#showinfo").hide();
            $("#infobox").show();
        }


        $.each(element, function (key, value) {
            if (key === "start_time" || key === "tcp_connect_start_time") {
                value = new Date(value * 1000);
            }
            // XXX this can lead to code exec
            $("#" + key).text(value);
        });
    }

}).on("mouseleave", function (d) {
    var classes = d.target.className.split(" ");

    if (d.target.className.indexOf("hClass") > -1) {
        var lastclass = classes[classes.length - 1];
        $('.' + lastclass).css("width", "6px").css("border", "");
    }
});


Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    return yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]);
};