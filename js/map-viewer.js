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
            that.createMap(id);
            that.loadModules(modules);
        });
    };

    MapViewer.loadLib('https://maps.googleapis.com/maps/api/js?v=3.exp&callback=cb&libraries=places');
}

(function() {
    "use strict";
    MapViewer.prototype = {
        cluster: null,
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
            var that = this;

            var mcOptions = {
                className: "property-cluster-marker"
            };

            this.cluster = new MarkerClusterer(this.map, null, mcOptions);

            google.maps.event.addListener(this.map, 'dragend', function() {
                that.removeMarkers();
                that.setMarkers();
            });
        },

        setModulesMap: function() {
            MapViewer.MapControl.prototype.map = this.map;
            for (var module in MapViewer.modules) {
                MapViewer.modules[module].prototype.map = this.map;
            }
        },

        removeMarkers: function() {
            this.cluster.clearMarkers();
        },

        setMarkers: function() {
            var data = [];
            var markers = [];
            data = this.CreateRandom();

            for (var i = 0; i < 20; i++) {
                var latLng = new google.maps.LatLng(data[i].lat, data[i].lng);
                var marker = new RichMarker({
                    position: latLng,
                    flat: true,
                    content: '<div class="property-marker"></div>'
                });
                markers.push(marker);
            }

            //this.cluster.setStyles(this.clusterStyles);
            this.cluster.addMarkers(markers);


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

        RandomCoordinate: function(min, max) {
            return Math.random() * (max - min) + min;
        },

        CreateRandom: function() {
            var list = [];

            var bounds = this.map.getBounds();
            var ne = bounds.getNorthEast();
            var sw = bounds.getSouthWest();
            var lat0 = sw.lat();
            var lat1 = ne.lat();
            var lng0 = sw.lng();
            var lng1 = ne.lng();


            for (var i = 0; i < 20; i++) {
                var lat = this.RandomCoordinate(lat0, lat1);
                var lng = this.RandomCoordinate(lng0, lng1);

                var elem = {
                    propertyId: 1,
                    lat: lat,
                    lng: lng,
                    fuzzy: false,
                    type: "test"
                };

                list.push(elem);
            }

            return list;
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