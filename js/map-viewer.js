function MapViewer(options, api, modules) {
    try {
        this.checkAPI(api);
    } catch (error) {
        console.error(error);
    }
    
    this.cluster = null;
    this.toggleGroups = {};
    this.templateTabs = null;
    this.infoWindow = null;

    this.markersById = {};
    this.markers = [];

    var that = this;
    cb = function() {
        var promises = MapViewer.loadGoogleLibs();
        Promise.all(promises).then(function(values) {
            options.center = options.center ? new google.maps.LatLng(options.center[0], options.center[1]) : new google.maps.LatLng(51.5286416, -0.1015987);
            that.createMap(options, api);
            that.loadModules(modules);

            var intervalResize = setInterval(function() {
                if (document.getElementById(options.id).clientHeight > 0) {
                    google.maps.event.trigger(that.map, "resize");
                    that.map.setCenter(options.center);
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

        createMap: function(options, api) {
            this.api = api;
            var that = this;
            var mapOptions = {
                zoom: options.zoom ? options.zoom : 11,
                center: options.center,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.SMALL,
                    position: google.maps.ControlPosition.RIGHT_TOP,

                },
                streetViewControl: false,
                panControl: false
            };

            this.element = document.getElementById(options.id);
            this.element.classList.add('map-widget');
            this.map = new google.maps.Map(this.element, mapOptions);
            this.map.content = this.element;

        

            this.updatedMarkersById = {};

            google.maps.event.addListener(this.map, 'zoom_changed', function() {
                //close the infowindow if marker is clustered
                setTimeout(function() {
                    var clusters = that.cluster.clusters_;
                    for (var cluster in clusters) {
                        var markers = clusters[cluster].markers_;
                        if (markers.length > 1) {
                            for (var m in markers) {
                                if (markers[m].infoWindow && markers[m].infoWindow.isOpen) {
                                    markers[m].infoWindow.close();
                                }
                            }
                        }
                    }
                }, 1000);
            });


            this.setCluster();

            this.api.addSearchListener(function(results) {
                that.updateMarkers(results);
                that.notifySearchResults(results);
            });

            this.setModulesMap();
            this.setModulesApi();
            this.setModulesOwner();
            this.loadedModules = {};
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

        notifyPropertyClicked: function(marker) {
            for (var module in this.loadedModules) {
                this.loadedModules[module].onPropertyClicked(marker);
            }
        },

        notifyPlaceClicked: function(marker) {
            for (var module in this.loadedModules) {
                this.loadedModules[module].onPlaceClicked(marker);
            }
        },

        notifyPlaceRemoved: function(marker) {
            for (var module in this.loadedModules) {
                this.loadedModules[module].onPlaceRemoved(marker);
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

        updateMarkers: function(markers) {
            this.markers = [];
            this.updatedMarkersById = {};
            var newMarkers = [];

            for (var i = 0; i < markers.length; i++) {
                //new markers
                if (!this.markersById[markers[i].propertyId]) {
                    newMarkers.push(markers[i]);
                    //markers existing
                } else {
                    this.updatedMarkersById[markers[i].propertyId] = this.markersById[markers[i].propertyId];
                    this.markers.push(this.markersById[markers[i].propertyId]);
                }
            }

            var removeMarkers = [];
            for (var m in this.cluster.markers_) {
                var marker = this.cluster.markers_[m];
                if (!this.updatedMarkersById[marker.propertyId]) {
                    //previous markers outside new search
                    removeMarkers.push(this.markersById[marker.propertyId]);
                    //delete this.markersById[marker.propertyId];
                }
            }
            this.removeMarkers(removeMarkers);

            this.setMarkers(newMarkers);
        },

        removeAllMarkers: function() {
            for (var i in this.markers) {
                if (this.markers[i].infoWindow && this.markers[i].infoWindow.isOpen) {
                    this.markers[i].infoWindow.close();
                }
            }
            this.markers = [];

            this.cluster.clearMarkers();
        },
        removeMarkers: function(markers) {
            for (var i = 0; i < markers.length; i++) {
                if (markers[i].infoWindow && markers[i].infoWindow.isOpen) {
                    markers[i].infoWindow.close();
                }
            }

            this.cluster.removeMarkers(markers);

        },

        setMarkers: function(searchResults) {

            for (var i = 0; i < searchResults.length; i++) {
                var latLng = new google.maps.LatLng(searchResults[i].lat, searchResults[i].lng);
                var markerObject = {
                    propertyId: searchResults[i].propertyId,
                    latLng: latLng,
                    iconClass: 'property-marker',
                    map: this.map,

                };
                var marker = this.drawMarker(markerObject);
                this.showInfoWindow(marker);
                this.markers.push(marker);
                this.markersById[marker.propertyId] = marker;
                this.updatedMarkersById[marker.propertyId] = marker;
            }

            this.cluster.addMarkers(this.markers);
        },

        drawMarker: function(marker) {
            var content = document.createElement('div');
            content.className = marker.iconClass;
            var richMarker = new RichMarker({
                position: marker.latLng,
                flat: true,
                content: content,
                map: marker.map,
                propertyId: marker.propertyId

            });
            richMarker.isInCluster = true;
            return richMarker;
        },

        redrawMarkers: function() {
            this.cluster.clearMarkers();
            this.cluster.addMarkers(this.markers);
        },

        showInfoWindow: function(marker) {
            var that = this;
            marker.addListener("click", function(event) {
                if (that.infoWindow) {
                    that.infoWindow.close();
                    that.infoWindow.removeChildren_(that.infoWindow.content_);
                }
                that.internalPropertyDataPromise = that.api.retrievePropertyData(marker.propertyId);
                that.internalPropertyDataPromise.then(function(propertyData) {
                    that.infoWindow = that.setInfoWindow(marker, propertyData);
                    marker.infoWindow.open(that.map, marker);

                });
                var activeProperty = that.getElementsByClass('property-active')[0];
                if (activeProperty) {
                    activeProperty.classList.remove('property-active');
                }
                marker.getContent().classList.add('property-active');
                that.notifyPropertyClicked(marker);
            });

        },

        setInfoWindow: function(marker, propertyData) {
            marker.infoWindow = new InfoBubble({
                offsetWidth: 0,
                offsetHeight: marker.height / 2
            });

            var tabs = this.templateTabs;
            for (var labelTab in tabs) {
                var tab = tabs[labelTab];
                var output = tab.template ? tab.template : '';
                var iterableData = propertyData;
                if (tab.iterableFields) {
                    iterableData = {};
                    for (var d in tab.iterableFields) {
                        var field = tab.iterableFields[d];
                        iterableData[field] = propertyData[field];
                    }

                }
                var details = {
                    'iterableData': [],
                    'data': propertyData
                };
                if (tab.template) {
                    for (var propKey in iterableData) {
                        var item = iterableData[propKey];
                        if (item instanceof Object) {
                            for (var i in item) {
                                details.iterableData.push({
                                    'key': i,
                                    'value': item[i]
                                });
                            }
                        } else {
                            details.iterableData.push({
                                'key': propKey,
                                'value': item
                            });
                        }
                    }
                    
                    output = Mustache.render(tab.template, details);
                } else {
                    output = 'No content template';
                }


                var that = this;
                if (tab.type == 'streetView') {
                    output = '<div class="balloon street-tab container"><div class="pano"></div><div class="map-pano"></div>';
                    google.maps.event.addDomListener(marker.infoWindow, 'content_changed', function() {
                        google.maps.event.addDomListener(marker.infoWindow, 'domready', function() {
                            if (marker.infoWindow.content_.getElementsByClassName('pano')[0]) {
                                if (tab.orientationField) {
                                    marker.orientationField = propertyData[tab.orientationField];
                                }
                                if (tab.inclinationField) {
                                    marker.inclinationField = propertyData[tab.inclinationField];
                                }
                                that.initializeStreetView(marker);
                            }
                        });
                    });

                }


                marker.infoWindow.addTab(labelTab, output);
            }


            return marker.infoWindow;
        },

        setBubbleTemplate: function(template) {
            this.templateTabs = template;
        },

        initializeStreetView: function(marker) {
            var mapPano = marker.infoWindow.content_.getElementsByClassName('map-pano')[0];
            var pano = marker.infoWindow.content_.getElementsByClassName('pano')[0];
            var heading = marker.orientationField ? marker.orientationField : 90;
            var pitch = marker.inclinationField ? marker.inclinationField : 5;
            var panoramaOptions = {
                position: marker.position,
                pov: {
                    heading: heading,
                    pitch: pitch
                },
                panControl: false,
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
        },

        getElementsByClass: function(classSelector) {
            return this.element.getElementsByClassName(classSelector);
        }

    };

    //Class functions
    MapViewer.modules = {};
    MapViewer.registerModule = function(controlClass, alias) {
        this.modules[alias] = controlClass;
    };

    MapViewer.loadGoogleLibs = function() {
        var promises = [];
        /*
         promises.push(this.loadLib('js/libs/markerclusterer.js'));
         promises.push(this.loadLib('js/libs/richmarker.js'));
         promises.push(this.loadLib('js/libs/mercatorProjectorLayer.js'));
         promises.push(this.loadLib('js/libs/infobubble.js'));
         promises.push(this.loadLib('js/libs/mustache.js'));
         */
        loadMarkerClusterer();
        loadRichmarker();
        loadMercatorProjectorLayer();
        loadInfoBubble();

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