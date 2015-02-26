(function() {

    var CONTROL_CLASS = 'check-draw';

    MapViewer.CheckDrawControl = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="check-draw-control-outer"><div class="check-draw-control-border">' +
        '<div class="check-draw-control-inner"><a class="check-draw-class" href="#"> </a> <span>Draw to search</span></div></div></div>',

        controlClass: 'check-draw-control',
        position: 'LEFT_BOTTOM',
        alias: CONTROL_CLASS,
        text: 'Default',
        defaultChecked: false,
        innerPolygon: null,
        outerPolygon: null,
        listener: null,
        pan: null,
        dragFlag: null,

        rectangleLeftCoords: null,
        rectangleRightCoords: null,
        reverseRectangleLeftCoords: null,
        reverseRectangleRightCoords: null,
        toggleGroup: ['search-group'],
        initialize: function() {

            /*
             We have to initialize rectangle coordinates here because 'google' var doesn't exist before.
             */
            this.rectangleLeftCoords = [
                new google.maps.LatLng(-150, -180),
                new google.maps.LatLng(-150, 0),
                new google.maps.LatLng(150, 0),
                new google.maps.LatLng(150, -180)
            ];
            this.reverseRectangleLeftCoords = [
                new google.maps.LatLng(150, -180),
                new google.maps.LatLng(150, 0),
                new google.maps.LatLng(-150, 0),
                new google.maps.LatLng(-150, -180)
            ];
            this.rectangleRightCoords = [
                new google.maps.LatLng(-150, 0),
                new google.maps.LatLng(-150, 180),
                new google.maps.LatLng(150, 180),
                new google.maps.LatLng(150, 0)
            ];
            this.reverseRectangleRightCoords = [
                new google.maps.LatLng(150, 0),
                new google.maps.LatLng(150, 180),
                new google.maps.LatLng(-150, 180),
                new google.maps.LatLng(-150, 0)
            ];

            this.link = this.getElementsByClass('check-draw-class')[0];

            this.drawingManager = this._getDrawingManager();


            if (this.defaultChecked) {
                this.link.classList.add('checked-pan');
                this.notifyActivation();
            } else {
                this.link.classList.add('unchecked-pan');
            }

            var that = this;

            this.bindEvent('check-draw-control-outer', 'click', function(event) {

                if (that.link.classList.contains("unchecked-pan")) {
                    that.notifyActivation();
                } else {
                    that.deactivate();
                }
            });
        },

        search: function(polygon, event) {
            var boundsPoly = null;
            var rectangleLeftCoords = null;
            var rectangleRightCoords = null;

            if (event === "edit") {
                boundsPoly = polygon;
            } else {
                boundsPoly = polygon.getPath().getArray();
            }

            if (boundsPoly.length > 2) {
                var clockwise = this._polygonArea(boundsPoly) > 0;
                if (!clockwise) {
                    rectangleLeftCoords = this.reverseRectangleLeftCoords;
                    rectangleRightCoords = this.reverseRectangleRightCoords;
                } else {
                    rectangleLeftCoords = this.rectangleLeftCoords;
                    rectangleRightCoords = this.rectangleRightCoords;
                }

                //Polygon substraction and mask
                if (this.outerPolygon !== null) {
                    this._cleanOuterPolygon();
                }

                if (this.currentlyActivate) {
                    this.outerPolygon = new google.maps.Polygon({
                        paths: [rectangleLeftCoords, rectangleRightCoords, boundsPoly],
                        map: this.map,
                        strokeOpacity: 1,
                        strokeWeight: 0,
                        fillColor: '#000000',
                        fillOpacity: 0.7,
                        zIndex: 0
                    });

                    this.api.searchByPolygon(boundsPoly);
                } else {
                    this._cleanInnerPolygon();
                }
            }
        },

        deactivate: function() {

            // if (!this.drawingManager.drawingMode) {
            MapViewer.MapControl.prototype.deactivate.apply(this, arguments);

            this.drawingManager.setMap(null);

            if (this.innerPolygon !== null) {
                this._searchInBounds();
                this._cleanMap();
            } else {

                this.drawingManager.setOptions({
                    drawingControl: false
                });

                this.drawingManager.setDrawingMode(null);
            }
            this._removeGmapListener();
            //}


        },

        activate: function() {
            MapViewer.MapControl.prototype.activate.apply(this, arguments);

            var that = this;
            that.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
            that.drawingManager.setMap(that.map);
            that.drawingManager.setOptions({
                drawingControl: false
            });
            that.listener = this._addGmapListener();

        },

        _cleanOuterPolygon: function() {
            this.outerPolygon.setMap(null);
            this.outerPolygon = null;
        },

        _cleanInnerPolygon: function() {
            this.innerPolygon.setMap(null);
            this.innerPolygon = null;
        },

        _removeGmapListener: function() {
            google.maps.event.removeListener(this.listener);
        },

        _addGmapListener: function() {
            var that = this;

            var _listener = google.maps.event.addListenerOnce(that.drawingManager, 'polygoncomplete', function(polygon) {
                that.dragFlag = false;
                that.innerPolygon = polygon;
                //Draw the complet polygon
                that.search(polygon, "creation");

                //Events
                google.maps.event.addListener(polygon, 'dragstart', function() {
                    that.dragFlag = true;
                });
                //Events

                google.maps.event.addListener(polygon, 'rightclick', function() {
                    var polygonOption = {};
                    if (polygon.getDraggable()) {
                        _toggleDrag(false);
                    } else {
                        _toggleDrag(true);
                    }

                });

                google.maps.event.addListener(polygon, 'dragend', function() {
                    that.dragFlag = false;
                    that.search(this, "drag");
                    _toggleDrag(false);
                });

                google.maps.event.addListener(polygon.getPath(), 'set_at', function() {
                    if (that.dragFlag !== true)
                        that.search(this.j, "edit");
                });

                google.maps.event.addListener(polygon.getPath(), 'insert_at', function() {
                    that.search(this.j, "edit");
                });

                google.maps.event.addListener(polygon.getPath(), 'remove_at', function() {
                    that.search(this.j, "edit");
                });

                that.drawingManager.setOptions({
                    drawingControl: false
                });

                that.drawingManager.setDrawingMode(null);


                function _toggleDrag(dragable) {
                    var color = dragable ? '#14bcb6' : '#BC141A';
                    var polygonOptions = {
                        strokeColor: color,
                        fillColor: color,
                        draggable: dragable
                    };
                    polygon.setOptions(polygonOptions);
                }

            });
            return _listener;

        },

        _getDrawingManager: function() {
            var _drawingManager = new google.maps.drawing.DrawingManager({
                drawingMode: google.maps.drawing.OverlayType.POLYGON,
                drawingControl: false,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.BOTTOM_LEFT,
                    drawingModes: [
                        google.maps.drawing.OverlayType.POLYGON
                    ]
                },
                polygonOptions: {
                    strokeColor: '#BC141A',
                    strokeOpacity: 0.9,
                    strokeWeight: 3,
                    fillColor: '#BC141A',
                    fillOpacity: 0.01,
                    clickable: true,
                    editable: true,
                    zIndex: 1
                }
            });
            return _drawingManager;
        },

        _polygonArea: function(vertices) {
            var area = 0;
            for (var i = 0; i < vertices.length; i++) {
                var j = (i + 1) % vertices.length;
                area += vertices[i].lat() * vertices[j].lng();
                area -= vertices[j].lat() * vertices[i].lng();
            }
            return area / 2;
        },

        _searchInBounds: function() {
            this.searchInBounds();
        },

        _cleanMap: function() {
            this._cleanOuterPolygon();
            this._cleanInnerPolygon();
        }
    });

    MapViewer.registerModule(MapViewer.CheckDrawControl, CONTROL_CLASS);
})();