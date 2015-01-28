(function() {

    MapViewer.Places = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="header" data-i18n="places">Places</div><ul class="places-list"></ul>',
        controlClass: 'places-control',

        position: 'BOTTOM_CENTER',
        alias: 'places-list',

        placesList: null,
        places: {},
        markers: {},

        service: null,
        infowindow: null,
        startCollapse: false,

        initialize: function() {
            var places = this.places;
            this.placesList = this.getElementsByClass('places-list')[0];
            for (var place in places) {
                this.addLI(place);
            }
            if(this.startCollapse){
                this.toggleList();
            }
            this.infowindow = new google.maps.InfoWindow();
            this.service = new google.maps.places.PlacesService(this.map);

            var that = this;
            this.bindEvent('places', 'click', function(event) {
                var li = event.currentTarget;

                if (li.classList.contains('active')) {
                    that.placesDeselected(li);
                } else {
                    that.placesSelected(li);
                }
            });

            this.bindEvent('header', 'click', function(event) {
                that.toggleList();
            });
        },

        placesSelected: function(li) {
            li.classList.add('active');
            var place = this.places[li.innerHTML];
            var type = place.type;
            var request = {
                location: this.map.getCenter(),
                radius: 50000,
                types: [type]
            };

            var that = this;
            this.service.nearbySearch(request, function(results, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    //that.map.setZoom(12);
                    that.markers[type] = [];
                    for (var i = 0; i < results.length; i++) {
                        that.createMarker(results[i], type, place.icon);
                    }
                }
            });
        },

        createMarker: function(place, type, icon) {
            var placeLoc = place.geometry.location;
            var marker = new google.maps.Marker({
                map: this.map,
                position: place.geometry.location,
               // icon: icon
            });
            this.markers[type].push(marker);

            var that = this;
            google.maps.event.addListener(marker, 'click', function() {
                that.infowindow.setContent(place.name);
                that.infowindow.open(that.map, this);
            });
        },

        placesDeselected: function(li) {
            li.classList.remove('active');
            var place = this.places[li.innerHTML];
            var type = place.type;
            var markers = this.markers[type];
            for (var m = 0; m < markers.length; m++) {
                markers[m].setMap(null);
            }
            this.markers[type] = [];
        },

        toggleList: function() {
            var style = this.placesList.style;
            if (style.display !== 'none') {
                style.display = 'none';
            } else {
                style.display = 'inline-block';
            }
        },

        addLI: function(place) {
            var li = document.createElement('li');
            li.className = 'places';
            li.innerHTML = place;
            li.setAttribute("data-tag", this.places[place]);
            this.placesList.appendChild(li);
        }
    });

    MapViewer.registerModule(MapViewer.Places, "places");
})();
