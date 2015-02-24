(function() {

        var CONTROL_CLASS = 'places';
        MapViewer.Places = MapViewer.extend(MapViewer.MapControl, {

                template: '<div class="places-div"><div class="header" data-i18n="places"><a class="collapse-class" href="#"></a>Places</div><ul class="places-list"></ul></div>',
                controlClass: 'places-control',

                position: 'RIGHT_BOTTOM',
                alias: CONTROL_CLASS,

                placesList: null,
                places: {},
                markers: {},

                service: null,
                infowindow: null,
                startCollapse: false,
                clusterPlaces: null,


                initialize: function() {
                    MapViewer.placesList = this.places;
                    var places = this.places;
                    var mcOptions = {
                        className: "places-cluster-marker"
                    };

                    MapViewer.clusterPlaces = new MarkerClusterer(this.map, null, mcOptions);
                    this.placesList = this.getElementsByClass('places-list')[0];
                    for (var place in places) {
                        this.addLI(place);
                    }
                    if (this.startCollapse) {
                        this.toggleList();
                    }
                    this.infowindow = new google.maps.InfoWindow();
                    this.service = new google.maps.places.PlacesService(this.map);

                    var that = this;
                    var timeOut = null;
                    this.bindEvent('places', 'click', function(event) {
                        var li = event.currentTarget;
                        if (timeOut !== null) {
                            clearTimeout(timeOut);
                        }

                        if (li.classList.contains('active')) {
                            timeOut = setTimeout(function() {
                                that.placesDeselected(li);
                            }, 500);
                        } else {
                            timeOut = setTimeout(function() {
                                that.placesSelected(li);
                            }, 500);
                        }
                    });



                    this.bindEvent('header', 'click', function(event) {
                        that.toggleList(event.target);
                    });
                    google.maps.event.addListener(this.map, 'dragend', function() {
                        var activePlaces = that.getElementsByClass('active');
                        for (var i = 0; i < activePlaces.length; i++) {
                            var place = that.places[activePlaces[i].innerHTML];
                            var type = place.type;
                            that.removePlacesToMap(type);
                            that.placesSelected(activePlaces[i], that.updateHeatmap);
                        }
                    });
                },

                placesSelected: function(li, callback) {
                    li.classList.add('active');
                    var place = this.places[li.innerHTML];
                    var type = place.type;
                    var request = {
                        location: this.map.getCenter(),
                        radius: 50000,
                        types: [type]
                    };
                    if (!place.iconClass) {
                        place.iconClass = 'places-marker places-marker-' + type;
                    }
                    var that = this;
                    this.service.radarSearch(request, function(results, status) {
                        if (status == google.maps.places.PlacesServiceStatus.OK) {
                            //that.map.setZoom(12);
                            that.markers[type] = [];
                            for (var i = 0; i < results.length; i++) {
                                that.createMarker(results[i], type, place.iconClass);
                            }
                            MapViewer.clusterPlaces.addMarkers(that.markers[type]);
                            if (callback)
                                callback();
                        }
                    });
                },

                createMarker: function(place, type, icon) {
                    var marker = {
                        properties: place,
                        latLng: place.geometry.location,
                        iconClass: icon,
                        map: this.map
                    };
                    marker = MapViewer.prototype.drawMarker(marker);

                    this.markers[type].push(marker);

                    /*var that = this;
           google.maps.event.addListener(marker, 'click', function() {
                that.infowindow.setContent(place.name);
                that.infowindow.open(that.map, this);
            });*/
                },

                placesDeselected: function(li) {
                    li.classList.remove('active');
                    var place = this.places[li.innerHTML];
                    var type = place.type;
                    this.removePlacesToMap(type);
                    if (MapViewer.heatmap) {
                        if (type === MapViewer.heatPlaces) {
                            MapViewer.heatmap.setMap(null);
                            var heatMapButton = document.getElementsByClassName('heatmap-view-button')[0];
                            if (heatMapButton) {
                                if (heatMapButton.classList.contains('active')) {
                                    heatMapButton.classList.remove('active');
                                }
                            }
                        }
                    }

                    },

                    removePlacesToMap: function(type) {
                            var markers = this.markers[type];
                            MapViewer.clusterPlaces.removeMarkers(markers);
                            for (var m = 0; m < markers.length; m++) {
                                markers[m].setMap(null);
                            }
                            this.markers[type] = [];
                        },

                        toggleList: function(header) {
                            var style = this.placesList.style;
                            if (style.display !== 'none') {
                                header.classList.add('collapse');
                                style.display = 'none';
                            } else {
                                header.classList.remove('collapse');
                                style.display = 'inline-block';
                            }
                        },

                        addLI: function(place) {
                            var li = document.createElement('li');
                            li.className = 'places';
                            li.innerHTML = place;
                            li.setAttribute("data-tag", place);
                            this.placesList.appendChild(li);
                        },
                        updateHeatmap: function() {
                            var heatMapButton = document.getElementsByClassName('heatmap-view-button')[0];
                            if (heatMapButton) {
                                if (heatMapButton.classList.contains('active')) {
                                    MapViewer.heatmap.setMap(null);
                                    MapViewer.Heatmap.prototype.createHeatMap();


                                }
                            }
                        }
                });

            MapViewer.registerModule(MapViewer.Places, CONTROL_CLASS);
        })();