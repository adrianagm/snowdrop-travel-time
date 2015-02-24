var mapViewer;
var currentImage = 0;
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
            var heading = RandomCoordinate(0, 360);
            var elem = {
                propertyId: 1,
                fuzzy: false,
                type: "test",
                lat: lat,
                lng: lng,
                images: [{
                    title: 'Photo 1',
                    url: 'https://casamodelo.files.wordpress.com/2010/12/apartamento.jpg'
                }, {
                    title: 'Photo 2',
                    url: 'http://178.62.16.68/wp-content/uploads/2011/01/Apartamento-NewYorkando1.jpg'
                }, {
                    title: 'Photo 3',
                    url: 'http://www.modms.info/wp-content/uploads/2014/11/diseno-apartamentos.jpg'
                }],
                heading: heading,
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

     mapViewer.setBubbleTemplate({
        "Details": {
            dataFields: ['propertyId', 'fuzzy', 'type'],
            template: '<div class="balloon data-tab container"><table>{{#data}}<tr class="data-item"><td><b>{{key}}</b></td><td>{{value}}</td></tr>{{/data}}</table></div>'
        },
        "Images": {
            dataFields: ['images'],
            template: '<div class="balloon image-tab container"><div class="slider_wrapper"><ul id="image_slider">' + '<li><img id="balloon-image-current" src="{{data.' + currentImage + '.value.url}}" title="{{data.' + currentImage + '.value.title}}" ></li>' + '</ul><span class="nvgt" id="prev" onclick="prevImageBalloon()"></span><span class="nvgt" id="next" onclick="nextImageBalloon()"></span></div><ul class="balloon-images-list">' + '{{#data}}<li onclick="showImageBalloon({{key}})"><img src="{{value.url}}" title="{{value.title}}"></li>{{/data}}' + '</ul></div>'

        },
        "Street View": {
            type: 'streetView',
            orientationField: 'heading'


        }
    });
}

window.onload = MapViewerTest;

function nextImageBalloon() {
    currentImage++;
    var image = document.getElementById('balloon-image-current');
    var imageList = document.getElementsByClassName('balloon-images-list')[0].children;
    if (currentImage >= imageList.length) {
        currentImage = 0;
    }
    image.src = imageList[currentImage].children[0].src;
}

function prevImageBalloon() {
    currentImage--;
    var image = document.getElementById('balloon-image-current');
    var imageList = document.getElementsByClassName('balloon-images-list')[0].children;
    if (currentImage < 0) {
        currentImage = imageList.length - 1;
    }
    image.src = imageList[currentImage].children[0].src;

}

function showImageBalloon(i) {
    var image = document.getElementById('balloon-image-current');
    var imageList = document.getElementsByClassName('balloon-images-list')[0].children;
    image.src = imageList[i].children[0].src;

}