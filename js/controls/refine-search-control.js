(function() {
    var CONTROL_CLASS = 'refine-search';
    var MAX_REQUESTS = 25;

    MapViewer.RefineSearchControl = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="refine-search-control-outer"><div class="refine-search-control-border">' +
            '<div class="refine-search-control-inner"><a class="check-class" href="#"> </a><span> Refine search</span></div></div></div>',
        controlClass: 'refine-search-control',

        position: 'LEFT_BOTTOM',
        alias: CONTROL_CLASS,
        text: 'Default',
        defaultChecked: false,
        checked: "",
        toggleGroup: [''],

        marker: null,
        infoWindow: null,
        infoWindowContent: null,
        eventsActivated: false,
        labelsCluster: null,

        matrix: [],
        mode: null,
        travelMode: null,
        value: 1,

        initialize: function() {
            this.link = this.getElementsByClass('check-class')[0];

            if (this.defaultChecked) {
                this.link.classList.add('checked-pan');

            } else {
                this.link.classList.add('unchecked-pan');
            }
            this.setCheckEvent();
        },

        setCheckEvent: function() {
            var that = this;
            this.bindEvent('refine-search-control-outer', 'click', function(event) {
                if (that.link.classList.contains("unchecked-pan")) {
                    if (!this.marker) {
                        that.createCluster();
                        that.createMarker();
                    }
                    that.marker.setMap(that.map);

                    //reset control
                    that.mode = 'duration';
                    that.travelMode = google.maps.TravelMode.DRIVING;
                    that.value = 60;
                    that.getMatrix();

                    that.notifyActivation();
                } else {
                    that.marker.setMap(null);
                    that.eventsActivated = false;
                    that.deactivate();
                    that.clearLabels();
                    that.owner.redrawMarkers();
                }
            });
        },

        createCluster: function() {
            var options = {
                className: "refine-cluster-marker"
            };
            this.labelsCluster = new MarkerClusterer(this.map, null, options);
        },

        createMarker: function() {
            this.marker = new google.maps.Marker({
                position: this.map.getCenter(),
                draggable: true,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: 'green',
                    fillOpacity: 0.8,
                    strokeColor: 'green',
                    strokeWeight: 2
                }
            });

            this.createInfowindow();

            var that = this;
            google.maps.event.addListener(this.marker, 'dragend', function() {
                that.owner.cluster.clearMarkers();
                that.labelsCluster.clearMarkers();
                var markers = that.owner.getMarkers();
                for (var m = 0; m < markers.length; m++) {
                    markers[m].isInCluster = false;
                }

                that.getMatrix();
            });
        },

        createInfowindow: function() {
            this.infoWindowContent = document.createElement('div');
            this.infoWindowContent.innerHTML = '<div class="refine-popup">' +
                '<div class="refine-mode">' +
                '<div class="refine-button active refine-time">Time</div><div class="refine-button inactive refine-distance">Distance</div>' +
                '</div>' +
                '<div class="refine-travelmode">' +
                '<span class="refine-button active fa fa-car travel-car"></span><span class="refine-button inactive fa fa-male travel-walking"></span>' +
                '</div>' +
                '<div class="refine-value">' +
                '<input type="number" value="60" min="0" step="1" class="refine-input"/><span class="refine-label">min.</span>' +
                '</div>' +
                '</div>';

            this.infowindow = new google.maps.InfoWindow();
            this.infowindow.setContent(this.infoWindowContent);

            var that = this;
            google.maps.event.addListener(this.marker, 'click', function() {
                that.infowindow.open(that.map, that.marker);
            });

            this.infowindow.open(this.map, this.marker);
            this.setInfoWindowEvents();
        },

        setInfoWindowEvents: function() {
            if (!this.eventsActivated) {
                var that = this;
                google.maps.event.addDomListener(this.getButton('refine-time'), 'click', function(event) {
                    that.mode = 'duration';
                    that.activateButton('refine-time');
                    that.deactivateButton('refine-distance');
                    that.getButton('refine-label').innerHTML = 'min.';
                    that.value = 60;
                    that.getButton('refine-input').value = that.value;
                    that.filterMarkers();
                });

                google.maps.event.addDomListener(this.getButton('refine-distance'), 'click', function(event) {
                    that.mode = 'distance';
                    that.activateButton('refine-distance');
                    that.deactivateButton('refine-time');
                    that.getButton('refine-label').innerHTML = 'Km.';
                    that.value = 10;
                    that.getButton('refine-input').value = that.value;
                    that.filterMarkers();
                });

                google.maps.event.addDomListener(this.getButton('travel-car'), 'click', function(event) {
                    that.travelMode = google.maps.TravelMode.DRIVING;
                    that.activateButton('travel-car');
                    that.deactivateButton('travel-walking');
                    that.getMatrix();
                });

                google.maps.event.addDomListener(this.getButton('travel-walking'), 'click', function(event) {
                    that.travelMode = google.maps.TravelMode.WALKING;
                    that.activateButton('travel-walking');
                    that.deactivateButton('travel-car');
                    that.getMatrix();
                });

                google.maps.event.addDomListener(this.getButton('refine-input'), 'change', function(event) {
                    that.value = event.target.value;
                    that.filterMarkers();
                });
                that.eventsActivated = true;
            }
        },

        activateButton: function(id) {
            this.getButton(id).classList.add('active');
            this.getButton(id).classList.remove('inactive');
        },

        deactivateButton: function(id) {
            this.getButton(id).classList.add('inactive');
            this.getButton(id).classList.remove('active');
        },

        getButton: function(id) {
            return this.infoWindowContent.getElementsByClassName(id)[0];
        },

        onSearchResults: function(searchResults) {
            if (!this.marker || !this.marker.getMap()) return;
            this.clearLabels();
            this.getMatrix();
        },

        getMatrix: function() {
            if (this.owner.getMarkers().length === 0) return;

            var service = new google.maps.DistanceMatrixService();
            var ownerMarkers = this.owner.getMarkers();
            var slices = ownerMarkers.length / MAX_REQUESTS;
            var that = this;
            var promises = [];

            that.matrix = [];
            for (var s = 0; s < slices; s++) {

                var promise = new Promise(function(resolve, reject) {
                    var destinations = ownerMarkers.slice(MAX_REQUESTS * s, MAX_REQUESTS * s + MAX_REQUESTS);

                    setTimeout(function() {
                        service.getDistanceMatrix({
                            origins: [that.marker.position],
                            destinations: destinations.map(function(marker) {
                                return marker.position;
                            }),
                            travelMode: that.travelMode,
                            avoidHighways: false,
                            avoidTolls: false
                        }, function(res, status) {
                            if (!that.marker.getMap()) return;

                            if (status === 'OK') {
                                resolve(res.rows[0].elements);

                                var args = [MAX_REQUESTS * s, MAX_REQUESTS].concat(res.rows[0].elements);
                                Array.prototype.splice.apply(that.matrix, args);
                                that.filterMarkers();
                            } else {
                                console.log(status);
                                reject();
                                that.owner.redrawMarkers();
                            }
                        });
                    }, 1100 * s);
                });
                promises.push(promise);
            }

            Promise.all(promises).then(function(values) {
                console.log(that.matrix);
            });
        },

        filterMarkers: function() {
            var markers = this.owner.getMarkers();
            var markersToAdd = [];
            var markersToRemove = [];
            var labelsToAdd = [];
            var labelsToRemove = [];

            this.clearLabels();
            //this.owner.cluster.clearMarkers();

            var unitChange = this.mode === 'duration' ? 60 : 1000;
            var convertedValue = this.value * unitChange;

            for (var m = 0; m < markers.length; m++) {
                var marker = markers[m];

                if (this.matrix[m] && this.matrix[m].status === 'OK') {
                    var value = this.matrix[m][this.mode].value;

                    if (value < convertedValue) {

                        if (!marker.isInCluster) {
                            markersToAdd.push(marker);
                            marker.isInCluster = true;
                        }

                        if (!marker.refineLabel) {
                            var label = this.setMarkerLabel(marker, this.matrix[m][this.mode].text);
                            labelsToAdd.push(label);
                        }

                    } else if (marker.isInCluster) {
                        markersToRemove.push(marker);
                        marker.isInCluster = false;
                    }
                }
            }
            this.labelsCluster.addMarkers(labelsToAdd);
            this.owner.cluster.addMarkers(markersToAdd);
            this.owner.cluster.removeMarkers(markersToRemove);
        },

        setMarkerLabel: function(marker, text) {
            var label = new RichMarker({
                position: marker.position,
                flat: true,
                content: '<div class="refine-marker-label">' + text + '</div>',
                map: this.map
            });
            return label;
        },

        clearLabels: function() {
            this.labelsCluster.clearMarkers();
        }
    });

    MapViewer.registerModule(MapViewer.RefineSearchControl, CONTROL_CLASS);
})();
