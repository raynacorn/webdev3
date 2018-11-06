// main.js

// initialize map
var map = L.map("map", {
    center: [46.73, -92.107],
    zoom: 11
});

// add base layer
var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// create request for GeoJSON
var request = new Promise(function(resolve, reject){
	var request = new XMLHttpRequest();
	request.addEventListener("load", function(){ resolve(this.responseText) });
	request.open("GET", "data/duluth_precincts_WGS84.geojson");
	request.send();
});

// handle request
request.then(function(values){
	// parse the incoming datasets into JSON format
	var precincts = JSON.parse(values);
	console.log('precincts:', precincts);

	//create a polygon layer for precincts
	var precinctsLayer = L.geoJSON(precincts, {
		    style: function (feature) {
		    	var demVote = feature.properties.USPRSDFL;
		    	var repVote = feature.properties.USPRSR;
		    	var totalVote = feature.properties.USPRSTOTAL;
		    	var thirdPartyVote = (totalVote - demVote - repVote);
		    	var thirdPartyPct = Math.round(thirdPartyVote/totalVote*100);

		    	// console.log('demVote:', demVote);
		    	// console.log('repVote:', repVote);
		    	// console.log('totalVote:', totalVote);
		    	// console.log('thirdPartyVote:', thirdPartyVote);
		    	console.log('pct3rd:', thirdPartyPct);
                var dempercent=Math.round(demVote/totalVote*100)
                console.log("percent", dempercent)

		    	// assign colors from the ColorBrewer yellow-green scale
		    	var fill;
		    	// equal interval classification
		    	// 7% or less
		    	if (dempercent >= 60) {
		    		fill = '#3182bd';
		    	}
		    	// 11% or less
		    	else if (dempercent <=60) {
		    		fill = '#9ecae1';
		    	}
		    	// 12% or more
		    	else if (dempercent <= 45) {
		    		fill = '#deebf7';
		    	}

		    	// FIXME: remove existing symbolization and create a diverging
		    	// symbology based the democrat or republic vote as a percent
		    	// of the total vote.
		    	// Use Colorbrewer's 5-class Red-Blue colors for this
		    	// http://colorbrewer2.org/#type=diverging&scheme=RdBu&n=5

		    	// return style specification
		        return {
		        	color: '#636363',
		        	weight: 1,
		        	fillColor: fill,
		        	fillOpacity: 0.6,
		        	balderdash: true
		        };
		    }
		});

		///////////////////////////////////////////////////////////////////////
		// POPUP
		// add popup for precincts layer
		// Leaflet documentation explains:
		// "If a Function is passed it will receive the layer as the first
		// argument and should return a String or HTMLElement."
		precinctsLayer.bindPopup(function (layer){
			// create variables to be displayed in popup
			var demVote = layer.feature.properties.USPRSDFL;
		    var repVote = layer.feature.properties.USPRSR;
		    var totalVote = layer.feature.properties.USPRSTOTAL;
		    var pctName = layer.feature.properties.PCTNAME;

		    // format content for popup
		    var html = "<h4>Precinct: "+pctName+"</h4>"+
		    	"<table><tr><td>Democratic votes: </td><td>"+demVote+"</td></tr>"+
		    	"<tr><td>Republican votes: </td><td>"+repVote+"</td></tr>"+
		    	"<tr><td>Total votes: </td><td>"+totalVote+"</td></tr>"+
		    	"<tr><td>Third party votes: </td><td>"+(totalVote-demVote-repVote)+"</td></tr></table>";

		    return html;
		})
	  	.addTo(map);
});