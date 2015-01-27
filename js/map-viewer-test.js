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

    mapViewer = new MapViewer('map', IntegrationAPI, [
        "button", {
            type: 'button',
            text: 'Hide/Show',
            position: 'BOTTOM_RIGHT',
            clickFunction: hide,
            cssClass: 'nhide'
        }, {
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
        }
    ]);
}

window.onload = MapViewerTest;
