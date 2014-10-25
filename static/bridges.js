$( document ).ready(function(){

    NProgress.configure({ ease: 'ease', speed: 500 });
    NProgress.start();

    $(document).tooltip({
      content: function () {
          return $(this).prop('title');
      },
      show: { duration: 200 }
    });

    var counter=0;

    $.getJSON("parsing/grouped.json", function(report_data){

        $.each(report_data, function(cc, transports) {

            if(Object.getOwnPropertyNames(transports).length != 0){

                // for every country

                $("#bridge_results").append("<div class='country "+cc+"'>");
                $("."+cc).append("<h3>"+cc+"</h3>");

		    $.each(transports, function(transportName, bridges){
		        if(Object.getOwnPropertyNames(bridges).length != 0){

			    // for every transport in the country
			    $("."+cc).append("<div class='transport "+cc+transportName+"'>");
                            $("."+cc+transportName).append("<h4>"+transportName+"</h4>");
			    $("."+cc+transportName).append("<div class='transport_summary transport"+cc+transportName+"'>");

			    // Summary data per transport
			    $.getJSON("parsing/summarized.json", function(summary_data){
				var summaryForTransport = summary_data[cc][transportName];
				summaryForTransport.sort(function(a, b){
				    return new Date(Object.keys(a)) - new Date(Object.keys(b));
				})
				console.log("Length for Country "+cc+ " is "+summaryForTransport.length);
				for(k=0; k<summaryForTransport.length; k++){
				    var summaryColor = summaryForTransport[k][Object.keys(summaryForTransport[k])];
				    if(summaryColor == "green"){
					var color_class = "yes";
                                    }
                                    if(summaryColor == "red"){
					var color_class = "no";
                                    }
				    if(summaryColor == "orange"){
					var color_class = "maybe";
				    }
                                    
                                    var label = "<div class='tooltip_date'>"+new Date(Object.keys(summaryForTransport[k]))+"</div>";
				    var entry = $("<div title='' class='result_item result_entry transportsum"+cc+transportName+" "+color_class+"'></div>");
                                    $(".transport"+cc+transportName).append(entry);
				    $(entry).prop('title', label);
				    if(k%15 == 0){
					$(".transport"+cc+transportName).append("<div style='margin-left:"+k*5.5+"px' class='date_indicator'>"+new Date(Object.keys(summaryForTransport[k])).yyyymmdd()+"</div>")
				    }

				}
			    });
			    $("."+cc+transportName).append("</div><br />");

			    for(j=0; j < bridges.length; j++){

                         $.each(bridges[j], function(key, reports) {

                             // for each bridge of that transport type in the country
                             $("."+cc+transportName).append("<div class='bridge_title'>"+key+"</div>")
                             $("."+cc+transportName).append("<div class='bridge_result bridge"+counter+"'>")

                             reports.sort(function(a, b) {
                                return new Date(a.start_time) - new Date(b.start_time);
                             })

                             for(i=0; i<reports.length; i++){

                                // for all the reports of each bridge in this country

                                if(reports[i].success){
                                   var color_class = "yes";
                                }
                                if(!reports[i].success){
                                  var color_class = "no";
                                }
                                if(typeof(reports[i].start_time) == "undefined"){
                                  var color_class = "probably_no";
                                }
                                var label = "<div class='tooltip_date'>"+new Date(reports[i].start_time*1000)+"</div>";

                                $.each(reports[i], function(k, v) {
                                   label += "<li>"
                                   label += k+ " : "+v
                                   label += "</li>"
                                })
                                var full_url = reports[i].file_url
                                var entry = $("<div onclick='window.open(\""+full_url+"\")' title='' class='result_item result_entry "+counter+" "+color_class+"'></div>");
                                $(".bridge"+counter).append(entry)
                                $(entry).prop('title', label);
			     }
 
			     counter+=1;
			 });
			    }
			}
			$("."+cc).append("</div><br /><br />");
			
		    });
	    }

		    $("#bridge_results").append("</div>");
	});
    
        NProgress.done();

    });


})

Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = this.getDate().toString();
    return yyyy + "-" + (mm[1]?mm:"0"+mm[0]) + "-"+ (dd[1]?dd:"0"+dd[0]); // padding
};
