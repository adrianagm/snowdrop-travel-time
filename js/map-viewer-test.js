var mapViewer;

var IntegrationAPI = {

    addSearchListener: function(callback) {

    },

    searchByPolygon: function(poligonPoints) {

    },

    setPropertiesFilter: function(propertiesIds) {

    }
};

function MapViewerTest() {
    console.log("Map Viewer");

    mapViewer = new MapViewer('map', IntegrationAPI);
    mapViewer.loadModule("button");

    var chicago = new google.maps.LatLng(41.850033, -87.6500523);
    mapViewer.loadModule({
    	type: 'button',
    	text: 'Chicago',
    	position: 'BOTTOM_CENTER',
    	clickFunction: mapViewer.map.setCenter,
    	clickParams: [chicago],
    	clickThis: mapViewer.map
    });
}
