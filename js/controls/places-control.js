(function() {

    var CONTROL_CLASS = 'places';
    MapViewer.Places = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="places-div"><div class="header" data-i18n="places"><a class="collapse-class" href="#"></a>Places</div><ul class="places-list"></ul>' +
            '<div class="custom-btn"></div><div class="search-places">Search Places</div></div>',
        controlClass: 'places-control',

        position: 'RIGHT_BOTTOM',
        alias: CONTROL_CLASS,

        placesList: null,
        places: {},
        markers: {},

        service: null,
        infowindow: null,
        clusterPlaces: null,

        startCollapse: false,
        startSearchPlaces: true,


        initialize: function() {

            MapViewer.placesList = this.places;
            var places = this.places;
            var mcOptions = {
                className: "places-cluster-marker"
            };

            MapViewer.clusterPlaces = new MarkerClusterer(this.map, null, mcOptions);
            this.placesList = this.getElementsByClass('places-list')[0];
            this.placesSearch = this.getElementsByClass('search-places')[0];
            this.placesCustom = this.getElementsByClass('custom-btn')[0];
            if (!this.startSearchPlaces) {
                this.placesSearch.style.display = 'none';
            }
            for (var place in places) {
                this.addLI(place);
            }
            if (this.startCollapse) {
                this.toggleList();
            }
            this.infowindow = new google.maps.InfoWindow();
            this.service = new google.maps.places.PlacesService(this.map);

            var that = this;
            this.timeOut = null;
            this.tooglePlaces();

            this.bindEvent('search-places', 'click', function(event) {
                var overlayOptions = {
                    parentObj: that,
                    appendToParent: that.owner.element,
                    modalClasses: 'search-places-overlay-modal',
                    modalInnerContent: that._searchPlacesModalTemplate(),
                    scripts: that._searchPlacesScript
                };

                that.overlay = new JLLOverlay(overlayOptions);
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
                    that.placesSelected(activePlaces[i], function() {
                        //callback for update heatmap if it's active
                        var heatMapButton = that.owner.element.getElementsByClassName('heatmap-view-button')[0];
                        if (heatMapButton) {
                            if (heatMapButton.classList.contains('active')) {
                                MapViewer.heatmap.setMap(null);
                                MapViewer.Heatmap.prototype.createHeatMap();
                            }
                        }

                    });
                }
            });

            google.maps.event.addListener(this.map, 'click', function() {
                var customPlacesList = that.content.getElementsByClassName('custom-places-list');
                if (customPlacesList.length > 0) {
                    customPlacesList[0].style.display = 'none';
                }
            });


        },

        tooglePlaces: function() {
            var that = this;
            this.bindEvent('places', 'click', function(event) {
                var li = event.currentTarget;
                if (that.timeOut !== null) {
                    clearTimeout(that.timeOut);
                }

                if (li.classList.contains('active')) {
                    that.timeOut = setTimeout(function() {
                        that.placesDeselected(li);
                    }, 500);
                } else {
                    that.timeOut = setTimeout(function() {
                        that.placesSelected(li);
                    }, 500);
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
                iconClass: "place-marker " + icon,
                map: this.map
            };
            marker = MapViewer.prototype.drawMarker(marker);
            marker.placeId = place.place_id;

            var that = this;
            marker.addListener("click", function(event) {
                that.owner.notifyPlaceClicked(marker);
            });

            this.markers[type].push(marker);

        },

        placesDeselected: function(li) {
            li.classList.remove('active');
            var place = this.places[li.innerHTML];
            var type = place.type;
            this.removePlacesToMap(type, true);
            if (MapViewer.heatmap) {
                if (type === MapViewer.heatPlaces) {
                    MapViewer.heatmap.setMap(null);
                    var heatMapButton = this.owner.element.getElementsByClassName('heatmap-view-button')[0];
                    if (heatMapButton) {
                        if (heatMapButton.classList.contains('active')) {
                            heatMapButton.classList.remove('active');
                        }
                    }
                }
            }

        },

        removePlacesToMap: function(type, deselected) {
            var markers = this.markers[type];
            MapViewer.clusterPlaces.removeMarkers(markers);
            for (var m = 0; m < markers.length; m++) {
                markers[m].setMap(null);
                if (deselected) {
                    this.owner.notifyPlaceRemoved(markers[m]);
                }
            }
            this.markers[type] = [];
        },

        toggleList: function(header) {
            var style = this.placesList.style;
            var stylePlcSearch = this.placesSearch.style;
            var stylePlcCustom = this.placesCustom.style;
            if (style.display !== 'none') {
                header.classList.add('control-collapse');
                style.display = 'none';
                if (this.startSearchPlaces) {
                    stylePlcSearch.display = 'none';
                    stylePlcCustom.display = 'none';
                }
            } else {
                header.classList.remove('control-collapse');
                style.display = 'inline-block';
                if (this.startSearchPlaces) {
                    stylePlcSearch.display = 'inline-block';
                    stylePlcCustom.display = 'inline-block';
                }
            }
        },

        addLI: function(place) {
            var li = document.createElement('li');
            li.className = 'places';
            li.innerHTML = place;
            li.setAttribute("data-tag", place);
            this.placesList.appendChild(li);
        },

        _searchPlacesModalTemplate: function() {
            var selection_options = placesCategories;
            var places = MapViewer.placesList;
            for (var place in places) {
                delete selection_options[places[place].type];
            }
            var html = '';
            html += '<div class="overlay-search-places-modal">';
            html += '   <div class="overlay-header">';
            html += '       <label for="search-places-input">Search Dataset:</label>';
            html += '       <input type="text" class="overlay-form-input overlay-form-item search-places-input" name="search-places-input">';
            html += '   </div>';
            html += '   <div class="overlay-content">';
            html += '       <label for="search-places-list">Availables Dataset:</label>';
            html += '       <select multiple class="overlay-form-select-multiple overlay-form-item search-places-list" name="search-places-list">';
            for (var key in selection_options) {
                if (selection_options.hasOwnProperty(key)) {
                    html += '<option class="placesCategory" value="' + key + '">' + selection_options[key] + '</option>';
                }
            }
            html += '       </select>';
            html += '   </div>';
            html += '   <div class="overlay-footer">';
            html += '       <button type="button" class="overlay-btn add-places-btn" >Add</button>';
            html += '   </div>';
            html += '</div>';

            return html;
        },
        _searchPlacesScript: function() {
            /* this function is execute insite JLLOverlay Class so 'this' is refered to the JLLOverlay object
             */
            var map = this.parentObj.owner.element;
            var that = this.parentObj;
            var searchPlaces = map.getElementsByClassName('search-places-list')[0];
            var searchInput = map.getElementsByClassName('search-places-input')[0];
            var placesList = this.parentObj.placesList;
            var placesListOptions = placesList.getElementsByClassName('placesCategory');
            var addBtn = map.getElementsByClassName('add-places-btn')[0];
            var disabledOptions = [];

            for (var i = 0; i < placesListOptions.length; i++) {
                disabledOptions.push(placesListOptions[i].innerText);
            }

            var searchListOptions = [];


            for (var j = 0; j < searchPlaces.options.length; j++) {
                if (disabledOptions.lastIndexOf(searchPlaces.options[j].text) > -1) {
                    searchPlaces.removeChild(searchPlaces.options[j]);

                } else {
                    searchListOptions.push(searchPlaces.options[j].text);
                }
            }
            if (searchInput && searchPlaces) {
                searchInput.addEventListener("keyup", function(e) {
                    var inputValue = e.target.value.toLowerCase();
                    searchPlaces.innerHTML = '';
                    for (var i = 0; i < searchListOptions.length; i++) {
                        var optionValue = searchListOptions[i];
                        if (new RegExp(inputValue).test(optionValue.toLowerCase())) {
                            var op = document.createElement('option');
                            op.className = 'layer';
                            op.innerText = optionValue;
                            searchPlaces.appendChild(op);
                        }
                    }
                }, false);
            }

            addBtn.onclick = function() {
                var searchPlaceslength = searchPlaces.length;
                for (var i = 0; i < searchPlaceslength; i++) {
                    if (searchPlaces[i]) {
                        var option = searchPlaces[i];
                        if (option.selected) {
                            MapViewer.placesList[option.text] = {
                                type: option.value,
                            };

                            if (!that.customPlacesBtn) {
                                that.createCustomBtn();
                            } else if (that.customPlacesBtn.style.display === 'none') {
                                that.customPlacesBtn.style.display = 'inline-block';
                            }
                            that.addCustomLI(option.text);

                        }
                    }
                }
                that.overlay.destroy();
            };

        },


        createCustomBtn: function() {
            var map = this.content;
            var customDiv = map.getElementsByClassName('custom-btn')[0];
            var customPlaces = document.createElement('div');
            customPlaces.className = 'custom-places';
            var customPlacesFooter = document.createElement('div');
            customPlacesFooter.className = 'custom-places-footer';
            customPlacesFooter.innerHTML = 'Custom <span class="number-item"></span>';
            var customPlacesList = document.createElement('div');
            customPlacesList.className = 'custom-places-list';
            customPlacesList.innerHTML = '<ul class="custom-places-list-ul"></ul>';
            customPlaces.appendChild(customPlacesList);
            customPlaces.appendChild(customPlacesFooter);
            customDiv.appendChild(customPlaces);
            customPlacesFooter.onclick = function() {
                var style = map.getElementsByClassName('custom-places-list')[0].style;
                if (style.display === 'none' || style.display === '') {
                    style.display = 'block';

                } else {
                    style.display = 'none';

                }


            };
            this.customPlacesBtn = customPlaces;

        },

        addCustomLI: function(place) {
            this.placesCustomList = this.getElementsByClass('custom-places-list-ul')[0];
            var item = document.createElement('li');
            var li = document.createElement('span');
            li.className = 'places';
            li.innerHTML = place;
            li.setAttribute("data-tag", place);
            var remove = document.createElement('span');
            remove.className = 'remove-place';
            item.appendChild(li);
            item.appendChild(remove);
            this.placesCustomList.appendChild(item);
            this.numberCustomCategories();
            this.placesSelected(li);
            this.tooglePlaces();

            var that = this;
            remove.onclick = function(event) {
                event.stopPropagation();
                var item = this.parentNode;
                var li = item.firstChild;
                if (li.classList.contains('active')) {
                    that.placesDeselected(li);
                }
                delete MapViewer.placesList[li.innerHTML];
                that.placesCustomList.removeChild(item);
                that.numberCustomCategories();
                if (that.placesCustomList.firstChild === null) {
                    that.customPlacesBtn.style.display = 'none';
                    that.getElementsByClass('custom-places-list')[0].style.display = 'none';
                }
            };

        },

        numberCustomCategories: function() {
            var list = this.getElementsByClass('custom-places-list-ul')[0];
            var items = list.children;
            var numberItem = this.getElementsByClass('number-item')[0];
            numberItem.innerHTML = ' (' + items.length + ')';
        }

    });

    var placesCategories = {
        accounting: 'Accounting',
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

    MapViewer.registerModule(MapViewer.Places, CONTROL_CLASS);
})();
