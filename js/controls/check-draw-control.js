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
        rectangleCoords: null,
        toggleGroup: ['search-group'],
        initialize: function() {

            this.rectangleCoords = [
                new google.maps.LatLng(180, -90),
                new google.maps.LatLng(-180, -90),
                new google.maps.LatLng(-180, 90),
                new google.maps.LatLng(180, 90)
            ];

            this.link = this.getElementsByClass('check-draw-class')[0];

            this.drawingManager = this._getDrawingManager();


            if (this.defaultChecked) {
                this.link.classList.add('checked-pan');
                this.activate();
            } else {
                this.link.classList.add('unchecked-pan');
            }

            var that = this;

            this.bindEvent('check-draw-control-outer', 'click', function(event) {

                if (that.link.classList.contains("unchecked-pan")) {
                    that.activate();
                } else {
                    that.deactivate();
                }
            });
        },
        search: function(polygon, event) {
            var boundsPoly = null;
            var polyObject = null;

            if (event == "edit") {
                polyObject = boundsPoly = polygon;
            } else {
                //Polygon coordinates
                polyObject = polygon.getPath();
                boundsPoly = polyObject.getArray();

                //Non convex polygon
                if (boundsPoly.length > 2) {
                    var nonConvex = false;
                    var sum = 0;
                    var a1 = boundsPoly[1].lat() - boundsPoly[0].lat();
                    var a2 = boundsPoly[2].lat() - boundsPoly[1].lat();
                    var b1 = boundsPoly[1].lng() - boundsPoly[0].lng();
                    var b2 = boundsPoly[2].lng() - boundsPoly[1].lng();

                    sum = a1 * b2 - b1 * a2;

                    if (sum < 0 && event !== "drag") {
                        boundsPoly.reverse();
                    }
                }

            }

            //Polygon substraction and mask
            if (this.outerPolygon !== null) {
                this.outerPolygon.setMap(null);
            }

            this.outerPolygon = new google.maps.Polygon({
                paths: [this.rectangleCoords, boundsPoly],
                map: this.map,
                strokeOpacity: 1,
                strokeWeight: 0,
                fillColor: '#000000',
                fillOpacity: 0.7,
                zIndex: 0
            });

            this.api.searchByPolygon(boundsPoly);
        },


        disableDrawing: function() {
            this.drawingManager.setMap(null);
        },

        basicSearch: function() {
            var list = [];
            var bounds = this.map.getBounds();
            list.push(bounds.getNorthEast());
            list.push(bounds.getSouthWest());
            this.api.searchByPolygon(list);
        },

        cleanMap: function() {
            this.outerPolygon.setMap(null);
            this.innerPolygon.setMap(null);
            this.innerPolygon = null;
            this.outerPolygon = null;
        },

        deactivate: function() {
            MapViewer.MapControl.prototype.deactivate.apply(this, arguments);

            this.disableDrawing();

            if (this.innerPolygon !== null) {
                this.basicSearch();
                this.cleanMap();
            } else {

                this.drawingManager.setOptions({
                    drawingControl: false
                });

                this.drawingManager.setDrawingMode(null);
            }
            this._removeGmapListener();
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

                google.maps.event.addListener(polygon, 'dragend', function() {
                    that.dragFlag = false;
                    that.search(this, "drag");
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
                    fillOpacity: 0.1,
                    clickable: true,
                    editable: true,
                    draggable: true,
                    zIndex: 1
                }
            });
            return _drawingManager;
        }
    });

    MapViewer.registerModule(MapViewer.CheckDrawControl, CONTROL_CLASS);
})();