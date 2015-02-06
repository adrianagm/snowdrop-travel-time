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
        var that = this;

        this.bindEvent('check-draw-control-outer', 'click', function(event) {
            var link = document.getElementsByClassName('check-draw-class')[0];
            var pan = document.getElementsByClassName('check-class')[0];
            if (link.classList.contains("checked-pan")) {
                that.controls(pan, 'checked-pan', 'unchecked-pan');
            }
        });

        this.bindEvent('check-pan-control-outer', 'click', function(event) {
            var link = document.getElementsByClassName('check-class')[0];
            var draw = document.getElementsByClassName('check-draw-class')[0];
            if (link.classList.contains("checked-pan")) {
                that.controls(draw, 'checked-pan', 'unchecked-pan');
                var evento = document.createEventObject('change');
                draw.dispatchEvent(evento);
            }
        });

    };

    MapViewer.MapControl.prototype = {
        template: "",
        controlClass: "",
        position: 'TOP_CENTER',

        initialize: function() {

        },

        controls: function(control, removeClass, addClass) {
            control.classList.remove(removeClass);
            control.classList.add(addClass);
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