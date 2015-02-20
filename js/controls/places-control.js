(function() {

    var CONTROL_CLASS = 'places';
    MapViewer.Places = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="places-div"><div class="header" data-i18n="places"><a class="collapse-class" href="#"></a>Places</div><ul class="places-list"></ul>'+
        '<div class="search-places">Search Places</div><ul class="search-list"></ul></div>',
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
            this.placesSearch = this.getElementsByClass('search-places')[0];
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

             this.bindEvent('search-places', 'click', function(event) {
                var overlayOptions = {
                    parent: that.owner.element,
                    modalClasses: 'search-places-overlay-modal',
                    modalInnerContent: that._searchPlacesModalTemplate(),
                    scripts: that._searchPlacesScript
                };

                var overlay = new JLLOverlay(overlayOptions);
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
            var stylePlcSearch = this.placesSearch.style;
            if (style.display !== 'none') {
                header.classList.add('collapse');
                style.display = 'none';
                stylePlcSearch.display = 'none';
            } else {
                header.classList.remove('collapse');
                style.display = 'inline-block';
                stylePlcSearch.display = 'inline-block';
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
        },
        _searchPlacesModalTemplate: function() {
            
            var html = '';
            html += '<div class="overlay-search-dataset-modal">';
            html += '   <div class="overlay-header">';
            html += '       <label for="search-dataset-input">Search Dataset:</label>';
            html += '       <input type="text" class="overlay-form-input overlay-form-item search-dataset-input" name="search-dataset-input">';
            html += '   </div>';
            html += '   <div class="overlay-content">';
            html += '       <label for="search-dataset-list">Availables Dataset:</label>';
            html += '       <select multiple class="overlay-form-select-multiple overlay-form-item search-dataset-list" name="search-dataset-list">';
            for (var key in placesCategories) {
                if (placesCategories.hasOwnProperty(key)) {
                    html += '<option value="' + key + '">' + placesCategories[key] + '</option>';
                }
            }
            html += '       </select>';
            html += '   </div>';
            html += '   <div class="overlay-footer">';
            html += '       <button type="button" class="overlay-btn" >Add</button>';
            html += '   </div>';
            html += '</div>';

            return html;
        },
        _searchPlacesScript: function() {
            /*
             this function is execute insite JLLOverlay Class so 'this' is refered to the JLLOverlay object
             */
            var map = this.parent;
            var searchInput = map.getElementsByClassName('search-dataset-input')[0];
            var searchList = map.getElementsByClassName('search-dataset-list')[0];

            if (searchInput && searchList) {
                searchInput.addEventListener("keyup", function(e) {
                    var inputValue = e.target.value;
                    var options = searchList.getElementsByTagName('option');
                    for (var i = 0; i < options.length; i++) {
                        var optionValue = options[i].text;
                        if (new RegExp('^' + inputValue).test(optionValue)) {
                            options[i].style.display = 'block';
                        } else {
                            options[i].style.display = 'none';
                        }
                    }
                }, false);
            }

        }

    });

    MapViewer.registerModule(MapViewer.Places, CONTROL_CLASS);
})();

var placesCategories = {
    accounting: 'accounting',
    airport: 'airport',
    amusement_park: 'amusement_park',
    aquarium: 'aquarium',
    art_gallery: 'art_gallery',
    atm: 'atm',
    bakery: 'bakery',
    bank: 'bank',
    bar: 'bar',
    beauty_salon: 'beauty_salon',
    bicycle_store: 'bicycle_store',
    book_store: 'book_store',
    bowling_alley: 'bowling_alley',
    bus_station: 'bus_station',
    cafe: 'cafe',
    campground: 'campground',
    car_dealer: 'car_dealer',
    car_rental: 'car_rental',
    car_repair: 'car_repair',
    car_wash: 'car_wash',
    casino: 'casino',
    cemetery: 'cemetery',
    church: 'church',
    city_hall: 'city_hall',
    clothing_store: 'clothing_store',
    convenience_store: 'convenience_store',
    courthouse: 'courthouse',
    dentist: 'dentist',
    department_store: 'department_store',
    doctor: 'doctor',
    electrician: 'electrician',
    electronics_store: 'electronics_store',
    embassy: 'embassy',
    establishment: 'establishment',
    finance: 'finance',
    fire_station: 'fire_station',
    florist: 'florist',
    food: 'food',
    funeral_home: 'funeral_home',
    furniture_store: 'furniture_store',
    gas_station: 'gas_station',
    general_contractor: 'general_contractor',
    grocery_or_supermarket: 'grocery_or_supermarket',
    gym: 'gym',
    hair_care: 'hair_care',
    hardware_store: 'hardware_store',
    health: 'health',
    hindu_temple: 'hindu_temple',
    home_goods_store: 'home_goods_store',
    hospital: 'hospital',
    insurance_agency: 'insurance_agency',
    jewelry_store: 'jewelry_store',
    laundry: 'laundry',
    lawyer: 'lawyer',
    library: 'library',
    liquor_store: 'liquor_store',
    local_government_office: 'local_government_office',
    locksmith: 'locksmith',
    lodging: 'lodging',
    meal_delivery: 'meal_delivery',
    meal_takeaway: 'meal_takeaway',
    mosque: 'mosque',
    movie_rental: 'movie_rental',
    movie_theater: 'movie_theater',
    moving_company: 'moving_company',
    museum: 'museum',
    night_club: 'night_club',
    painter: 'painter',
    park: 'park',
    parking: 'parking',
    pet_store: 'pet_store',
    pharmacy: 'pharmacy',
    physiotherapist: 'physiotherapist',
    place_of_worship: 'place_of_worship',
    plumber: 'plumber',
    police: 'police',
    post_office: 'post_office',
    real_estate_agency: 'real_estate_agency',
    restaurant: 'restaurant',
    roofing_contractor: 'roofing_contractor',
    rv_park: 'rv_park',
    school: 'school',
    shoe_store: 'shoe_store',
    shopping_mall: 'shopping_mall',
    spa: 'spa',
    stadium: 'stadium',
    storage: 'storage',
    store: 'store',
    subway_station: 'subway_station',
    synagogue: 'synagogue',
    taxi_stand: 'taxi_stand',
    train_station: 'train_station',
    travel_agency: 'travel_agency',
    university: 'university',
    veterinary_care: 'veterinary_care',
    zoo: 'zoo'
};