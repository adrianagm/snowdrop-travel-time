(function() {

    var CONTROL_CLASS = 'heatmap-view';
    MapViewer.Heatmap = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="heatmap-view-button" href="#" title="Heat Map View"> </div>',
        controlClass: 'heatmap-view-control',

        position: 'RIGHT_BOTTOM',
        alias: CONTROL_CLASS,

        placesSelected: [],
        places: {},
        markers: {},
        heatPlaces: null,
        heatmap: null,


        initialize: function() {

            this.buttonText = this.getElementsByClass('heatmap-view-button')[0];
            this.elem = this.map.getDiv();
            var that = this;

            this.bindEvent('heatmap-view-button', 'click', function() {
                if (this.classList.contains('active')) {
                    that.desactivateHeatMap(this);
                } else {
                    that.activateHeatmap(this);
                }

            });

        },

        activateHeatmap: function(control) {

            this.markers = MapViewer.Places.prototype.markers;
            this.placesSelected = [];
            for (var type in this.markers) {
                if (this.markers[type].length > 0) {
                    this.placesSelected.push(type);
                }
            }

            if (this.placesSelected.length === 0) {
                control.classList.remove('active');
                alert('Please first select one Google Places category');
            } else if (this.placesSelected.length > 1) {
                control.classList.add('active');
                alert('Please first select only one Google Places category');
            } else {
                control.classList.add('active');
               MapViewer.heatPlaces = this.placesSelected[0];
                this.createHeatMap();
            }


        },

        desactivateHeatMap: function(control) {
            control.classList.remove('active');
            if (MapViewer.heatmap) {
                var markers = this.markers[MapViewer.heatPlaces];
                MapViewer.heatmap.setMap(null);
                for (var m = 0; m < markers.length; m++) {
                    markers[m].setMap(this.map);
                }
                MapViewer.clusterPlaces.addMarkers(markers);
            }

        },

        createHeatMap: function() {
            this.markers = MapViewer.Places.prototype.markers;
            var markers = this.markers[MapViewer.heatPlaces];
            var heatPositions = [];
            for (var i = 0; i < markers.length; i++) {
                heatPositions.push(markers[i].position);
            }
            var pointArray = new google.maps.MVCArray(heatPositions);
            if (!MapViewer.heatmap) {
                MapViewer.heatmap = new google.maps.visualization.HeatmapLayer();
            }
            MapViewer.heatmap.setData(pointArray);
            MapViewer.heatmap.setMap(this.map);

            for (var m = 0; m < markers.length; m++) {
                markers[m].setMap(null);
            }
            MapViewer.clusterPlaces.removeMarkers(markers);
        }



    });

    MapViewer.registerModule(MapViewer.Heatmap, CONTROL_CLASS);
})();