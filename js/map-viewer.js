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

    MapViewer.loadLib('https://maps.googleapis.com/maps/api/js?v=3.exp&callback=cb&libraries=places,visualization');
}

var infoWindow = null;


(function() {
    "use strict";

    MapViewer.prototype = {
        cluster: null,
        templateTabs: null,
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
                //that.removeMarkers();
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
            var that = this;
            for (var i = 0; i < 20; i++) {
                var latLng = new google.maps.LatLng(searchResults[i].lat, searchResults[i].lng);
                var markerObject = {
                    properties: searchResults[i],
                    latLng: latLng,
                    iconClass: 'property-marker',
                    map: this.map,

                };
                var marker = this.drawMarker(markerObject);
                this.showInfoWindow(marker);
                markers.push(marker);

            }

            this.cluster.addMarkers(markers);

        },

        drawMarker: function(marker) {
            var content = "<div class='" + marker.iconClass + "'></div>";
            var richMarker = new RichMarker({
                position: marker.latLng,
                flat: true,
                content: content,
                map: marker.map,
                properties: marker.properties,

            });

            return richMarker;
        },

        showInfoWindow: function(marker) {
            var that = this;
            marker.addListener("click", function(event) {
                if (infoWindow) {
                    infoWindow.close();
                    infoWindow.removeChildren_(infoWindow.content_);

                }
                infoWindow = that.setInfoWindow(marker);
                infoWindow.open(this.map, this);



            });

        },

        setInfoWindow: function(marker) {
            var infoWindow = new InfoBubble({
                offsetWidth: 10,
                offsetHeight:20
            });
            var tabs = this.templateTabs;
            for (var labelTab in tabs) {
                var tab = tabs[labelTab];
                var output = tab.template ? tab.template : '';

                var data = marker.properties;
                if (tab.dataFields) {
                    data = {};
                    for (var d in tab.dataFields) {
                        var field = tab.dataFields[d];
                        data[field] = marker.properties[field];
                    }

                }
                var details = {
                    'data': []
                };
                if (tab.template) {
                    for (var propKey in data) {
                        var item = data[propKey];
                        if (item instanceof Object) {
                            for (var i in item) {
                                details.data.push({
                                    'key': i,
                                    'value': item[i]
                                });
                            }
                        } else {
                            details.data.push({
                                'key': propKey,
                                'value': item
                            });
                        }
                    }
                    output = Mustache.render(tab.template, details);
                } else {
                    output = 'No content template';
                }



                if (tab.type == 'streetView') {
                    output = '<div class="balloon street-tab container"><div id="pano"></div><div id="map-pano"></div>';
                    google.maps.event.addDomListener(infoWindow, 'content_changed', function() {
                        google.maps.event.addDomListener(infoWindow, 'domready', function() {
                            if (document.getElementById('pano') !== null) {
                                if (tab.orientationField) {
                                    marker.orientationField = marker.properties[tab.orientationField];
                                }
                                if (tab.inclinationField) {
                                    marker.inclinationField = marker.properties[tab.inclinationField];
                                }
                                initializeStreetView(marker);
                            }
                        });
                    });

                }


                infoWindow.addTab(labelTab, output);



            }

            return infoWindow;

        },

        setBubbleTemplate: function(template) {
            this.templateTabs = template;
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
        promises.push(this.loadLib('js/libs/infobubble.js'));
        promises.push(this.loadLib('js/libs/mustache.js'));
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



function initializeStreetView(marker) {
    var mapPano = document.getElementById('map-pano');
    var pano = document.getElementById('pano');
    var heading = marker.orientationField ? marker.orientationField : 90;
    var pitch = marker.inclinationField ? marker.inclinationField : 5;
    var panoramaOptions = {
        position: marker.position,
        pov: {
            heading: heading,
            pitch: pitch
        }
    };

    var sv = new google.maps.StreetViewService();
    sv.getPanoramaByLocation(marker.position, 50, processSVData);

    function processSVData(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
            var panorama = new google.maps.StreetViewPanorama(pano, panoramaOptions);
            var map = new google.maps.Map(mapPano);
            map.setStreetView(panorama);
        } else {
            pano.innerHTML = 'Street View not available in this position';
        }
    }

}