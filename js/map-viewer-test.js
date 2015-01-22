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
    console.log("new Map Viewer");


    mapViewer = new MapViewer('map', IntegrationAPI);
    mapViewer.loadModule("button");
}
