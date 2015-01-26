(function() {
    "use strict";

    MapViewer.MapControl = function() {
    	
    };

    MapViewer.MapControl.prototype = {
        template: "",
        setContent: function(html) {
        	var controlDiv = document.createElement('div');
            controlDiv.innerHTML = html;
        	this.content = controlDiv.firstChild;
        },
        addToMap: function(position) {
            this.map.controls[google.maps.ControlPosition[position]].push(this.content);
        }
    };
})();
