(function() {
    "use strict";

    MapViewer.MapControl = function() {

    };

    MapViewer.MapControl.prototype = {
        template: "",
        addToMap: function() {
            this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(this.content);
        }
    };
})();
