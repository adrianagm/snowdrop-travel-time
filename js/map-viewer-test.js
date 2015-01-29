var mapViewer;

var IntegrationAPI = {

    addSearchListener: function(callback) {

    },

    searchByPolygon: function(poligonPoints) {

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
        placesToolbar

    ]);
}

window.onload = MapViewerTest;