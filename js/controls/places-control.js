(function() {

    MapViewer.Places = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="header">Places</div><ul class="places-list"></ul>',
        controlClass: 'places-control',

        position: 'BOTTOM_CENTER',
        alias: 'places-list',

        placesList: null,
        places: [],

        initialize: function() {
            var places = this.places;
            this.placesList = this.getElementsByClass('places-list')[0];
            for (var l = 0; l < places.length; l++) {
                this.addLI(places[l]);
            }

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
        },

        placesDeselected: function(li) {
            li.classList.remove('active');
        },

        toggleList: function() {
            var style = this.placesList.style;
            if (style.display !== 'none') {
                style.display = 'none';
            } else {
                style.display = 'initial';
            }
        },

        addLI: function(text) {
            var li = document.createElement('li');
            li.className = 'places';
            li.innerHTML = text;
            this.placesList.appendChild(li);
        }
    });

    MapViewer.registerModule(MapViewer.Places, "places");
})();
