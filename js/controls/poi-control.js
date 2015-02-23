(function() {
    var CONTROL_CLASS = 'points-of-interest';

    MapViewer.POIControl = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="check-pan-control-outer"><div class="check-pan-control-border">' +
            '<div class="check-pan-control-inner"><a class="check-class" href="#"> </a><span> Points of interest</span></div></div></div>' +
            '<input id="pac-input" class="controls pac-input" type="text" placeholder="Add new point of interest">',
        controlClass: 'check-pan-control',

        position: 'LEFT_BOTTOM',
        alias: CONTROL_CLASS,
        text: 'Default',
        defaultChecked: false,
        checked: "",
        toggleGroup: [],

        searchBox: null,

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
                    that.showSearchBar();
                } else {
                    that.deactivate();
                }
            });
        },

        showSearchBar: function() {
            var input = this.getElementsByClass('pac-input')[0];
            this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

            this.searchBox = new google.maps.places.SearchBox((input));
        },

    });

    MapViewer.registerModule(MapViewer.POIControl, CONTROL_CLASS);
})();
