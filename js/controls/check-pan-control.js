(function() {
    var CONTROL_CLASS = 'search-on-pan';

    MapViewer.SearchOnPanControl = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="check-pan-control-outer"><div class="check-pan-control-border">' +
            '<div class="check-pan-control-inner"><a class="check-class" href="#"> </a><span> Search when moving map</span></div></div></div>',
        controlClass: 'check-pan-control',

        position: 'LEFT_BOTTOM',
        alias: CONTROL_CLASS,
        text: 'Default',
        defaultChecked: false,
        checked: "",
        toggleGroup: ['search-group'],
        initialize: function() {
            this.link = this.getElementsByClass('check-class')[0];

            if (this.defaultChecked) {
                this.link.classList.add('checked-pan');

            } else {
                this.link.classList.add('unchecked-pan');
            }

            var that = this;

            this.bindEvent('check-pan-control-outer', 'click', function(event) {
                if (that.link.classList.contains("unchecked-pan")) {
                    that.notifyActivation();
                } else {
                    that.deactivate();
                }

                google.maps.event.addListener(that.map, 'dragend', function() {
                    if (that.link.classList.contains("checked-pan")) {
                        var bounds = that.searchBounds();
                        that.api.searchByPolygon(bounds);
                    }
                });
            });
        },

        searchBounds: function() {
            var bounds = this.map.getBounds();
            var array = [];

            array.push(bounds.getNorthEast());
            array.push(bounds.getSouthWest());

            return array;
        }

    });

    MapViewer.registerModule(MapViewer.SearchOnPanControl, CONTROL_CLASS);
})();
