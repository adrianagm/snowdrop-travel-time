(function() {
    "use strict";

    var CONTROL_CLASS = 'map-control';

    MapViewer.MapControl = function(options) {
        if (typeof(options) === 'object') {
            for (var attr in options) {
                this[attr] = options[attr];
            }
        }
        this.setContent();
        this.initialize();
    };

    MapViewer.MapControl.prototype = {
        template: "",
        controlClass: "",

        initialize: function() {

        },

        setContent: function() {
            var helperDiv = document.createElement('div');
            var wrapperDiv = document.createElement('div');
            var controlDiv = document.createElement('div');

            controlDiv.innerHTML = this.template;
            controlDiv.className = this.controlClass;
            if (this.cssClass) {
                controlDiv.classList.add(this.cssClass);
            }

            wrapperDiv.className = 'map-control';
            wrapperDiv.appendChild(controlDiv);

            helperDiv.appendChild(wrapperDiv);
            this.content = helperDiv.firstChild;
        },

        addToMap: function() {
            this.map.controls[google.maps.ControlPosition[this.position]].push(this.content);
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
