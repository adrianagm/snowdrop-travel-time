(function() {

    MapViewer.Places = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="header" data-i18n="places"><a class="collapse-class" href="#"></a>Places</div><ul class="places-list"></ul>',
        controlClass: 'places-control',

        position: 'RIGHT_BOTTOM',
        alias: 'places-list',

        placesList: null,
        places: {},
        markers: {},

        service: null,
        infowindow: null,
        startCollapse: false,
        clusterPlaces: null,


        initialize: function() {
            var places = this.places;
            var mcOptions = {
                className: "places-cluster-marker"
            };

            this.clusterPlaces = new MarkerClusterer(this.map, null, mcOptions);
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
            this.bindEvent('places', 'click', function(event) {
                var li = event.currentTarget;

                if (li.classList.contains('active')) {
                    that.placesDeselected(li);
                } else {
                    that.placesSelected(li);
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
                    that.placesSelected(activePlaces[i]);
                }
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
                    that.clusterPlaces.addMarkers(that.markers[type]);
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

        },

        removePlacesToMap: function(type) {
            var markers = this.markers[type];
            this.clusterPlaces.removeMarkers(markers);
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
            li.setAttribute("data-tag", this.places[place]);
            this.placesList.appendChild(li);
        }
    });

    MapViewer.registerModule(MapViewer.Places, "places");
})();