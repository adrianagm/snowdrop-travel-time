var mapViewer;

var IntegrationAPI = {

	addSearchListener: function(callback) {
		this.callback = callback;
	},

	searchByPolygon: function(poligonPoints) {
		var list = [];
		var bounds = [];

		var minLat = poligonPoints[0].lat();
		var maxLat = poligonPoints[0].lat();
		var minLng = poligonPoints[0].lng();
		var maxLng = poligonPoints[0].lng();

		for (var i = 0; i < poligonPoints.length; i++) {
			if (poligonPoints[i].lat() < minLat)
				minLat = poligonPoints[i].lat();

			if (poligonPoints[i].lat() > maxLat)
				maxLat = poligonPoints[i].lat();

			if (poligonPoints[i].lng() < minLng)
				minLng = poligonPoints[i].lng();

			if (poligonPoints[i].lng() > maxLng)
				maxLng = poligonPoints[i].lng();
		}

		var poligon = new google.maps.Polygon({
			paths: poligonPoints
		});

		for (var j = 0; j < 20; j++) {
			var lat = RandomCoordinate(minLat, maxLat);
			var lng = RandomCoordinate(minLng, maxLng);

			var elem = {
				propertyId: 1,
				lat: lat,
				lng: lng,
				fuzzy: false,
				type: "test"
			};

			var point = new google.maps.LatLng(lat, lng);

			if (poligonPoints.length != 2) {
				if (google.maps.geometry.poly.containsLocation(point, poligon)) {
					list.push(elem);
				}
			} else {
				list.push(elem);
			}
		}

		var that = this;
		setTimeout(function() {
			that.callback(list);
		}, 500);

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

	var placesToolbar = {
		type: 'places',
		places: {
			Schools: {
				type: 'school' //default icon
			},
			Hospitals: {
				type: 'hospital',
				iconClass: 'fa fa-hospital-o fa-2x' //fontawesome icon
			},
			Supermarkets: {
				type: 'grocery_or_supermarket' //css defined icon
			},
			Restaurants: {
				type: 'restaurant',
				iconClass: "fa fa-cutlery fa-2x"
			}
		}
	};

	var layerListControl = {
		type: 'layer-list',
		layers: {
			"GME Layer": {
				type: "gme",
				layerId: "10446176163891957399-13516001307527776624",
				layerName: 'layer_00001'
			},
			"GME Layer 2": {
				type: "gme",
				layerId: "10446176163891957399-13516001307527776624",
				layerName: 'layer_00002'
			},
			"WMS Layer states": {
				type: "wms",
				url: "http://webservices.nationalatlas.gov/wms",
				layers: 'states'
			},
		}
	};

	mapViewer = new MapViewer('map', IntegrationAPI, [
		layerListControl,
		placesToolbar,
		"search-on-pan", "check-draw"

	]);
}

window.onload = MapViewerTest;