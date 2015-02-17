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
        eventsActivated: false,

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

            var that = this;
            this.bindEvent('refine-search-control-outer', 'click', function(event) {
                if (that.link.classList.contains("unchecked-pan")) {
                    if (!this.marker) {
                        that.createMarker();
                    }
                    that.marker.setMap(that.map);
                    that.mode = 'duration';
                    that.travelMode = google.maps.TravelMode.DRIVING;
                    that.value = 1;
                    that.notifyActivation();
                } else {
                    that.marker.setMap(null);
                    that.eventsActivated = false;
                    that.deactivate();
                }
            });
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
            this.infowindow = new google.maps.InfoWindow({
                content: '<div class="refine-popup">' +
                    '<div class="refine-mode">' +
                    '<div class="refine-button active" id="refine-time">Time</div><div class="refine-button inactive" id="refine-distance">Distance</div>' +
                    '</div>' +
                    '<div class="refine-travelmode">' +
                    '<span class="refine-button active fa fa-car" id="travel-car"></span><span class="refine-button inactive fa fa-male" id="travel-walking"></span>' +
                    '</div>' + '<input type="number" value="1" min="0" step="any" id="refine-value"/>' +
                    '</div>'
            });

            var that = this;
            google.maps.event.addListener(this.marker, 'click', function() {
                that.infowindow.open(that.map, that.marker);

                if (!that.eventsActivated) {
                    google.maps.event.addDomListener(document.getElementById('refine-time'), 'click', function(event) {
                        that.mode = 'duration';
                        that.activateButton('refine-time');
                        that.deactivateButton('refine-distance');
                        that.filterMarkers();
                    });

                    google.maps.event.addDomListener(document.getElementById('refine-distance'), 'click', function(event) {
                        that.mode = 'distance';
                        that.activateButton('refine-distance');
                        that.deactivateButton('refine-time');
                        that.filterMarkers();
                    });

                    google.maps.event.addDomListener(document.getElementById('travel-car'), 'click', function(event) {
                        that.travelMode = google.maps.TravelMode.DRIVING;
                        that.activateButton('travel-car');
                        that.deactivateButton('travel-walking');
                        that.getMatrix();
                    });

                    google.maps.event.addDomListener(document.getElementById('travel-walking'), 'click', function(event) {
                        that.travelMode = google.maps.TravelMode.WALKING;
                        that.activateButton('travel-walking');
                        that.deactivateButton('travel-car');
                        that.getMatrix();
                    });

                    google.maps.event.addDomListener(document.getElementById('refine-value'), 'change', function(event) {
                        //km or minutes
                        that.value = event.target.value;
                        that.filterMarkers();
                    });
                    that.eventsActivated = true;
                }
            });
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
            return document.getElementById(id);
        },

        getMatrix: function() {
            var service = new google.maps.DistanceMatrixService(),
                that = this;

            service.getDistanceMatrix({
                origins: [this.marker.position],
                destinations: this.owner.getMarkers().map(function(marker) {
                    return marker.position;
                }),
                travelMode: this.travelMode,
                avoidHighways: false,
                avoidTolls: false

            }, function(res, status) {
                that.matrix = res.rows[0].elements;
                that.filterMarkers();
            });
        },

        filterMarkers: function() {
            var markers = this.owner.getMarkers();
            var markersToAdd = [];

            this.owner.cluster.clearMarkers();

            var unitChange = this.mode === 'duration' ? 60 : 1000;
            var convertedValue = this.value * unitChange;

            for (var m = 0; m < markers.length; m++) {
                var marker = markers[m];
                var value = this.matrix[m][this.mode].value;

                if (value < convertedValue) {
                    console.log(this.matrix[m][this.mode].text);
                    markersToAdd.push(marker);
                }
            }
            this.owner.cluster.addMarkers(markersToAdd);
        }
    });

    MapViewer.registerModule(MapViewer.RefineSearchControl, CONTROL_CLASS);
})();
