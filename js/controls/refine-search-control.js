(function() {
    var CONTROL_CLASS = 'refine-search';

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
        labels: [],

        matrix: null,
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
            this.getMatrix();
        },

        getMatrix: function() {
            if (this.owner.getMarkers().length === 0) return;
            var service = new google.maps.DistanceMatrixService(),
                that = this;

            this.owner.cluster.clearMarkers();
            this.clearLabels();
            service.getDistanceMatrix({
                origins: [this.marker.position],
                destinations: this.owner.getMarkers().map(function(marker) {
                    return marker.position;
                }),
                travelMode: this.travelMode,
                avoidHighways: false,
                avoidTolls: false

            }, function(res, status) {
                if (status === 'OK') {
                    that.matrix = res.rows[0].elements;
                    that.filterMarkers();
                } else {
                    that.owner.redrawMarkers();
                }
            });
        },

        filterMarkers: function() {
            var markers = this.owner.getMarkers();
            var markersToAdd = [];

            this.clearLabels();
            this.owner.cluster.clearMarkers();

            var unitChange = this.mode === 'duration' ? 60 : 1000;
            var convertedValue = this.value * unitChange;

            for (var m = 0; m < markers.length; m++) {
                var marker = markers[m];

                if (this.matrix[m].status === 'OK') {
                    var value = this.matrix[m][this.mode].value;

                    if (value < convertedValue) {
                        markersToAdd.push(marker);
                        this.setMarkerLabel(marker, this.matrix[m][this.mode].text);
                    }
                }
            }
            this.labelsCluster.addMarkers(this.labels);
            this.owner.cluster.addMarkers(markersToAdd);
        },

        setMarkerLabel: function(marker, text) {
            var label = new RichMarker({
                position: marker.position,
                flat: true,
                content: '<div class="refine-marker-label">' + text + '</div>',
                map: this.map
            });

            this.labels.push(label);
        },

        clearLabels: function() {
            for (var l = 0; l < this.labels.length; l++) {
                this.labels[l].setMap(null);
            }
            this.labels = [];
            this.labelsCluster.clearMarkers();
        }
    });

    MapViewer.registerModule(MapViewer.RefineSearchControl, CONTROL_CLASS);
})();
