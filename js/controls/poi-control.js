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

        initialize: function() {
            this.link = this.getElementsByClass('check-class')[0];

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
        },

        setSearchBarBounds: function() {
            var bounds = this.map.getBounds();
            this.searchBox.setBounds(bounds);
        },

        addMarker: function(place) {
            var image = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            var marker = new google.maps.Marker({
                map: this.map,
                icon: image,
                title: place.name,
                position: place.geometry.location
            });

            this.markers.push(marker);
        },

        clearMarkers: function() {
            for (var i = 0; i < this.markers.length; i++) {
                marker = this.markers[i];
                marker.setMap(null);
            }
        },

        setMapBounds: function() {
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0; i < this.markers.length; i++) {
                bounds.extend(this.markers[i].position);
            }
            bounds.extend(this.map.getCenter());
            this.map.fitBounds(bounds);
        }
    });

    MapViewer.registerModule(MapViewer.POIControl, CONTROL_CLASS);
})();
