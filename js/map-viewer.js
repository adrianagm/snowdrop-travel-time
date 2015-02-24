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

            var intervalResize = setInterval(function() {
                if (document.getElementById(id).clientHeight > 0) {
                    google.maps.event.trigger(that.map, "resize");
                    clearInterval(intervalResize);
                }
            }, 100);

        });
    };

    MapViewer.loadLib('https://maps.googleapis.com/maps/api/js?v=3.exp&callback=cb&libraries=geometry,places,drawing,visualization');
}

(function() {
    "use strict";

    MapViewer.prototype = {
        markers: [],
        cluster: null,
        toggleGroups: {},

        createMap: function(id, api) {
            var mapOptions = {
                zoom: 12,
                center: new google.maps.LatLng(40.7033121, -73.979681),
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.SMALL,
                    position: google.maps.ControlPosition.RIGHT_TOP,

                },
                streetViewControl: false,
                panControl: false
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
                that.notifySearchResults(results);
            });

            this.setModulesMap();
            this.setModulesApi();
            this.setModulesOwner();
            this.loadedModules = {};

            google.maps.event.addListenerOnce(that.map, 'tilesloaded', function() {
                google.maps.event.addListenerOnce(that.map, 'tilesloaded', function() {
                    google.maps.event.trigger(that.map, 'resize');
                });
            });
        },

        setModulesMap: function() {
            MapViewer.MapControl.prototype.map = this.map;
            for (var module in MapViewer.modules) {
                MapViewer.modules[module].prototype.map = this.map;
            }
        },

        setModulesOwner: function() {
            MapViewer.MapControl.prototype.owner = this;
            for (var module in MapViewer.modules) {
                MapViewer.modules[module].prototype.owner = this;
            }
        },

        setModulesApi: function() {
            MapViewer.MapControl.prototype.api = this.api;
            for (var module in MapViewer.modules) {
                MapViewer.modules[module].prototype.api = this.api;
            }
        },


        loadModule: function(control) {
            var ModuleObject;
            var module;
            var controlClass;

            if (typeof(control) === 'string') {
                ModuleObject = MapViewer.modules[control];
                controlClass = control;

            } else if (typeof(control) === 'object') {
                ModuleObject = MapViewer.modules[control.type];
                controlClass = control.type;
            }

            module = new ModuleObject(control);

            if (controlClass && module) {

                module.addToMap();

                //all modules loaded will be stored
                this.loadedModules[controlClass] = module;

                //it fill toggleGroups with the information of the modules
                if (module.toggleGroup) {
                    var _toggleGroup = module.toggleGroup;
                    for (var i = 0; i < _toggleGroup.length; i++) {
                        if (!this.toggleGroups[_toggleGroup[i]]) {
                            this.toggleGroups[_toggleGroup[i]] = [];
                        }
                        this.toggleGroups[_toggleGroup[i]].push(controlClass);
                    }
                }
            }

        },

        notifyActivation: function(activeModule) {
            if (activeModule.toggleGroup) {
                var _toggleGroup = activeModule.toggleGroup;
                for (var i in _toggleGroup) {
                    if (this.toggleGroups[_toggleGroup[i]]) {
                        var _group = this.toggleGroups[_toggleGroup[i]];
                        for (var j in _group) {
                            if (_group[j] !== activeModule.alias && this.loadedModules[_group[j]]) {
                                this.loadedModules[_group[j]].deactivate();
                            }
                        }
                    }
                }
            }
            activeModule.activate();
        },

        notifySearchResults: function(searchResults) {
            for (var module in this.loadedModules) {
                this.loadedModules[module].onSearchResults(searchResults);
            }
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

        getMarkers: function() {
            return this.markers;
        },

        removeMarkers: function() {
            this.markers = [];
            this.cluster.clearMarkers();
        },

        setMarkers: function(searchResults) {
            this.markers = [];

            for (var i = 0; i < searchResults.length; i++) {
                var marker = {
                    latLng: new google.maps.LatLng(searchResults[i].lat, searchResults[i].lng),
                    iconClass: "property-marker",
                    properties: searchResults[i],
                    map: this.map
                };
                this.markers.push(this.drawMarker(marker));

            }

            this.cluster.addMarkers(this.markers);
        },

        drawMarker: function(marker) {
            var content = "<div class='" + marker.iconClass + "'></div>";
            var richMarker = new RichMarker({
                position: marker.latLng,
                flat: true,
                content: content,
                map: marker.map
            });
            richMarker.isInCluster = true;
            return richMarker;
        },

        redrawMarkers: function() {
            this.cluster.clearMarkers();
            this.cluster.addMarkers(this.markers);
        },

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
