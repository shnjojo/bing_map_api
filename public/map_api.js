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
	
	////////////////////////////////////////
	// Some Dummy data here, should be empty
	////////////////////////////////////////
	
	// places hold all the places data once fetch from server.
	places: [{
		id: "1",
		name: "Ryan's Home",
		address: "Under the bridge",
		type: "blue",
		location: {latitude: "52.4671044", longitude: "-1.9045764"}
	}],
	// places_id hold all the places id once fetch from server.
	places_id: ["1"],
	// raw_data hold all data fetch from server, empty before each function.
	raw_data: [],
	
	setRawdata: function (data) {
		raw_data = data;
	},
	
	emptyRawdata: function () {
		raw_data = [];
	},
	
	setPlacesid: function (new_place_id) {
    console.log('Set place id here:');
    console.log(new_place_id);
		this.places_id.push(new_place_id);
	},
	
	getPlacesid: function () {
		return this.places_id;
	},
  
	setPlaces: function (new_places) {
    console.log('Set places here:');
    console.log(new_places);
		this.places.push(new_places);
	},
  
  getPlaces: function (place_id) {
    
    var places = this.places;
    var place_info = null;
    
    $.each(places, function( k, v ) {
      var current_place_id = v.id;
      if (place_id === current_place_id) {
        place_info = places[k];
      }
    });
    
    return place_info;
    
  },
	
	// append new places data and append the new places id.
	appendNewplaces: function (new_places_data) {
    
    // Append new place data into places
		this.setPlaces(new_places_data);
    // Append new place id into places_id
    this.setPlacesid(new_places_data.id)
    
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
			// to mark which is the new places
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
	pinOptions: function (id, type, name, address){
		var dict = {
			htmlContent: '<p class="pinContent ' + type + '">' + 'Name: ' + name + 'Address: ' + address + '</p>',
      text: id
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
      var id = v.id;
		  var name = v.name;
			var address = v.address;
			var type = v.type;
      var pic = v.pic;
			var lat = v.location['latitude'];
			var lng = v.location['longitude'];
      
			var location = new Microsoft.Maps.Location(lat,lng)
			// new a pin and push into collection
			var pin_options = content_class.pinOptions(id, type, name, address);
			var current_pin = new Microsoft.Maps.Pushpin(location, pin_options);

      function displayInfo(e) {
        var id = e.target.getText();
        var data = content_class.getPlaces(id);
        var title = data.name;
        var address = data.address;
        
        $('#accommodation_pic').css("display", "none");
        $('#infoWindow #title').text(title);
        $('#infoWindow #address').text(address);
        
        if (!(data.pic === "" || data.pic === undefined)) {
          $('#accommodation_pic').attr( "src", data.pic )
          $('#accommodation_pic').css("display", "block");
          
        }
      }
      
      Microsoft.Maps.Events.addHandler(current_pin, 'click', displayInfo);
      
			pins_collection.push(current_pin);
		});
		
		return pins_collection;
		
	},
	
};

/*

Some bug need to fix, but alway got a dirty way to do the job...

var infoWindow = {
  
	title: $('#infoWindow #title'),
  address: $('#infoWindow #address'),
	
	setTitle: function (new_title) {
    title.text(new_title);
	},
  
	setAddress: function (new_address) {
		address.text(new_address);
	}
  
}
*/

// initialize the map
function GetMap(){
  
  var map = new Microsoft.Maps.Map(document.getElementById("map"), mapOptions);
  
  // Add handler for the pushpin click event.
  // Microsoft.Maps.Events.addHandler(current_pin, 'click', someTest);
	
	// Get all places info and pin on map inside the view from
  // post the bound to server when the view is changed.
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