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
<<<<<<< HEAD
    console.log("Map Viewer");

    mapViewer = new MapViewer('map', IntegrationAPI, [
        "button", {
            type: 'button',
            text: 'Hide/Show',
            position: 'BOTTOM_RIGHT',
            clickFunction: hide,
            cssClass: 'nhide'
        }, {
            type: 'layer-list',
            startCollapse: true,
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
                "WMS Layer": {
                    type: "wms",
                    url: "http://webservices.nationalatlas.gov/wms",
                    layers: 'seihaz'

                },
                "WMS Layer states": {
                    type: "wms",
                    url: "http://webservices.nationalatlas.gov/wms",
                    layers: 'states'
                },
            }
        }, {
            type: 'places',
            startCollapse: true,
            places: {
                Schools: {
                    type: 'school',
                    icon: '<i class="fa fa-child"></i>'
                },
                Hospitals: {
                    type: 'hospital',
                    icon: '<i class="fa fa-hospital-o"></i>'
                },
                Supermarkets: {
                    type: 'grocery_or_supermarket',
                    icon: '<i class="fa fa-cart-plus"></i>'
                },
                Restaurants: {
                    type: 'restaurant',
                    icon: '<i class="fa-cutlery"></i>'
                }
            }
        }
    ]);
=======
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
		}, "check-pan", "check-draw"
	]);
>>>>>>> fead5b1edaa697efa4c6a7400867f9d71a14dc62
}

window.onload = MapViewerTest;