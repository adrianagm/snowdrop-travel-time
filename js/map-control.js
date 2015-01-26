(function() {
    "use strict";

    var CONTROL_CLASS = 'map-control';

    MapViewer.MapControl = function(options) {
        this.setContent(options);
        this.initialize(options);
    };

    MapViewer.MapControl.prototype = {
        template: "",
        controlClass: "",

        initialize: function(options) {

        },

        setContent: function(options) {
            var helperDiv = document.createElement('div');
            var wrapperDiv = document.createElement('div');
            var controlDiv = document.createElement('div');

            controlDiv.innerHTML = this.template;
            controlDiv.className = this.controlClass;
            if (options.cssClass) {
                controlDiv.classList.add(options.cssClass);
            }

            wrapperDiv.className = 'map-control';
            wrapperDiv.appendChild(controlDiv);

            helperDiv.appendChild(wrapperDiv);
            this.content = helperDiv.firstChild;
        },

        addToMap: function(position) {
            this.map.controls[google.maps.ControlPosition[position]].push(this.content);
        },

        getElementsByClass: function(classSelector) {
            return this.content.getElementsByClassName(classSelector);
        },

        bindEvent: function(selector, event, callback) {
            var elements = this.getElementsByClass(selector);
            for (var el = 0; el < elements.length; el++) {
                google.maps.event.addDomListener(elements[el], event, callback);
            }
        }
    };
})();
