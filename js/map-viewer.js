function MapViewer(id, api, modules) {
    try {
        this.checkAPI(api);
    } catch (error) {
        console.error(error);
    }

    var that = this;
    cb = function() {
        var promises = MapViewer.loadGoogleLibs();
        Promise.all(promises).then(function(values) {
            that.createMap(id, api);
            that.loadModules(modules);
        });
    };

    MapViewer.loadLib('https://maps.googleapis.com/maps/api/js?v=3.exp&callback=cb&libraries=places,drawing,visualization');
}

(function() {
    "use strict";
    MapViewer.prototype = {
        cluster: null,
        createMap: function(id, api) {
            var mapOptions = {
                zoom: 12,
                center: new google.maps.LatLng(40.7033121, -73.979681)
            };

            this.element = document.getElementById(id);
            this.element.classList.add('map-widget');
            this.map = new google.maps.Map(this.element, mapOptions);
            this.api = api;

            var that = this;
            this.setCluster();

            this.api.addSearchListener(function(results) {
                that.removeMarkers();
                that.setMarkers(results);
            });



            this.setModulesMap();
            this.setModulesApi();
            this.activeModules = {};
        },

        setModulesMap: function() {
            MapViewer.MapControl.prototype.map = this.map;
            for (var module in MapViewer.modules) {
                MapViewer.modules[module].prototype.map = this.map;
            }
        },

        setModulesApi: function() {
            MapViewer.MapControl.prototype.api = this.api;
            for (var module in MapViewer.modules) {
                MapViewer.modules[module].prototype.api = this.api;
            }
        },

        drawMarker: function(marker) {
            var content = "<div class='" + marker.iconClass + "'></div>";
            var richMarker = new RichMarker({
                position: marker.latLng,
                flat: true,
                content: content,
                map: marker.map
            });

            return richMarker;
        },

        loadModule: function(control) {
            var ModuleObject;
            var module;
            if (typeof(control) === 'string') {
                ModuleObject = MapViewer.modules[control];
            } else if (typeof(control) === 'object') {
                ModuleObject = MapViewer.modules[control.type];
            }

            module = new ModuleObject(control);
            module.addToMap();
        },

        loadModules: function(modulesList) {
            for (var m = 0; m < modulesList.length; m++) {
                this.loadModule(modulesList[m]);
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
        },

        setCluster: function() {
            var mcOptions = {
                className: "property-cluster-marker"
            };
            this.cluster = new MarkerClusterer(this.map, null, mcOptions);
        },

        removeMarkers: function() {
            this.cluster.clearMarkers();
        },

        setMarkers: function(searchResults) {
            var markers = [];

            for (var i = 0; i < searchResults.length; i++) {
                var latLng = new google.maps.LatLng(searchResults[i].lat, searchResults[i].lng);
                var marker = new RichMarker({
                    position: latLng,
                    flat: true,
                    content: '<div class="property-marker"></div>'
                });
                markers.push(marker);
            }

            this.cluster.addMarkers(markers);

        }
    };

    //Class functions
    MapViewer.modules = {};
    MapViewer.registerModule = function(controlClass, alias) {
        this.modules[alias] = controlClass;
    };

    MapViewer.loadGoogleLibs = function() {
        var promises = [];
        promises.push(this.loadLib('js/libs/markerclusterer.js'));
        promises.push(this.loadLib('js/libs/richmarker.js'));
        promises.push(this.loadLib('js/libs/mercatorProjectorLayer.js'));
        return promises;
    };

    MapViewer.loadLib = function(src) {
        var promise = new Promise(function(resolve, reject) {
            var lib = document.createElement('script');
            lib.src = src;
            lib.onload = function() {
                resolve();
            };
            document.body.appendChild(lib);
        });
        return promise;
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