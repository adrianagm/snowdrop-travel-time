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
            this.setModulesMap();
            this.activeModules = {};
        },

        setModulesMap: function() {
            MapViewer.MapControl.prototype.map = this.map;
            for (var module in MapViewer.modules) {
                MapViewer.modules[module].control.prototype.map = this.map;
            }
        },

        loadModule: function(control) {
            var moduleObject;
            var module;
            if (typeof(control) === 'string') {
                moduleObject = MapViewer.modules[control];
                module = new moduleObject.control(moduleObject.defaultOptions);
                module.addToMap(moduleObject.defaultPosition);
            } else if (typeof(control) === 'object') {
                moduleObject = MapViewer.modules[control.type];
                module = new moduleObject.control(control);
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
        this.modules[alias] = {
            control: control,
            defaultPosition: defaultPosition,
            defaultOptions: defaultOptions
        };
    };

    MapViewer.extend = function(parent, child) {
        var Module = function(options) {
            parent.apply(this, arguments);
        };
        for (var attr in parent.prototype) {
            Module.prototype[attr] = parent.prototype[attr];
        }
        for (attr in child) {
            Module.prototype[attr] = child[attr];
        }
        return Module;
    };
})();
