(function() {
    var CONTROL_CLASS = 'points-of-interest';

    MapViewer.POIControl = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="check-pan-control-outer"><div class="check-pan-control-border">' +
            '<div class="check-pan-control-inner"><a class="check-class" href="#"> </a><span> Points of interest</span></div></div></div>' +
            '<input id="pac-input" class="controls pac-input" type="text" placeholder="Add new point of interest">',
        controlClass: 'check-pan-control',

        position: 'LEFT_BOTTOM',
        alias: CONTROL_CLASS,
        text: 'Default',
        defaultChecked: false,
        checked: "",
        toggleGroup: [],

        searchBox: null,
        markers: [],
        infoWindows: [],

        distanceService: null,

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
                    that.clearMarkers();
                }
            });
        },

        showSearchBar: function() {
            var input = this.getElementsByClass('pac-input')[0];
            this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

            if (!this.searchBox) {
                this.createSearchBar(input);
            }
        },

        createSearchBar: function(input) {
            var that = this;
            var options = {};
            this.searchBox = new google.maps.places.Autocomplete(input, options);
            this.searchBox.bindTo('bounds', this.map);

            google.maps.event.addListener(this.searchBox, 'place_changed', function() {
                that.addMarker(that.searchBox.getPlace());
                that.setMapBounds();
            });

            google.maps.event.addListener(this.map, 'idle', function() {
                that.refreshMarkers(google.maps.TravelMode.DRIVING);
                that.refreshMarkers(google.maps.TravelMode.WALKING);
            });
        },

        setSearchBarBounds: function() {
            var bounds = this.map.getBounds();
            this.searchBox.setBounds(bounds);
        },

        addMarker: function(place) {
            var content = '<div class="poi-marker"></div>';
            var marker = new RichMarker({
                position: new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng()),
                flat: true,
                content: content,
                map: this.map
            });

            this.markers.push(marker);

            this.createInfowindow(marker);
            this.getMarkerMatrix(marker, google.maps.TravelMode.DRIVING);
            this.getMarkerMatrix(marker, google.maps.TravelMode.WALKING);
        },

        createInfowindow: function(marker) {
            infoWindowContent = document.createElement('div');
            infoWindowContent.innerHTML = '<div class="poi-popup">' +
                '<div class="car"><div class="car-icon"><i class="fa fa-car"></i></div><div class="car-distance"></div><div class="car-time"></div></div>' +
                '<div class="walking"><div class="walking-icon"><i class="fa fa-male"></i></div><div class="walking-distance"></div><div class="walking-time"></div></div>' +
                '</div>';

            marker.infoWindowContent = infoWindowContent;

            //Half of markers height
            var offset;

            marker.infowindow = new google.maps.InfoWindow({
                pixelOffset: new google.maps.Size(0, -15)
            });
            marker.infowindow.setContent(infoWindowContent);

            var that = this;
            google.maps.event.addListener(marker, 'click', function() {
                marker.infowindow.open(that.map, marker);
            });
        },

        getMarkerMatrix: function(marker, travelMode) {
            var that = this;
            this.distanceService.getDistanceMatrix({
                origins: [this.map.getCenter()],
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

        refreshMarkers: function(travelMode) {
            var that = this;
            var destinations = this.markers.map(function(marker) {
                return marker.position;
            });

            this.distanceService.getDistanceMatrix({
                origins: [this.map.getCenter()],
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
                    }
                } else {
                    console.log(status);
                }
            });
        },

        setMarkerProperties: function(marker, result, travelMode) {
            var content, mode;
            if (travelMode === google.maps.TravelMode.DRIVING) {
                mode = 'car';
            } else if (travelMode === google.maps.TravelMode.WALKING) {
                mode = 'walking';
            }

            content = marker.infoWindowContent.getElementsByClassName(mode + '-distance')[0];
            content.innerHTML = result.distance.text;
            content = marker.infoWindowContent.getElementsByClassName(mode + '-time')[0];
            content.innerHTML = result.duration.text;
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
            bounds.extend(this.map.getCenter());
            this.map.fitBounds(bounds);
        },
    });

    MapViewer.registerModule(MapViewer.POIControl, CONTROL_CLASS);
})();
