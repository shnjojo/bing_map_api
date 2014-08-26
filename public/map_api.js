////////////////////////////
// Get lax and lng from url.
////////////////////////////

function splitUrl(url, symbo, islaxlng) {
	islaxlng = false || islaxlng;
	var raw_url = url.split(symbo);
	var url_after_split = raw_url[raw_url.length - 1];
	if (islaxlng) {
		return raw_url;
	} else {
		return url_after_split;
	}
}

function getLocationFromURL() {
	// Get current url
	var raw_url = $(location).attr('href');
	var url_after_slash = splitUrl(raw_url, '/');
	var url_after_sharp = splitUrl(url_after_slash, '#');
	var laxlng = splitUrl(url_after_sharp, ',', true);
	return new Microsoft.Maps.Location(laxlng[0],laxlng[1])
}



/////////////////
// Map API Stuff
/////////////////

var mapOptions = {
	// Map Options: http://msdn.microsoft.com/en-us/library/gg427603.aspx
	credentials: "AgxWecX8jqRQhxHLL113XSh1jGb1EeluxcaeSaJo4bowuOrm3sOPx3pSyZLimwLd",
	enableClickableLogo: false,
	enableSearchLogo: false,
	showCopyright: false,
	
	// View Options: http://msdn.microsoft.com/en-us/library/gg427628.aspx
	zoom: 16,
	center: getLocationFromURL()
};

function initPlaces(current_location) {
	var current_pin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(lax,lng), pinOptions(type, content));
	map.entities.push(current_pin);
}

function getViewBound(map) {
	var bound = map.getBounds();
	var bound_arr = {}
	var north_west = bound.getNorthwest();
	var south_east = bound.getSoutheast();
	bound_arr['north_west'] = north_west;
	bound_arr['south_east'] = south_east;
	return bound_arr;
}

// Define a Class to control the places data from server to client.
var place = {
	
	/////////////////
	// Some Dummy here
	/////////////////
	
	// places hold all the places data once fetch from server.
	places: [{
		id: "1",
		name: "Ryan's Home",
		address: "Under the bridge",
		type: "red",
		location: {latitude: "52.4671044", longitude: "-1.9045764"}
	}, {
		id: "2",
		name: "Will's Home",
		address: "Under the ground",
		type: "blue",
		location: {latitude: "52.4681044", longitude: "-1.9035764"}
	}],
	// places_id hold all the places id once fetch from server.
	places_id: ["1", "2"],
	// raw_data hold all data fetch from server, empty before each function.
	raw_data: [],
	
	setRawdata: function (data) {
		raw_data = data;
	},
	
	emptyRawdata: function () {
		raw_data = [];
	},
	
	setPlacesid: function () {
		places_id = [];
	},
	
	getPlacesid: function () {
		return this.places_id;
	},
	
	// append new places data and append the new places id.
	appendNewplaces: function (new_places_data) {
		this.places.push(new_places_data);
		var places_id = this.getPlacesid();
		
		$.each(new_places_data, function( k, v ) {
			places_id.push(v.id);
		})
		
		console.log(places_id);
	},
	
	// get data from server and set
	init: function (data_from_server) {
		this.setRawdata(data_from_server);
	},
	
	// Dereplication function compare the data from server and local.
	// And drop the same data, push the new data to local.
	filterOldInsertNew: function () {
		
		// Define main class for some scope reason.
		var content_class = this;
		
		// Implement the raw places data
		$.each(raw_data, function( k, v ) {
			
			var raw_place_id = v.id;
			var exist_places_id = content_class.getPlacesid();
			var counter = exist_places_id.length;
			// to make sure get the new data by the id of implement.
			var current_place_counter_id = k;
	
			console.log('All data from server: ' + raw_place_id);
			
			// Implement the exist places id
			$.each(exist_places_id, function( k, v ) {
				
				var times = k + 1;
				var exist_place_id = v;
				
				console.log('This is the ' + times + ' round match.');
		
				if (raw_place_id === exist_place_id) {
					console.log('Place is matched, the id is ' + raw_place_id);
					return false;
				}
				if (counter === times) {
					console.log('This place is not exist: ' + raw_place_id);
					// append new data to places array
					content_class.appendNewplaces(raw_data[current_place_counter_id]);
				}
			});

		});
		
		this.emptyRawdata();
		
	},

	// Generate the pins content
	pinOptions: function (type, name, address){
		var dict = {
			htmlContent: '<p class="pinContent ' + type + '">' + 'Name: ' + name + 'Address: ' + address + '</p>'
		};
	
		return dict;
	},
	
	// Put all the places into the map
	setPins: function () {
		
		var places = this.places;
		var content_class = this;
		// new a collection from maps api
		var pins_collection = new Microsoft.Maps.EntityCollection();
		
		$.each(places, function( k, v ) {
		  var name = v.name;
			var address = v.address;
			var type = v.type;
			var lat = v.location['latitude'];
			var lng = v.location['longitude'];
			var location = new Microsoft.Maps.Location(lat,lng)
			// new a pin and push into collection
			var pin_options = content_class.pinOptions(type, name, address);
			var current_pin = new Microsoft.Maps.Pushpin(location, pin_options);
			pins_collection.push(current_pin);
		});
		
		return pins_collection;
		
	},
	
}

// initialize the map
function GetMap(){
  var map = new Microsoft.Maps.Map(document.getElementById("map"), mapOptions);
	
	// initPlaces();
	// var current_accommodation = {};
	// current_accommodation['LaxLng'] = getLocationFromURL();
	
	// var center = map.getCenter();
  // var current_pin = new Microsoft.Maps.Pushpin(center, pinOptions); 
  // Add handler for the pushpin click event.
  // Microsoft.Maps.Events.addHandler(current_pin, 'click', someTest);
	
	// Get all places inside the view from post the bound to server when the view is changed.
	Microsoft.Maps.Events.addHandler(map, 'viewchangeend', function(e){
		
		var bound = getViewBound(map);
		
		$.post( "/map", JSON.stringify(bound), function( data ) {
			place.init(data);
			place.filterOldInsertNew();
			var all_pins = place.setPins();
			map.entities.push(all_pins);
		});
		
	});
}

$(function() {
  GetMap()
});