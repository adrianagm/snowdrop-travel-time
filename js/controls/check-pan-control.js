(function() {

    MapViewer.SearchOnPanControl = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="check-pan-control-outer"><div class="check-pan-control-border">' +
            '<div class="check-pan-control-inner"><a class="check-class" href="#"> </a> Search when moving map</div></div></div>',
        controlClass: 'check-pan-control',

        position: 'BOTTOM_RIGHT',
        alias: 'check-pan',

        text: 'Default',
        defaultChecked: false,
        checked: "",

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
                    that.link.classList.remove('unchecked-pan');
                    that.link.classList.add('checked-pan');
                    that.checked = true;
                } else {
                    that.link.classList.remove('checked-pan');
                    that.link.classList.add('unchecked-pan');
                    that.checked = false;
                }

                google.maps.event.addListener(that.map, 'idle', function() {
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

    MapViewer.registerModule(MapViewer.SearchOnPanControl, "search-on-pan");
})();