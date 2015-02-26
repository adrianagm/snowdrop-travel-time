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
            var that = this;
            var timeOut = null;
            this.bindEvent('heatmap-view-button', 'click', function() {
                var button = this;
                if (timeOut !== null) {
                    clearTimeout(timeOut);
                }
                timeOut = setTimeout(function() {
                    if (button.classList.contains('active')) {
                        that.desactivateHeatMap(button);
                    } else {
                        that.activateHeatmap(button);
                    }
                }, 400);

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
                this.showMessage();

            } else if (this.placesSelected.length > 1) {
                control.classList.add('active');
                this.chooseTypePlaces();
            } else {
                control.classList.add('active');
                MapViewer.heatPlaces = this.placesSelected[0];
                this.createHeatMap();
            }


        },

        desactivateHeatMap: function(control) {
            control.classList.remove('active');
            if (MapViewer.heatmap && MapViewer.heatPlaces) {
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
            if (MapViewer.heatPlaces) {
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
        },

        chooseTypePlaces: function() {
            MapViewer.heatPlaces = null;
            var that = this;
            var map = this.owner.element;
            var content = document.createElement('div');


            var overlayContent = document.createElement('div');
            overlayContent.className = 'overlay-content';
            overlayContent.innerHTML = 'There is more than one Google Places category selected in the toolbar. Choose one Google Places category to represent as heat map';

            for (var p in this.placesSelected) {
                for (var type in MapViewer.placesList) {
                    if (MapViewer.placesList[type].type == this.placesSelected[p]) {
                        var radioButton = "<p class='radio-places-item'><input type='radio'  name='radio-places' value=" + this.placesSelected[p] + ">" + type + "</p>";
                        overlayContent.innerHTML += radioButton;
                    }

                }
            }
            var overlayFooter = document.createElement('div');
            overlayFooter.className = 'overlay-footer';
            var acceptButton = document.createElement('button');
            acceptButton.className = 'heatmap-accept-button overlay-btn';
            acceptButton.innerHTML = 'Accept';
            acceptButton.onclick = function() {
                var radios = map.getElementsByClassName('radio-places-item');
                for (var i = 0, length = radios.length; i < length; i++) {
                    if (radios[i].firstChild.checked) {
                        MapViewer.heatPlaces = radios[i].firstChild.value;
                        that.createHeatMap();
                        break;
                    }
                }
                if (MapViewer.heatPlaces === null) {
                    var buttonText = map.getElementsByClassName('heatmap-view-button')[0];
                    buttonText.classList.remove('active');
                }
                overlay.destroy();

            };
            overlayFooter.appendChild(acceptButton);


            content.appendChild(overlayContent);
            content.appendChild(overlayFooter);

            var overlayOptions = {
                parentObj: that,
                appendToParent: that.owner.element,
                modalClasses: 'heatmap-overlay-modal',
                modalInnerContent: content,

            };

            var overlay = new MapViewerOverlay(overlayOptions);


        },

        showMessage: function() {
            var that = this;
            var content = document.createElement('div');

            var overlayContent = document.createElement('div');
            overlayContent.className = 'overlay-header';
            overlayContent.innerHTML = 'There is not any Google Places category selected in the toolbar. Please first select one Google Places category';


            var overlayFooter = document.createElement('div');
            overlayFooter.className = 'overlay-footer';
            var acceptButton = document.createElement('button');
            acceptButton.className = 'heatmap-accept-button overlay-btn';
            acceptButton.innerHTML = 'Accept';
            acceptButton.onclick = function() {
                overlay.destroy();
            };
            overlayFooter.appendChild(acceptButton);

            content.appendChild(overlayContent);
            content.appendChild(overlayFooter);

            var overlayOptions = {
                parentObj: that,
                appendToParent: that.owner.element,
                modalClasses: 'heatmap-overlay-modal',
                modalInnerContent: content,

            };

            var overlay = new MapViewerOverlay(overlayOptions);
        }


    });

    MapViewer.registerModule(MapViewer.Heatmap, CONTROL_CLASS);
})();