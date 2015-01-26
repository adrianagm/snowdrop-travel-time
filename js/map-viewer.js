function MapViewer(id, api) {
    try {
        this.checkAPI(api);
    } catch (error) {
        console.error(error);
    }
    this.createMap(id);
}

(function() {
    "use strict";
    MapViewer.prototype = {
        createMap: function(id) {
            var mapOptions = {
                zoom: 8,
                center: new google.maps.LatLng(51.506640, -0.125853)
            };

            this.element = document.getElementById(id);
            this.element.classList.add('map-widget');
            this.map = new google.maps.Map(this.element, mapOptions);
            MapViewer.MapControl.prototype.map = this.map;
            this.activeModules = {};
        },

        loadModule: function(control) {
            if (typeof(control) === 'string') {
                var moduleObject = MapViewer.modules[control];
                var module = new moduleObject.control(moduleObject.defaultOptions);
                module.addToMap(moduleObject.defaultPosition);
            } else if (typeof(control) === 'object') {
                var moduleObject = MapViewer.modules[control.type];
                var module = new moduleObject.control(control);
                module.addToMap(control.position);
            }
        },

        checkAPI: function(api) {
            var error;
            if (!api)
                error = "Map viewer needs an API object.";
            else if (!api.searchByPolygon)
                error = "API object does not contain searchByPolygon function.";
            else if (typeof(api.searchByPolygon) !== "function")
                error = "API searchByPolygon is not a function.";
            else if (!api.addSearchListener)
                error = "API object does not contain addSearchListener function.";
            else if (typeof(api.addSearchListener) !== "function")
                error = "API addSearchListener is not a function.";
            else if (!api.setPropertiesFilter)
                error = "API object does not contain setPropertiesFilter function.";
            else if (typeof(api.setPropertiesFilter) !== "function")
                error = "API setPropertiesFilter is not a function.";

            if (error) throw error;
        }
    };

    //Class functions
    MapViewer.modules = {};
    MapViewer.registerModule = function(control, alias, defaultPosition, defaultOptions) {
        control.prototype = Object.create(MapViewer.MapControl.prototype);
        this.modules[alias] = {control: control, defaultPosition: defaultPosition, defaultOptions: defaultOptions};
    };
})();
