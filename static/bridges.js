$( document ).ready(function(){
    $("#contract").on("click", function(d){
      $("#infobox").hide();
      $("#showinfo").show();
    });

    $("#showinfo").on("click", function(d){
      $("#showinfo").hide();
      $("#infobox").show();
    });
    NProgress.configure({ ease: 'ease', speed: 500 });
    NProgress.start();

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

				   // Setting labels and classes
                                    var datestring = new Date(Object.keys(summaryForTransport[k])).yyyymmdd();
                                    var label = "<div class='tooltip_date'>"+new Date(Object.keys(summaryForTransport[k]))+"</div>";
				    var entry = $("<div title='' class='result_item result_entry transportsum"+cc+transportName+" "+color_class+" hClass" +datestring+"_"+cc+transportName+"'></div>");
                                    $(".transport"+cc+transportName).append(entry);
				    $(entry).data('label', label);
				    if(k%15 == 0){
					$(".transport"+cc+transportName).append("<div style='margin-left:"+k*5.5+"px' class='date_indicator'>"+new Date(Object.keys(summaryForTransport[k])).yyyymmdd()+"</div>")
				   }

				}
			    });
			    $("."+cc+transportName).append("<h4 style='display: inline-block; float: right; font-weight: bold;' id='transportContent"+cc+transportName+"_toggler'>+</h4></div><br />");
                            $("."+cc+transportName).append("<div class='transport_reports transportContent"+cc+transportName+"'>");
			    $(".transportContent"+cc+transportName).hide();

			    for(j=0; j < bridges.length; j++){

                         $.each(bridges[j], function(key, reports) {

                             // for each bridge of that transport type in the country
                             $(".transportContent"+cc+transportName).append("<div class='bridge_title'>"+key+"</div>")
                             $(".transportContent"+cc+transportName).append("<div class='bridge_result bridge"+counter+"'>")

                             reports.sort(function(a, b) {
                                return new Date(a.start_time) - new Date(b.start_time);
                             })
			     

                             for(i=0; i<reports.length; i++){

                                // for all the reports of each bridge in this country
				var datestring = new Date(reports[i].start_time*1000).yyyymmdd();
                                if(reports[i].status == "ok"){
                                   var color_class = "yes";
                                }
                                if(reports[i].status == "blocked"){
                                  var color_class = "no";
                                }
				if(reports[i].status == "offline"){
				    var color_class = "offline";
				}
				if(reports[i].status == "inconsistent" || reports[i].status == "invalid"){
				    var color_class = "inconsistent";
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
                                var full_url = reports[i].file_url;
				var classname = "hClass" +datestring+"_"+cc+transportName;
				 
                                var entry = $("<div onclick='window.open(\""+full_url+"\")' title='' class='result_item result_entry "+counter+" "+color_class+" "+classname+"'></div>");
                                 $(".bridge"+counter).append(entry);

				 $(entry).data('label', reports[i]);
			     }
 
			     counter+=1;
			 });
			    }
			}
			$(".transportContent"+cc+transportName).append("<br /><br /></div>");
			$("."+cc+transportName).append("</div><div class='hover"+cc+transportName+"'></div>");
			$("."+cc).append("</div>");
			
		    });
	    }

		    $("#bridge_results").append("</div>");
	});
    
        NProgress.done();

    });


})


// Highlighting and showing text on hover
$(this).on("mouseenter", function(d) {
    var classes = d.target.className.split(" ");
    
    if(d.target.className.indexOf("hClass") > -1){
      var lastclass = classes[classes.length-1];
      $('.'+lastclass).css("border", "2px solid orange").css("width", "8px");
      
	var classarr = lastclass.split("_");
	var element = $(d.target).data('label');
	if(d.target.className.indexOf("transportsum") == -1){
	    console.log(d.target.className);
            $("#showinfo").hide();
	    $("#infobox").show();
	}


      $.each(element, function(key, value) {
          if (key === "start_time" || key === "tcp_connect_start_time") {
            value = new Date(value*1000);
          }
          // XXX this can lead to code exec
          $("#"+key).text(value);
      });
    }

})
    .on("mouseleave", function(d) {
	var classes = d.target.className.split(" ");

	if(d.target.className.indexOf("hClass") > -1){
	    var lastclass = classes[classes.length-1];
	    $('.'+lastclass).css("width", "5px").css("border", "");
	}
    });


// Expand and contract details
$(this).on("click", function(d) {
    id = d.target.id.split("_");
    if(d.target.id.indexOf("toggler") > -1){
	if($('.'+id[0]).is(":visible")){
	    $('.'+id[0]).hide();
	    $('#'+d.target.id).text("+");
	} else {
	    $('.'+id[0]).show();
	    $('#'+d.target.id).text("-");
	}
    }
});



Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = this.getDate().toString();
    return yyyy + "-" + (mm[1]?mm:"0"+mm[0]) + "-"+ (dd[1]?dd:"0"+dd[0]); // padding
};
