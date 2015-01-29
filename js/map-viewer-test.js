var mapViewer;

var IntegrationAPI = {

	addSearchListener: function(callback) {
		this.callback = callback;
	},

	searchByPolygon: function(poligonPoints) {
		var list = [];
		var bounds = [];

		for (var j = 0; j < 20; j++) {
			var lat = RandomCoordinate(poligonPoints[0].lat(), poligonPoints[1].lat());
			var lng = RandomCoordinate(poligonPoints[0].lng(), poligonPoints[1].lng());

			var elem = {
				propertyId: 1,
				lat: lat,
				lng: lng,
				fuzzy: false,
				type: "test"
			};

			list.push(elem);
		}

		var that = this;
		setTimeout(function() {
			that.callback(list);
		}, 1000);

		function RandomCoordinate(min, max) {
			return Math.random() * (max - min) + min;
		}

	},

	setPropertiesFilter: function(propertiesIds) {

	}
};

function hide() {
	var controls = document.getElementsByClassName("button-control");
	for (var i = 0; i < controls.length; i++) {
		var control = controls[i];
		if (control.classList.contains('nhide')) {
			continue;
		}
		if (control.style.display !== 'none') {
			control.style.display = 'none';
		} else {
			control.style.display = 'initial';
		}
	}
}

function MapViewerTest() {
	console.log("Map Viewer");

	mapViewer = new MapViewer('map', IntegrationAPI, [
		"button", {
			type: 'layer-list',
			layers: ['Terciopelo', 'Seda', 'Sintetica'],
		}, {
			type: 'places',
			places: {
				Schools: 'school',
				Hospitals: 'hospital',
				Supermarkets: 'grocery_or_supermarket',
				Restaurants: 'restaurant'
			},
		}, "check-pan"
	]);
}

window.onload = MapViewerTest;