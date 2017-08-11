document.getElementById("determineRoute").addEventListener("click", determineRoute);

function determineRoute() {
    var origin = document.getElementById("origin");
    var destination = document.getElementById("destination");
	var arrival = document.getElementById("arrival");
    var error = document.getElementById("error");
    var spinner = document.getElementById("loader");
    error.innerHTML = "";

	var panel = document.getElementById("direction");
	panel.style.display = "none";

    // Validation
    if (!origin.checkValidity()) {
        error.innerHTML = "ERROR: Origin Field - " + origin.validationMessage;
        return;
    }
    if (!destination.checkValidity()) {
        error.innerHTML = "ERROR: Destination Field - " + destination.validationMessage;
        return;
    }
	if (!arrival.checkValidity()) {
        error.innerHTML = "ERROR: Arrival Field - " + arrival.validationMessage;
        return;
    }
	
    origin = encodeURI(origin.value);
    destination = encodeURI(destination.value);
	arrival = new Date(arrival.value).getTime()/1000;

    var xhttp = new XMLHttpRequest();
    xhttp.onloadstart = function() {
        spinner.style.display = "block";
    }
    xhttp.onload = function() {
        if (this.status == 200) {
			console.log(this.response);
           loadData(this);
        }
    };
    xhttp.onerror = function(err) {
        alert("Error determining destination" + err);
    }
    xhttp.onloadend = function() {
        spinner.style.display = "none";
    }
   
    var yql = "https://maps.googleapis.com/maps/api/directions/xml?origin=" +origin+ "&destination=" +destination+ "&arrival_time=" +arrival+ "&mode=transit&key=AIzaSyBJ8VEb5j7TAF-W8fB4vWBdhJalZBt6ZtY";

    xhttp.open("GET", yql, true);
    xhttp.send();
}

function loadData(response) {
    var xmlDoc = response.responseXML;
    if (xmlDoc == null) {
        alert('Invalid response from server.');
        return;
    }
    var steps = xmlDoc.getElementsByTagName("step");
    if (steps.length == 0) {
        alert("No Route Established.");
    }
	
	var panel = document.getElementById("direction");
	
	var total_time = xmlDoc.getElementsByTagName("duration");
	total_time = total_time[total_time.length  -1].getElementsByTagName("text")[0].innerHTML;
	
	var origin = xmlDoc.getElementsByTagName("start_address")[0].innerHTML;
	var html ="<h5> Total Travel Time: "+ total_time +"</h5>"+
		"<p><i class='fa fa-circle-o'></i> Your Location: "+ origin +"</p>";
		
	panel.innerHTML = html;
	panel.style.display = "inline";
	
    for (var i = 0; i < steps.length; i++) {
        var step = steps[i];
        if (step != null) {
            displayStep(step);
        }
    }
	
	var destination = xmlDoc.getElementsByTagName("end_address")[0].innerHTML;
	html ="<p><i class='fa fa-circle-o'></i> Destination: "+ destination +"</p>";
	
	panel.innerHTML += html;
	panel.style.display = "inline";
}

function displayStep(step) {
    var travel_mode = step.getElementsByTagName("travel_mode");
	var distance = step.getElementsByTagName("distance");
    var duration = step.getElementsByTagName("duration");
	var instructions = step.getElementsByTagName("html_instructions");

	var panel = document.getElementById("direction");
    var html = "<p>";
	
	if(travel_mode.length != 0){
		travel_mode = travel_mode[0].innerHTML;
		if(travel_mode=="WALKING"){
			
			html="<i class='fa fa-blind'></i> Walk ";
		
			if(distance.length != 0){
				distance = distance[0].getElementsByTagName("text")[0].innerHTML;
				html += " " + distance;
			}	

			if(instructions.length != 0){
				instructions = instructions[0].innerHTML;
				
				instructions = instructions.replace(/&lt;b&gt;/g, '');
				instructions = instructions.replace(/&lt;\/b&gt;/g, '');
				instructions = instructions.replace(/&lt;div style="font-size:0.9em"&gt;/g, ' ');
				instructions = instructions.replace(/&lt;\/div&gt;/g, '');
				
				html += " " + instructions.substring(5);
			}	

			if (duration.length != 0) {
				duration = duration[0].getElementsByTagName("text")[0].innerHTML;
				html += " (about " + duration + ")";
			} 			
			
		}else if (travel_mode=="TRANSIT"){
			var bus_info = step.getElementsByTagName("transit_details");
			var short_name = bus_info[0].getElementsByTagName("short_name");
			var num_stops = bus_info[0].getElementsByTagName("num_stops");
			var arrival_stop = bus_info[0].getElementsByTagName("arrival_stop");
			
			html="<i class='fa fa-bus'></i> ";
			
			if (short_name.length != 0){
				short_name = short_name[0].innerHTML;
				html += "<span class='busNumber'>" + short_name + "</span>";
			}
			
			if (instructions.length != 0 && num_stops.length != 0){
				instructions = instructions[0].innerHTML;
				num_stops = num_stops[0].innerHTML;
				html += " " + instructions + "</br>Travel " + num_stops + " stops - ";
			}
			
			if (distance.length != 0){
				distance = distance[0].getElementsByTagName("text")[0].innerHTML;
				html += " " + distance;
			}

			if (duration.length != 0) {
				duration = duration[0].getElementsByTagName("text")[0].innerHTML;
				html += " (about " + duration + ")";
			} 	
			
			if (arrival_stop.length != 0){
				arrival_stop = arrival_stop[0].getElementsByTagName("name")[0].innerHTML;
				html += "</br>Get off at " + arrival_stop;
			}
		}
	}
	
	html += '</p>';
	panel.innerHTML += html;
	panel.style.display = "inline";
}