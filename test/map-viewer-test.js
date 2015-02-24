var mapViewer;

var IntegrationAPI = {

    addSearchListener: function(callback) {
        this.callback = callback;
    },

    searchByPolygon: function(poligonPoints) {
        var list = [];

        var minLat = poligonPoints[0].lat();
        var maxLat = poligonPoints[0].lat();
        var minLng = poligonPoints[0].lng();
        var maxLng = poligonPoints[0].lng();

        for (var i = 1; i < poligonPoints.length; i++) {
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


        var maxItems = 2000;
        var scopeLat = maxLat - minLat;
        // var scopeLat = Math.abs(minLat) + Math.abs(maxLat);
        var totalItems = scopeLat * maxItems / 180;
        totalItems = (totalItems < 3) ? 3 : totalItems;

        for (var j = 0; j < totalItems; j++) {
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

            if (poligonPoints.length > 2) {
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

    },

    retrieveDatasets: function() {

        var datasets = [
            {
                label: "Dataset 1", // Alternatively a translation key
                type: "gme", // layers coming from MapsEngine,
                id: "10446176163891957399-12677872887550376890"
            },
            {
                label: "Dataset 2",
                type: "wms", // WMS layers
                url: "http://webservices.nationalatlas.gov/wms",
                layers: 'states'
            },
            {
                label: "Dataset 3", // Alternatively a translation key
                type: "gme", // layers coming from MapsEngine,
                id: "10446176163891957399-01658747114625264102"
            },
            {
                label: "Dataset 4",
                type: "wms", // WMS layers
                url: "http://webservices.nationalatlas.gov/wms",
                layers: 'seihaz'
            },
            {
                label: "Dataset 5", // Alternatively a translation key
                type: "gme", // layers coming from MapsEngine,
                id: "10446176163891957399-01658747114625264102"
            },
            {
                label: "Dataset 6",
                type: "wms", // WMS layers
                url: "http://webservices.nationalatlas.gov/wms",
                layers: 'srcoi0100g'
            },
            {
                label: "Dataset 7", // Alternatively a translation key
                type: "gme", // layers coming from MapsEngine,
                id: "10446176163891957399-01658747114625264102"
            },
            {
                label: "Dataset 8",
                type: "wms", // WMS layers
                url: "http://webservices.nationalatlas.gov/wms",
                layers: 'sfgeo'
            },
            {
                label: "Dataset 9", // Alternatively a translation key
                type: "gme", // layers coming from MapsEngine,
                id: "10446176163891957399-12677872887550376890"
            },
            {
                label: "Dataset 10",
                type: "wms", // WMS layers
                url: "http://webservices.nationalatlas.gov/wms",
                layers: 'glag'
            },
            {
                label: "Dataset 11", // Alternatively a translation key
                type: "gme", // layers coming from MapsEngine,
                id: "10446176163891957399-01658747114625264102"
            },
            {
                label: "Dataset 12",
                type: "wms", // WMS layers
                url: "http://webservices.nationalatlas.gov/wms",
                layers: 'volcanoes'
            },
            {
                label: "Dataset 13", // Alternatively a translation key
                type: "gme", // layers coming from MapsEngine,
                id: "10446176163891957399-01658747114625264102"
            },
            {
                label: "Dataset 14",
                type: "wms", // WMS layers
                url: "http://webservices.nationalatlas.gov/wms",
                layers: 'dodexp_1'
            },
            {
                label: "Dataset 15", // Alternatively a translation key
                type: "gme", // layers coming from MapsEngine,
                id: "10446176163891957399-01658747114625264102"
            },
            {
                label: "Dataset 16",
                type: "wms", // WMS layers
                url: "http://webservices.nationalatlas.gov/wms",
                layers: 'fa0007_1'
            },
        ];
        return new Promise(function(resolve) {
            window.setTimeout(
                function() {
                    resolve(datasets);
                }, 1000);
        });

    }
};

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
        layers: [
            {
                type: "gme",
                id: '10446176163891957399-01658747114625264102',//"10446176163891957399-13516001307527776624",
                label: "GME Layer"
                // layerName: 'layer_00001'
            },
            {
                type: "gme",
                id: '10446176163891957399-12677872887550376890',//"10446176163891957399-13516001307527776624",
                label: "GME Layer 2"
                //   layerName: 'layer_00002'
            },
            {
                label: "WMS Layer states",
                type: "wms",
                url: "http://webservices.nationalatlas.gov/wms",
                layers: 'states'
            }
        ]
    };

    var mapViewer = new MapViewer('map', IntegrationAPI, [
        layerListControl,
        placesToolbar,
        "search-on-pan", "check-draw", 'picture-exportation', 'heatmap-view', 'refine-search'

    ]);
}

window.onload = MapViewerTest;