(function() {
    var CONTROL_CLASS = 'points-of-interest';

    MapViewer.POIControl = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="check-pan-control-outer"><div class="check-pan-control-border">' +
            '<div class="check-pan-control-inner"><a class="check-class" href="#"> </a><span> Points of interest</span></div></div></div>' +
            '<input id="poi-input" class="controls map-control poi-input hide" type="text" placeholder="Add new point of interest">',
        controlClass: 'check-pan-control',

        position: 'LEFT_BOTTOM',
        alias: CONTROL_CLASS,
        text: 'Default',
        defaultChecked: false,
        checked: "",
        toggleGroup: ['search-group'],

        input: null,
        searchBox: null,
        markers: [],
        infoWindows: [],

        distanceService: null,
        selectedProperty: null,

        initialize: function() {
            this.link = this.getElementsByClass('check-class')[0];

            this.distanceService = new google.maps.DistanceMatrixService();

            if (this.defaultChecked) {
                this.link.classList.add('checked-pan');

            } else {
                this.link.classList.add('unchecked-pan');
            }

            var that = this;

            this.bindEvent('check-pan-control-outer', 'click', function(event) {
                if (that.link.classList.contains("unchecked-pan")) {
                    that.notifyActivation();
                    that.showSearchBar();
                } else {
                    that.deactivate();
                }
            });
        },

        deactivate: function() {
            MapViewer.MapControl.prototype.deactivate.apply(this, arguments);
            this.clearMarkers();
            if (this.input) {
                this.input.classList.add('hide');
            }
        },

        showSearchBar: function() {
            if (!this.input) {
                this.input = this.getElementsByClass('poi-input')[0];
                this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(this.input);
            }

            if (!this.searchBox) {
                this.createSearchBar(this.input);
            }

            this.input.classList.remove('hide');
        },

        createSearchBar: function(input) {
            var that = this;
            var options = {};
            this.searchBox = new google.maps.places.Autocomplete(input, options);
            this.searchBox.bindTo('bounds', this.map);

            google.maps.event.addListener(this.searchBox, 'place_changed', function() {
                that.addMarker(that.searchBox.getPlace());
                //that.setMapBounds();

                //call blur to avoid searchbox refill input value
                that.input.blur();
                that.input.value = '';
            });
        },

        setSearchBarBounds: function() {
            var bounds = this.map.getBounds();
            this.searchBox.setBounds(bounds);
        },

        addMarker: function(place) {
            if (!place.geometry) return;

            var content = '<div class="poi-marker"></div>';
            var marker = new RichMarker({
                position: new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng()),
                flat: true,
                content: content,
                map: this.map
            });

            this.markers.push(marker);

            this.createInfowindow(marker, place.name);
            this.getMarkerMatrix(marker, google.maps.TravelMode.DRIVING);
            this.getMarkerMatrix(marker, google.maps.TravelMode.WALKING);
        },

        createInfowindow: function(marker, name) {
            infoWindowContent = document.createElement('div');
            infoWindowContent.innerHTML = '<div class="poi-popup">' +
                '<div class="poi-name">' + name + '</div>' +
                '<div class="car"><span class="car-icon"><i class="fa fa-car"></i></span><span class="car-distance poi-text"></span><span class="car-time poi-text"></span></div>' +
                '<div class="walking"><span class="walking-icon"><i class="fa fa-male"></i></span><span class="walking-distance poi-text"></span><span class="walking-time poi-text"></span></div>' +
                '</div>';

            marker.infoWindowContent = infoWindowContent;

            marker.infowindow = new google.maps.InfoWindow({
                pixelOffset: new google.maps.Size(0, -15),
                disableAutoPan: true
            });
            marker.infowindow.setContent(infoWindowContent);

            var that = this;
            google.maps.event.addListener(marker, 'click', function() {
                marker.infowindow.open(that.map, marker);
            });

            google.maps.event.addListener(marker.infowindow, 'closeclick', function() {
                marker.setMap(null);

                //remove marker from array
                var index = that.markers.indexOf(marker);
                if (index > -1) {
                    that.markers.splice(index, 1);
                }
            });
        },

        getMarkerMatrix: function(marker, travelMode) {
            if (!this.selectedProperty) return;

            var that = this;
            this.distanceService.getDistanceMatrix({
                origins: [this.selectedProperty.position],
                destinations: [marker.position],
                travelMode: travelMode,
                avoidHighways: false,
                avoidTolls: false
            }, function(res, status) {
                if (!marker.getMap()) return;

                if (status === 'OK') {
                    var result = res.rows[0].elements[0];
                    that.setMarkerProperties(marker, result, travelMode);
                    marker.infowindow.open(that.map, marker);
                } else {
                    console.log(status);
                }
            });
        },

        refreshMarkers: function() {
            if (!this.selectedProperty) return;
            this.refreshAllMarkersDistance(google.maps.TravelMode.DRIVING);
            this.refreshAllMarkersDistance(google.maps.TravelMode.WALKING);
        },

        refreshAllMarkersDistance: function(travelMode) {
            if (!this.selectedProperty) return;

            var that = this;
            var destinations = this.markers.map(function(marker) {
                return marker.position;
            });

            this.distanceService.getDistanceMatrix({
                origins: [this.selectedProperty.position],
                destinations: destinations,
                travelMode: travelMode,
                avoidHighways: false,
                avoidTolls: false
            }, function(res, status) {
                if (!that.markers) return;

                if (status === 'OK') {
                    for (var i = 0; i < that.markers.length; i++) {
                        var marker = that.markers[i];
                        var result = res.rows[0].elements[i];
                        that.setMarkerProperties(marker, result, travelMode);

                        if (!marker.infowindow.getMap()) {
                            marker.infowindow.open(that.map, marker);
                        }
                    }
                } else {
                    console.log(status);
                }
            });
        },

        setMarkerProperties: function(marker, result, travelMode) {
            var content, mode;

            var timeText = '-';
            if (result.status !== 'OK') {
                result = {
                    distance: {
                        text: '-'
                    }
                };
            } else {
                timeText = '';
                var seconds = result.duration.value;
                var minutes = seconds / 60;
                var hours = minutes / 60;
                var days = hours / 24;

                if (days > 1) {
                    timeText += days.toFixed() + ' d ';
                }
                if (hours > 1) {
                    timeText += (hours.toFixed() % 24) + ' h ';
                }
                if (days < 1) {
                    timeText += (minutes % 60).toFixed() + ' min';
                }
            }

            if (travelMode === google.maps.TravelMode.DRIVING) {
                mode = 'car';
            } else if (travelMode === google.maps.TravelMode.WALKING) {
                mode = 'walking';
            }

            content = marker.infoWindowContent.getElementsByClassName(mode + '-distance')[0];
            content.innerHTML = result.distance.text;
            content = marker.infoWindowContent.getElementsByClassName(mode + '-time')[0];
            content.innerHTML = timeText;
        },

        onPropertyclicked: function(marker) {
            this.selectedProperty = marker;
            if (this.markers.length > 0) {
                this.refreshMarkers();
            }
        },

        clearMarkers: function() {
            for (var i = 0; i < this.markers.length; i++) {
                marker = this.markers[i];
                marker.setMap(null);
            }
            this.markers = [];
        },

        setMapBounds: function() {
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0; i < this.markers.length; i++) {
                bounds.extend(this.markers[i].position);
            }
            if (this.selectedProperty) {
                bounds.extend(this.selectedProperty.position);
            }
            this.map.fitBounds(bounds);
        },
    });

    MapViewer.registerModule(MapViewer.POIControl, CONTROL_CLASS);
})();
