//Model Data

var main = [
	{
		name: "22 No. Phatak",
		lat: 30.340741,
		lng: 76.380370,
		show: true,
		selected: false,
		venueid: "4e171c5ec65be9c55e8b6c76"
	},
	{
		name: "Cafe Route 64",
		lat: 30.334797,
		lng: 76.386432,
		show: true,
		selected: false,
		venueid: "4fd4e34ce4b05b989d94f29f"
	},
	{
		name: "Gopal Sweets",
		lat: 30.335580,
		lng: 76.385026,
		show: true,
		selected: false,
		venueid: "4cc400f4b2beb1f7ff4d1a4c"
	},
	{
		name: "Red Dragon",
		lat: 30.342926,
		lng: 76.377767,
		show: true,
		selected: false,
		venueid: "4cf11efc8333224b9e4b088e"
	},
	{
		name: "Barista Lavazza",
		lat: 30.345454,
		lng: 76.377781,
		show: true,
		selected: false,
		venueid: "52614fd511d2d3e9a66e64af"
	},
	{
		name: "Kobe Sizzlers",
		lat: 30.345505,
		lng: 76.377452,
		show: true,
		selected: false,
		venueid: "4ddaa152ae60680f155295c8"
	},
	{
		name: "Ignite Micro-Brewery",
		lat: 30.346054,
		lng: 76.376706,
		show: true,
		selected: false,
		venueid: "53b81e82498eef48c83f3f92"
	},
	{
		name: "Aviation Club",
		lat: 30.369216,
		lng: 75.8600674,
		show: true,
		selected: false,
		venueid: "52e34824498ee2a47387dd26"
	}
];

// View Model

var ViewModel = function() {
	var self = this;
	self.mapList = [];
	self.errorDisplay = ko.observable("");

//pushes appropriate data to the mapList Array

	var pushMarker = function(marker){
		self.mapList.push(new google.maps.Marker({
				position: {lat: marker.lat, lng: marker.lng},
				map: map,
				name: marker.name,
				show: ko.observable(marker.show), //sets value as of dataModel
				selected: ko.observable(marker.selected), //sets value as of dataModel
				venueid: marker.venueid, //sets foursquare venue id
				animation: google.maps.Animation.DROP //sets DROP animation effect to the map markers
					})
			);
		};


	// Populate mapList array with the markers within the model by calling pushMarker function

  main.forEach(pushMarker);

	self.curentLocation = self.mapList[0];

//custom bounce animation for current marker
	self.bounceAnime = function(marker) {
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){ marker.setAnimation(null); }, 600);
	};

	//to add API information to each marker
	self.addFourSqAPI = function(givenMapMarker) {
     $.ajax({
	            url: "https://api.foursquare.com/v2/venues/" + givenMapMarker.venueid +
							 '?client_id=GE0SZ0HF35JPSWTLVAJDVTCLPSL2FFXRAEJOCHRAX05MU5OY&client_secret=1II0N22MXYQTFRPCJGBLWN2E4A1UMY4LXG1VREVHHMN5MSJE&v=20160606',
	            dataType: "json",
	            success: function (data) {
	                var result = data.response.venue;
                  // checks for likes and rating in returned json and displays it if available
	                givenMapMarker.likes = result.likes.summary;
	                givenMapMarker.rating = result.rating;
	            },
	            error: function (err) {
	            	self.errorDisplay("No FourSquare data to Display.");
	            }
        });
   };

   for (marker in self.mapList) {
		(function(givenMapMarker){
			self.addFourSqAPI(givenMapMarker);
			givenMapMarker.addListener('click', function(){
			self.selectMarker(givenMapMarker);
			});
		})	(self.mapList[marker]);
	}

// filtering procedure

	self.filterText = ko.observable("");


	self.searchModifier = function() {

		var activeSearch = self.filterText();
		infowindow.close();
		// when no text in filter field
		if (activeSearch.length === 0) {
			self.showAllMarkers(true);
		}
		else {						//for some filter applied
			for (marker in self.mapList) {
				if ( self.mapList[marker].name.toLowerCase().indexOf( activeSearch.toLowerCase()) >= 0 )
				{
					self.mapList[marker].show(true);
					self.mapList[marker].setVisible(true);
				}
				else
				{
					self.mapList[marker].show(false);
					self.mapList[marker].setVisible(false);
				}
			}
		}
		infowindow.close();
	};


	self.showAllMarkers = function(showVar) {
		for (marker in self.mapList) {
			self.mapList[marker].show(showVar);
			self.mapList[marker].setVisible(showVar);
		}
	};


	self.unselectAll = function() {
		for (marker in self.mapList) {
			self.mapList[marker].selected(false);
		}
	};


	self.selectMarker = function(location) {
		self.unselectAll();
        location.selected(true);

        self.curentLocation = location;
				//checks likes
        likesInfo = function() {
        	if (self.curentLocation.likes === "" || self.curentLocation.likes === undefined) {
        		return "No Likes on This Location";
        	} else {
        		return   self.curentLocation.likes;
        	}
        };
				//checks ratings
        ratingInfo = function() {
        	if (self.curentLocation.rating === "" || self.curentLocation.rating === undefined) {
        		return "No one Rated this Location";
        	} else {
        		return "Location has" + self.curentLocation.rating + "rating" ;
        	}
        };

        var formattedInfoWindow = "<h5>" + self.curentLocation.name + "</h5>" + "<div>" + likesInfo() + "</div>" + "<div>" + ratingInfo() + "</div>";

				infowindow.setContent(formattedInfoWindow);

        infowindow.open(map, location);
        self.bounceAnime(location); //animation applied
	};
};
