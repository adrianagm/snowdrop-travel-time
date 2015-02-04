var mapViewer;
var currentImage = 0;

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


    var placesToolbar = {
        type: 'places',
        places: {
            Schools: {
                type: 'school' //default icon
            },
            Hospitals: {
                type: 'hospital',
                iconClass: 'fa fa-hospital-o fa-lg' //fontawesome icon
            },
            Supermarkets: {
                type: 'grocery_or_supermarket' //css defined icon
            },
            Restaurants: {
                type: 'restaurant',
                iconClass: "fa fa-cutlery fa-lg"
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
    };

    mapViewer = new MapViewer('map', IntegrationAPI, [
        "button", {
            type: 'button',
            text: 'Hide/Show',
            position: 'BOTTOM_RIGHT',
            clickFunction: hide,
            cssClass: 'nhide'
        },
        layerListControl,
        placesToolbar,
        "search-on-pan"

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