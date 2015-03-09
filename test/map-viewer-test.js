var mapViewer;
var currentImage = 0;

var IntegrationAPI = {

    _data: null,
    _tree: null,

    addSearchListener: function(callback) {
        this.callback = callback;
    },

    searchByPolygon: function(polygonPoints) {

        if (!this._tree) {
            this._retrieveMarkers(polygonPoints);
            return;
        }

        var polygon = new google.maps.Polygon({
            paths: polygonPoints
        });

        var bounds = new google.maps.LatLngBounds();
        var paths = polygon.getPaths();
        var path;
        for (var i = 0; i < paths.getLength(); i++) {
            path = paths.getAt(i);
            for (var ii = 0; ii < path.getLength(); ii++) {
                bounds.extend(path.getAt(ii));
            }
        }

        var searchResult = this._tree.search([
            bounds.getSouthWest().lng(),
            bounds.getSouthWest().lat(),
            bounds.getNorthEast().lng(),
            bounds.getNorthEast().lat()
        ]);

        var result = [];
        for (var j = 0; j < searchResult.length; j++) {

            var elem = searchResult[j];
            var point = new google.maps.LatLng(elem.lat, elem.lng);
            if (polygonPoints.length > 2) {
                if (google.maps.geometry.poly.containsLocation(point, polygon)) {
                    result.push(elem);
                }
            }
        }

        var that = this;
        setTimeout(function() {
            that.callback(result);
        }, 500);
    },

    _retrieveMarkers: function(polygonPoints) {
        var that = this;
        $.get("example-properties.json").success(function(data) {
            that._tree = rbush(9, ['.lng', '.lat', '.lng', '.lat']);

            for (var i = 0; i < data.length; i++) {
                var elem = data[i];
                var lat = elem.geometry.coordinates[1];
                var lng = elem.geometry.coordinates[0];
                that._tree.insert({
                    propertyId: elem.properties.gx_id,
                    lat: lat,
                    lng: lng
                });
            }

            that.searchByPolygon(polygonPoints);
        });
    },

    setPropertiesFilter: function(propertiesIds) {

    },

    retrievePropertyData: function(id) {
        var heading = Math.random() * 360;
        var propertyData = {
            propertyId: id,
            "Address": chance.address() + ", London",
            "Phone": chance.phone({
                country: "uk"
            }),
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
        return new Promise(function(resolve) {
            window.setTimeout(
                function() {
                    resolve(propertyData);
                }, 1000);
        });
    },

    retrieveDatasets: function() {

        var datasets = [{
            label: "Primary Schools",
            type: "gme",             
            id: '08945086319809671446-16133476562581908850'
        }, {
            label: "Railway Lines",
            type: "gme",
            id: '08945086319809671446-04321643559861420246'
        }];
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
        //startSearchPlaces: false,
        places: {
            Schools: {
                type: 'school' //default icon
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
        layers: [{
            type: "gme",
            id: '10446176163891957399-01658747114625264102', //"10446176163891957399-13516001307527776624",
            label: "GME Layer"
                // layerName: 'layer_00001'
        }, {
            label: "WMS House Prices",
            type: "wms",
            url: "https://mapit.jll.com/arcgis/services/EMEA/House_Prices_WMS_test2/MapServer/WMSServer",
            layers: '0',
            opacity: 0.5
        }]
    };

    var mapOptions = {
        id: 'map',
        center: [51.5014408, -0.1406347],
        zoom: 12
    };

    var mapViewer = new MapViewer(mapOptions, IntegrationAPI, [
        layerListControl,
        placesToolbar,
        { 
            type: "search-on-pan",
            defaultChecked: true,
        }, "check-draw", 'picture-exportation', 'heatmap-view', 'points-of-interest'
    ]);

    mapViewer.setBubbleTemplate({
        "Details": {
            dataFields: ['Address', 'Phone'],
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