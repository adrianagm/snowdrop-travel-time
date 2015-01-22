(function() {

    MapViewer.ButtonControl = function() {
        MapViewer.MapControl.prototype.constructor.apply(this, arguments);
        var controlDiv = document.createElement('div');
        var chicago = new google.maps.LatLng(41.850033, -87.6500523);
        var html = '<div style = "padding: 5px; z-index: 0;">' +
            '<div title="Click to set the map to Home"' +
            'style = "border-style: solid; border-width: 2px; cursor:pointer; text-align: center; background-color: white;" >' +
            '<div style = "font-family: Arial, sans-serif; font-size: 12px; padding-left: 4px; padding-right: 4px;"> <b> Home </b> </div > </div> </div >';

        controlDiv.innerHTML = html;

        this.content = controlDiv.firstChild;

        var that = this;
        google.maps.event.addDomListener(this.content, 'click', function() {
            that.map.setCenter(chicago);
        });
    };

    MapViewer.registerModule(MapViewer.ButtonControl, "button");
})();
